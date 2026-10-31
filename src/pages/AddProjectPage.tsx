import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  GitBranch,
  Globe,
  Layers,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { ProjectCategory, ProjectStatus } from '../types';
import { TagInput } from '../components/ui/TagInput';

export const AddProjectPage: React.FC = () => {
  const { createProject, githubConfig } = useProjects();
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncOnSave, setSyncOnSave] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Client Projects');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('In Development');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [hostingProvider, setHostingProvider] = useState('Cloudflare Workers');
  const [database, setDatabase] = useState('');
  const [deploymentDate, setDeploymentDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [projectLogo, setProjectLogo] = useState('');

  // Arrays
  const [frontendTech, setFrontendTech] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [backendTech, setBackendTech] = useState<string[]>(['Node.js']);
  const [apisIntegrations, setApisIntegrations] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');

  // Handle Slug Generation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    const generatedSlug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
  };

  const handleAddScreenshot = () => {
    if (newScreenshotUrl.trim() && !screenshots.includes(newScreenshotUrl.trim())) {
      setScreenshots([...screenshots, newScreenshotUrl.trim()]);
      setNewScreenshotUrl('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (shouldSyncToGithub: boolean) => {
    if (!name.trim()) {
      error('Validation Error', 'Project name is required');
      return;
    }
    if (!slug.trim()) {
      error('Validation Error', 'Slug is required');
      return;
    }
    if (!shortDescription.trim()) {
      error('Validation Error', 'Please provide a short description for the project');
      return;
    }

    setIsSubmitting(true);
    setSyncOnSave(shouldSyncToGithub);

    try {
      const projectPayload = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        project_status: projectStatus,
        short_description: shortDescription.trim(),
        detailed_description: detailedDescription.trim(),
        live_url: liveUrl.trim() || null,
        custom_domain: customDomain.trim() || null,
        github_repo_url: githubRepoUrl.trim() || null,
        hosting_provider: hostingProvider.trim() || null,
        frontend_technologies: frontendTech,
        backend_technologies: backendTech,
        database: database.trim() || null,
        apis_integrations: apisIntegrations,
        deployment_date: deploymentDate.trim() || null,
        project_logo: projectLogo.trim() || null,
        screenshots,
        additional_notes: additionalNotes.trim() || null,
      };

      const res = await createProject(projectPayload, shouldSyncToGithub);

      if (res.success && res.project) {
        if (shouldSyncToGithub && res.error) {
          warning(
            'Saved in ProjectVault (GitHub Sync Pending)',
            `Project was saved in the dashboard, but GitHub push was skipped: ${res.error}`
          );
        } else {
          success(
            'Project Saved',
            shouldSyncToGithub
              ? `Saved ${name} and synchronized markdown to GitHub repository!`
              : `Project ${name} created successfully!`
          );
        }
        navigate(`/projects/${res.project.id}`);
      } else {
        error('Save Failed', res.error || 'Failed to create project');
      }
    } catch (err: any) {
      error('Error', err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList: ProjectCategory[] = [
    'Client Projects',
    'Personal Projects',
    'AI & Machine Learning',
    'Web Applications',
    'Mobile Applications',
    'Experimental Projects',
    'Academic Projects',
  ];

  const statusesList: ProjectStatus[] = [
    'Live',
    'In Development',
    'Needs Verification',
    'Offline',
    'Archived',
  ];

  const commonHosts = [
    'Cloudflare Workers',
    'Vercel',
    'Netlify',
    'Render / GCP',
    'GCP Cloud Run',
    'AWS / Modal',
    'Fly.io',
    'Railway',
    'Supabase Edge',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects Directory
        </Link>
        <span className="text-xs text-muted-foreground font-mono">New Entry Form</span>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm space-y-8">
        {/* Title */}
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Register New Project
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Provide technical specifications, deployment endpoints, and infrastructure metadata.
          </p>
        </div>

        {/* Section 1: Basic Identifiers */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            1. Core Identifiers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Vishal Bhattacharya Clinic"
                value={name}
                onChange={handleNameChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Slug (Repository File Identifier) *
              </label>
              <input
                type="text"
                placeholder="dr-vishal-bhattacharya-clinic"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                Will be written to: <span className="text-indigo-400">projects/.../{slug || '<slug>'}.md</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Project Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Deployment Status *
              </label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              >
                {statusesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Short Description (Card & Table Summary) *
            </label>
            <input
              type="text"
              placeholder="One-sentence executive summary of the system and its objective..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Detailed Architecture & Description
            </label>
            <textarea
              rows={4}
              placeholder="In-depth explanation of system design, functionality, problem solved, user journeys, edge compute setup..."
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Section 2: Endpoints & Deployment */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            2. Deployment & URLs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Live Deployment URL
              </label>
              <input
                type="url"
                placeholder="https://dr-vishal-clinic.hrishabhbase.workers.dev/"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Leave empty if pending verification. Never invent missing URLs.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. hrishabhgupt.vercel.app or clinic.example.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/hrishabhgupt/dr-vishal-clinic"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Hosting Provider
              </label>
              <input
                type="text"
                list="hosting-suggestions"
                placeholder="e.g. Cloudflare Workers, Vercel, Netlify..."
                value={hostingProvider}
                onChange={(e) => setHostingProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
              <datalist id="hosting-suggestions">
                {commonHosts.map((h) => (
                  <option key={h} value={h} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Initial Deployment Date
              </label>
              <input
                type="date"
                value={deploymentDate}
                onChange={(e) => setDeploymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Project Logo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://.../logo.png"
                value={projectLogo}
                onChange={(e) => setProjectLogo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Stack */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            3. Technology Stack & Integrations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TagInput
              label="Frontend Technologies"
              tags={frontendTech}
              onChange={setFrontendTech}
              placeholder="e.g. Next.js, React, Tailwind CSS..."
              suggestions={['React', 'Next.js', 'Vite', 'TypeScript', 'Tailwind CSS', 'Vue', 'HTML5']}
            />

            <TagInput
              label="Backend Technologies & Runtimes"
              tags={backendTech}
              onChange={setBackendTech}
              placeholder="e.g. Cloudflare Workers, Python, Flask..."
              suggestions={['Node.js', 'Express', 'Python', 'Flask', 'FastAPI', 'OpenNext', 'Cloudflare Workers Runtime']}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Database / Storage Engine
              </label>
              <input
                type="text"
                placeholder="e.g. Supabase PostgreSQL, ChromaDB, SQLite..."
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>

            <TagInput
              label="APIs, Models & Integrations"
              tags={apisIntegrations}
              onChange={setApisIntegrations}
              placeholder="e.g. Gemini API, Vosk, face_recognition..."
              suggestions={['Gemini API', 'OpenRouter', 'Supabase Auth', 'Vosk STT', 'face_recognition', 'EasyOCR', 'ChromaDB', 'SentenceTransformers']}
            />
          </div>
        </div>

        {/* Section 4: Screenshots */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-500" />
            4. Screenshots & Previews
          </h3>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (e.g. Unsplash, Cloudinary, S3, or Supabase Storage)..."
              value={newScreenshotUrl}
              onChange={(e) => setNewScreenshotUrl(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={handleAddScreenshot}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {screenshots.map((sUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-video">
                  <img src={sUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveScreenshot(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Additional Notes */}
        <div className="space-y-4 pt-4 border-t border-border">
          <label className="block text-xs font-semibold text-foreground">
            Additional Engineering Notes & Changelog
          </label>
          <textarea
            rows={3}
            placeholder="Deployment quirks, domain configuration, pending tasks, environment configurations..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
          />
        </div>

        {/* GitHub Token Notice if not configured */}
        {!githubConfig.access_token && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <GitBranch className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">GitHub Token needed for automatic repo pushes:</span>
              <p className="leading-relaxed">
                To allow ProjectVault to push commits directly to <strong>{githubConfig.repo_owner}/{githubConfig.repo_name}</strong> on GitHub, please enter your GitHub Personal Access Token (PAT) in{' '}
                <Link to="/settings" className="underline font-semibold hover:opacity-80">Settings</Link> or in <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">.env</code>. You can still save the project right now!
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons: Save vs Save & Sync to GitHub */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            to="/projects"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground text-center"
          >
            Cancel
          </Link>

          {/* Button 1: Save Project */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-muted-foreground" />
            <span>{isSubmitting && !syncOnSave ? 'Saving...' : 'Save Project (Local Only)'}</span>
          </button>

          {/* Button 2: Save & Sync to GitHub */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/25 transition-all disabled:opacity-50"
          >
            <GitBranch className="w-4 h-4" />
            <span>
              {isSubmitting && syncOnSave
                ? 'Saving & Syncing...'
                : 'Save & Sync to GitHub'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
