import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  Grid,
  List,
  ExternalLink,
  Server,
  Activity,
  Trash2,
  Edit,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HealthBadge } from '../components/ui/HealthBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { GithubIcon } from '../components/ui/GithubIcon';

export const ProjectsPage: React.FC = () => {
  const { projects, deleteProject, checkProjectHealth } = useProjects();
  const { success, error } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedHosting, setSelectedHosting] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const categories: string[] = [
    'All',
    'Client Projects',
    'Personal Projects',
    'AI & Machine Learning',
    'Web Applications',
    'Mobile Applications',
    'Experimental Projects',
    'Academic Projects',
  ];

  const statuses: string[] = ['All', 'Live', 'Needs Verification', 'In Development', 'Offline', 'Archived'];

  const hostingProviders = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.hosting_provider) set.add(p.hosting_provider);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.frontend_technologies.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.backend_technologies.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.hosting_provider && p.hosting_provider.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || p.project_status === selectedStatus;
      const matchesHosting = selectedHosting === 'All' || p.hosting_provider === selectedHosting;

      return matchesSearch && matchesCategory && matchesStatus && matchesHosting;
    });
  }, [projects, searchQuery, selectedCategory, selectedStatus, selectedHosting]);

  const handleDelete = async (id: string, name: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${name}"? This can optionally remove it from GitHub as well.`)) {
      setIsDeleting(id);
      try {
        const res = await deleteProject(id, true);
        if (res.success) {
          success('Project Deleted', `Removed ${name} and updated GitHub directory.`);
        } else {
          error('Delete Failed', res.error || 'Could not delete project');
        }
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleHealthCheck = async (id: string) => {
    const res = await checkProjectHealth(id);
    if (res.success) {
      success('Health Checked', `Response: HTTP ${res.status} in ${res.responseTime}ms`);
    } else {
      error('Health Check Error', res.error || 'Failed to ping project');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Projects Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage, filter, inspect, and deploy your software catalog ({filteredProjects.length} of {projects.length} displayed)
          </p>
        </div>

        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/25 hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Filter Bar & Search */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, technology, description, or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all"
            />
          </div>

          {/* Controls: Status, Host, View toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>

            {/* Hosting Select */}
            <select
              value={selectedHosting}
              onChange={(e) => setSelectedHosting(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {hostingProviders.map((h) => (
                <option key={h} value={h}>
                  Host: {h}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-xl p-0.5 bg-secondary/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-dashed border-border">
          <FolderGit2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No projects match your filter</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, status, or category filters to find the project you are looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSelectedHosting('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group overflow-hidden"
            >
              <div>
                {/* Screenshot / Header thumbnail if available */}
                {project.screenshots && project.screenshots.length > 0 && (
                  <div className="h-36 w-full overflow-hidden bg-secondary relative">
                    <img
                      src={project.screenshots[0]}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
                  </div>
                )}

                <div className="p-5">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <CategoryBadge category={project.category} />
                    <StatusBadge status={project.project_status} />
                  </div>

                  {/* Title & Slug */}
                  <Link
                    to={`/projects/${project.id}`}
                    className="block text-base font-bold text-foreground hover:text-primary transition-colors mt-2"
                  >
                    {project.name}
                  </Link>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {project.short_description}
                  </p>

                  {/* Tech stack tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {[...project.frontend_technologies, ...project.backend_technologies]
                      .slice(0, 4)
                      .map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-secondary text-secondary-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    {[...project.frontend_technologies, ...project.backend_technologies].length > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-muted-foreground">
                        +{[...project.frontend_technologies, ...project.backend_technologies].length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-border/70 bg-secondary/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <HealthBadge
                    status={project.health_status}
                    latency={project.last_response_time_ms}
                  />
                  {project.live_url && (
                    <button
                      onClick={() => handleHealthCheck(project.id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                      title="Ping endpoint now"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Open Live Site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {project.github_repo_url && (
                    <a
                      href={project.github_repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}

                  <Link
                    to={`/projects/${project.id}/edit`}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit Project"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    disabled={isDeleting === project.id}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Project</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Hosting</th>
                  <th className="p-4">Health</th>
                  <th className="p-4">Links</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors block text-sm"
                      >
                        {p.name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {p.slug}
                      </span>
                    </td>
                    <td className="p-4">
                      <CategoryBadge category={p.category} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={p.project_status} />
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      {p.hosting_provider || 'Pending'}
                    </td>
                    <td className="p-4">
                      <HealthBadge
                        status={p.health_status}
                        latency={p.last_response_time_ms}
                        statusCode={p.last_http_status}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {p.live_url ? (
                          <a
                            href={p.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline font-mono inline-flex items-center gap-1"
                          >
                            Live <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/projects/${p.id}`}
                          className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold"
                        >
                          View
                        </Link>
                        <Link
                          to={`/projects/${p.id}/edit`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
