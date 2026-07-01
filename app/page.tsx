'use client';

import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import Header from './components/Header';
import Footer from './components/Footer';
import AdSpace from './components/AdSpace';

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
    id: 'portugues',
    nome: 'Língua Portuguesa',
    icon: '📖',
    descricao: 'Gramática, interpretação e ortografia',
    conteudo: `Língua Portuguesa para concursos públicos:

    1. Interpretação de Texto: A princípio, a interpretação de texto envolve análise e compreensão, considerando a palavra e seu significado (sinonímia, antonímia e ambiguidade). Além disso, os níveis da significação (denotação e conotação) e as figuras de linguagem são amplamente cobrados. Portanto, praticar com textos variados é essencial.

    2. Fonética: Agora, a fonética abrange o estudo do fonema e da letra, encontros vocálicos (ditongo, tritongo e hiato), encontros consonantais e dígrafos. Além disso, a tonicidade (monossílaba, dissílaba, trissílaba, oxítona, paroxítona e proparoxítona) e a separação de sílabas são temas recorrentes.
    
    3. Morfologia: Sobretudo, a morfologia estuda os radicais, os processos de prefixação, sufixação, parassíntese, composição, derivação e hibridismo. Ou seja, é fundamental para compreender a estrutura e a formação das palavras.
    
    4. Sintaxe: A princípio, a sintaxe trata do sujeito e do predicado e suas respectivas classificações, da transitividade dos verbos e da complementação. Além disso, abrange frase, oração, período e suas classificações, além da concordância e da regência em todas as suas formas.`
  },
  {
    id: 'matematica',
    nome: 'Matemática',
    icon: '📊',
    descricao: 'Raciocínio lógico e cálculo',
    conteudo: `Matemática para concursos públicos:

    1. Números Naturais: A princípio, o conjunto dos números naturais é a base da matemática. Além disso, envolve representação geométrica, comparação e os sistemas atuais de numeração. As operações fundamentais (adição, subtração, multiplicação e divisão) são essenciais.

    2. Números Racionais: Agora, os números racionais incluem frações e decimais, com suas respectivas operações. Além disso, a porcentagem é amplamente cobrada.
    
    3. Aritmética Básica: Sobretudo, a aritmética básica compreende as operações fundamentais.`
  },
  {
    id: 'pedagogia',
    nome: 'Pedagogia',
    icon: '🎓',
    descricao: 'Teorias e práticas de ensino',
    conteudo: `Pedagogia para concursos públicos:

1. Legislação Educacional: LDB (Lei nº 9.394/96), ECA (Estatuto da Criança e do Adolescente), BNCC (Base Nacional Comum Curricular).

2. Teorias da Aprendizagem: Conhecer os clássicos da educação como Piaget, Vygotsky e Wallon.

3. Didática e Organização Escolar: Planejamento participativo, PPP, currículo, avaliação formativa.`
  },
  {
    id: 'historia',
    nome: 'História',
    icon: '🏛️',
    descricao: 'Brasil e história geral',
    conteudo: `História para concursos públicos:

    1. História do Brasil: A princípio, a história do Brasil compreende desde o período colonial até os dias atuais.

    2. Didática e Trabalho Pedagógico: Agora, a didática é o campo que estuda os métodos e técnicas de ensino.`
  },
  {
    id: 'customizado',
    nome: 'Meu próprio conteúdo',
    icon: '✏️',
    descricao: 'Cole seu material de estudo',
    conteudo: null
  }
];

const FEATURES = [
  {
    icon: '⚙️',
    title: 'Gerado por IA',
    description: 'Questões inéditas criadas sob medida para o seu estudo.'
  },
  {
    icon: '🎯',
    title: 'Foco no concurso',
    description: 'Simulados de verdade com formato e dificuldade real.'
  },
  {
    icon: '⚡',
    title: 'Correção instantânea',
    description: 'Veja suas respostas e aprenda com as explicações.'
  }
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(false);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quantity, setQuantity] = useState(40);
  const [customContent, setCustomContent] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('darkMode', value.toString());
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const gerarQuestoes = async () => {
    setError('');
    if (!selectedCategory) {
      setError('Selecione uma matéria para começar.');
      return;
    }

    setLoading(true);
    try {
      const categoria = CATEGORIAS.find(c => c.id === selectedCategory);
      const conteudo = selectedCategory === 'customizado' ? customContent : categoria?.conteudo;

      if (!conteudo) {
        setError('Selecione uma matéria para começar.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudo,
          quantidade: quantity,
          categoria: categoria?.nome || 'Customizado'
        })
      });

      if (!response.ok) throw new Error('Erro ao gerar questões');

      const data = await response.json();
      setQuestoes(data.questoes);
      setRespostas({});
      setShowResults(false);
    } catch (err) {
      setError('Erro ao gerar questões. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = (questionIndex: number, answer: string) => {
    setRespostas({
      ...respostas,
      [questionIndex]: answer
    });
  };

  const finalizarSimulado = () => {
    setShowResults(true);
  };

  const calculateStats = () => {
    let acertos = 0;
    questoes.forEach((questao, index) => {
      if (respostas[index] === questao.correta) {
        acertos++;
      }
    });
    const percentual = Math.round((acertos / questoes.length) * 100);
    return { acertos, total: questoes.length, percentual };
  };

  const downloadGabarito = () => {
    const doc = new jsPDF();
    const width = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('Gabarito do Simulado', width / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(11);
    questoes.forEach((questao, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      const respostaUsuario = respostas[index] || 'Não respondida';
      const acertou = respostaUsuario === questao.correta;

      if (acertou) {
        doc.setTextColor(34, 197, 94);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(`Q${index + 1} - ${acertou ? '✓ ACERTOU' : '✗ ERROU'}`, 20, yPos);
      yPos += 8;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(`Resposta: ${respostaUsuario} | Correta: ${questao.correta}`, 25, yPos);
      yPos += 8;
    });

    doc.save('gabarito-simulado.pdf');
  };

  if (questoes.length === 0 || showResults) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

          {/* Hero Section */}
          <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-20 sm:py-32">
            <div className="container-custom text-center">
              <div className="inline-block mb-8">
                <span className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                  <span>✨</span>
                  Estude de forma inteligente
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight max-w-4xl mx-auto">
                Simulados de concurso gerados por Inteligência Artificial
              </h2>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                Escolha a matéria, defina a quantidade de questões e pratique com correção e explicações em tempo real. Tudo gratuito.
              </p>

              <button
                onClick={() => {
                  setShowResults(false);
                  setQuestoes([]);
                  if (formRef.current) {
                    formRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block shadow-lg hover:shadow-xl"
              >
                Começar Agora
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 sm:py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="container-custom">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {FEATURES.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="p-6 sm:p-8 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-800 transition-all hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <div className="text-5xl mb-5">{feature.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Ad Space */}
          <AdSpace type="top" className="my-8" />

          {showResults ? (
            <>
              <AdSpace type="top" className="my-8" />
              {/* Resultado */}
              <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
                <div className="container-custom">
                  <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Resultado do Simulado</h2>
                      <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {calculateStats().percentual}%
                      </div>
                      <p className="text-xl text-gray-600 dark:text-gray-400">
                        Você acertou {calculateStats().acertos} de {calculateStats().total} questões
                      </p>
                    </div>

                    <div className="space-y-6 mb-8">
                      {questoes.map((questao, index) => {
                        const acertou = respostas[index] === questao.correta;
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 dark:bg-gray-800">
                            <div className={`font-bold mb-2 ${acertou ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Q{index + 1} - {acertou ? '✓ Acertou' : '✗ Errou'}
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium mb-3">{questao.pergunta}</p>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <p>Sua resposta: {respostas[index] || 'Não respondida'}</p>
                              <p>Resposta correta: {questao.correta}</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded text-sm text-gray-700 dark:text-gray-300">
                              <strong>Explicação:</strong> {questao.explicacao}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={downloadGabarito}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Baixar Gabarito PDF
                      </button>
                      <button
                        onClick={() => {
                          setShowResults(false);
                          setQuestoes([]);
                          setRespostas({});
                          setSelectedCategory(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Novo Simulado
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* Simulado */
            <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
              <div className="container-custom max-w-3xl">
                {questoes.length > 0 && (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Simulado</h2>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(Object.keys(respostas).length / questoes.length) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {Object.keys(respostas).length} de {questoes.length} respondidas
                      </p>
                    </div>

                    <div className="space-y-8">
                      {questoes.map((questao, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 dark:bg-gray-800">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Q{index + 1} - {questao.pergunta}
                          </h3>

                          <div className="space-y-3">
                            {['A', 'B', 'C', 'D'].map((opcao) => (
                              <button
                                key={opcao}
                                onClick={() => handleResponder(index, opcao)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                  respostas[index] === opcao
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                              >
                                <span className="font-semibold text-gray-900 dark:text-white">{opcao}.</span> {questao.opcoes[opcao as keyof typeof questao.opcoes]}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={finalizarSimulado}
                        disabled={Object.keys(respostas).length < questoes.length}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                      >
                        Finalizar Simulado
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-20 sm:py-32">
          <div className="container-custom text-center">
            <div className="inline-block mb-8">
              <span className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                <span>✨</span>
                Estude de forma inteligente
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight max-w-4xl mx-auto">
              Simulados de concurso gerados por Inteligência Artificial
            </h2>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Escolha a matéria, defina a quantidade de questões e pratique com correção e explicações em tempo real. Tudo gratuito.
            </p>

            <button
              onClick={() => {
                if (formRef.current) {
                  formRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block shadow-lg hover:shadow-xl"
            >
              Começar Agora
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {FEATURES.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="p-6 sm:p-8 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-800 transition-all hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <div className="text-5xl mb-5">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ad Space */}
        <AdSpace type="top" className="my-8" />

        {/* Main Form Section */}
        <section ref={formRef} className="py-16 sm:py-24 bg-white dark:bg-gray-900">
          <div className="container-custom max-w-3xl">
            {/* PASSO 1 */}
            <div className="mb-12">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">PASSO 1</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Escolha uma matéria ou seu conteúdo
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIAS.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => {
                      setSelectedCategory(categoria.id);
                      setError('');
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedCategory === categoria.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="text-2xl">{categoria.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{categoria.nome}</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{categoria.descricao}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* PASSO 2 */}
            <div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">PASSO 2</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Quantidade de questões
              </h2>

              <div className="grid grid-cols-4 gap-3 mb-8">
                {[20, 40, 60, 80].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className={`py-3 rounded-lg font-bold transition-colors ${
                      quantity === num
                        ? 'bg-white dark:bg-white text-gray-900 border-2 border-gray-300 dark:border-gray-300'
                        : 'bg-transparent border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={gerarQuestoes}
                disabled={!selectedCategory || loading}
                className="w-full bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                {loading ? 'Gerando...' : `Gerar Simulado (${quantity} questões)`}
              </button>

              {error && (
                <p className="text-center text-orange-600 dark:text-orange-400 mt-4 text-sm">
                  {error}
                </p>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
