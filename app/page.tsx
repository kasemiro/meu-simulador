// ============================================================
// ARQUIVO: app/page.tsx
// DESCRIÇÃO: Página principal do Simulador de Concurso com IA
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';

// ============================================================
// TIPOS (TypeScript)
// ============================================================

type Questao = {
  pergunta: string;
  opcoes: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correta: string;
  explicacao: string;
};

// ============================================================
// CATEGORIAS COM CONTEÚDO PRÉ-DEFINIDO
// ============================================================

const CATEGORIAS = [
  {
    nome: '📚 Língua Portuguesa',
    conteudo: `Língua Portuguesa para concursos públicos:

    1. Interpretação de Texto: A princípio, a interpretação de texto envolve análise e compreensão, considerando a palavra e seu significado (sinonímia, antonímia e ambiguidade). Além disso, os níveis da significação (denotação e conotação) e as figuras de linguagem são amplamente cobrados. Portanto, praticar com textos variados é essencial.

    2. Fonética: Agora, a fonética abrange o estudo do fonema e da letra, encontros vocálicos (ditongo, tritongo e hiato), encontros consonantais e dígrafos. Além disso, a tonicidade (monossílaba, dissílaba, trissílaba, oxítona, paroxítona e proparoxítona) e a separação de sílabas são temas recorrentes.
    
    3. Morfologia: Sobretudo, a morfologia estuda os radicais, os processos de prefixação, sufixação, parassíntese, composição, derivação e hibridismo. Ou seja, é fundamental para compreender a estrutura e a formação das palavras.
    
    4. Sintaxe: A princípio, a sintaxe trata do sujeito e do predicado e suas respectivas classificações, da transitividade dos verbos e da complementação. Além disso, abrange frase, oração, período e suas classificações, além da concordância e da regência em todas as suas formas.
    
    5. Classes Gramaticais: Agora, as classes gramaticais incluem substantivos, artigos, adjetivos, numerais, pronomes, advérbios, preposições, conjunções, verbos e suas flexões. Portanto, conhecer cada uma delas é indispensável para a análise morfossintática.
    
    6. Acentuação Gráfica: Além disso, a acentuação gráfica segue regras específicas que devem ser dominadas, principalmente com base no novo acordo ortográfico da Língua Portuguesa.
    
    7. Uso do Sinal de Crase: Por fim, o uso da crase é um dos temas que mais geram dúvidas. Nesse sentido, as bancas exigem conhecimento sobre quando seu uso é obrigatório, facultativo ou proibido.
    
    8. Pontuação e Regras de Uso: Sobretudo, a pontuação é crucial para a coerência textual. Portanto, o uso correto de vírgulas, pontos, dois-pontos e travessões deve ser praticado com frequência.
    
    9. Ortografia Oficial e Norma Culta: Agora, a ortografia oficial e a norma culta são a base para todas as questões de Língua Portuguesa. Além disso, a redação de correspondências oficiais também é cobrada, exigindo domínio da linguagem formal e do novo acordo ortográfico.`
  },
  {
    nome: '🔢 Matemática',
    conteudo: `Matemática para concursos públicos:

    1. Números Naturais: A princípio, o conjunto dos números naturais é a base da matemática. Além disso, envolve representação geométrica, comparação e os sistemas atuais de numeração. As operações fundamentais (adição, subtração, multiplicação e divisão) são essenciais, assim como suas propriedades. Sobretudo, potenciação, radiciação e divisibilidade são temas recorrentes. Portanto, a resolução de problemas práticos é fundamental para fixar o conteúdo.

    2. Números Racionais: Agora, os números racionais incluem frações e decimais, com suas respectivas operações. Além disso, a porcentagem é amplamente cobrada, principalmente em situações do cotidiano e em gráficos. Nesse sentido, a interpretação de gráficos e o sistema monetário também fazem parte desse bloco. Por fim, a resolução de problemas envolvendo equações de 1º e 2º graus completa este tópico.
    
    3. Aritmética Básica: Sobretudo, a aritmética básica compreende as operações fundamentais (adição, subtração, multiplicação e divisão). Além disso, a regra de três simples e composta é muito utilizada para resolver problemas de proporcionalidade. A porcentagem e a proporção também estão presentes nesse bloco, sendo aplicadas em diversas situações.
    
    4. Álgebra: A princípio, a álgebra trabalha com expressões algébricas, equações e inequações do 1º e 2º grau. Além disso, os sistemas de equações são frequentemente cobrados em provas de concursos. Portanto, dominar esses tópicos é indispensável para resolver problemas matemáticos com eficiência.
    
    5. Geometria: Agora, a geometria é dividida em três partes principais. Primeiramente, a geometria plana aborda áreas e perímetros de figuras planas. Em segundo lugar, a geometria espacial trata de volumes e áreas de sólidos geométricos. Por fim, noções de geometria analítica também são exigidas em alguns concursos.
    
    6. Análise Combinatória e Probabilidade: Sobretudo, a análise combinatória envolve contagem de elementos, fatorial, permutações, combinações e arranjos simples. Além disso, a probabilidade básica é cobrada para calcular chances de ocorrência de eventos. Nesse sentido, esses temas são muito comuns em questões de raciocínio lógico.
    
    7. Matemática Financeira: A princípio, a matemática financeira trabalha com juros simples e compostos, além da porcentagem aplicada a situações financeiras. Portanto, entender esses conceitos é essencial para resolver problemas envolvendo empréstimos, financiamentos e investimentos.
    
    8. Estatística: Agora, a estatística traz noções básicas sobre coleta e organização de dados. Além disso, a interpretação de gráficos e tabelas é amplamente cobrada em provas, exigindo do candidato a capacidade de extrair informações corretamente.
    
    9. Raciocínio Lógico: Sobretudo, o raciocínio lógico envolve proposições lógicas, tabelas verdade e raciocínio lógico-matemático. Além disso, esse bloco testa a capacidade do candidato de resolver problemas de forma estruturada e coerente, sendo cada vez mais valorizado em concursos.
    
    10. Resolução de Problemas: Por fim, a resolução de problemas é a aplicação prática de todos os conceitos matemáticos em situações do cotidiano. Portanto, praticar com questões de provas anteriores e exercícios variados é a melhor forma de consolidar o aprendizado e garantir um bom desempenho.`
  },
  {
    nome: '📖 Pedagogia',
    conteudo: `Pedagogia para concursos públicos:

1. Legislação Educacional: LDB (Lei nº 9.394/96), ECA (Estatuto da Criança e do Adolescente), BNCC (Base Nacional Comum Curricular) e o PNE (Plano Nacional de Educação).

2. Teorias da Aprendizagem: Conhecer os clássicos da educação como Piaget (desenvolvimento), Vygotsky (interacionismo) e Wallon (afetividade).

3. Didática e Organização Escolar: Planejamento participativo, PPP (Projeto Político-Pedagógico), currículo, avaliação formativa e tendências pedagógicas.

4. Educação Inclusiva: Atendimento Educacional Especializado (AEE) e diretrizes para a educação especial, Pilares da Educação.`
  },
  {
    nome: '🏛️ História',
    conteudo: `História para concursos públicos:

    1. Avaliação da Aprendizagem: A princípio, a avaliação da aprendizagem é um processo contínuo que visa verificar o desenvolvimento do aluno. Além disso, envolve diferentes instrumentos e critérios, considerando aspectos qualitativos e quantitativos. Portanto, o professor deve utilizar a avaliação como ferramenta de diagnóstico e reflexão sobre sua prática pedagógica.

    2. Didática e Trabalho Pedagógico: Agora, a didática é o campo que estuda os métodos e técnicas de ensino. Sobretudo, o trabalho pedagógico envolve a organização do processo de ensino-aprendizagem, considerando a relação professor-aluno, os recursos didáticos e as estratégias de ensino. Nesse sentido, uma prática pedagógica bem planejada favorece a aprendizagem significativa.
    
    3. Fundamentos de Currículo: A princípio, o currículo é o conjunto de conhecimentos e práticas que orientam a ação educativa. Além disso, seus fundamentos envolvem aspectos históricos, sociais, políticos e culturais. Portanto, compreender as teorias curriculares é essencial para elaborar propostas pedagógicas alinhadas à realidade dos alunos.
    
    4. Perspectivas Metodológicas: Sobretudo, as perspectivas metodológicas orientam a escolha das abordagens de ensino. Além disso, incluem tendências como o construtivismo, o sociointeracionismo e o ensino baseado em projetos. Por fim, o professor deve conhecer diferentes metodologias para adequar sua prática às necessidades dos estudantes.
    
    5. Planejamento e Gestão Educacional: Agora, o planejamento educacional envolve a organização de objetivos, conteúdos e estratégias. Além disso, a gestão educacional abrange a administração de recursos, a coordenação pedagógica e a articulação com a comunidade escolar. Portanto, um bom planejamento e uma gestão participativa são fundamentais para o sucesso da instituição de ensino.
    
    6. Psicologia do Desenvolvimento e da Aprendizagem: A princípio, a psicologia do desenvolvimento estuda as transformações físicas, cognitivas e emocionais ao longo da vida. Além disso, a psicologia da aprendizagem investiga como os indivíduos adquirem conhecimentos e habilidades. Nesse sentido, conhecer as teorias de Piaget, Vygotsky e outros autores é indispensável para o educador.
    
    7. Metodologia de Ensino de História: Sobretudo, a metodologia de ensino de História busca promover a compreensão crítica dos processos históricos. Além disso, envolve a utilização de fontes, documentos, imagens e narrativas para construir o conhecimento histórico. Portanto, o professor deve estimular o pensamento histórico e a reflexão sobre o presente.
    
    8. Pré-História e Sociedades Antigas: A princípio, a Pré-História abrange o período desde o surgimento dos primeiros hominídeos até o desenvolvimento da escrita. Além disso, as sociedades da antiguidade incluem civilizações como Egito, Mesopotâmia, Grécia e Roma. Nesse sentido, compreender essas culturas é essencial para entender a formação do mundo ocidental.
    
    9. Sociedade Medieval e Transformações Econômicas: Agora, a sociedade medieval foi marcada pelo feudalismo e pela influência da Igreja. Além disso, as transformações econômicas, políticas e sociais ocorridas com o desenvolvimento do comércio e da vida urbana deram origem ao Renascimento e às grandes navegações. Portanto, esse período é fundamental para entender a transição para a Idade Moderna.
    
    10. Expansão Marítima e Colonização da América: Sobretudo, a expansão marítima europeia, liderada por portugueses e espanhóis, resultou no processo de colonização da América. Além disso, a Reforma Protestante e o Renascimento Cultural foram movimentos que transformaram a mentalidade europeia. Nesse sentido, esses eventos tiveram impactos profundos na história mundial.
    
    11. Iluminismo e Revolução Industrial: A princípio, o Iluminismo foi um movimento intelectual que defendia a razão, a liberdade e a igualdade. Além disso, a Revolução Industrial trouxe profundas mudanças econômicas, sociais e tecnológicas. Portanto, esses dois fenômenos foram determinantes para a formação do mundo contemporâneo.
    
    12. Conflitos Mundiais do Século XX: Agora, os conflitos mundiais do século XX, como as duas Grandes Guerras, marcaram a história global. Além disso, a Guerra Fria e a corrida armamentista dividiram o mundo em blocos ideológicos. Nesse sentido, compreender esses eventos é essencial para analisar as relações internacionais atuais.
    
    13. História da África e Luta dos Negros no Brasil: Sobretudo, a história da África é rica e diversa, com civilizações e impérios importantes. Além disso, a luta dos negros no Brasil envolve resistência à escravidão e a busca por direitos e igualdade. Portanto, conhecer essa trajetória é fundamental para entender a formação da sociedade brasileira.
    
    14. Brasil Colônia e Processo de Independência: A princípio, a economia e a sociedade do Brasil Colônia foram marcadas pela exploração e pela escravidão. Além disso, o processo de independência do Brasil, em 1822, foi influenciado por fatores internos e externos. Nesse sentido, esse período é crucial para a compreensão da história nacional.
    
    15. Primeiro e Segundo Império no Brasil: Agora, o Primeiro Império foi marcado por lutas internas e pela consolidação da unidade territorial. Além disso, o Segundo Império enfrentou questões internas e lutas externas, como a Guerra do Paraguai. Portanto, estudar esse período é essencial para entender a formação do Estado brasileiro.
    
    16. República Velha, República Nova e Governos Militares: Sobretudo, a República Velha foi caracterizada pelo coronelismo e pela política do café com leite. Além disso, a República Nova trouxe transformações políticas e sociais. Por fim, os governos militares e o processo de redemocratização marcaram a história recente do Brasil.
    
    17. História de Santa Catarina: A princípio, a história de Santa Catarina envolve a colonização açoriana, a imigração europeia e o desenvolvimento econômico do estado. Além disso, sua geografia e cultura são aspectos importantes para compreender a identidade catarinense. Portanto, esse tema é específico para concursos estaduais e municipais.
    
    18. Mundo Contemporâneo: Globalização, Conflitos e Meio Ambiente: Agora, o mundo contemporâneo é marcado pela globalização, que integra economias e culturas. Além disso, os conflitos no Oriente Médio, o terrorismo e os problemas do meio ambiente são desafios atuais. Nesse sentido, compreender essas questões é essencial para uma visão crítica da realidade.
    
    19. Lei de Diretrizes e Bases (LDB): Sobretudo, a Lei de Diretrizes e Bases da Educação Nacional (LDB 9.394/96) é o principal marco legal da educação brasileira. Além disso, estabelece princípios, fins e diretrizes para a organização da educação. Portanto, todo educador deve conhecer a LDB para atuar de acordo com a legislação.
    
    20. Estatuto da Criança e do Adolescente (ECA): A princípio, o Estatuto da Criança e do Adolescente (Lei 8.069/90) garante os direitos fundamentais de crianças e adolescentes. Além disso, estabelece deveres para a família, a sociedade e o Estado. Nesse sentido, o ECA é essencial para a atuação de profissionais da educação.
    
    21. Legislação Municipal: Estatuto do Servidor Público e Plano de Carreira: Agora, a legislação municipal inclui o Estatuto do Servidor Público, que regula direitos e deveres dos servidores. Além disso, o plano de carreira dos servidores públicos da educação define a progressão funcional e os critérios de ascensão. Portanto, conhecer essas normas é indispensável para concursos municipais.
    
    22. Atribuições do Cargo e Lei Complementar 180/2013: Por fim, as atribuições do cargo estão previstas na Lei Complementar 180/2013, que regulamenta a carreira dos profissionais da educação. Além disso, essa lei define competências, jornada de trabalho e direitos específicos da categoria. Portanto, o candidato deve estar atento a essas disposições legais para uma atuação conforme a legislação vigente.`
  },
  {
    nome: '✍️ Escrever meu próprio conteúdo',
    conteudo: null
  }
];

export default function Home() {
  // ============================================================
  // ESTADOS (STATES)
  // ============================================================

  const [conteudo, setConteudo] = useState('');
  const [quantidade, setQuantidade] = useState(40);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [modoEntrada, setModoEntrada] = useState<'categoria' | 'texto'>('categoria');
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // ============================================================
  // EFEITOS (useEffect) - DARK MODE
  // ============================================================

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setDarkMode(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ============================================================
  // FUNÇÃO: GERAR SIMULADO
  // ============================================================

  const handleGerarSimulado = async () => {
    let textoParaEnviar = '';

    if (modoEntrada === 'categoria') {
      const categoria = CATEGORIAS.find(c => c.nome === categoriaSelecionada);
      if (!categoria || !categoria.conteudo) {
        setErro('Selecione uma categoria válida ou escolha "Escrever meu próprio conteúdo".');
        return;
      }
      textoParaEnviar = categoria.conteudo;
    } else {
      if (!conteudo.trim()) {
        setErro('Digite ou cole o conteúdo programático!');
        return;
      }
      if (conteudo.trim().length < 50) {
        setErro('Digite pelo menos 50 caracteres!');
        return;
      }
      textoParaEnviar = conteudo.trim();
    }

    setCarregando(true);
    setErro('');
    setAviso('');
    setQuestoes([]);
    setRespostas({});
    setMostrarResultado(false);

    try {
      const resposta = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudo: textoParaEnviar,
          quantidade: quantidade
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao gerar questões');
      }

      setQuestoes(dados.questoes);
      setRespostas({});
      if (dados.aviso) setAviso(dados.aviso);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  // ============================================================
  // FUNÇÃO: RESPONDER QUESTÃO
  // ============================================================

  const responderQuestao = (indice: number, opcao: string) => {
    setRespostas(prev => ({ ...prev, [indice]: opcao }));
  };

  // ============================================================
  // FUNÇÃO: CALCULAR RESULTADO
  // ============================================================

  const calcularResultado = () => {
    let acertos = 0;
    questoes.forEach((q, i) => {
      if (respostas[i] === q.correta) acertos++;
    });
    return acertos;
  };

  // ============================================================
  // FUNÇÃO: FINALIZAR PROVA
  // ============================================================

  const finalizarProva = () => {
    const totalQuestoes = questoes.length;
    const respondidas = Object.keys(respostas).length;
    
    if (respondidas < totalQuestoes) {
      setErro(`⚠️ Você respondeu apenas ${respondidas} de ${totalQuestoes} questões! Responda todas para ver o resultado.`);
      return;
    }
    
    setMostrarResultado(true);
    setErro('');
  };

  // ============================================================
  // FUNÇÃO: REINICIAR
  // ============================================================

  const reiniciar = () => {
    setQuestoes([]);
    setRespostas({});
    setMostrarResultado(false);
    setConteudo('');
    setErro('');
    setAviso('');
  };

  // ============================================================
  // FUNÇÃO: EXPORTAR PDF - SEM PREFIXOS, APENAS CORES
  // ============================================================

  const exportarPDF = () => {
    console.log('🟢 Botão Exportar PDF clicado');
    
    try {
      if (!questoes || questoes.length === 0) {
        setErro('Nenhuma questão para exportar.');
        return;
      }
      
      console.log('🟢 Questões:', questoes.length);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;
      
      // ===== CABEÇALHO =====
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Simulador de Concurso Público', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Gerado por IA com DeepSeek', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // ===== RESULTADO =====
      const acertos = calcularResultado();
      const total = questoes.length;
      const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESULTADO FINAL', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${acertos} / ${total}`, pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${percentual}% de acertos`, pageWidth / 2, y, { align: 'center' });
      y += 6;
      
      const status = percentual >= 70 ? 'APROVADO!' : 'Continue estudando!';
      pdf.setFont('helvetica', 'bold');
      pdf.text(status, pageWidth / 2, y, { align: 'center' });
      y += 12;
      
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // ===== GABARITO =====
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GABARITO COMENTADO', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      // ============================================================
      // PERCORRE TODAS AS QUESTÕES
      // ============================================================
      for (let i = 0; i < questoes.length; i++) {
        const q = questoes[i];
        const respostaUsuario = respostas[i] || 'Não respondeu';
        const acertou = respostaUsuario === q.correta;
        
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = margin;
        }
        
        // ===== NÚMERO DA QUESTÃO =====
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Questão ${i + 1}`, margin, y);
        y += 6;
        
        // ===== ENUNCIADO =====
        let perguntaLimpa = q.pergunta
          .replace(/[📚🔢📖🏛️✍️⚠️✅❌💡🏆🎉💪]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        const perguntaLines = pdf.splitTextToSize(perguntaLimpa, contentWidth);
        pdf.text(perguntaLines, margin, y);
        y += perguntaLines.length * 5 + 4;
        
        // ============================================================
        // ALTERNATIVAS - APENAS CORES, SEM PREFIXOS
        // ============================================================
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const alternativas = ['A', 'B', 'C', 'D'];
        for (const letra of alternativas) {
          const texto = `${letra}) ${q.opcoes[letra as keyof typeof q.opcoes]}`;
          const isCorreta = letra === q.correta;
          const isMarcada = respostaUsuario === letra;
          
          // ===== DEFINE A COR (SEM PREFIXOS) =====
          if (isCorreta) {
            pdf.setTextColor(0, 150, 0);      // Verde para correta
          } else if (isMarcada && !isCorreta) {
            pdf.setTextColor(200, 0, 0);      // Vermelho para errada marcada
          } else {
            pdf.setTextColor(0, 0, 0);        // Preto para normal
          }
          
          // ===== TEXTO SEM PREFIXOS =====
          const lines = pdf.splitTextToSize(texto, contentWidth - 4);
          pdf.text(lines, margin + 4, y);
          y += lines.length * 5 + 1;
        }
        
        pdf.setTextColor(0, 0, 0);
        y += 2;
        
        // ===== CORRETA =====
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 150, 0);
        pdf.text(`Correta: ${q.correta}`, margin, y);
        y += 5;
        
        // ===== EXPLICAÇÃO =====
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        
        let explicacaoLimpa = q.explicacao
          .replace(/[📚🔢📖🏛️✍️⚠️✅❌💡🏆🎉💪]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        const explicacaoLines = pdf.splitTextToSize(explicacaoLimpa, contentWidth - 4);
        pdf.text(explicacaoLines, margin + 4, y);
        y += explicacaoLines.length * 4 + 4;
        
        // ===== SUA RESPOSTA =====
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const acertouText = acertou ? 'Acertou!' : 'Errou!';
        
        if (acertou) {
          pdf.setTextColor(0, 150, 0);
        } else {
          pdf.setTextColor(200, 0, 0);
        }
        
        pdf.text(`Sua resposta: ${respostaUsuario} - ${acertouText}`, margin, y);
        y += 8;
        
        pdf.setTextColor(0, 0, 0);
        
        // Linha separadora
        if (i < questoes.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 6;
        }
      }
      
      // ===== RODAPÉ =====
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Gerado com DeepSeek AI - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.setTextColor(0, 0, 0);
      }
      
      pdf.save('simulado.pdf');
      console.log('✅ PDF salvo com sucesso!');
      
    } catch (error) {
      console.error('🔴 Erro ao gerar PDF:', error);
      setErro(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // ============================================================
  // CLASSES CONDICIONAIS - DARK MODE
  // ============================================================

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const cardShadow = darkMode ? 'shadow-xl shadow-gray-900/30' : 'shadow-md';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300';
  const hoverBg = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';

  // ============================================================
  // FUNÇÃO: HANDLE CATEGORIA CHANGE
  // ============================================================

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    setCategoriaSelecionada(valor);
    
    if (valor === '✍️ Escrever meu próprio conteúdo') {
      setModoEntrada('texto');
    } else {
      setModoEntrada('categoria');
    }
  };

  // ============================================================
  // FUNÇÃO: VERIFICAR TODAS RESPONDIDAS
  // ============================================================

  const todasRespondidas = questoes.length > 0 && Object.keys(respostas).length === questoes.length;

  // ============================================================
  // RENDERIZAÇÃO (JSX)
  // ============================================================

  return (
    <main className="min-h-screen transition-colors duration-300">
      
      {/* ============================================================
          HEADER - CABEÇALHO FIXO
          ============================================================ */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                📚 Simulador de Concurso
              </h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">com IA</span>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xl"
            aria-label="Alternar modo escuro"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* ============================================================
            FORMULÁRIO
            ============================================================ */}
        <div className={`${cardBg} ${cardShadow} rounded-2xl p-6 mb-8 transition-colors duration-300`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            1. Escolha uma categoria ou digite seu conteúdo
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                📂 Selecione uma categoria:
              </label>
              <select
                value={categoriaSelecionada}
                onChange={handleCategoriaChange}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${inputBg} text-gray-900 dark:text-gray-100`}
                disabled={carregando}
              >
                <option value="">-- Selecione uma categoria --</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat.nome} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {modoEntrada === 'texto' && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  ✍️ Digite seu conteúdo:
                </label>
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Cole aqui o conteúdo do edital, matérias, leis, etc."
                  className={`w-full h-64 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-colors duration-300 ${inputBg} text-gray-900 dark:text-gray-100`}
                  disabled={carregando}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{conteudo.length} caracteres</span>
                  {conteudo.length > 0 && conteudo.length < 50 && (
                    <span className="text-yellow-600 dark:text-yellow-400">⚠️ Mínimo 50</span>
                  )}
                  {conteudo.length >= 50 && (
                    <span className="text-green-600 dark:text-green-400">✅ OK</span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Quantidade de questões:
              </label>
              <div className="flex gap-3 flex-wrap">
                {[20, 40, 60, 80].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantidade(num)}
                    className={`px-5 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      quantidade === num
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-500 scale-105'
                        : `bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300`
                    }`}
                    disabled={carregando}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGerarSimulado}
              disabled={carregando || 
                (modoEntrada === 'categoria' && !categoriaSelecionada) ||
                (modoEntrada === 'texto' && conteudo.length < 50)}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3.5 rounded-xl text-lg font-semibold transition-all duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Gerando {quantidade} questões...
                </span>
              ) : (
                `🚀 Gerar Simulado (${quantidade} questões)`
              )}
            </button>

            {erro && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl">
                ⚠️ {erro}
              </div>
            )}
            {aviso && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded-xl">
                ⚠️ {aviso}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
            QUESTÕES
            ============================================================ */}
        {questoes.length > 0 && !mostrarResultado && (
          <div className="space-y-4">
            <div className={`${cardBg} ${cardShadow} rounded-2xl p-4 sticky top-[72px] z-10 transition-colors duration-300`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  📝 {Object.keys(respostas).length} de {questoes.length} respondidas
                </span>
                {todasRespondidas && (
                  <button
                    onClick={finalizarProva}
                    className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2 rounded-xl transition-all duration-200 animate-fade-in"
                  >
                    ✅ Ver Resultado
                  </button>
                )}
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-500 rounded-full"
                  style={{ width: `${(Object.keys(respostas).length / questoes.length) * 100}%` }}
                />
              </div>
              {!todasRespondidas && Object.keys(respostas).length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ⚠️ Responda todas as {questoes.length} questões para ver o resultado
                </p>
              )}
            </div>

            {questoes.map((q, indice) => (
              <div key={indice} className={`${cardBg} ${cardShadow} rounded-2xl p-6 transition-colors duration-300`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    Questão {indice + 1}
                  </h3>
                  {respostas[indice] && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                      Respondida
                    </span>
                  )}
                </div>
                <p className="mb-4 text-gray-800 dark:text-gray-200">{q.pergunta}</p>
                
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((letra) => (
                    <label 
                      key={letra} 
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        respostas[indice] === letra 
                          ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 dark:border-blue-400' 
                          : `${hoverBg} border-2 border-transparent`
                      }`}
                    >
                      <input
                        type="radio"
                        name={`questao-${indice}`}
                        value={letra}
                        checked={respostas[indice] === letra}
                        onChange={() => responderQuestao(indice, letra)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-bold text-gray-700 dark:text-gray-300">{letra})</span>
                      <span className="text-gray-800 dark:text-gray-200">{q.opcoes[letra as keyof typeof q.opcoes]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {todasRespondidas && (
              <div className="flex justify-center mt-6 animate-fade-in">
                <button
                  onClick={finalizarProva}
                  className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-8 py-4 rounded-2xl text-xl font-semibold transition-all duration-200 shadow-lg shadow-green-600/30"
                >
                  ✅ Ver Resultado Final
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            RESULTADO
            ============================================================ */}
        {mostrarResultado && (
          <div className={`${cardBg} ${cardShadow} rounded-2xl p-6 mt-8 transition-colors duration-300`}>
            <div id="conteudo-para-pdf">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
                🏆 Resultado Final
              </h2>
              
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                  {calcularResultado()} / {questoes.length}
                </div>
                <div className="text-xl mt-2">
                  {calcularResultado() >= Math.round(questoes.length * 0.7) ? (
                    <span className="text-green-600 dark:text-green-400">✅ Aprovado! 🎉</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">❌ Continue estudando! 💪</span>
                  )}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {Math.round((calcularResultado() / questoes.length) * 100)}% de acertos
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">📖 Gabarito Comentado</h3>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {questoes.map((q, i) => {
                  const respostaUsuario = respostas[i] || 'Não respondeu';
                  const acertou = respostaUsuario === q.correta;
                  
                  return (
                    <div key={i} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {i+1}. {q.pergunta}
                      </p>
                      
                      <div className="mt-2 space-y-1.5">
                        {['A', 'B', 'C', 'D'].map((letra) => {
                          const isCorreta = letra === q.correta;
                          const isMarcada = respostaUsuario === letra;
                          
                          let cor = 'text-gray-600 dark:text-gray-400';
                          let bgCor = '';
                          let borda = '';
                          
                          if (isCorreta && isMarcada) {
                            cor = 'text-green-700 dark:text-green-300';
                            bgCor = 'bg-green-50 dark:bg-green-900/20';
                            borda = 'border-green-500 dark:border-green-400';
                          } else if (isCorreta) {
                            cor = 'text-green-700 dark:text-green-300';
                            bgCor = 'bg-green-50 dark:bg-green-900/10';
                            borda = 'border-green-500 dark:border-green-400';
                          } else if (isMarcada && !isCorreta) {
                            cor = 'text-red-700 dark:text-red-300';
                            bgCor = 'bg-red-50 dark:bg-red-900/20';
                            borda = 'border-red-500 dark:border-red-400';
                          }
                          
                          return (
                            <div 
                              key={letra} 
                              className={`flex items-center gap-3 p-2.5 rounded-lg border ${borda} ${bgCor} transition-colors duration-200`}
                            >
                              <span className={`font-bold ${cor}`}>{letra})</span>
                              <span className={cor}>{q.opcoes[letra as keyof typeof q.opcoes]}</span>
                              {isMarcada && !isCorreta && (
                                <span className="ml-auto text-sm text-red-600 dark:text-red-400 font-medium">
                                  ❌ Sua resposta
                                </span>
                              )}
                              {isCorreta && (
                                <span className="ml-auto text-sm text-green-600 dark:text-green-400 font-medium">
                                  ✅ Correta
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <p className="text-green-600 dark:text-green-400 font-medium">
                          ✅ Correta: {q.correta}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl">
                          💡 {q.explicacao}
                        </p>
                        <p className={`text-sm font-medium ${acertou ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {acertou ? '✅ Você acertou!' : `❌ Você errou. A resposta correta é ${q.correta}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={exportarPDF}
                className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                📄 Exportar PDF
              </button>
              <button
                onClick={reiniciar}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                🔄 Novo Simulado
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            RODAPÉ
            ============================================================ */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Criado com ❤️por KASEMIRO</p>
        </div>
      </div>
    </main>
  );
}