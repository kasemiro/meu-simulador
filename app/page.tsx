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
// CATEGORIAS COM CONTEÚDO PRÉ-DEFINIDO
// ============================================================

const CATEGORIAS = [
  {
    nome: '📚 Língua Portuguesa',
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
    nome: '🔢 Matemática',
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

1. A Pré-História: Conceito e períodos da Pré-História.

2. A Idade Média: Feudalismo: estrutura social e econômica.

3. Revoluções do Século XIX: A Revolução Industrial e suas consequências.

4. Era Pós-Guerra e Descolonização: Reconstrução pós-Segunda Guerra Mundial.

5. Brasil Império: Primeiro Reinado, Período Regencial, Segundo Reinado, Abolição da Escravatura e Proclamação da República.

6. Brasil República: República Velha, Era Vargas, República Populista, Ditadura Militar.

7. Brasil entre 1961 e 1989: Governos de Jânio Quadros, João Goulart, regime militar (1964-1985), abertura política e constituição de 1988.`
  },
  {
    nome: '✍️ Escrever meu próprio conteúdo',
    conteudo: null
  }
];

// ============================================================
// BANCAS DISPONÍVEIS
// ============================================================

const BANCAS = [
  { 
    nome: '🎯 FGV', 
    descricao: 'Fundação Getúlio Vargas - Textos longos, filosofia, interpretação' 
  },
  { 
    nome: '📋 CEBRASPE', 
    descricao: 'Centro Brasileiro de Pesquisa em Avaliação - Certo/Errado, técnicas' 
  },
  { 
    nome: '📝 VUNESP', 
    descricao: 'Fundação VUNESP - Diretas, literalidade da lei' 
  },
  { 
    nome: '⚖️ FCC', 
    descricao: 'Fundação Carlos Chagas - Súmulas, jurisprudência' 
  },
  { 
    nome: '📚 Genérica', 
    descricao: 'Formato padrão de múltipla escolha' 
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
  const [bancaSelecionada, setBancaSelecionada] = useState('📚 Genérica');
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
  // FUNÇÃO: EXPORTAR PDF
  // ============================================================

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
      
      // ===== PERCORRE TODAS AS QUESTÕES =====
      for (let i = 0; i < questoes.length; i++) {
        const q = questoes[i];
        const respostaUsuario = respostas[i] || 'Não respondeu';
        const acertou = respostaUsuario === q.correta;
        
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = margin;
        }
        
        // Número da questão
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Questão ${i + 1}`, margin, y);
        y += 6;
        
        // Enunciado
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
        
        // Alternativas
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
        
        // Correta
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 150, 0);
        pdf.text(`Correta: ${q.correta}`, margin, y);
        y += 5;
        
        // Explicação
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
        
        // Sua resposta
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
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setErro('Erro ao gerar PDF. Tente novamente.');
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
            1. Escolha uma categoria, banca e quantidade
          </h2>
          
          <div className="space-y-4">
            {/* CATEGORIA */}
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

            {/* CAMPO DE TEXTO PERSONALIZADO */}
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

            {/* ============================================================
                SELETOR DE BANCA - NOVO!
                ============================================================ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                🎯 Selecione a banca:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BANCAS.map((b) => (
                  <button
                    key={b.nome}
                    onClick={() => setBancaSelecionada(b.nome)}
                    className={`p-2 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                      bancaSelecionada === b.nome
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-500'
                        : `bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300`
                    }`}
                    disabled={carregando}
                  >
                    <div className="font-bold">{b.nome}</div>
                    <div className="text-xs opacity-70">{b.descricao}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTIDADE */}
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

            {/* BOTÃO GERAR */}
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
                `🚀 Gerar Simulado (${quantidade} questões - ${bancaSelecionada})`
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
          <p>Gerado com ❤️ por KASEMIRO</p>
        </div>
      </div>
    </main>
  );
}