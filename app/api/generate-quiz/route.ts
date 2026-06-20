// app/api/generate-quiz/route.ts
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse-fixed';

// ESSA É A FUNÇÃO QUE A IA USA PARA GERAR AS QUESTÕES
const PROMPT_IA = `
Você é um professor especialista em concursos públicos.

Crie 80 questões de múltipla escolha sobre o conteúdo abaixo.

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

export async function POST(request: Request) {
  try {
    // 1. Recebe o PDF do usuário
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json(
        { erro: 'Nenhum PDF enviado' },
        { status: 400 }
      );
    }

    // 2. Converte PDF para texto
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const textoExtraido = pdfData.text;

    if (!textoExtraido || textoExtraido.length < 100) {
      return NextResponse.json(
        { erro: 'PDF muito curto ou sem texto legível' },
        { status: 400 }
      );
    }

    // 3. Manda para o DeepSeek
    const promptCompleto = PROMPT_IA + "\n" + textoExtraido;

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

    // 4. Limpa e valida o JSON
    let questoes;
    try {
      const jsonLimpo = conteudoGerado.replace(/```json/g, '').replace(/```/g, '').trim();
      questoes = JSON.parse(jsonLimpo);
    } catch (erro) {
      console.error('Erro ao parsear JSON:', erro);
      return NextResponse.json(
        { erro: 'IA retornou formato inválido. Tente novamente.' },
        { status: 500 }
      );
    }

    // 5. Verifica se tem 80 questões
    if (!questoes.questoes || questoes.questoes.length !== 80) {
      return NextResponse.json(
        { erro: `Gerou ${questoes.questoes?.length || 0} questões, mas precisamos de 80` },
        { status: 500 }
      );
    }

    // 6. Retorna as questões
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