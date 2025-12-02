import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick
}: CardProps) => {
  const baseClasses = 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800';
  const hoverClasses = hover ? 'hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
