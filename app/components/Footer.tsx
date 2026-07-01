export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-gray-700 mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span> Simulador
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Plataforma de estudos com questões geradas por inteligência artificial para preparação em concursos públicos.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Políticas */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Políticas</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                  Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
                f
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-400 transition">
                𝕏
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-pink-600 transition">
                📷
              </a>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {`© ${currentYear} Simulador. Todos os direitos reservados.`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 sm:mt-0">
            Desenvolvido com ❤️ para educadores e estudantes
          </p>
        </div>
      </div>
    </footer>
  );
}
