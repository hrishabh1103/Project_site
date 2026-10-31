import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Clock,
  Server,
  RefreshCw,
  ExternalLink,
  GitBranch,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { GithubIcon } from '../components/ui/GithubIcon';
import { Project } from '../types';

export const DashboardPage: React.FC = () => {
  const { projects, stats, syncAllToGithub, checkAllProjectsHealth, githubConfig, syncLogs } =
    useProjects();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [liveOnly, setLiveOnly] = useState<boolean>(false);

  const CANONICAL_REPO_URL = 'https://github.com/hrishabh1103/my-live-projects';

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllToGithub();
      if (res.success) {
        success(
          'GitHub Synchronization Success',
          `All ${projects.length} project specifications, README.md, and catalog synced to hrishabh1103/my-live-projects!`,
          res.commitUrl ? { text: 'View on GitHub', url: res.commitUrl } : undefined
        );
      } else {
        error('Sync Error', res.error || 'Failed to sync to GitHub');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleHealthCheckAll = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkAllProjectsHealth();
      success(
        'Health Checks Completed',
        `Checked ${res.checked} projects: ${res.healthy} responsive endpoints.`
      );
    } catch (err: any) {
      error('Health Check Failed', err.message);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const categories = [
    { label: 'All Projects', value: 'All' },
    { label: 'Client Projects', value: 'Client Projects' },
    { label: 'Personal & Startups', value: 'Personal Projects' },
    { label: 'AI & Machine Learning', value: 'AI & Machine Learning' },
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        (p.hosting_provider && p.hosting_provider.toLowerCase().includes(q)) ||
        p.frontend_technologies.some((t) => t.toLowerCase().includes(q)) ||
        p.backend_technologies.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;

      const matchesStatus = liveOnly ? p.project_status === 'Live' : true;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchQuery, selectedCategory, liveOnly]);

  const totalCount = projects.length;
  const liveCount = projects.filter((p) => p.project_status === 'Live').length;
  const inDevCount = projects.filter((p) => p.project_status === 'In Development').length;
  const clientCount = projects.filter((p) => p.category === 'Client Projects').length;
  const personalCount = projects.filter((p) => p.category === 'Personal Projects').length;
  const aimlCount = projects.filter((p) => p.category === 'AI & Machine Learning').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Clean Minimal Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Projects Directory · Production Single Source of Truth
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Hrishabh Gupta / ProjectVault
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Centralized directory for all personal platforms, client solutions, and AI/ML systems. Synchronized directly with the public GitHub repository:{' '}
            <a
              href={CANONICAL_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5 inline" />
              <span>hrishabh1103/my-live-projects</span>
              <ExternalLink className="w-3 h-3 inline text-muted-foreground" />
            </a>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={CANONICAL_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Open Repo</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>

          <button
            onClick={handleHealthCheckAll}
            disabled={isCheckingHealth}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            <span>{isCheckingHealth ? 'Checking...' : 'Ping URLs'}</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync to GitHub'}</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Grid (Matching hrishabh1103/my-live-projects README) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Total Projects</div>
          <div className="mt-2 text-3xl font-extrabold text-foreground">{totalCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {clientCount} client · {personalCount} personal · {aimlCount} AI/ML
          </p>
        </div>

        {/* Live Deployments */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Live Deployments
          </div>
          <div className="mt-2 text-3xl font-extrabold text-foreground">{liveCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active public web endpoints online
          </p>
        </div>

        {/* In Development */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> In Active Development
          </div>
          <div className="mt-2 text-3xl font-extrabold text-foreground">{inDevCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Local demo builds &amp; models
          </p>
        </div>

        {/* Primary Hosting Platforms */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" /> Edge &amp; Cloud Providers
          </div>
          <div className="mt-2 text-xl font-bold text-foreground">Vercel &amp; Workers</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Vercel (8), Cloudflare (1), Custom (1), Staging (3)
          </p>
        </div>
      </div>

      {/* Projects Showcase & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              const count =
                cat.value === 'All'
                  ? projects.length
                  : projects.filter((p) => p.category === cat.value).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Live Only Filter */}
          <button
            onClick={() => setLiveOnly(!liveOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors self-start sm:self-auto ${
              liveOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveOnly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'}`} />
            <span>Live Only ({liveCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects by name, technology (React, Next.js, Flask, Go...), or hosting..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const isLive = p.project_status === 'Live';
          const allTech = [...p.frontend_technologies, ...p.backend_technologies].slice(0, 4);

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Row: Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-bold text-base text-foreground group-hover:text-primary transition-colors block truncate"
                    >
                      {p.name}
                    </Link>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {p.hosting_provider || 'Unassigned'}
                    </div>
                  </div>

                  <StatusBadge status={p.project_status} />
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {p.short_description}
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allTech.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {p.database && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground font-mono">
                      {p.database.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {p.live_url ? (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-900 font-semibold hover:opacity-90 transition-opacity"
                    >
                      <span>Visit Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic px-1">
                      In Development
                    </span>
                  )}

                  {p.github_repo_url && (
                    <a
                      href={p.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border font-medium transition-colors"
                      title="View source repository on GitHub"
                    >
                      <GithubIcon className="w-3 h-3" />
                      <span>Code</span>
                    </a>
                  )}
                </div>

                <Link
                  to={`/projects/${p.id}`}
                  className="text-muted-foreground hover:text-foreground font-medium text-xs transition-colors"
                >
                  Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-card border border-border">
          <p className="text-sm font-semibold text-foreground">No projects found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setLiveOnly(false);
            }}
            className="mt-3 text-xs text-primary font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* GitHub Sync Status Card */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Repository Sync Target: hrishabh1103/my-live-projects
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Branch: <span className="font-mono text-foreground font-medium">main</span> · Tracks {projects.length} specifications in <code className="text-foreground">projects/</code>
            </p>
          </div>
        </div>

        <Link
          to="/github-sync"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors self-start sm:self-auto"
        >
          <span>View Sync Logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
