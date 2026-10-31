import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  RefreshCw,
  FolderTree,
  FileText,
  Folder,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Settings,
  Shield,
  Layers,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { MarkdownPreview } from '../components/ui/MarkdownPreview';
import {
  generateReadmeMarkdown,
  generateProjectsCatalogMarkdown,
} from '../lib/markdown-generator';

export const GithubSyncPage: React.FC = () => {
  const { projects, githubConfig, syncAllToGithub, syncLogs } = useProjects();
  const { success, error } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllToGithub();
      if (res.success) {
        success(
          'GitHub Synchronization Success',
          `Pushed all ${projects.length} project specifications, README.md, and catalog to ${githubConfig.repo_owner}/${githubConfig.repo_name}!`,
          res.commitUrl ? { text: 'View Commit on GitHub', url: res.commitUrl } : undefined
        );
      } else {
        error('Sync Error', res.error || 'Failed to push commit to GitHub');
      }
    } catch (err: any) {
      error('Exception', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const openReadmePreview = () => {
    const content = generateReadmeMarkdown(projects, githubConfig.repo_owner, githubConfig.repo_name);
    setPreviewFile({ title: 'README.md', content });
  };

  const openCatalogPreview = () => {
    const content = generateProjectsCatalogMarkdown(projects);
    setPreviewFile({ title: 'PROJECTS.md', content });
  };

  const copyPreviewContent = () => {
    if (!previewFile) return;
    navigator.clipboard.writeText(previewFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Copied', 'Content copied to clipboard');
  };

  const clientProjects = projects.filter((p) => p.category === 'Client Projects');
  const personalProjects = projects.filter((p) => p.category === 'Personal Projects');
  const aimlProjects = projects.filter((p) => p.category === 'AI & Machine Learning');
  const otherProjects = projects.filter(
    (p) => !['Client Projects', 'Personal Projects', 'AI & Machine Learning'].includes(p.category)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Public Repository Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1 flex items-center gap-2.5">
            <GitBranch className="w-6 h-6 text-foreground" />
            GitHub Synchronization
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Connected to <strong className="text-foreground">{githubConfig.repo_owner}/{githubConfig.repo_name}</strong> (Branch: <span className="font-mono text-foreground font-semibold">{githubConfig.branch}</span>). Every change produces clean Markdown and commits to your public directory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/settings"
            className="px-3.5 py-2.5 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            Configure Repo
          </Link>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to GitHub...' : 'Sync All Projects'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Visual File Tree & Quick Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Repository Structure Tree */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-muted-foreground" />
              Repository Structure ({githubConfig.repo_name})
            </h3>
            <span className="text-xs text-muted-foreground">
              {projects.length + 3} tracked files
            </span>
          </div>

          <div className="font-mono text-xs space-y-1.5 p-4 rounded-xl bg-muted/30 border border-border/80 overflow-x-auto text-foreground">
            <div className="font-semibold flex items-center gap-1.5 text-foreground">
              <Folder className="w-4 h-4 text-muted-foreground" /> {githubConfig.repo_name}/
            </div>

            {/* Root Files */}
            <div className="pl-6 space-y-1">
              <div className="flex items-center justify-between group hover:bg-muted/50 p-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 text-foreground">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" /> README.md
                </span>
                <button
                  onClick={openReadmePreview}
                  className="text-xs text-primary hover:underline flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>

              <div className="flex items-center justify-between group hover:bg-muted/50 p-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 text-foreground">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" /> PROJECTS.md
                </span>
                <button
                  onClick={openCatalogPreview}
                  className="text-xs text-primary hover:underline flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            {/* projects/ directory */}
            <div className="pl-6 pt-2">
              <div className="font-semibold flex items-center gap-1.5 text-foreground">
                <Folder className="w-3.5 h-3.5 text-muted-foreground" /> projects/
              </div>

              {/* client-projects */}
              <div className="pl-6 pt-1">
                <div className="font-medium text-foreground flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-muted-foreground" /> client-projects/ ({clientProjects.length})
                </div>
                <div className="pl-6 space-y-0.5 text-muted-foreground">
                  {clientProjects.map((p) => (
                    <div key={p.id} className="hover:text-foreground">
                      - {p.slug}.md
                    </div>
                  ))}
                </div>
              </div>

              {/* personal-projects */}
              <div className="pl-6 pt-1">
                <div className="font-medium text-foreground flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-muted-foreground" /> personal-projects/ ({personalProjects.length})
                </div>
                <div className="pl-6 space-y-0.5 text-muted-foreground">
                  {personalProjects.map((p) => (
                    <div key={p.id} className="hover:text-foreground">
                      - {p.slug}.md
                    </div>
                  ))}
                </div>
              </div>

              {/* ai-ml-projects */}
              <div className="pl-6 pt-1">
                <div className="font-medium text-foreground flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-muted-foreground" /> ai-ml-projects/ ({aimlProjects.length})
                </div>
                <div className="pl-6 space-y-0.5 text-muted-foreground">
                  {aimlProjects.map((p) => (
                    <div key={p.id} className="hover:text-foreground">
                      - {p.slug}.md
                    </div>
                  ))}
                </div>
              </div>

              {/* other categories */}
              {otherProjects.length > 0 && (
                <div className="pl-6 pt-1">
                  <div className="font-medium text-foreground flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-muted-foreground" /> experimental-projects/ ({otherProjects.length})
                  </div>
                  <div className="pl-6 space-y-0.5 text-muted-foreground">
                    {otherProjects.map((p) => (
                      <div key={p.id} className="hover:text-foreground">
                        - {p.slug}.md
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* assets & templates */}
            <div className="pl-6 pt-2 space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" /> assets/
              </div>
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" /> templates/
              </div>
              <div className="pl-6 text-[11px] text-muted-foreground">
                - project-template.md
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Preview & Configuration Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Preview Generated Markdown
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify how your project files and catalog tables will appear directly on GitHub before syncing.
            </p>

            <div className="space-y-2">
              <button
                onClick={openReadmePreview}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border text-xs font-medium text-foreground transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Preview README.md
                </span>
                <span className="text-primary font-medium">View →</span>
              </button>

              <button
                onClick={openCatalogPreview}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border text-xs font-medium text-foreground transition-all"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  Preview PROJECTS.md
                </span>
                <span className="text-primary font-medium">View →</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-foreground">
              Security & Integrity
            </h3>
            <div className="flex items-start gap-2.5 text-muted-foreground leading-relaxed">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Tokens are stored server-side and never exposed in client bundles. Commits preserve all existing entries and use atomic git operations.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Sync & Commit Logs Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Commit & Synchronization Logs ({syncLogs.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              History of atomic commits published to {githubConfig.repo_name}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border text-[11px]">
              <tr>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Target / Scope</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Commit Message</th>
                <th className="p-4 font-medium">Commit SHA</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 text-right font-medium">GitHub Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-muted-foreground font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-semibold text-foreground">
                    {log.project_name || 'Repository Root'}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-secondary text-foreground uppercase">
                      {log.sync_type}
                    </span>
                  </td>
                  <td className="p-4 max-w-sm truncate text-foreground">
                    {log.commit_message}
                  </td>
                  <td className="p-4 font-mono font-medium text-foreground">
                    {log.commit_sha ? log.commit_sha.slice(0, 7) : '—'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {log.commit_url ? (
                      <a
                        href={log.commit_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-4xl w-full max-h-[85vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/40">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground font-mono">
                  {previewFile.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyPreviewContent}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Content'}</span>
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <MarkdownPreview content={previewFile.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
