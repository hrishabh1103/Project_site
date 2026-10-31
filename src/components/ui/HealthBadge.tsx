import React from 'react';
import { HealthStatus } from '../../types';
import { Activity, Loader2, AlertCircle, HelpCircle } from 'lucide-react';

export const HealthBadge: React.FC<{
  status: HealthStatus;
  latency?: number | null;
  statusCode?: number | null;
  className?: string;
}> = ({ status, latency, statusCode, className = '' }) => {
  switch (status) {
    case 'healthy':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
          title={`HTTP ${statusCode || 200} · ${latency ? `${latency}ms` : 'Responding'}`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Healthy {latency ? `(${latency}ms)` : ''}</span>
        </span>
      );
    case 'unhealthy':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 ${className}`}
          title={`HTTP ${statusCode || 'Err'} · Unresponsive`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span>Down {statusCode ? `(${statusCode})` : ''}</span>
        </span>
      );
    case 'checking':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 ${className}`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span>Pinging...</span>
        </span>
      );
    case 'unknown':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20 ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Unchecked</span>
        </span>
      );
  }
};

