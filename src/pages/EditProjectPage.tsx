import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject, updateProject, githubConfig } = useProjects();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const project = id ? getProject(id) : undefined;

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
  const [hostingProvider, setHostingProvider] = useState('');
  const [database, setDatabase] = useState('');
  const [deploymentDate, setDeploymentDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [projectLogo, setProjectLogo] = useState('');

  // Arrays
  const [frontendTech, setFrontendTech] = useState<string[]>([]);
  const [backendTech, setBackendTech] = useState<string[]>([]);
  const [apisIntegrations, setApisIntegrations] = useState<string[]>([]);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug);
      setCategory(project.category);
      setProjectStatus(project.project_status);
      setShortDescription(project.short_description || '');
      setDetailedDescription(project.detailed_description || '');
      setLiveUrl(project.live_url || '');
      setCustomDomain(project.custom_domain || '');
      setGithubRepoUrl(project.github_repo_url || '');
      setHostingProvider(project.hosting_provider || '');
      setDatabase(project.database || '');
      setDeploymentDate(project.deployment_date || '');
      setAdditionalNotes(project.additional_notes || '');
      setProjectLogo(project.project_logo || '');
      setFrontendTech(project.frontend_technologies || []);
      setBackendTech(project.backend_technologies || []);
      setApisIntegrations(project.apis_integrations || []);
      setScreenshots(project.screenshots || []);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="p-12 text-center rounded-2xl bg-card border border-border">
        <h3 className="text-base font-bold text-foreground">Project Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          The requested project ID does not exist in the database.
        </p>
        <Link
          to="/projects"
          className="mt-4 inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
        >
          Return to Projects
        </Link>
      </div>
    );
  }

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

    setIsSubmitting(true);
    setSyncOnSave(shouldSyncToGithub);

    try {
      const updates = {
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

      const res = await updateProject(project.id, updates, shouldSyncToGithub);

      if (res.success && res.project) {
        success(
          'Project Updated',
          shouldSyncToGithub
            ? `Updated ${name} and synchronized changes to GitHub (${githubConfig.repo_name})!`
            : `Project ${name} updated successfully!`
        );
        navigate(`/projects/${project.id}`);
      } else {
        error('Update Failed', res.error || 'Failed to update project');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Back to Details
        </Link>
        <span className="text-xs text-muted-foreground font-mono">Editing: {project.slug}</span>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm space-y-8">
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Edit Project: {project.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Update infrastructure, tech stack, health configurations, and documentation.
          </p>
        </div>

        {/* Section 1: Core Identifiers */}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Slug (File Identifier) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
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
              Short Description *
            </label>
            <input
              type="text"
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
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Section 2: Deployment & URLs */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            2. Deployment & Endpoints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Live Deployment URL
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Custom Domain
              </label>
              <input
                type="text"
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
                value={hostingProvider}
                onChange={(e) => setHostingProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
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
                Database
              </label>
              <input
                type="text"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Tech Stack */}
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
            />
            <TagInput
              label="Backend Technologies"
              tags={backendTech}
              onChange={setBackendTech}
            />
          </div>

          <TagInput
            label="APIs & Integrations"
            tags={apisIntegrations}
            onChange={setApisIntegrations}
          />
        </div>

        {/* Section 4: Screenshots */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-500" />
            4. Screenshots
          </h3>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL..."
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
                  <img src={sUrl} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
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

        {/* Section 5: Notes */}
        <div className="space-y-4 pt-4 border-t border-border">
          <label className="block text-xs font-semibold text-foreground">
            Additional Notes
          </label>
          <textarea
            rows={3}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            to={`/projects/${project.id}`}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-muted-foreground" />
            <span>{isSubmitting && !syncOnSave ? 'Saving...' : 'Save Changes'}</span>
          </button>

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
