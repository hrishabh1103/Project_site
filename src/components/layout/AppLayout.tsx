import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Database, AlertCircle, ArrowRight } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner when running with local demo persistence instead of Supabase */}
      {!isSupabaseConfigured && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 text-indigo-100 text-xs px-4 py-2 border-b border-indigo-500/20 flex items-center justify-between z-50">
          <div className="flex items-center gap-2 max-w-4xl mx-auto truncate">
            <Database className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Local Active Mode:</strong> Initial 8 projects loaded in local persistence. Connect your Supabase credentials to enable multi-device PostgreSQL & Auth synchronization.
            </span>
          </div>
          <Link
            to="/settings"
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-indigo-300 hover:text-white underline text-xs shrink-0"
          >
            Configure Supabase <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Persistent Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
