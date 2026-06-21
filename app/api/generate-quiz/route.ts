// app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('📥 ===== INÍCIO =====');
    
    const body = await request.json();
    const conteudo = body?.conteudo as string;
    
    console.log('📝 Conteúdo:', conteudo?.length || 0, 'caracteres');
    
    if (!conteudo || conteudo.length < 50) {
      return NextResponse.json({ 
        erro: 'Digite pelo menos 50 caracteres.' 
      }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        erro: 'Chave da API não configurada' 
      }, { status: 500 });
    }

    // ===== PROMPT SIMPLIFICADO =====
    // Em vez de pedir 80, pedimos 20 questões por vez (mais fácil de processar)
    const PROMPT_BASE = `
Você é um professor de concurso público.

Crie 20 questões de múltipla escolha sobre o conteúdo abaixo.

REGRAS:
- 4 alternativas: A, B, C, D
- Indique a correta
- Dê uma explicação

RESPONDA APENAS COM JSON. NADA MAIS.

FORMATO EXATO:
{"questoes":[{"pergunta":"texto","opcoes":{"A":"opcao","B":"opcao","C":"opcao","D":"opcao"},"correta":"A","explicacao":"texto"}]}

CONTEÚDO:
`;

    const textoLimitado = conteudo.slice(0, 8000);
    const prompt = PROMPT_BASE + "\n\n" + textoLimitado;

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
            content: 'Você responde apenas com JSON puro, sem texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
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
    
    console.log('📄 Resposta recebida (primeiros 300 caracteres):');
    console.log(conteudoGerado.substring(0, 300));

    // ===== EXTRAIR JSON =====
    // Remove tudo que não é JSON
    let jsonStr = conteudoGerado
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/`/g, '')
      .trim();
    
    // Encontra o JSON
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
      console.log('📄 Conteúdo completo:');
      console.log(jsonStr);
      
      // Tenta extrair com regex
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
             q.opcoes && 
             typeof q.opcoes === 'object' &&
             q.opcoes.A && 
             q.opcoes.B && 
             q.opcoes.C && 
             q.opcoes.D &&
             q.correta && 
             ['A','B','C','D'].includes(q.correta) &&
             q.explicacao;
    });

    console.log('✅ Questões válidas:', questoesValidas.length);

    if (questoesValidas.length === 0) {
      // Se falhou, tenta gerar questões manualmente como fallback
      console.log('🔄 Tentando fallback...');
      
      // Cria questões genéricas baseadas no conteúdo
      const questoesFallback = gerarQuestoesFallback(conteudo);
      
      if (questoesFallback.length > 0) {
        return NextResponse.json({
          sucesso: true,
          questoes: questoesFallback.slice(0, 80),
          total: questoesFallback.length,
          aviso: '⚠️ Geradas questões de fallback. A IA teve dificuldade, mas criamos questões automaticamente.'
        });
      }
      
      return NextResponse.json({
        erro: 'Não foi possível gerar questões. Tente um texto diferente ou mais curto.'
      }, { status: 500 });
    }

    // ===== RETORNA =====
    const questoesFinais = questoesValidas.slice(0, 80);
    let aviso = '';
    
    if (questoesFinais.length < 80) {
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

// ===== FUNÇÃO DE FALLBACK =====
function gerarQuestoesFallback(conteudo: string): any[] {
  const questoes = [];
  const topicos = conteudo.split(/[.;,]/).filter(t => t.trim().length > 20);
  
  // Pega os primeiros 80 tópicos
  const topicosSelecionados = topicos.slice(0, 80);
  
  for (let i = 0; i < topicosSelecionados.length; i++) {
    const topico = topicosSelecionados[i].trim();
    if (topico.length < 10) continue;
    
    questoes.push({
      pergunta: `Sobre "${topico.substring(0, 80)}..." qual afirmação está correta?`,
      opcoes: {
        A: `A afirmação correta sobre ${topico.substring(0, 30)} é verdadeira`,
        B: `A afirmação incorreta sobre ${topico.substring(0, 30)} é falsa`,
        C: `Não há informação suficiente sobre ${topico.substring(0, 30)}`,
        D: `Todas as alternativas estão corretas`
      },
      correta: 'A',
      explicacao: `De acordo com o conteúdo: "${topico}". A alternativa A está correta porque reflete o conteúdo apresentado.`
    });
  }
  
  return questoes;
}