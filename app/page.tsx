// app/page.tsx
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
// CATEGORIAS
// ============================================================

const CATEGORIAS = [
  { 
    nome: 'Língua Portuguesa', 
    icone: '📖',
    descricao: 'Gramática, interpretação e ortografia',
    conteudo: `Língua Portuguesa para concursos públicos:
1. Interpretação de Texto: A princípio, interpretação de texto é o carro-chefe das provas de Português. Ou seja, muitas questões giram em torno da sua capacidade de compreender e analisar textos. Além disso, as bancas cobram a identificação de ideias centrais, inferências e temas implícitos. Portanto, praticar com textos variados e questões de provas anteriores é fundamental.
2. Ortografia e Acentuação: Agora, o uso correto da ortografia e das regras de acentuação gráfica continua sendo muito cobrado, principalmente devido à reforma ortográfica. Por exemplo, conhecer as regras de hífen, uso de acentos diferenciais e mudanças no uso de tremas são essenciais.
3. Concordância Verbal e Nominal: Sobretudo, a concordância verbal e nominal é uma das partes mais técnicas, mas também uma das mais frequentes. Além disso, as bancas gostam de testar como você lida com a relação entre o sujeito e o verbo, além da adequação de adjetivos e substantivos.
4. Crase: Por fim, o uso da crase é um dos temas que mais confunde os candidatos. Nesse sentido, as bancas pedem que você saiba quando o uso do acento grave é obrigatório, facultativo ou proibido.
5. Pontuação: Além disso, a pontuação é crucial para garantir que a construção do texto seja coerente e compreensível. Por exemplo, questões sobre o uso correto de vírgulas, pontos e travessões estão presentes em quase todas as provas.
6. Regência Verbal e Nominal: Agora, a regência verbal e nominal é cobrada para testar seu conhecimento sobre a relação entre os verbos, substantivos e os complementos que os acompanham. Portanto, praticar com exercícios que abordam regência é importante para se sair bem.
7. Figuras de Linguagem: A princípio, as figuras de linguagem costumam aparecer em questões de interpretação e análise textual. Além disso, identificar corretamente metáforas, hipérboles, eufemismos e outras figuras pode garantir alguns pontos extras.
8. Formação de Palavras: Agora, entender os processos de formação de palavras, como prefixação, sufixação e composição, é essencial. Além disso, esse tema está diretamente ligado à morfologia, o que torna seu estudo ainda mais importante.
9. Sintaxe e Análise Sintática: Sobretudo, o conhecimento sobre a estrutura das frases, a função dos termos dentro das orações e a classificação das orações subordinadas e coordenadas são recorrentes nas provas.`
  },
  { 
    nome: 'Matemática', 
    icone: '🔢',
    descricao: 'Raciocínio lógico e cálculo',
    conteudo: `Matemática para concursos públicos:
1. Aritmética Básica: Operações fundamentais (adição, subtração, multiplicação, divisão), Regra de três simples e composta, Porcentagem e proporção.
2. Álgebra: Expressões algébricas, Equações e inequações do 1º e 2º grau, Sistemas de equações.
3. Geometria: Geometria plana (áreas e perímetros de figuras planas), Geometria espacial (volumes e áreas de sólidos geométricos), Noções de geometria analítica.
4. Análise Combinatória e Probabilidade: Contagem de elementos, Fatorial, Permutações, combinações e arranjos simples, Probabilidade básica.
5. Matemática Financeira: Juros simples e compostos, Porcentagem aplicada a situações financeiras.
6. Estatística: Noções básicas de estatística, Interpretação de gráficos e tabelas.
7. Raciocínio Lógico: Proposições lógicas, Tabelas verdade, Raciocínio lógico-matemático.
8. Resolução de Problemas: Aplicação prática dos conceitos matemáticos em situações do cotidiano.`
  },
  { 
    nome: 'Pedagogia', 
    icone: '📚',
    descricao: 'Teorias e práticas de ensino',
    conteudo: `Pedagogia para concursos públicos:
    1. Legislação Educacional: LDB (Lei nº 9.394/96), ECA (Estatuto da Criança e do Adolescente), Constituição Federal (arts. 205 a 214), BNCC (Base Nacional Comum Curricular), PNE (Plano Nacional de Educação), Diretrizes Curriculares Nacionais (DCNs), Lei Brasileira de Inclusão (Lei nº 13.146/2015), Leis nº 10.639/2003 e nº 11.645/2008.
    2. Teorias da Aprendizagem: Piaget (desenvolvimento cognitivo), Vygotsky (interacionismo e mediação), Wallon (afetividade e desenvolvimento), Ausubel (aprendizagem significativa), Bruner (aprendizagem por descoberta), Paulo Freire (pedagogia crítica), Emilia Ferreiro e Ana Teberosky (psicogênese da língua escrita).
    3. Didática e Organização Escolar: Planejamento participativo, Projeto Político-Pedagógico (PPP), currículo, planejamento de ensino, planos de aula, avaliação diagnóstica, formativa e somativa, tendências pedagógicas, metodologias ativas, interdisciplinaridade e organização do trabalho pedagógico.
    4. Educação Inclusiva: Atendimento Educacional Especializado (AEE), educação especial na perspectiva inclusiva, acessibilidade, adaptações curriculares, desenho universal para aprendizagem (DUA), tecnologias assistivas, educação inclusiva e os quatro pilares da educação.
    5. Fundamentos da Educação: História da Educação, Filosofia da Educação, Sociologia da Educação, Psicologia da Educação, políticas públicas educacionais e organização da educação brasileira.
    6. Alfabetização e Letramento: Processos de alfabetização, letramento, consciência fonológica, psicogênese da língua escrita, aquisição da leitura e da escrita, métodos de alfabetização e práticas de linguagem.
    7. Educação Infantil: Desenvolvimento infantil, direitos de aprendizagem, campos de experiências, brincadeira e ludicidade, interação, organização dos espaços e tempos, avaliação na Educação Infantil e documentação pedagógica.
    8. Gestão Escolar: Gestão democrática, coordenação pedagógica, supervisão escolar, orientação educacional, liderança pedagógica, conselho escolar, participação da comunidade e gestão participativa.
    9. Avaliação Educacional: Avaliação da aprendizagem, avaliação diagnóstica, formativa e somativa, instrumentos avaliativos, recuperação da aprendizagem, avaliação institucional e avaliações externas.
    10. Modalidades de Ensino: Educação de Jovens e Adultos (EJA), Educação do Campo, Educação Escolar Indígena, Educação Quilombola, Educação Profissional e Tecnológica, Educação Integral e Educação a Distância (EaD).
    11. Diversidade, Direitos Humanos e Temas Transversais: Educação em Direitos Humanos, Educação Ambiental, Educação para as Relações Étnico-Raciais, diversidade cultural, ética, cidadania, cultura da paz e inclusão social.
    12. Tecnologias Educacionais: Tecnologias digitais na educação, ensino híbrido, cultura digital, recursos tecnológicos, mídias educacionais, inteligência artificial na educação e inovação pedagógica.`
  },
  { 
    nome: 'História', 
    icone: '🏛️',
    descricao: 'Brasil e história geral',
    conteudo: `História para concursos públicos:
    1. História do Brasil Colonial: Descobrimento, colonização, capitanias hereditárias, governo-geral, economia açucareira, mineração, escravidão, invasões estrangeiras, bandeirismo e movimentos nativistas.
    2. Brasil Império: Independência do Brasil, Primeiro Reinado, Período Regencial, Segundo Reinado, economia cafeeira, Guerra do Paraguai, movimento abolicionista e Proclamação da República.
    3. Brasil República: República Velha, Era Vargas, Constituição de 1934, Estado Novo, redemocratização, Regime Militar (1964–1985), Constituição de 1988 e Nova República.
    4. Movimentos Sociais e Revoltas: Inconfidência Mineira, Conjuração Baiana, Revolução Pernambucana, Revolta da Vacina, Revolta da Chibata, Guerra de Canudos, Guerra do Contestado, Coluna Prestes e Diretas Já.
    5. História Econômica do Brasil: Ciclos econômicos (pau-brasil, açúcar, ouro, café, borracha), industrialização, urbanização e desenvolvimento econômico.
    6. História Antiga: Civilizações do Egito, Mesopotâmia, Grécia e Roma; principais características políticas, sociais, econômicas e culturais.
    7. História Medieval: Feudalismo, Igreja Medieval, Cruzadas, Renascimento Comercial e Urbano e formação das monarquias nacionais.
    8. História da Idade Moderna: Renascimento Cultural, Reformas Religiosas, Absolutismo, Mercantilismo, Grandes Navegações e Iluminismo. 
    9. Revoluções Contemporâneas: Revolução Inglesa, Independência dos Estados Unidos, Revolução Francesa, Revolução Industrial e Revoluções Liberais. 
    10. História Contemporânea: Imperialismo, Primeira Guerra Mundial, Revolução Russa, Crise de 1929, Segunda Guerra Mundial, Guerra Fria, descolonização da África e da Ásia e globalização.  
    11. História Política Brasileira Contemporânea: Constituição Federal de 1988, redemocratização, cidadania, direitos fundamentais e organização do Estado brasileiro.
    12. Patrimônio Histórico e Cultural: Formação da identidade brasileira, patrimônio material e imaterial, diversidade cultural e memória histórica.`
  },
  { 
    nome: 'Meu próprio conteúdo', 
    icone: '✍️',
    descricao: 'Cole seu material de estudo',
    conteudo: null
  }
];

// ============================================================
// BANCAS
// ============================================================

const BANCAS = [
  { nome: 'FGV', descricao: 'Fundação Getúlio Vargas' },
  { nome: 'CEBRASPE', descricao: 'Centro Brasileiro de Pesquisa' },
  { nome: 'VUNESP', descricao: 'Fundação VUNESP' },
  { nome: 'FCC', descricao: 'Fundação Carlos Chagas' },
  { nome: 'Genérica', descricao: 'Formato padrão' }
];

export default function Home() {
  // ============================================================
  // ESTADOS
  // ============================================================

  const [conteudo, setConteudo] = useState('');
  const [quantidade, setQuantidade] = useState(40);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [modoEntrada, setModoEntrada] = useState<'categoria' | 'texto'>('categoria');
  const [bancaSelecionada, setBancaSelecionada] = useState('Genérica');
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // ============================================================
  // DARK MODE
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
  // FUNÇÕES
  // ============================================================

  const handleGerarSimulado = async () => {
    let textoParaEnviar = '';

    if (modoEntrada === 'categoria') {
      const categoria = CATEGORIAS.find(c => c.nome === categoriaSelecionada);
      if (!categoria || !categoria.conteudo) {
        setErro('Selecione uma categoria válida ou escolha "Meu próprio conteúdo".');
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
          quantidade: quantidade,
          banca: bancaSelecionada
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

  const responderQuestao = (indice: number, opcao: string) => {
    setRespostas(prev => ({ ...prev, [indice]: opcao }));
  };

  const calcularResultado = () => {
    let acertos = 0;
    questoes.forEach((q, i) => {
      if (respostas[i] === q.correta) acertos++;
    });
    return acertos;
  };

  const finalizarProva = () => {
    const totalQuestoes = questoes.length;
    const respondidas = Object.keys(respostas).length;
    
    if (respondidas < totalQuestoes) {
      setErro(`⚠️ Você respondeu apenas ${respondidas} de ${totalQuestoes} questões!`);
      return;
    }
    
    setMostrarResultado(true);
    setErro('');
  };

  const reiniciar = () => {
    setQuestoes([]);
    setRespostas({});
    setMostrarResultado(false);
    setConteudo('');
    setErro('');
    setAviso('');
  };

  const exportarPDF = () => {
    try {
      if (!questoes || questoes.length === 0) {
        setErro('Nenhuma questão para exportar.');
        return;
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Simulador de Estudos', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Gerado por IA com KASEMIRO.COM', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;
      
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
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GABARITO COMENTADO', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      for (let i = 0; i < questoes.length; i++) {
        const q = questoes[i];
        const respostaUsuario = respostas[i] || 'Não respondeu';
        const acertou = respostaUsuario === q.correta;
        
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = margin;
        }
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Questão ${i + 1}`, margin, y);
        y += 6;
        
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
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const alternativas = ['A', 'B', 'C', 'D'];
        for (const letra of alternativas) {
          const texto = `${letra}) ${q.opcoes[letra as keyof typeof q.opcoes]}`;
          const isCorreta = letra === q.correta;
          const isMarcada = respostaUsuario === letra;
          
          if (isCorreta) {
            pdf.setTextColor(0, 150, 0);
          } else if (isMarcada && !isCorreta) {
            pdf.setTextColor(200, 0, 0);
          } else {
            pdf.setTextColor(0, 0, 0);
          }
          
          const lines = pdf.splitTextToSize(texto, contentWidth - 4);
          pdf.text(lines, margin + 4, y);
          y += lines.length * 5 + 1;
        }
        
        pdf.setTextColor(0, 0, 0);
        y += 2;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 150, 0);
        pdf.text(`Correta: ${q.correta}`, margin, y);
        y += 5;
        
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
        
        if (i < questoes.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(margin, y, pageWidth - margin, y);
          y += 6;
        }
      }
      
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Gerado com AI - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.setTextColor(0, 0, 0);
      }
      
      pdf.save('simulado.pdf');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setErro('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleCategoriaClick = (nome: string) => {
    setCategoriaSelecionada(nome);
    if (nome === 'Meu próprio conteúdo') {
      setModoEntrada('texto');
    } else {
      setModoEntrada('categoria');
    }
  };

  const todasRespondidas = questoes.length > 0 && Object.keys(respostas).length === questoes.length;

  // ============================================================
  // CLASSES DARK MODE
  // ============================================================

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMutedClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300';
  const hoverBg = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const shadowClass = darkMode ? 'shadow-xl shadow-gray-900/30' : 'shadow-lg';

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  return (
    <main className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      
      {/* ============================================================
          HEADER
          ============================================================ */}
      <header className={`sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b ${borderClass} transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
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
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Simulador de Estudos
              </h1>
              <span className={`text-xs ${textMutedClass}`}>Kasemiro.com</span>
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
            PASSO 1 - MATÉRIA (70%) E BANCA (30%) EM DUAS COLUNAS
            ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6 mb-8">
          
          {/* ===== COLUNA ESQUERDA - CONTEÚDO (70%) ===== */}
          <div className="md:col-span-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
              PASSO 1
            </p>
            <h2 className="text-2xl font-bold mb-4">
              Escolha uma matéria
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.nome}
                  onClick={() => handleCategoriaClick(cat.nome)}
                  className={`p-4 rounded-xl text-center transition-all duration-200 ${
                    categoriaSelecionada === cat.nome
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                      : `${cardBg} ${shadowClass} hover:scale-105 hover:shadow-xl`
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icone}</div>
                  <div className="font-semibold text-sm">{cat.nome}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ===== COLUNA DIREITA - BANCA (30%) ===== */}
          <div className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">
              PASSO 1
            </p>
            <h2 className="text-2xl font-bold mb-4">
              Escolha a banca
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {BANCAS.map((b) => (
                <button
                  key={b.nome}
                  onClick={() => setBancaSelecionada(b.nome)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    bancaSelecionada === b.nome
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : `${cardBg} ${borderClass} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  {b.nome}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ============================================================
            CAMPO DE TEXTO (Meu próprio conteúdo)
            ============================================================ */}
        {modoEntrada === 'texto' && (
          <div className={`${cardBg} ${shadowClass} rounded-2xl p-6 mb-8 transition-colors duration-300 animate-fade-in`}>
            <label className={`block text-sm font-medium ${textMutedClass} mb-2`}>
              ✍️ Digite seu conteúdo:
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Cole aqui o conteúdo do edital, matérias, leis, etc."
              className={`w-full h-64 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-colors duration-300 ${inputBg} ${textClass}`}
              disabled={carregando}
            />
            <div className={`flex justify-between mt-2 text-sm ${textMutedClass}`}>
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

        {/* ============================================================
            PASSO 2 - QUANTIDADE
            ============================================================ */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
            PASSO 2
          </p>
          <h2 className="text-2xl font-bold mb-4">
            Quantidade de questões
          </h2>
          
          <div className="flex gap-3 flex-wrap">
            {[20, 40, 60, 80].map((num) => (
              <button
                key={num}
                onClick={() => setQuantidade(num)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  quantidade === num
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                    : `${cardBg} ${shadowClass} hover:scale-105 hover:shadow-xl`
                }`}
                disabled={carregando}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================
            BOTÃO GERAR
            ============================================================ */}
        <button
          onClick={handleGerarSimulado}
          disabled={carregando || 
            (modoEntrada === 'categoria' && !categoriaSelecionada) ||
            (modoEntrada === 'texto' && conteudo.length < 50)}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 ${
            carregando || 
            (modoEntrada === 'categoria' && !categoriaSelecionada) ||
            (modoEntrada === 'texto' && conteudo.length < 50)
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-600/30 text-white hover:scale-[1.02]'
          }`}
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
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl">
            ⚠️ {erro}
          </div>
        )}
        {aviso && (
          <div className={`mt-4 p-4 rounded-xl ${
            aviso.includes('✅') 
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300'
              : 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
          }`}>
            {aviso}
          </div>
        )}

        {/* ============================================================
            QUESTÕES
            ============================================================ */}
        {questoes.length > 0 && !mostrarResultado && (
          <div className="mt-8 space-y-4">
            <div className={`${cardBg} ${shadowClass} rounded-2xl p-4 sticky top-[72px] z-10 transition-colors duration-300`}>
              <div className="flex justify-between items-center">
                <span className={`font-semibold ${textClass}`}>
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
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 rounded-full"
                  style={{ width: `${(Object.keys(respostas).length / questoes.length) * 100}%` }}
                />
              </div>
            </div>

            {questoes.map((q, indice) => (
              <div key={indice} className={`${cardBg} ${shadowClass} rounded-2xl p-6 transition-colors duration-300`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-bold text-lg text-blue-600 dark:text-blue-400`}>
                    Questão {indice + 1}
                  </h3>
                  {respostas[indice] && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                      Respondida
                    </span>
                  )}
                </div>
                <p className={`mb-4 ${textClass}`}>{q.pergunta}</p>
                
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
                      <span className={`font-bold ${textClass}`}>{letra})</span>
                      <span className={textClass}>{q.opcoes[letra as keyof typeof q.opcoes]}</span>
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
          <div className={`${cardBg} ${shadowClass} rounded-2xl p-6 mt-8 transition-colors duration-300`}>
            <div id="conteudo-para-pdf">
              <h2 className={`text-2xl font-bold text-center mb-6 ${textClass}`}>
                🏆 Resultado Final
              </h2>
              
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                  {calcularResultado()} / {questoes.length}
                </div>
                <div className={`text-xl mt-2 ${textClass}`}>
                  {calcularResultado() >= Math.round(questoes.length * 0.7) ? (
                    <span className="text-green-600 dark:text-green-400">✅ Aprovado! 🎉</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">❌ Continue estudando! 💪</span>
                  )}
                </div>
                <div className={textMutedClass}>
                  {Math.round((calcularResultado() / questoes.length) * 100)}% de acertos
                </div>
              </div>

              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>📖 Gabarito Comentado</h3>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {questoes.map((q, i) => {
                  const respostaUsuario = respostas[i] || 'Não respondeu';
                  const acertou = respostaUsuario === q.correta;
                  
                  return (
                    <div key={i} className={`border-b ${borderClass} pb-4`}>
                      <p className={`font-semibold ${textClass} mb-2`}>
                        {i+1}. {q.pergunta}
                      </p>
                      
                      <div className="mt-2 space-y-1.5">
                        {['A', 'B', 'C', 'D'].map((letra) => {
                          const isCorreta = letra === q.correta;
                          const isMarcada = respostaUsuario === letra;
                          
                          let cor = textMutedClass;
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
                        <p className={`${textClass} ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-2 rounded-xl`}>
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
        <div className={`mt-8 text-center text-sm ${textMutedClass}`}>
          <p>Gerado com ❤️ por KASEMIRO</p>
        </div>
      </div>
    </main>
  );
}