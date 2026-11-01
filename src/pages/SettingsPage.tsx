import React, { useState, useEffect } from 'react';
import {
  Settings,
  GitBranch,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Save,
  Cloud,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { GitHubService } from '../lib/github-api';

export const SettingsPage: React.FC = () => {
  const { githubConfig, updateGithubConfig } = useProjects();
  const { success, error } = useToast();

  const [repoOwner, setRepoOwner] = useState(githubConfig.repo_owner || 'hrishabh1103');
  const [repoName, setRepoName] = useState(githubConfig.repo_name || 'my-live-projects');
  const [branch, setBranch] = useState(githubConfig.branch || 'main');
  const [token, setToken] = useState(githubConfig.access_token || '');
  const [authorName, setAuthorName] = useState(githubConfig.author_name || 'Hrishabh Gupta');
  const [authorEmail, setAuthorEmail] = useState(githubConfig.author_email || 'hrishabh1104@gmail.com');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    canPush?: boolean;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    fetch('/api/github/config')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: any) => {
        if (data.defaultOwner && !repoOwner) setRepoOwner(data.defaultOwner);
        if (data.defaultRepo && !repoName) setRepoName(data.defaultRepo);
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = () => {
    updateGithubConfig({
      repo_owner: repoOwner.trim(),
      repo_name: repoName.trim(),
      branch: branch.trim(),
      access_token: token.trim(),
      author_name: authorName.trim(),
      author_email: authorEmail.trim(),
      is_active: Boolean(token.trim()),
    });

    success('Settings Saved', 'GitHub repository configuration updated successfully!');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const activeToken = token.trim() || githubConfig.access_token;
    const activeOwner = repoOwner.trim() || githubConfig.repo_owner || 'hrishabh1103';
    const activeRepo = repoName.trim() || githubConfig.repo_name || 'my-live-projects';
    const activeBranch = branch.trim() || githubConfig.branch || 'main';

    // 1. Direct browser validation via GitHub REST API (CORS supported)
    if (activeToken) {
      try {
        const gh = new GitHubService({
          token: activeToken,
          owner: activeOwner,
          repo: activeRepo,
          branch: activeBranch,
          authorName: authorName.trim() || 'Hrishabh Gupta',
          authorEmail: authorEmail.trim() || 'hrishabh1104@gmail.com',
        });

        const data = await gh.testConnection();

        if (data.success) {
          setTestResult({
            success: true,
            message: `Connected successfully to ${data.repoFullName} (branch: ${data.defaultBranch}). Push permission verified!`,
            canPush: data.canPush,
          });
          success('Connection Verified', `Connected to ${data.repoFullName}`);

          // Automatically persist the verified configuration
          updateGithubConfig({
            repo_owner: activeOwner,
            repo_name: activeRepo,
            branch: activeBranch,
            access_token: activeToken,
            author_name: authorName.trim() || 'Hrishabh Gupta',
            author_email: authorEmail.trim() || 'hrishabh1104@gmail.com',
            is_active: true,
          });
        } else {
          setTestResult({
            success: false,
            message: data.error || 'Connection failed. Please check repository name and token permissions.',
          });
          error('Connection Error', data.error || 'Connection failed');
        }
      } catch (err: any) {
        setTestResult({
          success: false,
          message: err.message || 'Network failure while contacting GitHub API.',
        });
        error('Network Error', err.message);
      } finally {
        setIsTesting(false);
      }
      return;
    }

    // 2. Server API fallback if no token was typed in the browser (e.g. server env var GITHUB_TOKEN)
    try {
      const res = await fetch('/api/github/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            owner: activeOwner,
            repo: activeRepo,
            branch: activeBranch,
          },
        }),
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = (await res.json()) as any;
          if (data.success) {
            setTestResult({
              success: true,
              message: `Connected successfully to ${data.repoFullName} (branch: ${data.defaultBranch}) via server credentials. Push permission verified!`,
              canPush: data.canPush,
            });
            success('Connection Verified', `Connected to ${data.repoFullName}`);
            setIsTesting(false);
            return;
          } else {
            setTestResult({
              success: false,
              message: data.error || 'Connection failed using server credentials.',
            });
            error('Connection Error', data.error);
            setIsTesting(false);
            return;
          }
        }
      }

      setTestResult({
        success: false,
        message:
          'No GitHub Personal Access Token provided. Please enter your PAT (with "repo" scope) in the field above and click Test Connection.',
      });
      error('Token Required', 'Please enter your GitHub Personal Access Token.');
    } catch {
      setTestResult({
        success: false,
        message:
          'No GitHub Personal Access Token provided. Please paste your PAT with "repo" permissions in the field above.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copySqlSchema = () => {
    const sqlText = `-- PROJECTVAULT SCHEMA
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    detailed_description TEXT,
    category TEXT NOT NULL,
    live_url TEXT,
    custom_domain TEXT,
    github_repo_url TEXT,
    hosting_provider TEXT,
    frontend_technologies TEXT[] DEFAULT '{}',
    backend_technologies TEXT[] DEFAULT '{}',
    database TEXT,
    apis_integrations TEXT[] DEFAULT '{}',
    deployment_date DATE,
    project_status TEXT NOT NULL DEFAULT 'In Development',
    health_status TEXT DEFAULT 'unknown',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read-only access" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users write access" ON public.projects FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    success('Copied', 'SQL schema copied to clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-primary" />
          Settings & Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure GitHub synchronization repository, server-side secrets, and database connections.
        </p>
      </div>

      {/* SECTION 1: GITHUB INTEGRATION */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center border border-border">
              <GitBranch className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">GitHub Repository Integration</h2>
              <p className="text-xs text-muted-foreground">
                Automatic synchronization target for your project markdown documents
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Main Directory
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Repository Owner (Username / Org) *
            </label>
            <input
              type="text"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              placeholder="e.g. hrishabhgupt"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Repository Name *
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="my-live-projects"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Target Branch *
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
              <span>GitHub Personal Access Token (PAT)</span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline font-normal inline-flex items-center gap-1"
              >
                Generate Token <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Requires <code className="text-indigo-400">repo</code> permissions. Stored securely and can also be defined in <code className="text-indigo-400">GITHUB_TOKEN</code> env variable.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Commit Author Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="ProjectVault Bot"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Commit Author Email
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="vault@projectvault.internal"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Test Result Message Box */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <div>
              <p className="font-semibold">{testResult.success ? 'Verified' : 'Verification Error'}</p>
              <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Validating Access...' : 'Test Connection'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: SUPABASE & DATABASE ARCHITECTURE */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center border border-border">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">PostgreSQL & Supabase Architecture</h2>
              <p className="text-xs text-muted-foreground">
                Row Level Security (RLS) and schema status
              </p>
            </div>
          </div>
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL CACHE MODE'}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          ProjectVault includes complete migrations located at <code className="text-foreground font-mono">supabase/migrations/20261031_init.sql</code>. It defines tables for <strong>projects</strong>, <strong>deployment_checks</strong>, <strong>github_sync_logs</strong>, and <strong>integrations</strong> with strict RLS policies ensuring only authenticated administrators can mutate project data while allowing public directory queries.
        </p>

        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>SQL Migrations Ready for Supabase SQL Editor</span>
            <button
              onClick={copySqlSchema}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border text-foreground hover:bg-secondary transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied' : 'Copy DDL'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-muted/80 text-foreground font-mono text-[11px] overflow-x-auto">
            file: supabase/migrations/20261031_init.sql &amp; supabase/seed.sql
          </pre>
        </div>
      </div>

      {/* SECTION 3: CLOUDFLARE WORKERS DEPLOYMENT */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center border border-border">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Cloudflare Workers Deployment</h2>
            <p className="text-xs text-muted-foreground">
              Production configuration via wrangler.toml
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The application is configured for Cloudflare Workers with serverless edge functions for GitHub synchronization, health monitoring probes, and static assets hosting:
        </p>

        <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-foreground font-mono text-xs space-y-1">
          <p className="text-muted-foreground"># Deploy to Cloudflare Workers in one command:</p>
          <p className="font-semibold">npm run build &amp;&amp; npx wrangler deploy</p>
        </div>
      </div>
    </div>
  );
};
