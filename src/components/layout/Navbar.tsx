import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  ExternalLink,
  Shield,
  Plus,
  GitBranch,
  Settings,
  LogOut,
  Activity,
  Layers,
  Lock,
  Unlock,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { GithubIcon } from '../ui/GithubIcon';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, signOut } = useAuth();
  const { githubConfig, projects } = useProjects();
  const location = useLocation();
  const navigate = useNavigate();

  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const liveCount = projects.filter((p) => p.project_status === 'Live').length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
            HG
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                Hrishabh Gupta
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                /
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Live Projects
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium sm:hidden">
              ProjectVault
            </span>
          </div>
        </Link>

        {/* Center / Nav Links (Minimal & Clear) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              isActive('/') || isActive('/projects')
                ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            Projects
          </Link>

          <Link
            to="/monitoring"
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/monitoring')
                ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900'
            }`}
          >
            <span>Live Health</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </Link>

          <a
            href={`https://github.com/${githubConfig.repo_owner}/${githubConfig.repo_name}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>

        {/* Right: Theme Toggle & Admin Access */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Admin Management Dropdown / Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 transition-all"
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Admin</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {adminDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl p-1.5 z-50 text-xs animate-in fade-in"
                  onClick={() => setAdminDropdownOpen(false)}
                >
                  <Link
                    to="/projects/new"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>Add Project</span>
                  </Link>

                  <Link
                    to="/github-sync"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                    <span>GitHub Sync</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Settings & Config</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Admin Login"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
