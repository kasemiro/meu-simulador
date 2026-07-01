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
    nome: '📚 Língua Portuguesa',
    conteudo: `Língua Portuguesa para concursos públicos:

    1. Interpretação de Texto: A princípio, a interpretação de texto envolve análise e compreensão, considerando a palavra e seu significado (sinonímia, antonímia e ambiguidade). Além disso, os níveis da significação (denotação e conotação) e as figuras de linguagem são amplamente cobrados. Portanto, praticar com textos variados é essencial.

    2. Fonética: Agora, a fonética abrange o estudo do fonema e da letra, encontros vocálicos (ditongo, tritongo e hiato), encontros consonantais e dígrafos. Além disso, a tonicidade (monossílaba, dissílaba, trissílaba, oxítona, paroxítona e proparoxítona) e a separação de sílabas são temas recorrentes.
    
    3. Morfologia: Sobretudo, a morfologia estuda os radicais, os processos de prefixação, sufixação, parassíntese, composição, derivação e hibridismo. Ou seja, é fundamental para compreender a estrutura e a formação das palavras.
    
    4. Sintaxe: A princípio, a sintaxe trata do sujeito e do predicado e suas respectivas classificações, da transitividade dos verbos e da complementação. Além disso, abrange frase, oração, período e suas classificações, além da concordância e da regência em todas as suas formas.`
  },
  {
    nome: '🔢 Matemática',
    conteudo: `Matemática para concursos públicos:

    1. Números Naturais: A princípio, o conjunto dos números naturais é a base da matemática. Além disso, envolve representação geométrica, comparação e os sistemas atuais de numeração. As operações fundamentais (adição, subtração, multiplicação e divisão) são essenciais.

    2. Números Racionais: Agora, os números racionais incluem frações e decimais, com suas respectivas operações. Além disso, a porcentagem é amplamente cobrada.
    
    3. Aritmética Básica: Sobretudo, a aritmética básica compreende as operações fundamentais.`
  },
  {
    nome: '📖 Pedagogia',
    conteudo: `Pedagogia para concursos públicos:

1. Legislação Educacional: LDB (Lei nº 9.394/96), ECA (Estatuto da Criança e do Adolescente), BNCC (Base Nacional Comum Curricular).

2. Teorias da Aprendizagem: Conhecer os clássicos da educação como Piaget, Vygotsky e Wallon.

3. Didática e Organização Escolar: Planejamento participativo, PPP, currículo, avaliação formativa.`
  },
  {
    nome: '🏛️ História',
    conteudo: `História para concursos públicos:

    1. Avaliação da Aprendizagem: A princípio, a avaliação da aprendizagem é um processo contínuo que visa verificar o desenvolvimento do aluno.

    2. Didática e Trabalho Pedagógico: Agora, a didática é o campo que estuda os métodos e técnicas de ensino.`
  },
  {
    nome: '✍️ Escrever meu próprio conteúdo',
    conteudo: null
  }
];

const FEATURES = [
  {
  
  },
  {

  },
  {

  }
];

export default function Home() {
  const [conteudo, setConteudo] = useState('');
  const [quantidade, setQuantidade] = useState(10);
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

    setErro('');
    setCarregando(true);

    try {
      const response = await fetch('/api/gerar-questoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudo: textoParaEnviar,
          quantidade: quantidade,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar questões');
      }

      const data = await response.json();
      setQuestoes(data.questoes);
      setRespostas({});
      setMostrarResultado(false);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao gerar questões');
    } finally {
      setCarregando(false);
    }
  };

  const handleResponder = (indexQuestao: number, resposta: string) => {
    setRespostas(prev => ({
      ...prev,
      [indexQuestao]: resposta
    }));
  };

  const handleFinalizarProva = () => {
    if (Object.keys(respostas).length === 0) {
      setErro('Responda pelo menos uma questão!');
      return;
    }
    setMostrarResultado(true);
  };

  const handleNovaProva = () => {
    setQuestoes([]);
    setRespostas({});
    setMostrarResultado(false);
    setConteudo('');
    setCategoriaSelecionada('');
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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

  const acertos = Object.entries(respostas).filter(
    ([idx, resp]) => resp === questoes[parseInt(idx)].correta
  ).length;

  const percentualAcerto = questoes.length > 0 ? Math.round((acertos / questoes.length) * 100) : 0;

  // Se não tem questões geradas, mostra landing page
  if (questoes.length === 0 && !mostrarResultado) {
    return (
      <div className="bg-white">
        <Header 
          darkMode={darkMode} 
          onToggleDarkMode={setDarkMode}
          onComecode={() => {
            if (formRef.current) {
              formRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
          <div className="container-custom text-center">
            {/* Badge */}
            <div className="inline-block mb-8">
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                <span>✨</span>
                Estude de forma inteligente
              </span>
            </div>

            {/* Título */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight max-w-4xl mx-auto">
              Simulados de concurso gerados por Inteligência Artificial
            </h2>

            {/* Descrição */}
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Escolha a matéria, defina a quantidade de questões e pratique com correção e explicações em tempo real. Tudo gratuito.
            </p>

            {/* CTA Button */}
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

        <AdSpace type="top" className="my-8" />

        {/* Formulário */}
        <section ref={formRef} className="py-16 sm:py-24 bg-gray-50">
          <div className="container-custom max-w-2xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Gerar Simulado</h3>

            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
              {/* Toggle Modo */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setModoEntrada('categoria')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    modoEntrada === 'categoria'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Categorias
                </button>
                <button
                  onClick={() => setModoEntrada('texto')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    modoEntrada === 'texto'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Meu Conteúdo
                </button>
              </div>

              {/* Modo Categoria */}
              {modoEntrada === 'categoria' && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selecione uma matéria
                  </label>
                  <select
                    value={categoriaSelecionada}
                    onChange={(e) => setCategoriaSelecionada(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Escolha uma opção...</option>
                    {CATEGORIAS.map(cat => (
                      <option key={cat.nome} value={cat.nome}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modo Texto */}
              {modoEntrada === 'texto' && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cole o conteúdo programático
                  </label>
                  <textarea
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    placeholder="Digite ou cole o conteúdo aqui..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    rows={6}
                  />
                </div>
              )}

              {/* Quantidade de Questões */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantidade de questões: {quantidade}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Erro */}
              {erro && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {erro}
                </div>
              )}

              {/* Botão */}
              <button
                onClick={handleGerarSimulado}
                disabled={carregando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                {carregando ? 'Gerando questões...' : 'Gerar Simulado'}
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Se tem questões, mostra as questões
  return (
    <div className="bg-white min-h-screen">
      <Header 
        darkMode={darkMode} 
        onToggleDarkMode={setDarkMode}
      />

      <main className="container-custom py-8 sm:py-12">
        {!mostrarResultado ? (
          <>
            {/* Questões */}
            <div className="max-w-3xl mx-auto">
              {questoes.map((questao, idx) => (
                <div key={idx} className="mb-8 p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900">{questao.pergunta}</h3>
                  </div>

                  <div className="space-y-2 ml-11">
                    {Object.entries(questao.opcoes).map(([letra, texto]) => (
                      <label key={letra} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                        <input
                          type="radio"
                          name={`questao-${idx}`}
                          value={letra}
                          checked={respostas[idx] === letra}
                          onChange={() => handleResponder(idx, letra)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-700">{letra})</span>
                        <span className="text-gray-600">{texto}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleFinalizarProva}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Finalizar Prova
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Resultado */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12 p-8 bg-blue-50 rounded-lg">
                <div className="text-6xl font-bold text-blue-600 mb-2">{percentualAcerto}%</div>
                <p className="text-2xl font-semibold text-gray-900 mb-2">
                  {acertos} de {questoes.length} questões corretas
                </p>
                <p className="text-gray-600">
                  {percentualAcerto >= 70 ? '🎉 Excelente desempenho!' : percentualAcerto >= 50 ? '👍 Bom desempenho!' : '💪 Continue praticando!'}
                </p>
              </div>

              <AdSpace type="bottom" className="my-8" />

              {/* Gabarito */}
              <div className="space-y-4 mb-8">
                {questoes.map((questao, idx) => {
                  const respostaUsuario = respostas[idx];
                  const acertou = respostaUsuario === questao.correta;

                  return (
                    <div key={idx} className={`p-6 border-l-4 rounded-lg ${
                      acertou ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                    }`}>
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-xl">{acertou ? '✓' : '✗'}</span>
                        <div>
                          <p className="font-semibold text-gray-900">Questão {idx + 1}</p>
                          <p className="text-sm text-gray-600 mt-1">{questao.pergunta}</p>
                        </div>
                      </div>

                      <div className="ml-8 space-y-1 text-sm">
                        <p><span className="font-medium">Sua resposta:</span> {respostaUsuario || 'Não respondida'}</p>
                        <p><span className="font-medium">Resposta correta:</span> {questao.correta}</p>
                        <p className="mt-3 text-gray-600 italic">{questao.explicacao}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões */}
              <div className="flex gap-4">
                <button
                  onClick={downloadGabarito}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  📥 Baixar Gabarito
                </button>
                <button
                  onClick={handleNovaProva}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  ➕ Nova Prova
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
