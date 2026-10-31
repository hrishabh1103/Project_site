import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Radio,
  X,
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { HealthBadge } from '../components/ui/HealthBadge';
import { Project, ProjectStatus } from '../types';

export const MonitoringPage: React.FC = () => {
  const { projects, checkProjectHealth, checkAllProjectsHealth, updateProject } = useProjects();
  const { success, error } = useToast();

  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [checkingIds, setCheckingIds] = useState<Record<string, boolean>>({});
  const [overrideModalProject, setOverrideModalProject] = useState<Project | null>(null);
  const [selectedOverrideStatus, setSelectedOverrideStatus] = useState<ProjectStatus>('Live');

  const monitoredProjects = projects.filter((p) => p.live_url && p.live_url.startsWith('http'));
  const healthyCount = monitoredProjects.filter((p) => p.health_status === 'healthy').length;
  const unhealthyCount = monitoredProjects.filter((p) => p.health_status === 'unhealthy').length;

  const avgLatency = Math.round(
    monitoredProjects
      .filter((p) => p.last_response_time_ms && p.last_response_time_ms > 0)
      .reduce((acc, p, _, arr) => acc + (p.last_response_time_ms || 0) / arr.length, 0)
  );

  const handleCheckSingle = async (projectId: string) => {
    setCheckingIds((prev) => ({ ...prev, [projectId]: true }));
    try {
      const res = await checkProjectHealth(projectId);
      if (res.success) {
        success('Health Checked', `Status: HTTP ${res.status} (${res.responseTime}ms)`);
      } else {
        error('Health Check Error', res.error || 'Failed to ping URL');
      }
    } finally {
      setCheckingIds((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  const handleCheckAll = async () => {
    setIsCheckingAll(true);
    try {
      const res = await checkAllProjectsHealth();
      success(
        'Bulk Health Check Done',
        `Checked ${res.checked} projects. ${res.healthy} healthy, ${res.failed} issues.`
      );
    } catch (err: any) {
      error('Health Check Failed', err.message);
    } finally {
      setIsCheckingAll(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!overrideModalProject) return;

    try {
      const res = await updateProject(overrideModalProject.id, {
        project_status: selectedOverrideStatus,
      });

      if (res.success) {
        success('Status Updated', `Manually adjusted status of ${overrideModalProject.name} to ${selectedOverrideStatus}`);
        setOverrideModalProject(null);
      } else {
        error('Failed', res.error || 'Could not update status');
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Service Health & Availability
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Live Deployment Monitor
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Live availability and latency checks across all your deployed project endpoints. Checks run automatically and allow manual status overrides without modifying project records.
          </p>
        </div>

        <button
          onClick={handleCheckAll}
          disabled={isCheckingAll}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin' : ''}`} />
          <span>{isCheckingAll ? 'Checking Endpoints...' : 'Ping All Endpoints'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="text-xs font-medium text-muted-foreground">
            Monitored Services
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">
            {monitoredProjects.length}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Deployments with live URLs</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy (200 OK)
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">{healthyCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Active and responding</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Offline / Inaccessible
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">{unhealthyCount}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Pending or down</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Average Latency
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">
            {avgLatency > 0 ? `${avgLatency} ms` : '—'}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Across active servers</p>
        </div>
      </div>

      {/* Main Endpoints Monitoring Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              All Registered Deployments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {monitoredProjects.length} of {projects.length} projects have live endpoints configured
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Auto-refresh enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border text-[11px]">
              <tr>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Deployment URL</th>
                <th className="p-4 font-medium">Hosting Provider</th>
                <th className="p-4 font-medium">Status Code</th>
                <th className="p-4 font-medium">Response Time</th>
                <th className="p-4 font-medium">Health State</th>
                <th className="p-4 font-medium">Last Checked</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => {
                const isChecking = checkingIds[p.id];
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-sm text-foreground">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={p.project_status} />
                        <span className="text-[11px] text-muted-foreground">{p.slug}</span>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      {p.live_url ? (
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline font-mono truncate block"
                          title={p.live_url}
                        >
                          {p.live_url}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">Pending deployment / verification</span>
                      )}
                    </td>

                    <td className="p-4 font-medium text-foreground">
                      {p.hosting_provider || 'Unassigned'}
                    </td>

                    <td className="p-4 font-mono font-medium">
                      {p.last_http_status ? (
                        <span
                          className={
                            p.last_http_status >= 200 && p.last_http_status < 400
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-rose-600 dark:text-rose-400 font-semibold'
                          }
                        >
                          HTTP {p.last_http_status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-muted-foreground">
                      {p.last_response_time_ms ? `${p.last_response_time_ms} ms` : '—'}
                    </td>

                    <td className="p-4">
                      <HealthBadge status={p.health_status} />
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {p.last_health_check
                        ? new Date(p.last_health_check).toLocaleTimeString()
                        : 'Never'}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.live_url && (
                          <button
                            onClick={() => handleCheckSingle(p.id)}
                            disabled={isChecking}
                            className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all disabled:opacity-50"
                            title="Ping URL now"
                          >
                            <Activity className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isChecking ? 'animate-spin' : ''}`} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setOverrideModalProject(p);
                            setSelectedOverrideStatus(p.project_status);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                          title="Override Status"
                        >
                          Override
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Status Override Modal */}
      {overrideModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Manual Status Override</h3>
              <button
                onClick={() => setOverrideModalProject(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Manually set the operational status for <strong>{overrideModalProject.name}</strong>. Note that ProjectVault never automatically deletes projects even if endpoints return 404/500 errors.
            </p>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Target Status
              </label>
              <select
                value={selectedOverrideStatus}
                onChange={(e) => setSelectedOverrideStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="Live">Live</option>
                <option value="Offline">Offline</option>
                <option value="Needs Verification">Needs Verification</option>
                <option value="In Development">In Development</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModalProject(null)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
