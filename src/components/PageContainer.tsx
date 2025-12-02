import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const PageContainer = ({ children, maxWidth = '7xl' }: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8`}>
        {children}
      </main>
    </div>
  );
};
