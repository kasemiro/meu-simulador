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
  const [conteudoTexto, setConteudoTexto] = useState('');
  const [modoEntrada, setModoEntrada] = useState<'texto' | 'pdf'>('texto');
  const [carregando, setCarregando] = useState(false);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [erro, setErro] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEnviarConteudo = async () => {
    // Valida se tem conteúdo
    if (modoEntrada === 'texto' && !conteudoTexto.trim()) {
      setErro('Digite ou cole o conteúdo programático!');
      return;
    }

    if (modoEntrada === 'pdf' && !arquivo) {
      setErro('Selecione um PDF primeiro!');
      return;
    }

    setCarregando(true);
    setErro('');
    setQuestoes([]);
    setMostrarResultado(false);

    const formData = new FormData();
    
    if (modoEntrada === 'texto') {
      // Modo texto: envia o conteúdo como texto
      formData.append('conteudo', conteudoTexto);
      formData.append('modo', 'texto');
    } else {
      // Modo PDF: envia o arquivo
      formData.append('pdf', arquivo!);
      formData.append('modo', 'pdf');
    }

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
      setRespostas({});
      
      if (dados.aviso) {
        setErro(dados.aviso);
      }
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
    if (Object.keys(respostas).length < questoes.length) {
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

        {/* Área de Upload/Texto */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Insira o conteúdo programático</h2>
          
          {/* Seletor de modo */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setModoEntrada('texto')}
              className={`px-4 py-2 rounded ${
                modoEntrada === 'texto' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              📝 Colar Texto
            </button>
            <button
              onClick={() => setModoEntrada('pdf')}
              className={`px-4 py-2 rounded ${
                modoEntrada === 'pdf' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              📄 Upload PDF
            </button>
          </div>

          {/* Modo Texto */}
          {modoEntrada === 'texto' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cole o conteúdo programático (edital, matérias, etc.):
              </label>
              <textarea
                value={conteudoTexto}
                onChange={(e) => setConteudoTexto(e.target.value)}
                placeholder="Exemplo: Direito Constitucional: Art. 1º A República Federativa do Brasil...&#10;Direito Administrativo: Art. 37 ..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={carregando}
              />
              <p className="text-sm text-gray-500 mt-1">
                {conteudoTexto.length} caracteres
              </p>
            </div>
          )}

          {/* Modo PDF */}
          {modoEntrada === 'pdf' && (
            <div className="mb-4">
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
                  disabled={carregando}
                >
                  📂 Escolher PDF
                </button>
                <span className="text-gray-600">
                  {arquivo ? `📄 ${arquivo.name}` : 'Nenhum arquivo selecionado'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                ⚠️ PDFs muito grandes podem demorar ou não funcionar. Prefira colar o texto.
              </p>
            </div>
          )}

          <button
            onClick={handleEnviarConteudo}
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded disabled:bg-gray-400 text-lg font-semibold"
          >
            {carregando ? '🔄 Gerando questões...' : '🚀 Gerar Simulado'}
          </button>

          {erro && (
            <div className={`mt-4 p-3 rounded ${
              erro.includes('apenas') || erro.includes('menos') 
                ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {erro.includes('apenas') || erro.includes('menos') ? '⚠️' : '⚠️'} {erro}
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
                setConteudoTexto('');
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