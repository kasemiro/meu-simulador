// app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server';

// PROMPT DA IA PARA GERAR AS QUESTÕES
const PROMPT_IA = `
Você é um professor especialista em concursos públicos.

Crie 80 questões de múltiplíssima escolha sobre o conteúdo abaixo.

REGRAS IMPORTANTES:
1. Cada questão deve ter 4 alternativas: A, B, C, D
2. Indique a alternativa correta
3. Dê uma explicação do porquê a resposta está certa
4. As questões devem ser desafiadoras, nível médio/difícil
5. Misture assuntos diferentes
6. Use linguagem formal de concurso

FORMATO DE SAÍDA (use exatamente assim, em JSON):

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

// Função para extrair texto de PDF usando APIs nativas
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Converte o buffer para um Blob (tipo de arquivo)
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const arrayBuffer = await blob.arrayBuffer();
  
  // Tenta ler como texto UTF-8
  const textDecoder = new TextDecoder('utf-8');
  let text = textDecoder.decode(arrayBuffer);
  
  // Remove caracteres especiais e não imprimíveis
  text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
  
  // Se não pegou nada, tenta ler como texto puro (fallback)
  if (text.length < 50) {
    text = buffer.toString('utf-8').replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
  }
  
  return text.trim();
}

export async function POST(request: Request) {
  try {
    // 1. RECEBE O PDF DO USUÁRIO
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json(
        { erro: 'Nenhum PDF enviado' },
        { status: 400 }
      );
    }

    // 2. CONVERTE O PDF PARA TEXTO
    const buffer = Buffer.from(await file.arrayBuffer());
    let textoExtraido = await extractTextFromPDF(buffer);
    
    // Verifica se extraiu texto suficiente
    if (!textoExtraido || textoExtraido.length < 50) {
      return NextResponse.json(
        { 
          erro: 'Não foi possível extrair texto do PDF. Verifique se o PDF tem texto selecionável.' 
        },
        { status: 400 }
      );
    }

    // 3. LIMITA O TAMANHO DO TEXTO (DeepSeek tem limite de tokens)
    const textoLimitado = textoExtraido.slice(0, 15000);

    // 4. ENVIA PARA A DEEPSEEK
    const promptCompleto = PROMPT_IA + "\n\n" + textoLimitado;

    const respostaIA = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar questões de concurso público. Responda apenas com JSON válido, sem explicações extras.'
          },
          {
            role: 'user',
            content: promptCompleto
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    // 5. VERIFICA SE A RESPOSTA DA IA DEU CERTO
    if (!respostaIA.ok) {
      const erro = await respostaIA.text();
      console.error('Erro DeepSeek:', erro);
      return NextResponse.json(
        { erro: 'Erro ao gerar questões com IA' },
        { status: 500 }
      );
    }

    const dadosIA = await respostaIA.json();
    const conteudoGerado = dadosIA.choices[0].message.content;

    // 6. LIMPA E VALIDA O JSON
    let questoes;
    try {
      // Remove formatação markdown se existir
      const jsonLimpo = conteudoGerado
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      questoes = JSON.parse(jsonLimpo);
    } catch (erro) {
      console.error('Erro ao parsear JSON:', erro);
      console.log('Conteúdo recebido:', conteudoGerado);
      
      return NextResponse.json(
        { erro: 'IA retornou formato inválido. Tente novamente.' },
        { status: 500 }
      );
    }

    // 7. VERIFICA SE TEM EXATAMENTE 80 QUESTÕES
    if (!questoes.questoes || questoes.questoes.length !== 80) {
      return NextResponse.json(
        { erro: `Gerou ${questoes.questoes?.length || 0} questões, mas precisamos de 80` },
        { status: 500 }
      );
    }

    // 8. RETORNA O SUCESSO
    return NextResponse.json({
      sucesso: true,
      questoes: questoes.questoes,
      total: questoes.questoes.length
    });

  } catch (erro) {
    console.error('Erro geral:', erro);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}