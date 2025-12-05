import { Task } from '../types';
import { Check, Clock, Code, BookOpen, Play } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskList = ({ tasks, onTaskClick }: TaskListProps) => {
  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'coding-challenge':
        return <Code size={20} className="text-purple-600 dark:text-purple-400" />;
      case 'quiz':
        return <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />;
      case 'reading':
        return <BookOpen size={20} className="text-green-600 dark:text-green-400" />;
      case 'video-watch':
        return <Play size={20} className="text-red-600 dark:text-red-400" />;
      case 'exercise':
        return <Clock size={20} className="text-amber-600 dark:text-amber-400" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
            <Check size={16} /> Completo
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
            Em Progresso
          </span>
        );
      case 'skipped':
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
            Pulado
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
            Não Iniciado
          </span>
        );
    }
  };

  const getDifficultyBadge = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
            Fácil
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
            Médio
          </span>
        );
      case 'hard':
        return (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
            Difícil
          </span>
        );
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Nenhuma tarefa disponível
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          As tarefas aparecerão aqui quando forem adicionadas a esta lição.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          onClick={() => onTaskClick(task)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] ${
            task.status === 'completed'
              ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
              : task.status === 'in-progress'
              ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Task number */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 text-sm">
              {index + 1}
            </div>

            {/* Task info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getTaskIcon(task.type)}
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {task.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(task.status)}
                {getDifficultyBadge(task.difficulty)}
                <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                  <Clock size={14} />
                  {task.estimatedMinutes} min
                </span>
                {task.score !== undefined && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                    Score: {task.score}%
                  </span>
                )}
                {task.attempts > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {task.attempts} {task.attempts === 1 ? 'tentativa' : 'tentativas'}
                  </span>
                )}
              </div>
            </div>

            {/* Completion indicator */}
            {task.status === 'completed' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={24} className="text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Summary stats */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Progresso das Tarefas
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {tasks.filter(t => t.status === 'completed').length} / {tasks.length}
          </span>
        </div>
        <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
            style={{
              width: `${(tasks.filter(t => t.status === 'completed').length / tasks.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
