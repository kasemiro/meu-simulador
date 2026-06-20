// app/page.tsx
'use client';

import { useState } from 'react';

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

export default function Home() {
  const [conteudo, setConteudo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

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
        body: JSON.stringify({ conteudo: conteudo.trim() })
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
      setErro(`Responda todas as ${questoes.length} questões antes de finalizar!`);
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

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-4">
          📚 Simulador de Concurso Público
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Cole o conteúdo do edital ou material de estudo e gere 80 questões personalizadas!
        </p>

        {/* Área de texto */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            1. Cole o conteúdo programático
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo para gerar as questões:
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Cole aqui o conteúdo do edital, matérias, leis, etc.&#10;&#10;Exemplo:&#10;Direito Constitucional: Art. 1º A República Federativa do Brasil...&#10;Direito Administrativo: Art. 37 ...&#10;Direito Penal: Art. 121 ..."
              className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              disabled={carregando}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{conteudo.length} caracteres</span>
              {conteudo.length > 0 && conteudo.length < 50 && (
                <span className="text-yellow-600">⚠️ Mínimo 50 caracteres</span>
              )}
              {conteudo.length >= 50 && (
                <span className="text-green-600">✅ Conteúdo suficiente</span>
              )}
              {conteudo.length > 10000 && (
                <span className="text-yellow-600">⚠️ Texto muito grande, pode demorar</span>
              )}
            </div>
          </div>

          <button
            onClick={handleGerarSimulado}
            disabled={carregando || conteudo.length < 50}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded disabled:bg-gray-400 text-lg font-semibold transition-colors"
          >
            {carregando ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Gerando 80 questões...
              </span>
            ) : (
              '🚀 Gerar Simulado'
            )}
          </button>

          {erro && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              ⚠️ {erro}
            </div>
          )}

          {aviso && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              ⚠️ {aviso}
            </div>
          )}
        </div>

        {/* Questões */}
        {questoes.length > 0 && !mostrarResultado && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
              <span className="font-semibold">
                📝 Respondidas: {Object.keys(respostas).length} de {questoes.length}
              </span>
              <button
                onClick={finalizarProva}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors"
              >
                ✅ Finalizar Prova
              </button>
            </div>

            {questoes.map((q, indice) => (
              <div key={indice} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-3 text-blue-800">
                  Questão {indice + 1}
                </h3>
                <p className="mb-4 text-gray-800">{q.pergunta}</p>
                
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((letra) => (
                    <label 
                      key={letra} 
                      className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                        respostas[indice] === letra 
                          ? 'bg-blue-100 border-2 border-blue-500' 
                          : 'hover:bg-gray-50 border-2 border-transparent'
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
                      <span className="font-bold text-gray-700">{letra})</span>
                      <span className="text-gray-800">{q.opcoes[letra as keyof typeof q.opcoes]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resultado */}
        {mostrarResultado && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              🏆 Resultado Final
            </h2>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600">
                {calcularResultado()} / {questoes.length}
              </div>
              <div className="text-xl mt-2">
                {calcularResultado() >= 60 ? (
                  <span className="text-green-600">✅ Aprovado! Continue assim! 🎉</span>
                ) : (
                  <span className="text-red-600">❌ Continue estudando! Você consegue! 💪</span>
                )}
              </div>
              <div className="text-gray-500 mt-2">
                {Math.round((calcularResultado() / questoes.length) * 100)}% de acertos
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">📖 Gabarito Comentado</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questoes.map((q, i) => (
                <div key={i} className="border-b border-gray-200 pb-4">
                  <p className="font-semibold text-gray-800">
                    {i+1}. {q.pergunta}
                  </p>
                  <div className="mt-2 space-y-1">
                    {['A', 'B', 'C', 'D'].map((letra) => (
                      <p key={letra} className={`text-sm ${
                        letra === q.correta ? 'text-green-600 font-bold' : 'text-gray-600'
                      }`}>
                        {letra === q.correta && '✅ '}
                        {letra}) {q.opcoes[letra as keyof typeof q.opcoes]}
                      </p>
                    ))}
                  </div>
                  <p className="text-green-700 mt-2 font-medium">
                    ✅ Correta: {q.correta}
                  </p>
                  <p className="text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                    💡 {q.explicacao}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Sua resposta: {respostas[i] || 'Não respondeu'} 
                    {respostas[i] === q.correta ? ' ✅' : ' ❌'}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={reiniciar}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded w-full text-lg font-semibold transition-colors"
            >
              🔄 Fazer outro simulado
            </button>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Gerado com ❤️ usando DeepSeek AI</p>
          <p className="mt-1">Cole o conteúdo e receba 80 questões personalizadas!</p>
        </div>
      </div>
    </main>
  );
}