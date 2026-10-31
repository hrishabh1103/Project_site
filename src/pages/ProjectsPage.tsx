import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ExternalLink,
  Server,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { GithubIcon } from '../components/ui/GithubIcon';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const { projects, deleteProject } = useProjects();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [liveOnly, setLiveOnly] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const categories = [
    { label: 'All Projects', value: 'All' },
    { label: 'Client Work', value: 'Client Projects' },
    { label: 'Personal & Startups', value: 'Personal Projects' },
    { label: 'AI & Machine Learning', value: 'AI & Machine Learning' },
  ];

  const totalCount = projects.length;
  const liveCount = projects.filter((p) => p.project_status === 'Live').length;
  const inDevCount = projects.filter((p) => p.project_status === 'In Development').length;

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        (p.hosting_provider && p.hosting_provider.toLowerCase().includes(q)) ||
        p.frontend_technologies.some((t) => t.toLowerCase().includes(q)) ||
        p.backend_technologies.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;

      const matchesStatus = liveOnly ? p.project_status === 'Live' : true;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchQuery, selectedCategory, liveOnly]);

  const handleDelete = async (id: string, name: string) => {
    if (!isAuthenticated) return;
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      setIsDeleting(id);
      try {
        const res = await deleteProject(id, true);
        if (res.success) {
          success('Removed', `Project ${name} removed.`);
        } else {
          error('Error', res.error || 'Failed to remove project');
        }
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Header (Clean, Minimal, Recruiter-Friendly) */}
      <div className="space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active Deployments &amp; Portfolio</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Projects &amp; Deployments
          </h1>
          <p className="text-base text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            A curated directory of live web applications, client solutions, and AI/ML systems built by Hrishabh Gupta. All deployments are continuously monitored for uptime.
          </p>
        </div>

        {/* Quick Summary Counter Pills */}
        <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 dark:text-zinc-400 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 font-medium">
            <span className="font-semibold text-slate-900 dark:text-white">{totalCount}</span> Total Projects
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">{liveCount}</span> Live Online
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold">{inDevCount}</span> In Development
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Clean & Accessible) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              const count =
                cat.value === 'All'
                  ? projects.length
                  : projects.filter((p) => p.category === cat.value).length;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Live Only Filter Toggle */}
          <button
            onClick={() => setLiveOnly(!liveOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors self-start sm:self-auto ${
              liveOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveOnly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'}`} />
            <span>Show Live Only</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, tech stack (e.g. Next.js, Supabase, Python), or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-600 focus:bg-white dark:focus:bg-zinc-900 transition-all"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
          <Layers className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No projects found
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search terms or turning off the "Show Live Only" filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setLiveOnly(false);
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm hover:shadow transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Category & Status Row */}
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={project.category} />
                  <StatusBadge status={project.project_status} />
                </div>

                {/* Title & Description */}
                <div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors block"
                  >
                    {project.name}
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                    {project.short_description}
                  </p>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[...project.frontend_technologies, ...project.backend_technologies]
                    .slice(0, 4)
                    .map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  {[...project.frontend_technologies, ...project.backend_technologies].length > 4 && (
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium px-1">
                      +{[...project.frontend_technologies, ...project.backend_technologies].length - 4} more
                    </span>
                  )}
                </div>

                {/* Hosting & Domain metadata */}
                {project.hosting_provider && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 pt-1">
                    <Server className="w-3.5 h-3.5" />
                    <span>Hosted on <strong>{project.hosting_provider}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons (Clear, Obvious, Recruiter-Friendly) */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Primary CTA: Visit Live Site */}
                  {project.live_url ? (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <span>Visit Live App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800/50">
                      Local / In Dev
                    </span>
                  )}

                  {/* Secondary CTA: GitHub Repo */}
                  {project.github_repo_url && (
                    <a
                      href={project.github_repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      title="View GitHub Repository"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                </div>

                {/* Details link & Admin controls */}
                <div className="flex items-center gap-1">
                  <Link
                    to={`/projects/${project.id}`}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Details →
                  </Link>

                  {isAuthenticated && (
                    <>
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md"
                        title="Edit Project"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        disabled={isDeleting === project.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
