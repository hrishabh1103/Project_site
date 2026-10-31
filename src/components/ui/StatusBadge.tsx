import React from 'react';
import { ProjectStatus } from '../../types';
import { CheckCircle, AlertCircle, Clock, Archive, HelpCircle } from 'lucide-react';

export const StatusBadge: React.FC<{ status: ProjectStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'Live':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <CheckCircle className="w-3.5 h-3.5" />
          Live
        </span>
      );
    case 'Offline':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <AlertCircle className="w-3.5 h-3.5" />
          Offline
        </span>
      );
    case 'Needs Verification':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Needs Verification
        </span>
      );
    case 'In Development':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          In Development
        </span>
      );
    case 'Archived':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 ${className}`}
        >
          <Archive className="w-3.5 h-3.5" />
          Archived
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 ${className}`}>
          {status}
        </span>
      );
  }
};
