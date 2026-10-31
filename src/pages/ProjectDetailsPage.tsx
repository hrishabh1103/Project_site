import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Server,
  Activity,
  Calendar,
  Layers,
  GitBranch,
  Edit,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HealthBadge } from '../components/ui/HealthBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { MarkdownPreview } from '../components/ui/MarkdownPreview';
import { GithubIcon } from '../components/ui/GithubIcon';
import { generateProjectMarkdown, getProjectMarkdownPath } from '../lib/markdown-generator';
import { DeploymentCheck } from '../types';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, deleteProject, checkProjectHealth, syncProjectToGithub, githubConfig, getProjectChecks } =
    useProjects();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const project = id ? getProject(id) : undefined;

  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'markdown'>('overview');
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [recentChecks, setRecentChecks] = useState<DeploymentCheck[]>([]);

  useEffect(() => {
    if (project) {
      getProjectChecks(project.id).then(setRecentChecks);
    }
  }, [project, getProjectChecks]);

  if (!project) {
    return (
      <div className="p-12 text-center rounded-2xl bg-card border border-border">
        <h3 className="text-base font-bold text-foreground">Project Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          The requested project does not exist.
        </p>
        <Link
          to="/projects"
          className="mt-4 inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const handleHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkProjectHealth(project.id);
      if (res.success) {
        success('Health Checked', `Status: HTTP ${res.status} (${res.responseTime}ms)`);
        getProjectChecks(project.id).then(setRecentChecks);
      } else {
        error('Health Check Error', res.error || 'Failed to ping URL');
      }
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSyncToGithub = async () => {
    setIsSyncing(true);
    try {
      const res = await syncProjectToGithub(project);
      if (res.success) {
        success(
          'GitHub Synchronized',
          `Pushed ${project.name} specifications to repository!`,
          res.commitUrl ? { text: 'View Commit', url: res.commitUrl } : undefined
        );
      } else {
        error('Sync Failed', res.error || 'Failed to sync to GitHub');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      const res = await deleteProject(project.id, true);
      if (res.success) {
        success('Deleted', `Project ${project.name} has been removed.`);
        navigate('/projects');
      } else {
        error('Delete Failed', res.error || 'Failed to delete');
      }
    }
  };

  const generatedMarkdown = generateProjectMarkdown(project);
  const markdownFilePath = getProjectMarkdownPath(project);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
    success('Copied', 'Markdown copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects Directory
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${project.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </Link>

          <button
            onClick={handleDelete}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <CategoryBadge category={project.category} />
              <StatusBadge status={project.project_status} />
              <HealthBadge
                status={project.health_status}
                latency={project.last_response_time_ms}
                statusCode={project.last_http_status}
              />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {project.name}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {project.short_description}
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                {project.hosting_provider || 'Hosting unassigned'}
              </span>
              {project.custom_domain && (
                <span className="px-2 py-0.5 rounded bg-secondary text-foreground">
                  domain: {project.custom_domain}
                </span>
              )}
              {project.deployment_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Deployed: {project.deployment_date}
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs: Live website & GitHub Repo */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Live Application</span>
              </a>
            ) : (
              <div className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 text-center">
                URL Pending Verification
              </div>
            )}

            {project.github_repo_url ? (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Source Repository</span>
              </a>
            ) : (
              <div className="px-4 py-2 rounded-xl text-xs text-muted-foreground bg-secondary/40 border border-border/50 text-center">
                Private / Internal Repo
              </div>
            )}

            <button
              onClick={handleSyncToGithub}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all disabled:opacity-50"
            >
              <GitBranch className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Spec to GitHub'}</span>
            </button>
          </div>
        </div>

        {/* Sync & Target File Banner */}
        <div className="p-3.5 rounded-xl bg-background/80 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-indigo-400">Target File:</span>
            <span className="font-semibold text-foreground truncate">{markdownFilePath}</span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground font-mono">
            {project.last_commit_sha && (
              <span>
                commit: <span className="text-foreground">{project.last_commit_sha}</span>
              </span>
            )}
            <span>
              Status: <span className="text-emerald-400 uppercase font-bold">{project.sync_status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview & Architecture
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'health'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Health & Latency Telemetry
        </button>
        <button
          onClick={() => setActiveTab('markdown')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'markdown'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Generated Markdown File ({project.slug}.md)
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Descriptions & Tech Stacks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detailed Description */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                System Overview
              </h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {project.detailed_description || project.short_description}
              </p>
            </div>

            {/* Screenshots Gallery */}
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Screenshots & Interface
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.screenshots.map((sUrl, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden border border-border bg-secondary group aspect-video relative"
                    >
                      <img
                        src={sUrl}
                        alt={`${project.name} screenshot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {project.additional_notes && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Engineering Notes
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {project.additional_notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Tech Stack & Metadata */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Technical Stack
              </h3>

              {/* Frontend */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Frontend
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.frontend_technologies.length > 0 ? (
                    project.frontend_technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-secondary text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None specified</span>
                  )}
                </div>
              </div>

              {/* Backend */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Backend & Runtime
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.backend_technologies.length > 0 ? (
                    project.backend_technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-secondary text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None specified</span>
                  )}
                </div>
              </div>

              {/* Database */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Database / Storage
                </span>
                {project.database ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-secondary text-secondary-foreground inline-block">
                    {project.database}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">None</span>
                )}
              </div>

              {/* APIs & Integrations */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  APIs & Models
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.apis_integrations.length > 0 ? (
                    project.apis_integrations.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Meta */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3 text-xs">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                System Registry Meta
              </h3>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-foreground">{project.id.slice(0, 13)}...</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">{new Date(project.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEALTH & LATENCY */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Deployment Health Status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target URL: {project.live_url || 'No live URL configured'}
              </p>
            </div>

            {project.live_url && (
              <button
                onClick={handleHealthCheck}
                disabled={isCheckingHealth}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Activity className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                <span>{isCheckingHealth ? 'Checking Status...' : 'Ping Live URL Now'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Response Code</span>
              <p className="text-2xl font-extrabold text-foreground mt-2">
                {project.last_http_status ? `HTTP ${project.last_http_status}` : 'N/A'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Latency</span>
              <p className="text-2xl font-extrabold text-foreground mt-2">
                {project.last_response_time_ms ? `${project.last_response_time_ms} ms` : 'N/A'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border text-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Last Check</span>
              <p className="text-sm font-semibold text-foreground mt-2 font-mono">
                {project.last_health_check
                  ? new Date(project.last_health_check).toLocaleTimeString()
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* Historical Check Logs Table */}
          <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Recent Ping History
            </div>
            {recentChecks.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status Code</th>
                    <th className="p-3">Response Time</th>
                    <th className="p-3">Health State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {recentChecks.map((chk) => (
                    <tr key={chk.id}>
                      <td className="p-3 text-muted-foreground">
                        {new Date(chk.checked_at).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        HTTP {chk.status_code || 'Err'}
                      </td>
                      <td className="p-3">{chk.response_time_ms}ms</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            chk.is_healthy
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {chk.is_healthy ? 'HEALTHY' : 'DOWN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No health check history recorded yet for this project.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MARKDOWN PREVIEW */}
      {activeTab === 'markdown' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground font-mono block">Repository Path:</span>
              <span className="text-xs font-bold text-foreground font-mono truncate block">
                {markdownFilePath}
              </span>
            </div>

            <button
              onClick={copyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors shrink-0"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied' : 'Copy Markdown'}</span>
            </button>
          </div>

          <MarkdownPreview content={generatedMarkdown} />
        </div>
      )}
    </div>
  );
};
