import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Plus, GitBranch, Settings, ExternalLink, Activity } from 'lucide-react';
import { GithubIcon } from '../ui/GithubIcon';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { githubConfig, projects } = useProjects();
  const location = useLocation();

  const isHome = location.pathname === '/' || location.pathname === '/projects';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Navbar />

      {/* Admin Quick Action Strip (Only visible when logged in) */}
      {isAuthenticated && (
        <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 text-xs py-2 px-4 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium">Admin Mode Active</span>
              <span className="text-slate-300 dark:text-zinc-700">·</span>
              <span className="hidden sm:inline">Sync target: {githubConfig.repo_owner}/{githubConfig.repo_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </Link>

              <Link
                to="/github-sync"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Sync Repo</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/80 dark:border-zinc-800/80 py-8 px-4 text-xs text-slate-500 dark:text-zinc-400 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Hrishabh Gupta</span>
            <span>·</span>
            <a
              href="https://hrishabhgupt.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors underline"
            >
              Portfolio
            </a>
            <span>·</span>
            <a
              href={`https://github.com/${githubConfig.repo_owner}/${githubConfig.repo_name}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>{githubConfig.repo_name}</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Automated project catalog &amp; deployment sync · Maintained with ProjectVault
          </p>
        </div>
      </footer>
    </div>
  );
};
