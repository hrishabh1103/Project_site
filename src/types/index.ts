export type ProjectCategory =
  | 'Client Projects'
  | 'Personal Projects'
  | 'AI & Machine Learning'
  | 'Web Applications'
  | 'Mobile Applications'
  | 'Experimental Projects'
  | 'Academic Projects';

export type ProjectStatus =
  | 'Live'
  | 'Offline'
  | 'Needs Verification'
  | 'In Development'
  | 'Archived';

export type HealthStatus = 'healthy' | 'unhealthy' | 'checking' | 'unknown';

export type SyncStatus = 'synced' | 'pending' | 'error' | 'syncing';

export interface Project {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  detailed_description: string;
  category: ProjectCategory;
  live_url: string | null;
  custom_domain: string | null;
  github_repo_url: string | null;
  hosting_provider: string | null;
  frontend_technologies: string[];
  backend_technologies: string[];
  database: string | null;
  apis_integrations: string[];
  deployment_date: string | null;
  project_status: ProjectStatus;
  project_logo: string | null;
  screenshots: string[];
  additional_notes: string | null;
  health_status: HealthStatus;
  last_health_check: string | null;
  last_http_status: number | null;
  last_response_time_ms: number | null;
  last_synced_at: string | null;
  last_commit_sha: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export interface DeploymentCheck {
  id: string;
  project_id: string;
  status_code: number | null;
  response_time_ms: number | null;
  is_healthy: boolean;
  error_message: string | null;
  checked_at: string;
}

export interface GitHubSyncLog {
  id: string;
  project_id: string | null;
  project_name?: string;
  sync_type: 'create' | 'update' | 'delete' | 'full_resync' | 'manual_sync';
  status: 'success' | 'failed' | 'in_progress';
  commit_sha: string | null;
  commit_message: string;
  commit_url: string | null;
  files_affected: string[];
  error_message: string | null;
  created_at: string;
}

export interface GitHubConfig {
  repo_owner: string;
  repo_name: string;
  branch: string;
  access_token: string;
  author_name: string;
  author_email: string;
  is_active: boolean;
  last_tested_at?: string | null;
  last_status?: string | null;
}

export interface DashboardStats {
  totalProjects: number;
  liveProjects: number;
  offlineProjects: number;
  inDevelopmentProjects: number;
  needsVerificationProjects: number;
  archivedProjects: number;
  hostingBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}
