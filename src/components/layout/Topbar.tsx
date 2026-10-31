import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Moon,
  Sun,
  GitBranch,
  Plus,
  RefreshCw,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../ui/StatusBadge';

export const Topbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { projects, syncAllToGithub, githubConfig } = useProjects();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? projects
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.hosting_provider?.toLowerCase().includes(q) ||
            p.frontend_technologies.some((t) => t.toLowerCase().includes(q)) ||
            p.backend_technologies.some((t) => t.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : [];

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllToGithub();
      if (res.success) {
        success(
          'GitHub Synchronized',
          `Successfully pushed all projects and README updates to ${githubConfig.repo_owner}/${githubConfig.repo_name}`,
          res.commitUrl ? { text: 'View Commit', url: res.commitUrl } : undefined
        );
      } else {
        error('Sync Failed', res.error || 'Failed to sync to GitHub');
      }
    } catch (err: any) {
      error('Sync Error', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 border-b border-border backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search input with live results popup */}
        <div ref={searchRef} className="relative w-64 sm:w-80 md:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, stacks, tags... (Press /)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-secondary/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background text-foreground transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-card border border-border shadow-2xl overflow-hidden z-50">
              <div className="p-2 text-[11px] font-semibold text-muted-foreground border-b border-border uppercase tracking-wider">
                Matching Projects ({searchResults.length})
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigate(`/projects/${p.id}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-secondary/70 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {p.name}
                          </span>
                          <StatusBadge status={p.project_status} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {p.category} · {p.hosting_provider || 'No host'}
                        </p>
                      </div>
                      <span className="text-xs text-primary font-medium shrink-0">
                        View →
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No projects found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* GitHub Auto-Sync Button */}
        <button
          onClick={handleQuickSync}
          disabled={isSyncing}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all disabled:opacity-50"
          title="Push all markdown files and README to GitHub"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Repo'}</span>
        </button>

        {/* Add Project Quick Button */}
        <button
          onClick={() => navigate('/projects/new')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Project</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};

