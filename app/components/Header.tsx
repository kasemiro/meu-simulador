import { useState, useEffect } from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
}

export default function Header({ darkMode, onToggleDarkMode }: HeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo e Título */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
              📚
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                Simulador
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Questões com IA</p>
            </div>
          </div>

          {/* Navegação e Controles */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Toggle Dark Mode */}
            <button
              onClick={() => onToggleDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
              aria-label="Alternar modo escuro"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* GitHub Link - Hidden on mobile, shown on sm+ */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              aria-label="GitHub"
              title="GitHub"
            >
              ⭐
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
