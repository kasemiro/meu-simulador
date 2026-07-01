'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import Header from './components/Header';
import Footer from './components/Footer';
import AdSpace from './components/AdSpace';
import CategoryCard from './components/CategoryCard';
import ProgressBar from './components/ProgressBar';
import Breadcrumb from './components/Breadcrumb';

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
    
    3. Fundamentos de Currículo: A princípio, o currículo é o conjunto de conhecimentos e práticas que orientam a ação educativa. Além disso, seus fundamentos envolvem aspectos históricos, sociais, políticos e culturais. Portanto, compreender as teorias curriculares é essencial para elaborar propostas pedagógicas alinhadas à realidade dos alunos.`
  },
  {
    nome: '✍️ Escrever meu próprio conteúdo',
    conteudo: null
  }
];

export default function Home() {
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
      setErro(`Você respondeu apenas ${respondidas} de ${totalQuestoes} questões! Responda todas para ver o resultado.`);
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
    setCategoriaSelecionada('');
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
      pdf.text('Simulador de Concurso Público', pageWidth / 2, y, { align: 'center' });
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Gerado por IA com DeepSeek', pageWidth / 2, y, { align: 'center' });
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
          `Gerado com DeepSeek AI - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.setTextColor(0, 0, 0);
      }
      
      pdf.save('simulado.pdf');
    } catch (error) {
      setErro(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const todasRespondidas = questoes.length > 0 && Object.keys(respostas).length === questoes.length;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header darkMode={darkMode} onToggleDarkMode={setDarkMode} />

      {/* Hero Section */}
      {!questoes.length && !mostrarResultado && (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simule seu Concurso
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Prepare-se com questões geradas por inteligência artificial. Simulados completos, gabaritos comentados e análise de desempenho.
            </p>
            
            {/* Anúncio topo */}
            <div className="max-w-4xl mx-auto mb-12">
              <AdSpace type="top" />
            </div>
          </div>
        </section>
      )}

      <main className="container-custom py-12">
        {!questoes.length && !mostrarResultado ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Formulário */}
              <div className="card card-accent">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-3xl">📚</span> Escolha sua categoria
                </h2>

                {/* Grid de Categorias */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {CATEGORIAS.map((cat) => (
                    <CategoryCard
                      key={cat.nome}
                      name={cat.nome}
                      isSelected={categoriaSelecionada === cat.nome}
                      onClick={() => {
                        setCategoriaSelecionada(cat.nome);
                        setModoEntrada(cat.conteudo ? 'categoria' : 'texto');
                      }}
                    />
                  ))}
                </div>

                {/* Modo Texto */}
                {modoEntrada === 'texto' && (
                  <div className="animate-fade-in mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      ✍️ Digite seu conteúdo programático:
                    </label>
                    <textarea
                      value={conteudo}
                      onChange={(e) => setConteudo(e.target.value)}
                      placeholder="Cole aqui o conteúdo do edital, matérias, leis, etc."
                      className="w-full h-56 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    />
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{conteudo.length} caracteres</span>
                      {conteudo.length > 0 && conteudo.length < 50 && (
                        <span className="badge badge-warning">Mínimo 50 caracteres</span>
                      )}
                      {conteudo.length >= 50 && (
                        <span className="badge badge-success">✓ Pronto</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quantidade de Questões */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Quantidade de questões:
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[20, 40, 60, 80].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuantidade(num)}
                        className={`py-3 rounded-lg font-semibold transition-all ${
                          quantidade === num
                            ? 'btn-primary ring-2 ring-offset-2 ring-orange-500 dark:ring-offset-slate-900 scale-105'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                        disabled={carregando}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botão Gerar */}
                <button
                  onClick={handleGerarSimulado}
                  disabled={carregando || !categoriaSelecionada || (modoEntrada === 'texto' && conteudo.length < 50)}
                  className="w-full btn-accent text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {carregando ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Gerando {quantidade} questões...
                    </span>
                  ) : (
                    `🚀 Gerar Simulado (${quantidade} questões)`
                  )}
                </button>

                {/* Mensagens de erro e aviso */}
                {erro && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {erro}
                  </div>
                )}
                {aviso && (
                  <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm">
                    {aviso}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar com Anúncio */}
            <div>
              <AdSpace type="sidebar" className="sticky top-24" />
            </div>
          </div>
        ) : null}

        {/* Seção de Questões */}
        {questoes.length > 0 && !mostrarResultado && (
          <div className="space-y-6">
            <Breadcrumb items={[
              { label: 'Categorias', active: false },
              { label: 'Simulado', active: true }
            ]} />

            <ProgressBar 
              current={Object.keys(respostas).length} 
              total={questoes.length}
              answered={Object.keys(respostas).length}
            />

            {/* Questões */}
            <div className="space-y-4">
              {questoes.map((q, indice) => (
                <div key={indice} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      Questão {indice + 1}
                    </h3>
                    {respostas[indice] && (
                      <span className="badge badge-success">✓ Respondida</span>
                    )}
                  </div>

                  <p className="text-gray-900 dark:text-white mb-6 font-medium">{q.pergunta}</p>

                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((letra) => (
                      <label
                        key={letra}
                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border-2 ${
                          respostas[indice] === letra
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`questao-${indice}`}
                          value={letra}
                          checked={respostas[indice] === letra}
                          onChange={() => responderQuestao(indice, letra)}
                          className="w-4 h-4 accent-orange-500"
                        />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{letra})</span>
                        <span className="text-gray-800 dark:text-gray-200">{q.opcoes[letra as keyof typeof q.opcoes]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botão Finalizar */}
            {todasRespondidas && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={finalizarProva}
                  className="btn-secondary text-lg py-4 px-8 animate-pulse"
                >
                  ✅ Ver Resultado Final
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resultado */}
        {mostrarResultado && (
          <div className="space-y-6">
            <Breadcrumb items={[
              { label: 'Categorias', active: false },
              { label: 'Simulado', active: false },
              { label: 'Resultado', active: true }
            ]} />

            <div className="card">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  🏆 Resultado Final
                </h2>

                <div className="inline-block mb-6">
                  <div className="text-7xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent mb-4">
                    {calcularResultado()}/{questoes.length}
                  </div>
                  <div className="text-2xl font-semibold">
                    {calcularResultado() >= Math.round(questoes.length * 0.7) ? (
                      <span className="text-green-600 dark:text-green-400">✅ Aprovado! 🎉</span>
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400">Continue estudando! 💪</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">
                    {Math.round((calcularResultado() / questoes.length) * 100)}% de acertos
                  </p>
                </div>
              </div>

              {/* Anúncio pós-teste */}
              <div className="my-8">
                <AdSpace type="bottom" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📖 Gabarito Comentado
              </h3>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {questoes.map((q, i) => {
                  const respostaUsuario = respostas[i] || 'Não respondeu';
                  const acertou = respostaUsuario === q.correta;

                  return (
                    <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                      <p className="font-semibold text-gray-900 dark:text-white mb-4">
                        {i + 1}. {q.pergunta}
                      </p>

                      <div className="space-y-2 mb-4">
                        {['A', 'B', 'C', 'D'].map((letra) => {
                          const isCorreta = letra === q.correta;
                          const isMarcada = respostaUsuario === letra;

                          let borderColor = 'border-gray-200 dark:border-gray-700';
                          let bgColor = '';
                          let textColor = 'text-gray-600 dark:text-gray-400';

                          if (isCorreta && isMarcada) {
                            borderColor = 'border-green-500 dark:border-green-400';
                            bgColor = 'bg-green-50 dark:bg-green-950/30';
                            textColor = 'text-green-700 dark:text-green-300';
                          } else if (isCorreta) {
                            borderColor = 'border-green-500 dark:border-green-400';
                            bgColor = 'bg-green-50 dark:bg-green-950/10';
                            textColor = 'text-green-700 dark:text-green-300';
                          } else if (isMarcada && !isCorreta) {
                            borderColor = 'border-red-500 dark:border-red-400';
                            bgColor = 'bg-red-50 dark:bg-red-950/20';
                            textColor = 'text-red-700 dark:text-red-300';
                          }

                          return (
                            <div
                              key={letra}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 ${borderColor} ${bgColor}`}
                            >
                              <span className={`font-bold ${textColor}`}>{letra})</span>
                              <span className={textColor}>{q.opcoes[letra as keyof typeof q.opcoes]}</span>
                              {isMarcada && !isCorreta && (
                                <span className="ml-auto text-sm font-medium text-red-600 dark:text-red-400">
                                  ❌ Sua resposta
                                </span>
                              )}
                              {isCorreta && (
                                <span className="ml-auto text-sm font-medium text-green-600 dark:text-green-400">
                                  ✅ Correta
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          ✅ Gabarito: {q.correta}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          💡 {q.explicacao}
                        </p>
                        <p className={`font-medium ${acertou ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {acertou ? '✅ Você acertou!' : `❌ Você errou. Resposta correta: ${q.correta}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões de ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <button
                  onClick={exportarPDF}
                  className="btn-secondary text-lg py-4 font-semibold"
                >
                  📄 Exportar PDF
                </button>
                <button
                  onClick={reiniciar}
                  className="btn-primary text-lg py-4 font-semibold"
                >
                  🔄 Novo Simulado
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
