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
    nome: 'Língua Portuguesa',
    descricao: 'Gramática, interpretação e ortografia',
    conteudo: `Língua Portuguesa para concursos públicos:

    1. Interpretação de Texto: A princípio, a interpretação de texto envolve análise e compreensão, considerando a palavra e seu significado (sinonímia, antonímia e ambiguidade). Além disso, os níveis da significação (denotação e conotação) e as figuras de linguagem são amplamente cobrados. Portanto, praticar com textos variados é essencial.

    2. Fonética: Agora, a fonética abrange o estudo do fonema e da letra, encontros vocálicos (ditongo, tritongo e hiato), encontros consonantais e dígrafos. Além disso, a tonicidade (monossílaba, dissílaba, trissílaba, oxítona, paroxítona e proparoxítona) e a separação de sílabas são temas recorrentes.
    
    3. Morfologia: Sobretudo, a morfologia estuda os radicais, os processos de prefixação, sufixação, parassíntese, composição, derivação e hibridismo. Ou seja, é fundamental para compreender a estrutura e a formação das palavras.
    
    4. Sintaxe: A princípio, a sintaxe trata do sujeito e do predicado e suas respectivas classificações, da transitividade dos verbos e da complementação. Além disso, abrange frase, oração, período e suas classificações, além da concordância e da regência em todas as suas formas.`
  },
  {
    nome: 'Matemática',
    descricao: 'Raciocínio lógico e cálculo',
    conteudo: `Matemática para concursos públicos:

    1. Números Naturais: A princípio, o conjunto dos números naturais é a base da matemática. Além disso, envolve representação geométrica, comparação e os sistemas atuais de numeração. As operações fundamentais (adição, subtração, multiplicação e divisão) são essenciais.

    2. Números Racionais: Agora, os números racionais incluem frações e decimais, com suas respectivas operações. Além disso, a porcentagem é amplamente cobrada.
    
    3. Aritmética Básica: Sobretudo, a aritmética básica compreende as operações fundamentais.`
  },
  {
    nome: 'Pedagogia',
    descricao: 'Teorias e práticas de ensino',
    conteudo: `Pedagogia para concursos públicos:

1. Legislação Educacional: LDB (Lei nº 9.394/96), ECA (Estatuto da Criança e do Adolescente), BNCC (Base Nacional Comum Curricular).

2. Teorias da Aprendizagem: Conhecer os clássicos da educação como Piaget, Vygotsky e Wallon.

3. Didática e Organização Escolar: Planejamento participativo, PPP, currículo, avaliação formativa.`
  },
  {
    nome: 'História',
    descricao: 'Brasil e história geral',
    conteudo: `História para concursos públicos:

    1. Avaliação da Aprendizagem: A princípio, a avaliação da aprendizagem é um processo contínuo que visa verificar o desenvolvimento do aluno.

    2. Didática e Trabalho Pedagógico: Agora, a didática é o campo que estuda os métodos e técnicas de ensino.`
  },
  {
    nome: 'Meu próprio conteúdo',
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
    description: 'Matérias mais cobradas nas principais provas do país.'
  },
  {
    icon: '⚡',
    title: 'Correção instantânea',
    description: 'Veja a resposta certa e a explicação a cada questão.'
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
  const [darkMode, setDarkMode] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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

  const gerarQuestoes = async () => {
    if (!categoriaSelecionada && modoEntrada === 'categoria') {
      setErro('Selecione uma matéria para começar.');
      return;
    }

    if (!conteudo && modoEntrada === 'texto') {
      setErro('Cole seu material de estudo para começar.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const categoria = CATEGORIAS.find((c) => c.nome === categoriaSelecionada);
      const conteudoParaProcessar =
        modoEntrada === 'texto' ? conteudo : categoria?.conteudo || '';

      const response = await fetch('/api/gerar-questoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudo: conteudoParaProcessar,
          quantidade,
          categoria: categoriaSelecionada,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar questões');
      }

      const data = await response.json();
      setQuestoes(data.questoes);
      setRespostas({});
      setMostrarResultado(false);
    } catch (err) {
      setErro('Erro ao gerar questões. Tente novamente.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  const calcularResultado = () => {
    const acertos = Object.entries(respostas).filter(
      ([index, resposta]) =>
        resposta === questoes[parseInt(index)].correta
    ).length;

    return {
      acertos,
      total: questoes.length,
      percentual: Math.round((acertos / questoes.length) * 100),
    };
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

  if (mostrarResultado && questoes.length > 0) {
    const { acertos, total, percentual } = calcularResultado();

    return (
      <div className="min-h-screen bg-white">
        <Header darkMode={darkMode} onToggleDarkMode={setDarkMode} />

        <div className="container-custom py-16">
          <AdSpace type="top" className="my-8" />

          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-12 text-center mb-12">
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {percentual}%
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {acertos} de {total} questões corretas
              </h2>
              <p className="text-gray-600 mb-8">
                {percentual >= 70
                  ? 'Parabéns! Você está no caminho certo!'
                  : 'Estude um pouco mais e você consegue!'}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setMostrarResultado(false);
                    setQuestoes([]);
                    setRespostas({});
                    if (formRef.current) {
                      formRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Novo Simulado
                </button>
                <button
                  onClick={downloadGabarito}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Baixar Gabarito
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questoes.map((questao, index) => {
                const respostaUsuario = respostas[index];
                const acertou = respostaUsuario === questao.correta;

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                          acertou ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-4">
                          {questao.pergunta}
                        </p>

                        <div className="space-y-2 mb-4">
                          {Object.entries(questao.opcoes).map(([letra, texto]) => {
                            const isCorreta = letra === questao.correta;
                            const isUserAnswer = letra === respostaUsuario;

                            return (
                              <div
                                key={letra}
                                className={`p-3 rounded border ${
                                  isCorreta
                                    ? 'bg-green-50 border-green-200'
                                    : isUserAnswer && !acertou
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <span className="font-semibold">{letra}.</span> {texto}
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                          <p className="text-sm font-semibold text-blue-900 mb-2">
                            Explicação:
                          </p>
                          <p className="text-sm text-blue-800">{questao.explicacao}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AdSpace type="bottom" className="my-8" />
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header darkMode={darkMode} onToggleDarkMode={setDarkMode} />

      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="container-custom text-center">
          <div className="inline-block mb-8">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
              <span>⭐</span>
              Estude de forma inteligente
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight max-w-4xl mx-auto">
            Simulados de concurso gerados por Inteligência Artificial
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Escolha a matéria, defina a quantidade de questões e pratique com correção e explicações em tempo real. Tudo gratuito.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((feature, idx) => (
              <div 
                key={idx} 
                className="p-6 sm:p-8 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-gray-300"
              >
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publicidade */}
      <div className="container-custom py-4">
        <AdSpace type="top" className="my-0" />
      </div>

      {/* Main Content */}
      <main className="bg-white">
        <div className="container-custom py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário Principal */}
            <div className="lg:col-span-2">
              <div ref={formRef}>
                {/* PASSO 1 */}
                <div className="mb-12">
                  <div className="mb-6">
                    <span className="text-sm font-semibold text-gray-500 uppercase">
                      Passo 1
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-2">
                      Escolha uma matéria ou seu conteúdo
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {CATEGORIAS.map((categoria) => (
                      <button
                        key={categoria.nome}
                        onClick={() => {
                          setCategoriaSelecionada(categoria.nome);
                          setModoEntrada('categoria');
                          setConteudo('');
                          setErro('');
                        }}
                        className={`p-4 text-left rounded-lg border-2 transition-all ${
                          categoriaSelecionada === categoria.nome
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">
                          {categoria.nome}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {categoria.descricao}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PASSO 2 */}
                <div className="mb-12">
                  <div className="mb-6">
                    <span className="text-sm font-semibold text-gray-500 uppercase">
                      Passo 2
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      Quantidade de questões
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {[20, 40, 60, 80].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuantidade(num)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          quantidade === num
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={gerarQuestoes}
                    disabled={carregando || !categoriaSelecionada}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {carregando
                      ? 'Gerando...'
                      : `Gerar Simulado (${quantidade} questões)`}
                  </button>

                  {erro && (
                    <p className="text-red-600 text-sm mt-4">{erro}</p>
                  )}
                </div>

                {/* Questões */}
                {questoes.length > 0 && !mostrarResultado && (
                  <div className="mb-12">
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Questão {Object.keys(respostas).length + 1} de {questoes.length}
                        </h3>
                        <button
                          onClick={() => {
                            setMostrarResultado(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Ver Resultado
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{
                            width: `${((Object.keys(respostas).length + 1) / questoes.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {questoes.map((questao, index) => (
                      <div key={index} className={`mb-12 ${index !== 0 ? 'hidden' : ''}`}>
                        <p className="text-xl font-semibold text-gray-900 mb-6">
                          {questao.pergunta}
                        </p>

                        <div className="space-y-3">
                          {Object.entries(questao.opcoes).map(([letra, texto]) => (
                            <button
                              key={letra}
                              onClick={() => {
                                setRespostas({ ...respostas, [index]: letra });
                                if (index < questoes.length - 1) {
                                  setTimeout(() => {
                                    const nextQuestao = document.querySelector(
                                      `[data-questao="${index + 1}"]`
                                    );
                                    if (nextQuestao) {
                                      nextQuestao.scrollIntoView({ behavior: 'smooth' });
                                    }
                                  }, 300);
                                }
                              }}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                respostas[index] === letra
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <span className="font-semibold">{letra}.</span> {texto}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Publicidade */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <AdSpace type="sidebar" className="my-0" />
                <AdSpace type="sidebar" className="my-0" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Publicidade Rodapé */}
      <div className="container-custom py-8">
        <AdSpace type="bottom" className="my-0" />
      </div>

      <Footer />
    </div>
  );
}
