import React, { useState } from 'react';
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
  Globe,
  Database,
  Cpu,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { GithubIcon } from '../components/ui/GithubIcon';
import { MarkdownPreview } from '../components/ui/MarkdownPreview';
import { generateProjectMarkdown, getProjectMarkdownPath } from '../lib/markdown-generator';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, deleteProject, checkProjectHealth, syncProjectToGithub, githubConfig } =
    useProjects();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const project = id ? getProject(id) : undefined;

  const [activeTab, setActiveTab] = useState<'overview' | 'documentation'>('overview');
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  if (!project) {
    return (
      <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Project Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          The requested project does not exist.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-900"
        >
          Return to Projects
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
          `Pushed ${project.name} specification to repository!`,
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
    if (!isAuthenticated) return;
    if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      const res = await deleteProject(project.id, true);
      if (res.success) {
        success('Deleted', `Project ${project.name} has been removed.`);
        navigate('/');
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${project.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </Link>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <CategoryBadge category={project.category} />
              <StatusBadge status={project.project_status} />
              {project.health_status === 'healthy' && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  · Online {project.last_response_time_ms ? `(${project.last_response_time_ms}ms)` : ''}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {project.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
              {project.short_description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 flex-wrap pt-1">
              {project.hosting_provider && (
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  Hosted on <strong>{project.hosting_provider}</strong>
                </span>
              )}
              {project.custom_domain && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Domain: <strong>{project.custom_domain}</strong>
                </span>
              )}
              {project.deployment_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {project.deployment_date}
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 shadow-sm transition-all"
              >
                <span>Visit Live Application</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 bg-slate-100 dark:bg-zinc-800 text-center">
                Local / Development Staging
              </div>
            )}

            {project.github_repo_url && (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Source Repository</span>
              </a>
            )}

            {isAuthenticated && (
              <button
                onClick={handleSyncToGithub}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
              >
                <GitBranch className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Push to GitHub'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Overview vs Repository Markdown */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-medium transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          System Overview &amp; Stack
        </button>
        <button
          onClick={() => setActiveTab('documentation')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'documentation'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <span>Markdown Documentation</span>
          <span className="text-[11px] font-mono text-slate-400">({project.slug}.md)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Detailed Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {project.detailed_description || project.short_description}
              </p>
            </div>

            {project.additional_notes && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Engineering Notes
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                  {project.additional_notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Clean Tech Stack Card */}
          <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Technology Stack
            </h3>

            {/* Frontend */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Frontend</span>
              <div className="flex flex-wrap gap-1">
                {project.frontend_technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Backend */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Backend &amp; Runtime</span>
              <div className="flex flex-wrap gap-1">
                {project.backend_technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Database */}
            {project.database && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Database</span>
                <p className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                  {project.database}
                </p>
              </div>
            )}

            {/* APIs & Integrations */}
            {project.apis_integrations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">APIs &amp; Integrations</span>
                <div className="flex flex-wrap gap-1">
                  {project.apis_integrations.map((api) => (
                    <span
                      key={api}
                      className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    >
                      {api}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MARKDOWN PREVIEW */}
      {activeTab === 'documentation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
            <span className="font-mono text-slate-600 dark:text-zinc-400 truncate">
              {markdownFilePath}
            </span>
            <button
              onClick={copyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <MarkdownPreview content={generatedMarkdown} />
        </div>
      )}
    </div>
  );
};
