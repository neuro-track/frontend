import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: {
    label: string;
    path: string;
  };
  actions?: ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export const PageHeader = ({ title, description, backTo, actions, stats }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Back Button */}
      {backTo && (
        <button
          onClick={() => navigate(backTo.path)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">{backTo.label}</span>
        </button>
      )}

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            {stats.map((stat, index) => (
              <div key={index} className="text-center md:text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
