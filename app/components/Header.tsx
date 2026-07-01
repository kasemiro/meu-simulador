import { useState, useEffect } from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
  onComecode?: () => void;
}

export default function Header({ darkMode, onToggleDarkMode, onComecode }: HeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              🎓
            </div>
            <div>
              <h1 className="font-bold text-base text-gray-900">
                Simulador de Concurso
              </h1>
              <p className="text-xs text-gray-500">Questões com IA</p>
            </div>
          </div>

          {/* Navegação e Botão */}
          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-6">
              <button className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                Gerar Simulado
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                Matérias
              </button>
            </nav>
            
            <button
              onClick={onComecode}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Começar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
