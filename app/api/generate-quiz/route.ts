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
    console.log('📥 ===== INÍCIO DA REQUISIÇÃO =====');
    
    // 1. LER O CORPO DA REQUISIÇÃO
    let body;
    try {
      body = await request.json();
      console.log('📝 Body recebido:', typeof body);
    } catch (erro) {
      console.error('❌ Erro ao ler JSON do body:', erro);
      return NextResponse.json({ 
        erro: 'Erro ao ler dados da requisição' 
      }, { status: 400 });
    }

    const conteudo = body?.conteudo as string;
    console.log('📝 Conteúdo recebido:', conteudo?.length || 0, 'caracteres');
    
    if (!conteudo) {
      console.error('❌ Conteúdo vazio');
      return NextResponse.json({ 
        erro: 'Nenhum conteúdo enviado' 
      }, { status: 400 });
    }
    
    if (conteudo.length < 50) {
      console.error('❌ Conteúdo muito curto:', conteudo.length);
      return NextResponse.json({ 
        erro: 'Digite pelo menos 50 caracteres para gerar questões.' 
      }, { status: 400 });
    }

    // 2. VERIFICAR API KEY
    const apiKey = process.env.DEEPSEEK_API_KEY;
    console.log('🔑 API Key:', apiKey ? `PRESENTE (${apiKey.substring(0, 10)}...)` : 'AUSENTE');
    
    if (!apiKey) {
      console.error('❌ DEEPSEEK_API_KEY não encontrada!');
      return NextResponse.json({ 
        erro: 'Chave da API DeepSeek não configurada. Adicione no .env.local' 
      }, { status: 500 });
    }

    // 3. PREPARAR O PROMPT
    const textoLimitado = conteudo.slice(0, 12000);
    const promptCompleto = PROMPT_IA + "\n\n" + textoLimitado;
    console.log('📤 Tamanho do prompt:', promptCompleto.length, 'caracteres');

    // 4. CHAMAR A DEEPSEEK
    console.log('📤 Enviando para DeepSeek...');
    console.log('📤 URL:', 'https://api.deepseek.com/v1/chat/completions');
    
    let respostaIA;
    try {
      respostaIA = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
    } catch (erro) {
      console.error('❌ Erro ao chamar DeepSeek:', erro);
      return NextResponse.json({ 
        erro: `Erro de rede: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}` 
      }, { status: 500 });
    }

    // 5. TRATAR RESPOSTA DA DEEPSEEK
    if (!respostaIA.ok) {
      let erroTexto;
      try {
        erroTexto = await respostaIA.text();
      } catch (e) {
        erroTexto = 'Não foi possível ler o erro';
      }
      console.error('❌ Erro DeepSeek:', respostaIA.status, erroTexto);
      
      let mensagemErro = 'Erro ao gerar questões com IA';
      if (respostaIA.status === 401) mensagemErro = 'Chave da API inválida. Verifique sua chave.';
      if (respostaIA.status === 402) mensagemErro = 'Saldo insuficiente. Adicione crédito.';
      if (respostaIA.status === 429) mensagemErro = 'Limite de requisições excedido. Tente mais tarde.';
      if (respostaIA.status === 500) mensagemErro = 'Erro interno da DeepSeek. Tente novamente.';
      
      return NextResponse.json({ erro: mensagemErro }, { status: respostaIA.status });
    }

    // 6. LER O CONTEÚDO GERADO
    let dadosIA;
    try {
      dadosIA = await respostaIA.json();
      console.log('📄 Resposta da DeepSeek recebida');
    } catch (erro) {
      console.error('❌ Erro ao ler resposta da DeepSeek:', erro);
      return NextResponse.json({ 
        erro: 'Erro ao ler resposta da IA' 
      }, { status: 500 });
    }

    const conteudoGerado = dadosIA.choices?.[0]?.message?.content;
    if (!conteudoGerado) {
      console.error('❌ Conteúdo gerado vazio');
      return NextResponse.json({ 
        erro: 'A IA não retornou conteúdo' 
      }, { status: 500 });
    }
    
    console.log('📄 Conteúdo gerado (primeiros 300 caracteres):');
    console.log(conteudoGerado.substring(0, 300));

    // 7. LIMPAR O JSON
    let jsonLimpo = conteudoGerado;
    jsonLimpo = jsonLimpo.replace(/```json\s*/g, '');
    jsonLimpo = jsonLimpo.replace(/```\s*/g, '');
    jsonLimpo = jsonLimpo.replace(/`/g, '');
    
    const matchJson = jsonLimpo.match(/\{[\s\S]*\}/);
    if (matchJson) {
      jsonLimpo = matchJson[0];
    }
    
    console.log('📄 JSON limpo (primeiros 300 caracteres):');
    console.log(jsonLimpo.substring(0, 300));

    // 8. PARSEAR O JSON
    let questoes;
    try {
      questoes = JSON.parse(jsonLimpo);
      console.log('✅ JSON parseado com sucesso');
    } catch (erro) {
      console.error('❌ Erro ao parsear JSON:', erro);
      console.log('📄 Conteúdo completo que falhou:');
      console.log(jsonLimpo);
      
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

    // 9. VALIDAR
    if (!questoes.questoes || !Array.isArray(questoes.questoes)) {
      console.error('❌ Formato inválido - não tem array de questões');
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

    console.log('✅ ===== SUCESSO! =====', questoesFinais.length, 'questões geradas');

    return NextResponse.json({
      sucesso: true,
      questoes: questoesFinais,
      total: questoesFinais.length,
      aviso: aviso || undefined
    });

  } catch (erro) {
    console.error('❌ Erro geral:', erro);
    console.error('❌ Stack trace:', erro instanceof Error ? erro.stack : 'Sem stack');
    return NextResponse.json({ 
      erro: `Erro interno: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}