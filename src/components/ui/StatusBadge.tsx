import React from 'react';
import { ProjectStatus } from '../../types';

export const StatusBadge: React.FC<{ status: ProjectStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'Live':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      );
    case 'In Development':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          In Development
        </span>
      );
    case 'Needs Verification':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Pending Check
        </span>
      );
    case 'Offline':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Offline
        </span>
      );
    case 'Archived':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 ${className}`}
        >
          Archived
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-zinc-800 ${className}`}>
          {status}
        </span>
      );
  }
};
