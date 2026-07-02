// app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server';

// ============================================================
// CONFIGURAÇÕES DE SEGURANÇA
// ============================================================

const CONFIG = {
  MAX_CONTENT_LENGTH: 10000,      // Máximo de caracteres do conteúdo
  MIN_CONTENT_LENGTH: 50,         // Mínimo de caracteres do conteúdo
  MAX_QUESTIONS: 40,              // Máximo de questões por requisição
  ALLOWED_ORIGINS: [
    'http://localhost:3000',      // Desenvolvimento local
    'https://meu-simulador-pink.vercel.app/',  // Produção
    // Adicione outros domínios aqui
  ],
};

// ============================================================
// FUNÇÃO: VERIFICAR ORIGEM
// ============================================================

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // Permitir localhost em qualquer porta (para desenvolvimento)
  if (origin.match(/^http:\/\/localhost:\d+$/)) {
    return true;
  }
  
  return CONFIG.ALLOWED_ORIGINS.includes(origin);
}

// ============================================================
// FUNÇÃO: VALIDAR CONTEÚDO
// ============================================================

function validarConteudo(conteudo: string): { valido: boolean; erro?: string } {
  if (!conteudo || conteudo.trim().length === 0) {
    return { valido: false, erro: 'Nenhum conteúdo fornecido.' };
  }
  
  if (conteudo.trim().length < CONFIG.MIN_CONTENT_LENGTH) {
    return { valido: false, erro: `Digite pelo menos ${CONFIG.MIN_CONTENT_LENGTH} caracteres.` };
  }
  
  if (conteudo.length > CONFIG.MAX_CONTENT_LENGTH) {
    return { valido: false, erro: `Conteúdo muito grande. Máximo de ${CONFIG.MAX_CONTENT_LENGTH} caracteres.` };
  }
  
  return { valido: true };
}

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
  const startTime = Date.now();
  
  try {
    // ============================================================
    // 1. VERIFICAR ORIGEM DA REQUISIÇÃO (CORS)
    // ============================================================
    
    const origin = request.headers.get('origin');
    console.log(`🔍 Origem da requisição: ${origin || 'Desconhecida'}`);
    
    if (!isOriginAllowed(origin)) {
      console.log(`🚫 Origem bloqueada: ${origin}`);
      return NextResponse.json({
        erro: 'Origem não autorizada.'
      }, { status: 403 });
    }
    
    console.log('✅ Origem autorizada');

    // ============================================================
    // 2. VERIFICAR TAMANHO DA REQUISIÇÃO
    // ============================================================
    
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1000000) { // 1MB
      console.log(`🚫 Requisição muito grande: ${contentLength} bytes`);
      return NextResponse.json({
        erro: 'Requisição muito grande. Máximo de 1MB.'
      }, { status: 413 });
    }

    // ============================================================
    // 3. VALIDAR CORPO DA REQUISIÇÃO
    // ============================================================
    
    let body;
    try {
      body = await request.json();
    } catch (erro) {
      console.log('🚫 Erro ao ler corpo da requisição');
      return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
    }
    
    const conteudo = body?.conteudo as string;
    const quantidade = Math.min(body?.quantidade || 40, CONFIG.MAX_QUESTIONS);
    const banca = body?.banca || '📚 Genérica';
    
    console.log('📝 Conteúdo:', conteudo?.length || 0, 'caracteres');
    console.log('📊 Quantidade:', quantidade);
    console.log('🎯 Banca:', banca);
    
    // ============================================================
    // 4. VALIDAR CONTEÚDO
    // ============================================================
    
    const validacao = validarConteudo(conteudo);
    if (!validacao.valido) {
      return NextResponse.json({ erro: validacao.erro }, { status: 400 });
    }

    // ============================================================
    // 5. VERIFICAR API KEY (SEM EXPOR NOS LOGS)
    // ============================================================
    
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // ⚠️ IMPORTANTE: NUNCA logar a chave completa!
    if (!apiKey) {
      console.error('❌ API Key ausente (não logada por segurança)');
      return NextResponse.json({ 
        erro: 'Chave da API não configurada.' 
      }, { status: 500 });
    }
    
    // Apenas loga que existe, sem mostrar a chave
    console.log('🔑 API Key presente: ✅');

    // ============================================================
    // 6. GERAR PROMPT E CHAMAR API
    // ============================================================
    
    const promptBase = getPromptPorBanca(banca, quantidade);
    const textoLimitado = conteudo.slice(0, CONFIG.MAX_CONTENT_LENGTH);
    const promptCompleto = promptBase + `\n\nCONTEÚDO:\n${textoLimitado}`;

    console.log('📤 Enviando para DeepSeek...');

    // ============================================================
    // 7. CHAMAR API DEEPSEEK (COM A CHAVE)
    // ============================================================
    
    try {
      const respostaIA = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`  // ← Chave usada aqui, nunca exposta
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
        // Não mostra detalhes do erro para o usuário (segurança)
        console.error(`❌ Erro DeepSeek: ${respostaIA.status}`);
        return NextResponse.json({ 
          erro: 'Erro na geração de questões. Tente novamente.' 
        }, { status: respostaIA.status });
      }

      const dadosIA = await respostaIA.json();
      let conteudoGerado = dadosIA.choices[0].message.content;
      
      console.log('📄 Resposta recebida (primeiros 500 caracteres):');
      console.log(conteudoGerado.substring(0, 500));

      // ============================================================
      // 8. EXTRAIR JSON
      // ============================================================
      
      let jsonStr = conteudoGerado
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/`/g, '')
        .trim();
      
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        jsonStr = match[0];
      }

      // ============================================================
      // 9. TENTA PARSEAR
      // ============================================================
      
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

      // ============================================================
      // 10. VALIDA AS QUESTÕES
      // ============================================================
      
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
        return NextResponse.json({
          erro: 'Não foi possível gerar questões. Tente um texto diferente.'
        }, { status: 500 });
      }

      // ============================================================
      // 11. RETORNA
      // ============================================================
      
      const questoesFinais = questoesValidas.slice(0, quantidade);
      let aviso = '';
      
      if (questoesFinais.length < quantidade) {
        aviso = `⚠️ Gerou apenas ${questoesFinais.length} questões. Tente colar mais conteúdo.`;
      }

      const endTime = Date.now();
      console.log(`✅ SUCESSO! ${questoesFinais.length} questões em ${(endTime - startTime) / 1000}s`);

      return NextResponse.json({
        sucesso: true,
        questoes: questoesFinais,
        total: questoesFinais.length,
        aviso: aviso || undefined
      });

    } catch (erro) {
      console.error('❌ Erro na comunicação com DeepSeek:', erro);
      return NextResponse.json({
        erro: 'Erro na comunicação com o servidor. Tente novamente.'
      }, { status: 500 });
    }

  } catch (erro) {
    console.error('❌ Erro geral:', erro);
    return NextResponse.json({
      erro: 'Erro interno. Tente novamente.'
    }, { status: 500 });
  }
}