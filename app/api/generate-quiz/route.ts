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

EXEMPLO DE UMA QUESTÃO (use este formato exato):
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

AGORA, CRIE 80 QUESTÕES SOBRE ESTE CONTEÚDO:

`;

export async function POST(request: Request) {
  try {
    console.log('📥 ===== INÍCIO =====');
    
    // 1. LER O CORPO
    const body = await request.json();
    const conteudo = body?.conteudo as string;
    
    console.log('📝 Conteúdo:', conteudo?.length || 0, 'caracteres');
    
    if (!conteudo || conteudo.length < 50) {
      return NextResponse.json({ 
        erro: 'Digite pelo menos 50 caracteres.' 
      }, { status: 400 });
    }

    // 2. VERIFICAR API KEY
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('❌ API Key ausente');
      return NextResponse.json({ 
        erro: 'Chave da API não configurada' 
      }, { status: 500 });
    }

    // 3. PREPARAR PROMPT
    const textoLimitado = conteudo.slice(0, 10000);
    const promptCompleto = PROMPT_IA + "\n\n" + textoLimitado;

    console.log('📤 Enviando para DeepSeek...');

    // 4. CHAMAR DEEPSEEK
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
            content: 'Você é um assistente que responde APENAS com JSON válido. NUNCA adicione texto antes ou depois. NUNCA use Markdown. Apenas o JSON puro.'
          },
          {
            role: 'user',
            content: promptCompleto
          }
        ],
        temperature: 0.7,
        max_tokens: 12000
      })
    });

    if (!respostaIA.ok) {
      const erroTexto = await respostaIA.text();
      console.error('❌ Erro DeepSeek:', respostaIA.status, erroTexto);
      
      let mensagem = 'Erro ao gerar questões';
      if (respostaIA.status === 401) mensagem = 'Chave da API inválida';
      if (respostaIA.status === 402) mensagem = 'Saldo insuficiente';
      if (respostaIA.status === 429) mensagem = 'Limite excedido';
      
      return NextResponse.json({ erro: mensagem }, { status: respostaIA.status });
    }

    const dadosIA = await respostaIA.json();
    let conteudoGerado = dadosIA.choices[0].message.content;
    
    console.log('📄 Resposta da IA (primeiros 500 caracteres):');
    console.log(conteudoGerado.substring(0, 500));

    // 5. EXTRAIR JSON - MÚLTIPLAS ESTRATÉGIAS
    let jsonStr = '';
    
    // Estratégia 1: Remover markdown
    let limpo = conteudoGerado
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/`/g, '')
      .trim();
    
    // Estratégia 2: Encontrar primeiro { e último }
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio !== -1 && fim !== -1 && fim > inicio) {
      jsonStr = limpo.substring(inicio, fim + 1);
    } else {
      jsonStr = limpo;
    }
    
    console.log('📄 JSON extraído (primeiros 300 caracteres):');
    console.log(jsonStr.substring(0, 300));

    // 6. TENTAR PARSEAR
    let questoesData = null;
    let erroParse = null;
    
    try {
      questoesData = JSON.parse(jsonStr);
      console.log('✅ JSON parseado com sucesso!');
    } catch (erro) {
      erroParse = erro;
      console.error('❌ Erro no parse:', erro);
      
      // Tenta reparar o JSON
      try {
        // Tenta encontrar o array de questões com regex
        const match = jsonStr.match(/"questoes"\s*:\s*\[([\s\S]*?)\]/);
        if (match) {
          const tentativa = '{"questoes": [' + match[1] + ']}';
          questoesData = JSON.parse(tentativa);
          console.log('✅ Recuperado com regex!');
        }
      } catch (erro2) {
        console.error('❌ Falha na recuperação:', erro2);
      }
    }

    // 7. VALIDAR
    if (!questoesData || !questoesData.questoes || !Array.isArray(questoesData.questoes)) {
      console.error('❌ Estrutura inválida');
      console.log('📄 Conteúdo completo que falhou:');
      console.log(jsonStr);
      
      return NextResponse.json({
        erro: 'A IA não retornou um formato válido. Tente com um texto mais curto ou diferente.'
      }, { status: 500 });
    }

    let questoes = questoesData.questoes;
    console.log('📊 Total de questões geradas:', questoes.length);

    // Valida cada questão
    const questoesValidas = questoes.filter((q: any) => {
      return q.pergunta && 
             q.opcoes && 
             q.opcoes.A && 
             q.opcoes.B && 
             q.opcoes.C && 
             q.opcoes.D && 
             q.correta && 
             q.explicacao;
    });

    console.log('✅ Questões válidas:', questoesValidas.length);

    if (questoesValidas.length === 0) {
      return NextResponse.json({
        erro: 'As questões geradas estão incompletas. Tente novamente.'
      }, { status: 500 });
    }

    // Pega no máximo 80
    const questoesFinais = questoesValidas.slice(0, 80);
    let aviso = '';
    
    if (questoesFinais.length < 80) {
      aviso = `⚠️ Gerou apenas ${questoesFinais.length} questões completas. Tente colar mais conteúdo.`;
    }

    console.log('✅ SUCESSO!', questoesFinais.length, 'questões retornadas');

    return NextResponse.json({
      sucesso: true,
      questoes: questoesFinais,
      total: questoesFinais.length,
      aviso: aviso || undefined
    });

  } catch (erro) {
    console.error('❌ Erro geral:', erro);
    return NextResponse.json({
      erro: `Erro: ${erro instanceof Error ? erro.message : 'Erro desconhecido'}`
    }, { status: 500 });
  }
}