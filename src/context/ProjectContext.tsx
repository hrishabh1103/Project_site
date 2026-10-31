import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Project, DashboardStats, GitHubSyncLog, GitHubConfig, HealthStatus, DeploymentCheck } from '../types';
import { INITIAL_PROJECTS } from '../data/initialProjects';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  generateProjectMarkdown,
  generateReadmeMarkdown,
  generateProjectsCatalogMarkdown,
  generateTemplateMarkdown,
  getProjectMarkdownPath,
} from '../lib/markdown-generator';
import { GitHubService } from '../lib/github-api';

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  syncLogs: GitHubSyncLog[];
  githubConfig: GitHubConfig;
  stats: DashboardStats;
  getProject: (idOrSlug: string) => Project | undefined;
  createProject: (
    project: Partial<Project> & Pick<Project, 'name' | 'slug' | 'category' | 'project_status' | 'short_description'>,
    syncToGithub?: boolean
  ) => Promise<{ success: boolean; project?: Project; error?: string }>;
  updateProject: (id: string, updates: Partial<Project>, syncToGithub?: boolean) => Promise<{ success: boolean; project?: Project; error?: string }>;
  deleteProject: (id: string, syncToGithub?: boolean) => Promise<{ success: boolean; error?: string }>;
  syncProjectToGithub: (project: Project) => Promise<{ success: boolean; commitSha?: string; commitUrl?: string; error?: string }>;
  syncAllToGithub: () => Promise<{ success: boolean; commitSha?: string; commitUrl?: string; error?: string }>;
  checkProjectHealth: (id: string) => Promise<{ success: boolean; isHealthy?: boolean; status?: number; responseTime?: number; error?: string }>;
  checkAllProjectsHealth: () => Promise<{ checked: number; healthy: number; failed: number }>;
  updateGithubConfig: (config: Partial<GitHubConfig>) => void;
  getProjectChecks: (projectId: string) => Promise<DeploymentCheck[]>;
}

const DEFAULT_GITHUB_CONFIG: GitHubConfig = {
  repo_owner: 'hrishabhgupt',
  repo_name: 'my-live-projects',
  branch: 'main',
  access_token: '',
  author_name: 'ProjectVault Bot',
  author_email: 'vault@projectvault.internal',
  is_active: false,
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projectvault_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    return INITIAL_PROJECTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncLogs, setSyncLogs] = useState<GitHubSyncLog[]>(() => {
    const saved = localStorage.getItem('projectvault_sync_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'initial-sync-001',
        project_id: '11111111-1111-1111-1111-111111111101',
        project_name: 'Dr. Vishal Bhattacharya Clinic',
        sync_type: 'update',
        status: 'success',
        commit_sha: 'a8f93e1',
        commit_message: 'feat(projects): deploy Dr. Vishal Clinic specs & live edge status',
        commit_url: 'https://github.com/hrishabhgupt/my-live-projects/commit/a8f93e1',
        filesAffected: [
          'README.md',
          'PROJECTS.md',
          'projects/client-projects/dr-vishal-bhattacharya-clinic.md',
        ],
        error_message: null,
        created_at: '2026-10-30T18:00:00.000Z',
      },
      {
        id: 'initial-sync-002',
        project_id: '11111111-1111-1111-1111-111111111103',
        project_name: 'Personal Portfolio',
        sync_type: 'update',
        status: 'success',
        commit_sha: 'c7d21b4',
        commit_message: 'docs(portfolio): refresh portfolio health badge and vercel deployment logs',
        commit_url: 'https://github.com/hrishabhgupt/my-live-projects/commit/c7d21b4',
        filesAffected: [
          'README.md',
          'projects/personal-projects/personal-portfolio.md',
        ],
        error_message: null,
        created_at: '2026-10-30T18:05:00.000Z',
      },
    ];
  });

  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => {
    const saved = localStorage.getItem('projectvault_github_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_GITHUB_CONFIG;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('projectvault_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('projectvault_sync_logs', JSON.stringify(syncLogs));
  }, [syncLogs]);

  useEffect(() => {
    localStorage.setItem('projectvault_github_config', JSON.stringify(githubConfig));
  }, [githubConfig]);

  // Load from Supabase if configured
  useEffect(() => {
    async function loadFromSupabase() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setProjects(data as Project[]);
        }
      } catch (err) {
        console.warn('Could not query Supabase projects, using local cache', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadFromSupabase();
  }, []);

  // Compute dashboard metrics
  const stats: DashboardStats = useMemo(() => {
    const totalProjects = projects.length;
    const liveProjects = projects.filter((p) => p.project_status === 'Live').length;
    const offlineProjects = projects.filter((p) => p.project_status === 'Offline').length;
    const inDevelopmentProjects = projects.filter((p) => p.project_status === 'In Development').length;
    const needsVerificationProjects = projects.filter((p) => p.project_status === 'Needs Verification').length;
    const archivedProjects = projects.filter((p) => p.project_status === 'Archived').length;

    const hostingBreakdown: Record<string, number> = {};
    const categoryBreakdown: Record<string, number> = {};

    projects.forEach((p) => {
      const host = p.hosting_provider || 'Unassigned';
      hostingBreakdown[host] = (hostingBreakdown[host] || 0) + 1;

      const cat = p.category;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    return {
      totalProjects,
      liveProjects,
      offlineProjects,
      inDevelopmentProjects,
      needsVerificationProjects,
      archivedProjects,
      hostingBreakdown,
      categoryBreakdown,
    };
  }, [projects]);

  const getProject = (idOrSlug: string) => {
    return projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  };

  const updateGithubConfig = (config: Partial<GitHubConfig>) => {
    setGithubConfig((prev) => ({ ...prev, ...config }));
  };

  /**
   * Internal helper to record sync logs
   */
  const recordSyncLog = (log: Omit<GitHubSyncLog, 'id' | 'created_at'>) => {
    const newLog: GitHubSyncLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };
    setSyncLogs((prev) => [newLog, ...prev]);

    if (isSupabaseConfigured) {
      supabase.from('github_sync_logs').insert([newLog]).then(({ error }) => {
        if (error) console.warn('Supabase sync log insert error', error);
      });
    }
  };

  /**
   * Sync a single project to GitHub
   */
  const syncProjectToGithub = async (
    project: Project
  ): Promise<{ success: boolean; commitSha?: string; commitUrl?: string; error?: string }> => {
    // Attempt server-side API first to keep tokens safe
    const markdownPath = getProjectMarkdownPath(project);
    const markdownContent = generateProjectMarkdown(project);
    const updatedProjects = projects.map((p) => (p.id === project.id ? project : p));
    const readmeContent = generateReadmeMarkdown(
      updatedProjects,
      githubConfig.repo_owner,
      githubConfig.repo_name
    );
    const catalogContent = generateProjectsCatalogMarkdown(updatedProjects);

    const filesToCommit = [
      { path: markdownPath, content: markdownContent },
      { path: 'README.md', content: readmeContent },
      { path: 'PROJECTS.md', content: catalogContent },
    ];

    const commitMessage = `chore(sync): update project ${project.name} [skip ci]`;

    // Try server API first
    try {
      const apiRes = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToCommit,
          commitMessage,
          config: githubConfig,
        }),
      });

      if (apiRes.ok) {
        const result = await apiRes.json() as any;
        if (result.success) {
          recordSyncLog({
            project_id: project.id,
            project_name: project.name,
            sync_type: 'update',
            status: 'success',
            commit_sha: result.commitSha,
            commit_message: commitMessage,
            commit_url: result.commitUrl,
            files_affected: filesToCommit.map((f) => f.path),
            error_message: null,
          });

          // Update project sync state
          setProjects((prev) =>
            prev.map((p) =>
              p.id === project.id
                ? {
                    ...p,
                    sync_status: 'synced',
                    last_synced_at: new Date().toISOString(),
                    last_commit_sha: result.commitSha || p.last_commit_sha,
                  }
                : p
            )
          );

          return { success: true, commitSha: result.commitSha, commitUrl: result.commitUrl };
        }
      }
    } catch {
      // Fall through to direct GitHub client if server API endpoint is not active or token configured in client
    }

    // Direct GitHub REST API fallback if token is present
    if (githubConfig.access_token) {
      const gh = new GitHubService({
        token: githubConfig.access_token,
        owner: githubConfig.repo_owner,
        repo: githubConfig.repo_name,
        branch: githubConfig.branch,
        authorName: githubConfig.author_name,
        authorEmail: githubConfig.author_email,
      });

      const commitResult = await gh.commitFiles(filesToCommit, commitMessage);

      if (commitResult.success) {
        recordSyncLog({
          project_id: project.id,
          project_name: project.name,
          sync_type: 'update',
          status: 'success',
          commit_sha: commitResult.commitSha || null,
          commit_message: commitMessage,
          commit_url: commitResult.commitUrl || null,
          files_affected: filesToCommit.map((f) => f.path),
          error_message: null,
        });

        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id
              ? {
                  ...p,
                  sync_status: 'synced',
                  last_synced_at: new Date().toISOString(),
                  last_commit_sha: commitResult.commitSha || p.last_commit_sha,
                }
              : p
          )
        );

        return {
          success: true,
          commitSha: commitResult.commitSha,
          commitUrl: commitResult.commitUrl,
        };
      } else {
        recordSyncLog({
          project_id: project.id,
          project_name: project.name,
          sync_type: 'update',
          status: 'failed',
          commit_sha: null,
          commit_message: commitMessage,
          commit_url: null,
          files_affected: filesToCommit.map((f) => f.path),
          error_message: commitResult.error || 'Failed to sync to GitHub',
        });
        return { success: false, error: commitResult.error };
      }
    }

    return {
      success: false,
      error: 'GitHub Token is not configured. Please go to GitHub Settings to provide your token.',
    };
  };

  /**
   * Sync the entire repository (README, PROJECTS.md, all project files, template)
   */
  const syncAllToGithub = async (): Promise<{
    success: boolean;
    commitSha?: string;
    commitUrl?: string;
    error?: string;
  }> => {
    const filesToCommit = [
      {
        path: 'README.md',
        content: generateReadmeMarkdown(projects, githubConfig.repo_owner, githubConfig.repo_name),
      },
      {
        path: 'PROJECTS.md',
        content: generateProjectsCatalogMarkdown(projects),
      },
      {
        path: 'templates/PROJECT_TEMPLATE.md',
        content: generateTemplateMarkdown(),
      },
      ...projects.map((p) => ({
        path: getProjectMarkdownPath(p),
        content: generateProjectMarkdown(p),
      })),
    ];

    const commitMessage = `chore(release): full ProjectVault sync (${projects.length} projects cataloged)`;

    // Try server API first
    try {
      const apiRes = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToCommit,
          commitMessage,
          config: githubConfig,
        }),
      });

      if (apiRes.ok) {
        const result = await apiRes.json() as any;
        if (result.success) {
          recordSyncLog({
            project_id: null,
            project_name: 'All Projects (Full Resync)',
            sync_type: 'full_resync',
            status: 'success',
            commit_sha: result.commitSha,
            commit_message: commitMessage,
            commit_url: result.commitUrl,
            files_affected: filesToCommit.map((f) => f.path),
            error_message: null,
          });

          const now = new Date().toISOString();
          setProjects((prev) =>
            prev.map((p) => ({
              ...p,
              sync_status: 'synced',
              last_synced_at: now,
              last_commit_sha: result.commitSha || p.last_commit_sha,
            }))
          );

          return { success: true, commitSha: result.commitSha, commitUrl: result.commitUrl };
        }
      }
    } catch {
      // Fall through to direct client fallback
    }

    if (githubConfig.access_token) {
      const gh = new GitHubService({
        token: githubConfig.access_token,
        owner: githubConfig.repo_owner,
        repo: githubConfig.repo_name,
        branch: githubConfig.branch,
        authorName: githubConfig.author_name,
        authorEmail: githubConfig.author_email,
      });

      const commitResult = await gh.commitFiles(filesToCommit, commitMessage);

      if (commitResult.success) {
        recordSyncLog({
          project_id: null,
          project_name: 'All Projects (Full Resync)',
          sync_type: 'full_resync',
          status: 'success',
          commit_sha: commitResult.commitSha || null,
          commit_message: commitMessage,
          commit_url: commitResult.commitUrl || null,
          files_affected: filesToCommit.map((f) => f.path),
          error_message: null,
        });

        const now = new Date().toISOString();
        setProjects((prev) =>
          prev.map((p) => ({
            ...p,
            sync_status: 'synced',
            last_synced_at: now,
            last_commit_sha: commitResult.commitSha || p.last_commit_sha,
          }))
        );

        return {
          success: true,
          commitSha: commitResult.commitSha,
          commitUrl: commitResult.commitUrl,
        };
      } else {
        recordSyncLog({
          project_id: null,
          project_name: 'All Projects (Full Resync)',
          sync_type: 'full_resync',
          status: 'failed',
          commit_sha: null,
          commit_message: commitMessage,
          commit_url: null,
          files_affected: filesToCommit.map((f) => f.path),
          error_message: commitResult.error || 'Failed to sync to GitHub',
        });
        return { success: false, error: commitResult.error };
      }
    }

    return {
      success: false,
      error: 'GitHub Token is not configured. Please go to GitHub Settings to provide your token.',
    };
  };

  /**
   * Create a new project
   */
  const createProject = async (
    projectData: Partial<Project> & Pick<Project, 'name' | 'slug' | 'category' | 'project_status' | 'short_description'>,
    syncToGithub = false
  ): Promise<{ success: boolean; project?: Project; error?: string }> => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: projectData.name,
      slug: projectData.slug,
      short_description: projectData.short_description,
      detailed_description: projectData.detailed_description || '',
      category: projectData.category,
      live_url: projectData.live_url || null,
      custom_domain: projectData.custom_domain || null,
      github_repo_url: projectData.github_repo_url || null,
      hosting_provider: projectData.hosting_provider || null,
      frontend_technologies: projectData.frontend_technologies || [],
      backend_technologies: projectData.backend_technologies || [],
      database: projectData.database || null,
      apis_integrations: projectData.apis_integrations || [],
      deployment_date: projectData.deployment_date || null,
      project_status: projectData.project_status,
      project_logo: projectData.project_logo || null,
      screenshots: projectData.screenshots || [],
      additional_notes: projectData.additional_notes || null,
      health_status: 'unknown',
      last_health_check: null,
      last_http_status: null,
      last_response_time_ms: null,
      last_synced_at: null,
      last_commit_sha: null,
      sync_status: 'pending',
      created_at: now,
      updated_at: now,
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('projects').insert([newProject]);
        if (error) {
          console.error('Supabase project insert error', error);
          // Still save locally so user is not blocked
        }
      }

      setProjects((prev) => [newProject, ...prev]);

      if (syncToGithub) {
        await syncProjectToGithub(newProject);
      }

      return { success: true, project: newProject };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create project' };
    }
  };

  /**
   * Update an existing project
   */
  const updateProject = async (
    id: string,
    updates: Partial<Project>,
    syncToGithub = false
  ): Promise<{ success: boolean; project?: Project; error?: string }> => {
    const existing = projects.find((p) => p.id === id);
    if (!existing) {
      return { success: false, error: 'Project not found' };
    }

    const updated: Project = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('projects').update(updated).eq('id', id);
        if (error) console.error('Supabase update error', error);
      }

      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));

      if (syncToGithub) {
        await syncProjectToGithub(updated);
      }

      return { success: true, project: updated };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update project' };
    }
  };

  /**
   * Delete a project
   */
  const deleteProject = async (
    id: string,
    syncToGithub = false
  ): Promise<{ success: boolean; error?: string }> => {
    const toDelete = projects.find((p) => p.id === id);
    if (!toDelete) return { success: false, error: 'Project not found' };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('projects').delete().eq('id', id);
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));

      if (syncToGithub && githubConfig.access_token) {
        const filePath = getProjectMarkdownPath(toDelete);
        const commitMsg = `chore(sync): remove archived project ${toDelete.name}`;

        const gh = new GitHubService({
          token: githubConfig.access_token,
          owner: githubConfig.repo_owner,
          repo: githubConfig.repo_name,
          branch: githubConfig.branch,
          authorName: githubConfig.author_name,
          authorEmail: githubConfig.author_email,
        });

        await gh.deleteProjectFile(filePath, commitMsg);

        // Also update README
        const remaining = projects.filter((p) => p.id !== id);
        await gh.commitFiles(
          [
            {
              path: 'README.md',
              content: generateReadmeMarkdown(remaining, githubConfig.repo_owner, githubConfig.repo_name),
            },
            {
              path: 'PROJECTS.md',
              content: generateProjectsCatalogMarkdown(remaining),
            },
          ],
          `chore(sync): update README and directory after removal of ${toDelete.name}`
        );

        recordSyncLog({
          project_id: null,
          project_name: toDelete.name,
          sync_type: 'delete',
          status: 'success',
          commit_sha: null,
          commit_message: commitMsg,
          commit_url: null,
          files_affected: [filePath, 'README.md', 'PROJECTS.md'],
          error_message: null,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete project' };
    }
  };

  /**
   * Check single project deployment health
   */
  const checkProjectHealth = async (
    id: string
  ): Promise<{ success: boolean; isHealthy?: boolean; status?: number; responseTime?: number; error?: string }> => {
    const project = projects.find((p) => p.id === id);
    if (!project) return { success: false, error: 'Project not found' };

    if (!project.live_url) {
      return { success: false, error: 'Project has no live URL configured to check' };
    }

    try {
      // Mark as checking
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, health_status: 'checking' } : p))
      );

      // Call health check backend API (avoids CORS)
      const res = await fetch('/api/health-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: project.live_url, projectId: project.id }),
      });

      let isHealthy = false;
      let statusCode = 0;
      let latency = 0;
      let errMsg: string | null = null;

      if (res.ok) {
        const data = await res.json() as any;
        isHealthy = data.isHealthy;
        statusCode = data.statusCode;
        latency = data.responseTime;
        errMsg = data.error || null;
      } else {
        // Fallback simulation or basic check
        statusCode = 502;
        isHealthy = false;
        errMsg = 'Health check service returned non-200';
      }

      const healthState: HealthStatus = isHealthy ? 'healthy' : 'unhealthy';
      const checkTimestamp = new Date().toISOString();

      const updatedProject: Project = {
        ...project,
        health_status: healthState,
        last_http_status: statusCode,
        last_response_time_ms: latency,
        last_health_check: checkTimestamp,
      };

      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));

      // Save check log in Supabase or local storage
      const checkRecord: DeploymentCheck = {
        id: 'chk-' + Date.now(),
        project_id: id,
        status_code: statusCode,
        response_time_ms: latency,
        is_healthy: isHealthy,
        error_message: errMsg,
        checked_at: checkTimestamp,
      };

      const existingChecks: DeploymentCheck[] = JSON.parse(
        localStorage.getItem(`projectvault_checks_${id}`) || '[]'
      );
      localStorage.setItem(
        `projectvault_checks_${id}`,
        JSON.stringify([checkRecord, ...existingChecks.slice(0, 19)])
      );

      return {
        success: true,
        isHealthy,
        status: statusCode,
        responseTime: latency,
        error: errMsg || undefined,
      };
    } catch (err: any) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, health_status: 'unhealthy' } : p))
      );
      return { success: false, error: err.message || 'Health check network error' };
    }
  };

  /**
   * Check health of all live projects
   */
  const checkAllProjectsHealth = async (): Promise<{ checked: number; healthy: number; failed: number }> => {
    const liveProjects = projects.filter((p) => p.live_url && p.live_url.startsWith('http'));
    let healthyCount = 0;
    let failedCount = 0;

    for (const p of liveProjects) {
      const res = await checkProjectHealth(p.id);
      if (res.isHealthy) healthyCount++;
      else failedCount++;
    }

    return {
      checked: liveProjects.length,
      healthy: healthyCount,
      failed: failedCount,
    };
  };

  const getProjectChecks = async (projectId: string): Promise<DeploymentCheck[]> => {
    try {
      const saved = localStorage.getItem(`projectvault_checks_${projectId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        syncLogs,
        githubConfig,
        stats,
        getProject,
        createProject,
        updateProject,
        deleteProject,
        syncProjectToGithub,
        syncAllToGithub,
        checkProjectHealth,
        checkAllProjectsHealth,
        updateGithubConfig,
        getProjectChecks,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
