// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  'Todas',
  'Língua Portuguesa',
  'Matemática',
  'História do Brasil',
  'Informática',
  'Atualidades',
  'Raciocínio Lógico',
];

export default function Home() {
  const [conteudo, setConteudo] = useState('');
  const [quantidade, setQuantidade] = useState(40);
  const [categoria, setCategoria] = useState('Todas');
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // ===== DARK MODE =====
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

  // ===== GERAR SIMULADO =====
  const handleGerarSimulado = async () => {
    if (!conteudo.trim()) {
      setErro('Digite ou cole o conteúdo programático!');
      return;
    }
    if (conteudo.trim().length < 50) {
      setErro('Digite pelo menos 50 caracteres!');
      return;
    }

    setCarregando(true);
    setErro('');
    setAviso('');
    setQuestoes([]);
    setMostrarResultado(false);

    try {
      const resposta = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudo: conteudo.trim(),
          quantidade: quantidade,
          categoria: categoria
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
    if (Object.keys(respostas).length < questoes.length) {
      setErro(`Responda todas as ${questoes.length} questões!`);
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

  const exportarPDF = async () => {
    const element = document.getElementById('conteudo-para-pdf');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('simulado.pdf');
    } catch (error) {
      setErro('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const ultimaRespondida = questoes.length > 0 && 
    respostas[questoes.length - 1] !== undefined;

  // ===== CLASSES DARK MODE =====
  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const cardShadow = darkMode ? 'shadow-xl shadow-gray-900/30' : 'shadow-md';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300';
  const hoverBg = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';

  return (
    <main className="min-h-screen transition-colors duration-300">
      {/* ===== HEADER ===== */}
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
        
        {/* ===== FORMULÁRIO ===== */}
        <div className={`${cardBg} ${cardShadow} rounded-2xl p-6 mb-8 transition-colors duration-300`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            1. Cole o conteúdo programático
          </h2>
          
          <div className="space-y-4">
            {/* CATEGORIA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                📂 Categoria:
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${inputBg} text-gray-900 dark:text-gray-100`}
                disabled={carregando}
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* TEXTO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Conteúdo:
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
              disabled={carregando || conteudo.length < 50}
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

        {/* ===== QUESTÕES ===== */}
        {questoes.length > 0 && !mostrarResultado && (
          <div className="space-y-4">
            <div className={`${cardBg} ${cardShadow} rounded-2xl p-4 flex justify-between items-center sticky top-[72px] z-10 transition-colors duration-300`}>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                📝 {Object.keys(respostas).length} de {questoes.length}
              </span>
              {Object.keys(respostas).length === questoes.length && (
                <button
                  onClick={finalizarProva}
                  className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2 rounded-xl transition-all duration-200"
                >
                  ✅ Finalizar Prova
                </button>
              )}
            </div>

            {questoes.map((q, indice) => (
              <div key={indice} className={`${cardBg} ${cardShadow} rounded-2xl p-6 transition-colors duration-300`}>
                <h3 className="font-bold text-lg mb-3 text-blue-600 dark:text-blue-400">
                  Questão {indice + 1}
                </h3>
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

            {Object.keys(respostas).length === questoes.length && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={finalizarProva}
                  className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-8 py-3 rounded-2xl text-lg font-semibold transition-all duration-200"
                >
                  ✅ Finalizar Prova
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== RESULTADO ===== */}
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

              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">📖 Gabarito</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questoes.map((q, i) => (
                  <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {i+1}. {q.pergunta}
                    </p>
                    <div className="mt-2 space-y-1">
                      {['A', 'B', 'C', 'D'].map((letra) => (
                        <p key={letra} className={`text-sm ${
                          letra === q.correta ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {letra === q.correta && '✅ '}
                          {letra}) {q.opcoes[letra as keyof typeof q.opcoes]}
                        </p>
                      ))}
                    </div>
                    <p className="text-green-600 dark:text-green-400 mt-2 font-medium">
                      ✅ Correta: {q.correta}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl">
                      💡 {q.explicacao}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Sua resposta: {respostas[i] || 'Não respondeu'} 
                      {respostas[i] === q.correta ? ' ✅' : ' ❌'}
                    </p>
                  </div>
                ))}
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

        {/* ===== RODAPÉ ===== */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Gerado com ❤️ usando DeepSeek AI</p>
        </div>
      </div>
    </main>
  );
}