// app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server';

const PROMPT_IA = `
Você é um professor especialista em concursos públicos.

CRIE EXATAMENTE 80 QUESTÕES de múltipla escolha sobre o conteúdo abaixo.

INSTRUÇÕES OBRIGATÓRIAS:
1. Cada questão DEVE ter 4 alternativas: A, B, C, D
2. Indique a alternativa correta
3. Dê uma explicação do porquê a resposta está certa
4. As questões devem ser desafiadoras, nível médio/difícil
5. Use linguagem formal de concurso
6. RESPONDA APENAS COM O JSON, SEM NENHUM TEXTO ADICIONAL.

FORMATO OBRIGATÓRIO (exatamente assim):
{
  "questoes": [
    {
      "pergunta": "Texto da pergunta?",
      "opcoes": {
        "A": "Opção A",
        "B": "Opção B",
        "C": "Opção C",
        "D": "Opção D"
      },
      "correta": "A",
      "explicacao": "Explicação detalhada..."
    }
  ]
}

CONTEÚDO PARA GERAR AS QUESTÕES:
`;

export async function POST(request: Request) {
  try {
    console.log('📥 Recebendo requisição...');
    
    const body = await request.json();
    const conteudo = body.conteudo as string;
    
    if (!conteudo || conteudo.length < 50) {
      return NextResponse.json({ 
        erro: 'Digite pelo menos 50 caracteres para gerar questões.' 
      }, { status: 400 });
    }

    console.log('📝 Conteúdo recebido:', conteudo.length, 'caracteres');

    // Limita o tamanho do texto
    const textoLimitado = conteudo.slice(0, 12000);
    const promptCompleto = PROMPT_IA + "\n\n" + textoLimitado;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('❌ DEEPSEEK_API_KEY não encontrada!');
      return NextResponse.json({ 
        erro: 'Chave da API DeepSeek não configurada' 
      }, { status: 500 });
    }

    console.log('📤 Enviando para DeepSeek...');
    console.log('📤 Tamanho do prompt:', promptCompleto.length, 'caracteres');

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
            content: 'Você é um assistente que responde APENAS com JSON válido. NUNCA adicione texto antes ou depois do JSON. NUNCA use Markdown.'
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

    console.log('📨 Resposta recebida, status:', respostaIA.status);

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
    console.log('📄 Conteúdo gerado (primeiros 500 caracteres):');
    console.log(conteudoGerado.substring(0, 500));

    // Limpeza do JSON
    let jsonLimpo = conteudoGerado;
    jsonLimpo = jsonLimpo.replace(/```json\s*/g, '');
    jsonLimpo = jsonLimpo.replace(/```\s*/g, '');
    jsonLimpo = jsonLimpo.replace(/`/g, '');
    
    const matchJson = jsonLimpo.match(/\{[\s\S]*\}/);
    if (matchJson) {
      jsonLimpo = matchJson[0];
    }
    
    console.log('📄 JSON limpo (primeiros 500 caracteres):');
    console.log(jsonLimpo.substring(0, 500));

    let questoes;
    try {
      questoes = JSON.parse(jsonLimpo);
    } catch (erro) {
      console.error('❌ Erro ao parsear JSON:', erro);
      
      // Tenta recuperar
      try {
        const questoesMatch = jsonLimpo.match(/"questoes"\s*:\s*\[([\s\S]*?)\]/);
        if (questoesMatch) {
          const questoesRaw = '{"questoes": [' + questoesMatch[1] + ']}';
          questoes = JSON.parse(questoesRaw);
          console.log('✅ Recuperado com sucesso via regex!');
        }
      } catch (erro2) {
        console.error('❌ Falha na recuperação:', erro2);
      }
      
      if (!questoes) {
        return NextResponse.json({ 
          erro: 'A IA não retornou um formato válido. Tente novamente com um texto diferente.' 
        }, { status: 500 });
      }
    }

    if (!questoes.questoes || !Array.isArray(questoes.questoes)) {
      return NextResponse.json({
        erro: 'A IA não retornou um array de questões.'
      }, { status: 500 });
    }

    console.log('📊 Total de questões:', questoes.questoes.length);

    let questoesFinais = questoes.questoes;
    let aviso = '';

    if (questoesFinais.length < 80) {
      aviso = `⚠️ Gerou apenas ${questoesFinais.length} questões. Tente colar mais conteúdo.`;
      console.log('⚠️', aviso);
    }

    if (questoesFinais.length > 80) {
      console.log('⚠️ Gerou', questoesFinais.length, 'questões, pegando as 80 primeiras');
      questoesFinais = questoesFinais.slice(0, 80);
    }

    console.log('✅ Sucesso!', questoesFinais.length, 'questões geradas');

    return NextResponse.json({
      sucesso: true,
      questoes: questoesFinais,
      total: questoesFinais.length,
      aviso: aviso || undefined
    });

  } catch (erro) {
    console.error('❌ Erro geral:', erro);
    return NextResponse.json({ 
      erro: `Erro interno: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}