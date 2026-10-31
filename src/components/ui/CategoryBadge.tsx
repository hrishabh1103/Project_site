import React from 'react';
import { ProjectCategory } from '../../types';

export const CategoryBadge: React.FC<{ category: ProjectCategory; className?: string }> = ({
  category,
  className = '',
}) => {
  const getStyle = () => {
    switch (category) {
      case 'Client Projects':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50';
      case 'Personal Projects':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50';
      case 'AI & Machine Learning':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStyle()} ${className}`}
    >
      {category}
    </span>
  );
};
