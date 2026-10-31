import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderGit2,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  RefreshCw,
  ExternalLink,
  GitBranch,
  ArrowUpRight,
  Radio,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HealthBadge } from '../components/ui/HealthBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';

export const DashboardPage: React.FC = () => {
  const { projects, stats, syncAllToGithub, checkAllProjectsHealth, githubConfig, syncLogs } =
    useProjects();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllToGithub();
      if (res.success) {
        success(
          'Sync Completed',
          `All ${projects.length} projects synced to ${githubConfig.repo_owner}/${githubConfig.repo_name}`,
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
        `Checked ${res.checked} projects: ${res.healthy} responsive, ${res.failed} issues detected.`
      );
    } catch (err: any) {
      error('Health Check Failed', err.message);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const topHosting = Object.entries(stats.hostingBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-card via-card/90 to-primary/5 border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-500">
              System Active & Monitoring
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
            Project & Deployment Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Centralized hub for all personal, client, and AI/ML deployments. Automated synchronization with{' '}
            <a
              href={`https://github.com/${githubConfig.repo_owner}/${githubConfig.repo_name}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-indigo-500 hover:underline font-semibold"
            >
              {githubConfig.repo_name}
            </a>
            .
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleHealthCheckAll}
            disabled={isCheckingHealth}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 text-emerald-500 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            <span>{isCheckingHealth ? 'Pinging...' : 'Check All URLs'}</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Pushing...' : 'Sync to GitHub'}</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{stats.totalProjects}</span>
            <span className="text-xs text-muted-foreground font-medium">all time</span>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <span>{stats.categoryBreakdown['Client Projects'] || 0} client</span> ·{' '}
            <span>{stats.categoryBreakdown['AI & Machine Learning'] || 0} AI/ML</span>
          </div>
        </div>

        {/* Live Projects */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Live & Deployed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{stats.liveProjects}</span>
            <span className="text-xs font-semibold text-emerald-500">
              {stats.totalProjects > 0
                ? `${Math.round((stats.liveProjects / stats.totalProjects) * 100)}%`
                : '0%'}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Active public endpoints</p>
        </div>

        {/* Needs Verification */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Verification Req.</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {stats.needsVerificationProjects}
            </span>
            <span className="text-xs text-amber-500 font-medium">pending URLs</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Domain or setup pending</p>
        </div>

        {/* In Development */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Development</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {stats.inDevelopmentProjects}
            </span>
            <span className="text-xs text-blue-500 font-medium">active code</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Local or staging builds</p>
        </div>

        {/* Offline Projects */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-red-500/40 transition-colors col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Offline</span>
            <Radio className="w-4 h-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{stats.offlineProjects}</span>
            <span className="text-xs text-muted-foreground font-medium">unresponsive</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">0 outages currently</p>
        </div>
      </div>

      {/* Grid: Recently Added & Hosting Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added / Updated Projects Table */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Recently Active Projects</h3>
              <p className="text-xs text-muted-foreground">
                Projects with latest deployments or metadata updates
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border flex-1 overflow-x-auto">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                    >
                      {project.name}
                    </Link>
                    <StatusBadge status={project.project_status} />
                    <CategoryBadge category={project.category} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {project.short_description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground/80 flex items-center gap-1">
                      <Server className="w-3 h-3 text-indigo-400" />
                      {project.hosting_provider || 'Pending'}
                    </span>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono"
                      >
                        Visit Site <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <HealthBadge
                    status={project.health_status}
                    latency={project.last_response_time_ms}
                    statusCode={project.last_http_status}
                  />
                  <div className="mt-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border inline-block"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Hosting Platforms & GitHub Sync Feed */}
        <div className="space-y-6">
          {/* Hosting Platforms Breakdown */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-500" />
                Hosting Platforms
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {topHosting.length} platforms
              </span>
            </div>

            <div className="space-y-3">
              {topHosting.map(([host, count]) => {
                const percentage = Math.round((count / stats.totalProjects) * 100);
                return (
                  <div key={host} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{host}</span>
                      <span className="text-muted-foreground font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GitHub Sync Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                GitHub Directory
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ACTIVE REPO
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Every change made in ProjectVault is automatically translated into structured markdown files
              and published directly to:
            </p>

            <div className="my-3 p-3 rounded-xl bg-background/80 border border-border font-mono text-xs text-foreground flex items-center justify-between">
              <span className="truncate">
                {githubConfig.repo_owner}/{githubConfig.repo_name}
              </span>
              <a
                href={`https://github.com/${githubConfig.repo_owner}/${githubConfig.repo_name}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 hover:text-indigo-400 p-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">Recent Sync Activity:</span>
              <Link to="/github-sync" className="font-semibold text-primary hover:underline">
                View Logs ({syncLogs.length}) →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
