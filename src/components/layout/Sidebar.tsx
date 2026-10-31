import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  PlusCircle,
  Activity,
  GitBranch,
  Settings,
  Shield,
  ExternalLink,
  ChevronRight,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const { projects, githubConfig } = useProjects();
  const navigate = useNavigate();

  const liveCount = projects.filter((p) => p.project_status === 'Live').length;

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: null,
    },
    {
      to: '/projects',
      label: 'Projects Directory',
      icon: <FolderGit2 className="w-5 h-5" />,
      badge: projects.length,
    },
    {
      to: '/projects/new',
      label: 'Add Project',
      icon: <PlusCircle className="w-5 h-5" />,
      badge: null,
    },
    {
      to: '/monitoring',
      label: 'Health Monitoring',
      icon: <Activity className="w-5 h-5" />,
      badge: liveCount > 0 ? `${liveCount} Live` : null,
    },
    {
      to: '/github-sync',
      label: 'GitHub Sync',
      icon: <GitBranch className="w-5 h-5" />,
      badge: 'Auto',
    },
    {
      to: '/settings',
      label: 'Settings & Integrations',
      icon: <Settings className="w-5 h-5" />,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-card/95 border-r border-border backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <NavLink to="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-foreground">
                  PROJECT<span className="text-indigo-500">VAULT</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 uppercase tracking-widest border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Personal Deployment OS
              </p>
            </div>
          </NavLink>
        </div>

        {/* Target Repository Info Card */}
        <div className="px-4 py-3 mx-4 my-3 rounded-xl bg-secondary/50 border border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sync Repository
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <a
            href={`https://github.com/${githubConfig.repo_owner}/${githubConfig.repo_name}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between mt-1 text-xs font-mono font-medium text-foreground hover:text-indigo-500 transition-colors group"
          >
            <span className="truncate">{githubConfig.repo_name}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted-foreground font-mono">
            <span className="text-indigo-400">branch:</span>
            <span>{githubConfig.branch}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className="px-2 py-0.5 text-xs font-bold rounded-full bg-black/10 dark:bg-white/10"
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Auth Status */}
        <div className="p-4 border-t border-border">
          {isAuthenticated ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.email}
                  </p>
                  <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Authorized Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-secondary/60 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Viewer Mode (Read Only)
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in to Manage
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
