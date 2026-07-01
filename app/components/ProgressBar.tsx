interface ProgressBarProps {
  current: number;
  total: number;
  answered: number;
}

export default function ProgressBar({ current, total, answered }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  const answeredPercentage = (answered / total) * 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
      {/* Cabeçalho do progresso */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
            Progresso da Prova
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {answered} de {total} respondidas
          </p>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text gradient-accent">
            {Math.round(answeredPercentage)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full transition-all duration-500 bg-gradient-to-r from-orange-500 to-purple-500"
            style={{ width: `${answeredPercentage}%` }}
            role="progressbar"
            aria-valuenow={answered}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>

        {/* Informações */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2 sm:p-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">Questão</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{current}/{total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-2 sm:p-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">Respondidas</p>
            <p className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">{answered}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded p-2 sm:p-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">Pendentes</p>
            <p className="font-bold text-orange-600 dark:text-orange-400 text-sm sm:text-base">{total - answered}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
