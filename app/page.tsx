// app/page.tsx
'use client';

import { useState, useRef } from 'react';

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
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [erro, setErro] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!arquivo) {
      setErro('Selecione um PDF primeiro!');
      return;
    }

    setCarregando(true);
    setErro('');
    setQuestoes([]);
    setMostrarResultado(false);

    const formData = new FormData();
    formData.append('pdf', arquivo);

    try {
      const resposta = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao gerar questões');
      }

      setQuestoes(dados.questoes);
      // Reseta respostas
      setRespostas({});
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  const selecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArquivo(file);
      setErro('');
    } else {
      setErro('Por favor, selecione um arquivo PDF válido');
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
    // Verifica se respondeu todas
    if (Object.keys(respostas).length < 80) {
      setErro(`Responda todas as ${questoes.length} questões antes de finalizar!`);
      return;
    }
    setMostrarResultado(true);
    setErro('');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          📚 Simulador de Concurso Público
        </h1>

        {/* Área de Upload */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Envie o conteúdo programático (PDF)</h2>
          
          <div className="flex items-center gap-4 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={selecionarArquivo}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              📂 Escolher PDF
            </button>
            <span className="text-gray-600">
              {arquivo ? `📄 ${arquivo.name}` : 'Nenhum arquivo selecionado'}
            </span>
            <button
              onClick={handleUpload}
              disabled={carregando || !arquivo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-gray-400"
            >
              {carregando ? '🔄 Gerando questões...' : '🚀 Gerar Simulado'}
            </button>
          </div>

          {erro && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              ⚠️ {erro}
            </div>
          )}
        </div>

        {/* Questões */}
        {questoes.length > 0 && !mostrarResultado && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
              <span className="font-semibold">
                📝 Respondidas: {Object.keys(respostas).length} de {questoes.length}
              </span>
              <button
                onClick={finalizarProva}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                ✅ Finalizar Prova
              </button>
            </div>

            {questoes.map((q, indice) => (
              <div key={indice} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold mb-3">
                  Questão {indice + 1}
                </h3>
                <p className="mb-4 text-gray-800">{q.pergunta}</p>
                
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((letra) => (
                    <label key={letra} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="radio"
                        name={`questao-${indice}`}
                        value={letra}
                        checked={respostas[indice] === letra}
                        onChange={() => responderQuestao(indice, letra)}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold">{letra})</span>
                      <span>{q.opcoes[letra as keyof typeof q.opcoes]}</span>
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
              <p className="text-6xl font-bold text-blue-600">
                {calcularResultado()} / {questoes.length}
              </p>
              <p className="text-gray-600 mt-2">
                {calcularResultado() >= 60 ? '✅ Aprovado!' : '❌ Continue estudando!'}
              </p>
            </div>

            <h3 className="text-xl font-bold mb-4">📖 Gabarito Comentado</h3>
            {questoes.map((q, i) => (
              <div key={i} className="border-b border-gray-200 py-4">
                <p className="font-semibold">
                  {i+1}. {q.pergunta}
                </p>
                <p className="text-green-600">
                  ✅ Correta: {q.correta}
                </p>
                <p className="text-gray-700">
                  💡 {q.explicacao}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Sua resposta: {respostas[i] || 'Não respondeu'} 
                  {respostas[i] === q.correta ? ' ✅' : ' ❌'}
                </p>
              </div>
            ))}

            <button
              onClick={() => {
                setQuestoes([]);
                setRespostas({});
                setMostrarResultado(false);
                setArquivo(null);
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              🔄 Fazer outro simulado
            </button>
          </div>
        )}
      </div>
    </main>
  );
}