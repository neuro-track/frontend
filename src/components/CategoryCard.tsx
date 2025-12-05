import { LearningCategory } from '../types';

interface CategoryCardProps {
  category: LearningCategory;
  progress: { completed: number; total: number; percentage: number };
  onClick: () => void;
}

export const CategoryCard = ({ category, progress, onClick }: CategoryCardProps) => {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-blue-500 dark:hover:border-blue-500"
      onClick={onClick}
      style={{ borderLeft: `4px solid ${category.color}` }}
    >
      {/* Icon and title */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {category.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Progresso
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {progress.percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress.percentage}%`,
              backgroundColor: category.color,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {progress.completed} de {progress.total} lições
        </span>
        {progress.completed === progress.total && progress.total > 0 ? (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
            ✓ Completo
          </span>
        ) : progress.completed > 0 ? (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
            Em progresso
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
            Não iniciado
          </span>
        )}
      </div>
    </div>
  );
};
