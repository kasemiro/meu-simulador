// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
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

// ===== CATEGORIAS =====
const CATEGORIAS = [
  'Todas',
  'Língua Portuguesa',
  'Matemática',
  'Direito Constitucional',
  'Direito Administrativo',
  'Direito Penal',
  'Direito Civil',
  'Direito do Trabalho',
  'Informática',
  'Atualidades',
  'Raciocínio Lógico',
  'Legislação Específica'
];

export default function Home() {
  // ===== STATES =====
  const [conteudo, setConteudo] = useState('');
  const [quantidade, setQuantidade] = useState(40);
  const [categoria, setCategoria] = useState('Todas');
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  
  // ===== DARK MODE =====
  const [darkMode, setDarkMode] = useState(false);

  // ===== LOAD DARK MODE PREFERENCE =====
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setDarkMode(saved === 'true');
    }
  }, []);

  // ===== SAVE DARK MODE PREFERENCE =====
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ===== CLASSES CONDICIONAIS =====
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const textPrimaryClass = darkMode ? 'text-blue-400' : 'text-blue-600';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300';
  const shadowClass = darkMode ? 'shadow-xl' : 'shadow-md';

  // ===== GERAR SIMULADO =====
  const handleGerarSimulado = async () => {
    if (!conteudo.trim()) {
      setErro('Digite ou cole o conteúdo programático!');
      return;
    }

    if (conteudo.trim().length < 50) {
      setErro('Digite pelo menos 50 caracteres para gerar questões!');
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      
      if (dados.aviso) {
        setAviso(dados.aviso);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  // ===== RESPONDER QUESTÃO =====
  const responderQuestao = (indice: number, opcao: string) => {
    setRespostas(prev => ({ ...prev, [indice]: opcao }));
  };

  // ===== CALCULAR RESULTADO =====
  const calcularResultado = () => {
    let acertos = 0;
    questoes.forEach((q, i) => {
      if (respostas[i] === q.correta) acertos++;
    });
    return acertos;
  };

  // ===== FINALIZAR PROVA =====
  const finalizarProva = () => {
    if (Object.keys(respostas).length < questoes.length) {
      setErro(`Responda todas as ${questoes.length} questões antes de finalizar!`);
      return;
    }
    setMostrarResultado(true);
    setErro('');
  };

  // ===== REINICIAR =====
  const reiniciar = () => {
    setQuestoes([]);
    setRespostas({});
    setMostrarResultado(false);
    setConteudo('');
    setErro('');
    setAviso('');
  };

  // ===== EXPORTAR PDF =====
  const exportarPDF = async () => {
    const element = document.getElementById('conteudo-para-pdf');
    if (!element) return;

    try {
      setErro('');
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
      console.error('Erro ao gerar PDF:', error);
      setErro('Erro ao gerar PDF. Tente novamente.');
    }
  };

  // ===== VERIFICA SE ÚLTIMA QUESTÃO FOI RESPONDIDA =====
  const ultimaRespondida = questoes.length > 0 && 
    respostas[questoes.length - 1] !== undefined;

  return (
    <main className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300 p-8`}>
      <div className="max-w-4xl mx-auto">
        
        {/* ===== HEADER ===== */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {/* LOGO */}
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimaryClass}`}>
                📚 Simulador de Concurso
              </h1>
              <span className={`text-sm ${textMutedClass}`}>
                com IA
              </span>
            </div>
          </div>

          {/* BOTÃO DARK MODE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-2xl"
            aria-label="Alternar modo escuro"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        {/* ===== FORMULÁRIO ===== */}
        <div className={`${cardClass} ${shadowClass} rounded-lg p-6 mb-8 transition-colors duration-300`}>
          <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>
            1. Cole o conteúdo programático
          </h2>
          
          {/* SELETOR DE CATEGORIA */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${textMutedClass} mb-2`}>
              📂 Categoria do conteúdo:
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${inputClass} ${textClass}`}
              disabled={carregando}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* CAMPO DE TEXTO */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${textMutedClass} mb-2`}>
              Conteúdo para gerar as questões:
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder={`Cole aqui o conteúdo de ${categoria}...`}
              className={`w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-colors duration-300 ${inputClass} ${textClass}`}
              disabled={carregando}
            />
            <div className={`flex justify-between mt-2 text-sm ${textMutedClass}`}>
              <span>{conteudo.length} caracteres</span>
              {conteudo.length > 0 && conteudo.length < 50 && (
                <span className="text-yellow-600 dark:text-yellow-400">⚠️ Mínimo 50 caracteres</span>
              )}
              {conteudo.length >= 50 && (
                <span className="text-green-600 dark:text-green-400">✅ Conteúdo suficiente</span>
              )}
            </div>
          </div>

          {/* SELETOR DE QUANTIDADE */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${textMutedClass} mb-2`}>
              Quantidade de questões:
            </label>
            <div className="flex gap-4 flex-wrap">
              {[20, 40, 60, 80].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuantidade(num)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    quantidade === num
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-500 scale-105'
                      : `bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 ${textClass}`
                  }`}
                  disabled={carregando}
                >
                  {num} questões
                </button>
              ))}
            </div>
            <p className={`text-sm ${textMutedClass} mt-1`}>
              ⚡ Mais questões = mais tempo para gerar
            </p>
          </div>

          {/* BOTÃO GERAR */}
          <button
            onClick={handleGerarSimulado}
            disabled={carregando || conteudo.length < 50}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 text-lg font-semibold transition-all duration-200"
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
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
              ⚠️ {erro}
            </div>
          )}

          {aviso && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded-lg">
              ⚠️ {aviso}
            </div>
          )}
        </div>

        {/* ===== QUESTÕES ===== */}
        {questoes.length > 0 && !mostrarResultado && (
          <div className="space-y-6">
            <div className={`${cardClass} ${shadowClass} rounded-lg p-4 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300`}>
              <span className={`font-semibold ${textClass}`}>
                📝 Respondidas: {Object.keys(respostas).length} de {questoes.length}
              </span>
              {/* BOTÃO FINALIZAR - SÓ APARECE SE TODAS FOREM RESPONDIDAS */}
              {Object.keys(respostas).length === questoes.length && (
                <button
                  onClick={finalizarProva}
                  className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-2 rounded-lg transition-all duration-200 animate-fade-in"
                >
                  ✅ Finalizar Prova
                </button>
              )}
            </div>

            {questoes.map((q, indice) => (
              <div key={indice} className={`${cardClass} ${shadowClass} rounded-lg p-6 hover:shadow-lg transition-all duration-200`}>
                <h3 className={`font-bold text-lg mb-3 ${textPrimaryClass}`}>
                  Questão {indice + 1}
                </h3>
                <p className={`mb-4 ${textClass}`}>{q.pergunta}</p>
                
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((letra) => (
                    <label 
                      key={letra} 
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        respostas[indice] === letra 
                          ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500 dark:border-blue-400' 
                          : `hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent`
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

            {/* BOTÃO FINALIZAR NO FINAL DA PÁGINA */}
            {Object.keys(respostas).length === questoes.length && (
              <div className="flex justify-center mt-6 animate-fade-in">
                <button
                  onClick={finalizarProva}
                  className="bg-green-600 hover:bg-green-700 active:scale-95 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200"
                >
                  ✅ Finalizar Prova
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== RESULTADO ===== */}
        {mostrarResultado && (
          <div className={`${cardClass} ${shadowClass} rounded-lg p-6 mt-8 transition-colors duration-300`}>
            <div id="conteudo-para-pdf">
              <h2 className={`text-2xl font-bold text-center mb-6 ${textClass}`}>
                🏆 Resultado Final
              </h2>
              
              <div className="text-center mb-8">
                <div className={`text-6xl font-bold ${textPrimaryClass}`}>
                  {calcularResultado()} / {questoes.length}
                </div>
                <div className={`text-xl mt-2 ${textClass}`}>
                  {calcularResultado() >= Math.round(questoes.length * 0.7) ? (
                    <span className="text-green-600 dark:text-green-400">✅ Aprovado! Continue assim! 🎉</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">❌ Continue estudando! Você consegue! 💪</span>
                  )}
                </div>
                <div className={textMutedClass}>
                  {Math.round((calcularResultado() / questoes.length) * 100)}% de acertos
                </div>
              </div>

              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>📖 Gabarito Comentado</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questoes.map((q, i) => (
                  <div key={i} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                    <p className={`font-semibold ${textClass}`}>
                      {i+1}. {q.pergunta}
                    </p>
                    <div className="mt-2 space-y-1">
                      {['A', 'B', 'C', 'D'].map((letra) => (
                        <p key={letra} className={`text-sm ${
                          letra === q.correta ? 'text-green-600 dark:text-green-400 font-bold' : textMutedClass
                        }`}>
                          {letra === q.correta && '✅ '}
                          {letra}) {q.opcoes[letra as keyof typeof q.opcoes]}
                        </p>
                      ))}
                    </div>
                    <p className="text-green-600 dark:text-green-400 mt-2 font-medium">
                      ✅ Correta: {q.correta}
                    </p>
                    <p className={`${textClass} mt-1 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} p-2 rounded`}>
                      💡 {q.explicacao}
                    </p>
                    <p className={`text-sm ${textMutedClass} mt-1`}>
                      Sua resposta: {respostas[i] || 'Não respondeu'} 
                      {respostas[i] === q.correta ? ' ✅' : ' ❌'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÕES */}
            <div className="space-y-3 mt-6">
              <button
                onClick={exportarPDF}
                className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                📄 Exportar PDF
              </button>
              <button
                onClick={reiniciar}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                🔄 Fazer outro simulado
              </button>
            </div>
          </div>
        )}

        {/* ===== RODAPÉ ===== */}
        <div className={`mt-8 text-center text-sm ${textMutedClass}`}>
          <p>Gerado com ❤️ usando DeepSeek AI</p>
          <p className="mt-1">Cole o conteúdo e receba questões personalizadas!</p>
        </div>
      </div>
    </main>
  );
}