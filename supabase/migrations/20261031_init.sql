-- ============================================================================
-- PROJECTVAULT: Production Database Schema & Row Level Security (RLS)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    detailed_description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Client Projects',
        'Personal Projects',
        'AI & Machine Learning',
        'Web Applications',
        'Mobile Applications',
        'Experimental Projects',
        'Academic Projects'
    )),
    live_url TEXT,
    custom_domain TEXT,
    github_repo_url TEXT,
    hosting_provider TEXT,
    frontend_technologies TEXT[] DEFAULT '{}',
    backend_technologies TEXT[] DEFAULT '{}',
    database TEXT,
    apis_integrations TEXT[] DEFAULT '{}',
    deployment_date DATE,
    project_status TEXT NOT NULL DEFAULT 'In Development' CHECK (project_status IN (
        'Live',
        'Offline',
        'Needs Verification',
        'In Development',
        'Archived'
    )),
    project_logo TEXT,
    screenshots TEXT[] DEFAULT '{}',
    additional_notes TEXT,
    -- Deployment health tracking
    health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'unhealthy', 'checking', 'unknown')),
    last_health_check TIMESTAMPTZ,
    last_http_status INT,
    last_response_time_ms INT,
    -- GitHub sync tracking
    last_synced_at TIMESTAMPTZ,
    last_commit_sha TEXT,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('synced', 'pending', 'error', 'syncing')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- 3. Project Technologies (Normalized mapping table for fine-grained querying)
CREATE TABLE IF NOT EXISTS public.project_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'devops', 'ai_ml', 'integration', 'other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_tech_project_id ON public.project_technologies(project_id);

-- 4. Project Screenshots
CREATE TABLE IF NOT EXISTS public.project_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_screenshots_project_id ON public.project_screenshots(project_id);

-- 5. Deployment Health Checks History
CREATE TABLE IF NOT EXISTS public.deployment_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    status_code INT,
    response_time_ms INT,
    is_healthy BOOLEAN NOT NULL,
    error_message TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployment_checks_project ON public.deployment_checks(project_id, checked_at DESC);

-- 6. GitHub Synchronization Logs
CREATE TABLE IF NOT EXISTS public.github_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('create', 'update', 'delete', 'full_resync', 'manual_sync')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
    commit_sha TEXT,
    commit_message TEXT,
    commit_url TEXT,
    files_affected TEXT[] DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_sync_logs_project ON public.github_sync_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_sync_logs_created_at ON public.github_sync_logs(created_at DESC);

-- 7. Integrations (Encrypted / secure configuration store)
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('github', 'cloudflare', 'health_check')),
    repo_owner TEXT,
    repo_name TEXT DEFAULT 'my-live-projects',
    branch TEXT DEFAULT 'main',
    access_token TEXT, -- Token stored safely server-side, encrypted or managed
    author_name TEXT,
    author_email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_tested_at TIMESTAMPTZ,
    last_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Projects RLS:
-- Public can view live or non-archived projects (or allow public read if configured as a public catalog showcase)
-- ONLY authenticated users can insert, update, delete projects.
CREATE POLICY "Public read-only project access" 
    ON public.projects FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can insert projects" 
    ON public.projects FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update projects" 
    ON public.projects FOR UPDATE 
    TO authenticated 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete projects" 
    ON public.projects FOR DELETE 
    TO authenticated 
    USING (auth.uid() IS NOT NULL);

-- 3. Project Technologies RLS
CREATE POLICY "Public read project technologies" 
    ON public.project_technologies FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users modify project technologies" 
    ON public.project_technologies FOR ALL 
    TO authenticated 
    USING (auth.uid() IS NOT NULL);

-- 4. Project Screenshots RLS
CREATE POLICY "Public read project screenshots" 
    ON public.project_screenshots FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users modify project screenshots" 
    ON public.project_screenshots FOR ALL 
    TO authenticated 
    USING (auth.uid() IS NOT NULL);

-- 5. Deployment Checks RLS
CREATE POLICY "Public read deployment checks" 
    ON public.deployment_checks FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users modify deployment checks" 
    ON public.deployment_checks FOR ALL 
    TO authenticated 
    USING (auth.uid() IS NOT NULL);

-- 6. GitHub Sync Logs RLS
CREATE POLICY "Public read github sync logs" 
    ON public.github_sync_logs FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users insert sync logs" 
    ON public.github_sync_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Integrations RLS:
-- strictly private to authenticated user
CREATE POLICY "Users can manage their own integrations" 
    ON public.integrations FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Trigger for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

