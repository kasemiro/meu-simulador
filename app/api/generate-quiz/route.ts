// app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server';

// ============================================================
// FUNÇÃO: GERAR PROMPT POR BANCA
// ============================================================

function getPromptPorBanca(banca: string, quantidade: number): string {
  const basePrompt = `
Você é um professor especialista em concursos públicos e um especialista na banca.

CRIE EXATAMENTE ${quantidade} QUESTÕES de múltipla escolha sobre o conteúdo abaixo.

INSTRUÇÕES GERAIS:
1. Cada questão deve ter 4 alternativas: A, B, C, D
2. Apenas UMA alternativa deve ser correta
3. Dê uma explicação detalhada do porquê a resposta está certa
4. Use linguagem formal de concurso
5. RESPONDA APENAS COM JSON. NADA MAIS.

FORMATO EXATO:
{"questoes":[
  {
    "pergunta": "Texto da pergunta?",
    "opcoes": {
      "A": "Primeira opção",
      "B": "Segunda opção",
      "C": "Terceira opção",
      "D": "Quarta opção"
    },
    "correta": "A",
    "explicacao": "Explicação detalhada..."
  }
]}
`;

  const promptsPorBanca: Record<string, string> = {
    '🎯 FGV': `
${basePrompt}

ESTILO FGV (Fundação Getúlio Vargas):
- Use textos de apoio longos (filósofos ou doutrinadores) como contexto
- Crie alternativas com sinônimos perfeitos onde apenas um se encaixa no contexto
- Faça pegadinhas com palavras como "desde que" ou "contanto que"
- Cobrar conceitos de "Teoria Geral" e princípios implícitos
- Alto grau de interpretação
- Alternativa 'E' raramente deve ser a correta
- Enunciados com comando indireto: "De acordo com...", "Considerando..."
`,

    '📋 CEBRASPE': `
${basePrompt}

ESTILO CEBRASPE (Centro Brasileiro de Pesquisa em Avaliação):
- Formato "julgue o item" (Certo ou Errado)
- Frases curtas, mas altamente técnicas
- Pegadinha: informação 100% correta, mas deturpar o final
- Cobrar entendimentos do STF em Repercussão Geral
- Alternativas curtas e diretas
- Comando direto: "Julgue o item a seguir..."
`,

    '📝 VUNESP': `
${basePrompt}

ESTILO VUNESP:
- Questões diretas com comando claro: "Assinale a alternativa correta"
- Cobrar literalidade da lei e jurisprudência sumulada
- Repetir o nome da lei no enunciado
- Alternativas com 5 linhas cada
- Diferença entre certa e errada é uma única palavra
- Comando claro: "Assinale a alternativa que..."
`,

    '⚖️ FCC': `
${basePrompt}

ESTILO FCC (Fundação Carlos Chagas):
- Cobrar súmulas do STJ e STF de forma LITERAL
- Misturar duas leis no mesmo enunciado
- Enunciados extensos com situação-problema (caso concreto)
- Exigir solução com base na lei seca
- Comando indireto: "Considerando a situação hipotética..."
`,

    '📚 Genérica': `
${basePrompt}

ESTILO GENÉRICO:
- Questões padrão de múltipla escolha
- Comando claro e direto
- Nível médio de dificuldade
- Distribuição equilibrada entre os tópicos
- Comando: "Assinale a alternativa correta"
`
  };

  return promptsPorBanca[banca] || promptsPorBanca['📚 Genérica'];
}

// ============================================================
// FUNÇÃO PRINCIPAL (POST)
// ============================================================

export async function POST(request: Request) {
  try {
    console.log('📥 ===== INÍCIO =====');
    
    const body = await request.json();
    const conteudo = body?.conteudo as string;
    const quantidade = body?.quantidade || 40;
    const banca = body?.banca || '📚 Genérica';
    
    console.log('📝 Conteúdo:', conteudo?.length || 0, 'caracteres');
    console.log('📊 Quantidade:', quantidade);
    console.log('🎯 Banca:', banca);
    
    if (!conteudo || conteudo.length < 50) {
      return NextResponse.json({ 
        erro: 'Digite pelo menos 50 caracteres.' 
      }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('❌ API Key ausente');
      return NextResponse.json({ 
        erro: 'Chave da API não configurada' 
      }, { status: 500 });
    }

    // ===== PROMPT ESPECÍFICO DA BANCA =====
    const promptBase = getPromptPorBanca(banca, quantidade);
    const textoLimitado = conteudo.slice(0, 8000);
    const promptCompleto = promptBase + `\n\nCONTEÚDO:\n${textoLimitado}`;

    console.log('📤 Enviando para DeepSeek...');

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
            content: 'Você é um especialista em criar questões de concurso. Responda apenas com JSON puro, sem texto adicional.'
          },
          {
            role: 'user',
            content: promptCompleto
          }
        ],
        temperature: 0.8,
        max_tokens: 16000
      })
    });

    if (!respostaIA.ok) {
      const erroTexto = await respostaIA.text();
      console.error('❌ Erro DeepSeek:', respostaIA.status, erroTexto);
      return NextResponse.json({ 
        erro: `Erro na API: ${respostaIA.status}` 
      }, { status: respostaIA.status });
    }

    const dadosIA = await respostaIA.json();
    let conteudoGerado = dadosIA.choices[0].message.content;
    
    console.log('📄 Resposta recebida (primeiros 500 caracteres):');
    console.log(conteudoGerado.substring(0, 500));

    // ===== EXTRAIR JSON =====
    let jsonStr = conteudoGerado
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/`/g, '')
      .trim();
    
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      jsonStr = match[0];
    }
    
    console.log('📄 JSON extraído (primeiros 300 caracteres):');
    console.log(jsonStr.substring(0, 300));

    // ===== TENTA PARSEAR =====
    let questoes = [];
    
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.questoes && Array.isArray(parsed.questoes)) {
        questoes = parsed.questoes;
        console.log('✅ Parseado com sucesso!', questoes.length, 'questões');
      }
    } catch (erro) {
      console.error('❌ Erro no parse:', erro);
      
      try {
        const regexMatch = jsonStr.match(/"questoes"\s*:\s*\[([\s\S]*?)\]/);
        if (regexMatch) {
          const tentativa = '{"questoes": [' + regexMatch[1] + ']}';
          const parsed = JSON.parse(tentativa);
          if (parsed.questoes && Array.isArray(parsed.questoes)) {
            questoes = parsed.questoes;
            console.log('✅ Recuperado com regex!', questoes.length, 'questões');
          }
        }
      } catch (erro2) {
        console.error('❌ Falha na recuperação:', erro2);
      }
    }

    // ===== VALIDA AS QUESTÕES =====
    const questoesValidas = questoes.filter((q: any) => {
      return q.pergunta && 
             typeof q.pergunta === 'string' &&
             q.pergunta.length > 10 &&
             q.opcoes && 
             typeof q.opcoes === 'object' &&
             q.opcoes.A && typeof q.opcoes.A === 'string' &&
             q.opcoes.B && typeof q.opcoes.B === 'string' &&
             q.opcoes.C && typeof q.opcoes.C === 'string' &&
             q.opcoes.D && typeof q.opcoes.D === 'string' &&
             q.correta && 
             ['A','B','C','D'].includes(q.correta) &&
             q.explicacao && typeof q.explicacao === 'string';
    });

    console.log('✅ Questões válidas:', questoesValidas.length);

    if (questoesValidas.length === 0) {
      const questoesFallback = gerarQuestoesFallback(conteudo, quantidade);
      if (questoesFallback.length > 0) {
        return NextResponse.json({
          sucesso: true,
          questoes: questoesFallback.slice(0, quantidade),
          total: questoesFallback.length,
          aviso: '⚠️ Geradas questões automáticas.'
        });
      }
      
      return NextResponse.json({
        erro: 'Não foi possível gerar questões. Tente um texto diferente.'
      }, { status: 500 });
    }

    // ===== RETORNA =====
    const questoesFinais = questoesValidas.slice(0, quantidade);
    let aviso = '';
    
    if (questoesFinais.length < quantidade) {
      aviso = `⚠️ Gerou apenas ${questoesFinais.length} questões. Tente colar mais conteúdo.`;
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

// ============================================================
// FUNÇÃO DE FALLBACK
// ============================================================

function gerarQuestoesFallback(conteudo: string, quantidade: number): any[] {
  const questoes = [];
  const topicos = conteudo.split(/[.;,]/).filter(t => t.trim().length > 30);
  const topicosSelecionados = topicos.slice(0, quantidade);
  
  for (let i = 0; i < topicosSelecionados.length; i++) {
    const topico = topicosSelecionados[i].trim();
    if (topico.length < 20) continue;
    
    const tiposPergunta = [
      `Qual das seguintes afirmações sobre "${topico.substring(0, 50)}..." está correta?`,
      `De acordo com o conteúdo, o que se pode afirmar sobre "${topico.substring(0, 50)}..."?`,
      `Sobre "${topico.substring(0, 50)}...", é correto dizer que:`
    ];
    
    const pergunta = tiposPergunta[i % tiposPergunta.length];
    
    questoes.push({
      pergunta: pergunta,
      opcoes: {
        A: `A afirmação sobre ${topico.substring(0, 20)} é verdadeira`,
        B: `A afirmação sobre ${topico.substring(0, 20)} é falsa`,
        C: `Não há informações suficientes sobre ${topico.substring(0, 20)}`,
        D: `Todas as afirmações estão corretas`
      },
      correta: 'A',
      explicacao: `De acordo com o conteúdo: "${topico}". A alternativa A está correta.`
    });
  }
  
  return questoes;
}