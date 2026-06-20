// app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server';

// PROMPT MAIS ESPECÍFICO E ESTRUTURADO
const PROMPT_IA = `
Você é um professor especialista em concursos públicos.

CRIE EXATAMENTE 80 QUESTÕES de múltipla escolha sobre o conteúdo abaixo.

INSTRUÇÕES OBRIGATÓRIAS:
1. Cada questão DEVE ter 4 alternativas: A, B, C, D
2. Indique a alternativa correta
3. Dê uma explicação do porquê a resposta está certa
4. As questões devem ser desafiadoras, nível médio/difícil
5. Misture assuntos diferentes do conteúdo
6. Use linguagem formal de concurso
7. NÃO use Markdown, NÃO use aspas triplas, NÃO use texto antes do JSON

RESPONDA APENAS COM O JSON, SEM NENHUM TEXTO ADICIONAL.

FORMATO OBRIGATÓRIO (exatamente assim):
{
  "questoes": [
    {
      "pergunta": "Qual é a principal característica do federalismo brasileiro?",
      "opcoes": {
        "A": "Centralização do poder na União",
        "B": "Autonomia dos entes federativos",
        "C": "Inelegibilidade dos governadores",
        "D": "Unicidade do sistema jurídico"
      },
      "correta": "B",
      "explicacao": "O federalismo brasileiro é caracterizado pela autonomia dos entes federativos (União, Estados, Distrito Federal e Municípios), cada qual com suas competências próprias."
    }
  ]
}

CONTEÚDO PARA GERAR AS QUESTÕES:
`;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array], { type: 'application/pdf' });
    const arrayBuffer = await blob.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8');
    let text = textDecoder.decode(arrayBuffer);
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    
    if (text.length < 50) {
      text = buffer.toString('utf-8').replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    }
    
    return text.trim();
  } catch (erro) {
    console.error('Erro ao extrair texto do PDF:', erro);
    throw erro;
  }
}

export async function POST(request: Request) {
  try {
    console.log('📥 1. Recebendo requisição...');
    
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    console.log('📄 2. Arquivo recebido:', file?.name, file?.size, 'bytes');
    
    if (!file) {
      return NextResponse.json({ erro: 'Nenhum PDF enviado' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('📦 3. Buffer criado:', buffer.length, 'bytes');
    
    let textoExtraido = await extractTextFromPDF(buffer);
    console.log('📝 4. Texto extraído:', textoExtraido.length, 'caracteres');
    
    if (!textoExtraido || textoExtraido.length < 50) {
      return NextResponse.json({ 
        erro: 'Não foi possível extrair texto do PDF. Verifique se o PDF tem texto selecionável.' 
      }, { status: 400 });
    }

    const textoLimitado = textoExtraido.slice(0, 12000);
    const promptCompleto = PROMPT_IA + "\n\n" + textoLimitado;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    console.log('🔑 5. API Key existe?', apiKey ? 'SIM' : 'NÃO');
    
    if (!apiKey) {
      console.error('❌ DEEPSEEK_API_KEY não encontrada!');
      return NextResponse.json({ 
        erro: 'Chave da API DeepSeek não configurada' 
      }, { status: 500 });
    }

    console.log('📤 6. Enviando para DeepSeek...');

    const respostaIA = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que responde APENAS com JSON válido. NUNCA adicione texto antes ou depois do JSON. NUNCA use Markdown. Apenas o JSON puro.'
          },
          {
            role: 'user',
            content: promptCompleto
          }
        ],
        temperature: 0.5,
        max_tokens: 10000
      })
    });

    console.log('📨 7. Resposta recebida, status:', respostaIA.status);

    if (!respostaIA.ok) {
      const erroTexto = await respostaIA.text();
      console.error('❌ Erro DeepSeek:', respostaIA.status);
      console.error('📄 Detalhe:', erroTexto);
      
      let mensagemErro = 'Erro ao gerar questões com IA';
      if (respostaIA.status === 401) mensagemErro = 'Chave da API inválida.';
      if (respostaIA.status === 402) mensagemErro = 'Saldo insuficiente.';
      if (respostaIA.status === 429) mensagemErro = 'Limite de requisições excedido.';
      
      return NextResponse.json({ erro: mensagemErro }, { status: respostaIA.status });
    }

    const dadosIA = await respostaIA.json();
    let conteudoGerado = dadosIA.choices[0].message.content;
    console.log('📄 8. Conteúdo bruto da IA (primeiros 500 caracteres):');
    console.log(conteudoGerado.substring(0, 500));

    // LIMPEZA MAIS ROBUSTA
    let jsonLimpo = conteudoGerado;
    
    // Remove blocos de código markdown
    jsonLimpo = jsonLimpo.replace(/```json\s*/g, '');
    jsonLimpo = jsonLimpo.replace(/```\s*/g, '');
    jsonLimpo = jsonLimpo.replace(/`/g, '');
    
    // Tenta encontrar apenas a parte do JSON (entre { e })
    const matchJson = jsonLimpo.match(/\{[\s\S]*\}/);
    if (matchJson) {
      jsonLimpo = matchJson[0];
    }
    
    console.log('📄 9. JSON limpo (primeiros 500 caracteres):');
    console.log(jsonLimpo.substring(0, 500));

    let questoes;
    try {
      questoes = JSON.parse(jsonLimpo);
    } catch (erro) {
      console.error('❌ Erro ao parsear JSON:', erro);
      console.log('📄 Conteúdo completo que falhou:');
      console.log(jsonLimpo);
      
      // TENTATIVA DE RECUPERAÇÃO: tentar parsear linha por linha
      try {
        // Tenta encontrar arrays de questões
        const questoesMatch = jsonLimpo.match(/"questoes"\s*:\s*\[([\s\S]*?)\]/);
        if (questoesMatch) {
          const questoesRaw = '{"questoes": [' + questoesMatch[1] + ']}';
          questoes = JSON.parse(questoesRaw);
          console.log('✅ Recuperado com sucesso via regex!');
        }
      } catch (erro2) {
        console.error('❌ Falha na recuperação também:', erro2);
      }
      
      if (!questoes) {
        return NextResponse.json({ 
          erro: 'IA retornou formato inválido. Tente novamente com um PDF menor.' 
        }, { status: 500 });
      }
    }

    // Verifica se tem questões
    if (!questoes.questoes || !Array.isArray(questoes.questoes)) {
      return NextResponse.json({
        erro: 'A IA não retornou um array de questões.'
      }, { status: 500 });
    }

    console.log('📊 10. Total de questões retornadas:', questoes.questoes.length);

    // Se tiver menos de 80, tenta complementar
    if (questoes.questoes.length < 80) {
      console.log('⚠️ Gerou apenas', questoes.questoes.length, 'questões. Vamos tentar completar...');
      // Aceita o que foi gerado, mas avisa
      return NextResponse.json({
        sucesso: true,
        questoes: questoes.questoes,
        total: questoes.questoes.length,
        aviso: `Gerou apenas ${questoes.questoes.length} questões. Tente novamente com um PDF menor.`
      });
    }

    // Se tiver mais de 80, pega só as 80 primeiras
    if (questoes.questoes.length > 80) {
      console.log('⚠️ Gerou', questoes.questoes.length, 'questões, pegando as 80 primeiras');
      questoes.questoes = questoes.questoes.slice(0, 80);
    }

    console.log('✅ 11. Sucesso!', questoes.questoes.length, 'questões geradas');

    return NextResponse.json({
      sucesso: true,
      questoes: questoes.questoes,
      total: questoes.questoes.length
    });

  } catch (erro) {
    console.error('❌ Erro geral:', erro);
    return NextResponse.json({ 
      erro: `Erro interno: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}