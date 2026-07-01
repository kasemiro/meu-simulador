interface CategoryCardProps {
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function CategoryCard({ name, isSelected, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        card transition-all duration-300 cursor-pointer relative overflow-hidden
        w-full h-full min-h-24 sm:min-h-28 flex flex-col justify-between
        ${isSelected 
          ? 'ring-2 ring-offset-2 ring-orange-500 dark:ring-offset-slate-900 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 shadow-lg' 
          : 'hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md'
        }
      `}
      aria-pressed={isSelected}
      aria-label={`Selecionar categoria ${name}`}
    >
      {/* Fundo gradiente para cards selecionados */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-purple-500/10" />
      )}

      <div className="relative z-10 w-full">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-left line-clamp-2">
          {name}
        </h3>
        
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            isSelected 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isSelected ? '✓ Selecionado' : 'Selecionar'}
          </span>
          
          <span className={`text-lg sm:text-xl transition-transform flex-shrink-0 ${isSelected ? 'scale-110' : ''}`}>
            →
          </span>
        </div>
      </div>

      {/* Indicador visual */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${
        isSelected ? 'bg-gradient-accent' : 'bg-transparent'
      }`} />
    </button>
  );
}
