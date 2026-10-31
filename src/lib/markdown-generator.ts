import { Project, ProjectCategory } from '../types';

export function getCategorySlug(category: ProjectCategory): string {
  switch (category) {
    case 'Client Projects':
      return 'client-projects';
    case 'Personal Projects':
      return 'personal-projects';
    case 'AI & Machine Learning':
      return 'ai-ml-projects';
    case 'Web Applications':
      return 'web-applications';
    case 'Mobile Applications':
      return 'mobile-applications';
    case 'Experimental Projects':
      return 'experimental-projects';
    case 'Academic Projects':
      return 'academic-projects';
    default:
      return 'misc-projects';
  }
}

export function getProjectMarkdownPath(project: Project): string {
  const categoryFolder = getCategorySlug(project.category);
  return `projects/${categoryFolder}/${project.slug}.md`;
}

export function getStatusBadge(status: Project['project_status']): string {
  switch (status) {
    case 'Live':
      return '![Status: Live](https://img.shields.io/badge/Status-Live-22c55e?style=flat-square)';
    case 'Offline':
      return '![Status: Offline](https://img.shields.io/badge/Status-Offline-ef4444?style=flat-square)';
    case 'Needs Verification':
      return '![Status: Needs Verification](https://img.shields.io/badge/Status-Needs%20Verification-f59e0b?style=flat-square)';
    case 'In Development':
      return '![Status: In Development](https://img.shields.io/badge/Status-In%20Development-3b82f6?style=flat-square)';
    case 'Archived':
      return '![Status: Archived](https://img.shields.io/badge/Status-Archived-6b7280?style=flat-square)';
    default:
      return '![Status: Unknown](https://img.shields.io/badge/Status-Unknown-9ca3af?style=flat-square)';
  }
}

/**
 * Generate standalone Markdown file for an individual project
 */
export function generateProjectMarkdown(project: Project): string {
  const statusBadge = getStatusBadge(project.project_status);
  const healthBadge = project.health_status === 'healthy'
    ? '![Health: 100%](https://img.shields.io/badge/Health-Healthy%20(200)-emerald?style=flat-square)'
    : project.health_status === 'unhealthy'
    ? '![Health: Down](https://img.shields.io/badge/Health-Unreachable-red?style=flat-square)'
    : '![Health: Unknown](https://img.shields.io/badge/Health-Unchecked-gray?style=flat-square)';

  const liveLinkText = project.live_url
    ? `[${project.live_url}](${project.live_url})`
    : '*Pending verification / internal deployment*';

  const repoLinkText = project.github_repo_url
    ? `[View Repository](${project.github_repo_url})`
    : '*Private or pending repository mapping*';

  const frontendTechList = project.frontend_technologies.length > 0
    ? project.frontend_technologies.map(t => `\`${t}\``).join(' ')
    : '*Not specified*';

  const backendTechList = project.backend_technologies.length > 0
    ? project.backend_technologies.map(t => `\`${t}\``).join(' ')
    : '*Not specified*';

  const integrationsList = project.apis_integrations.length > 0
    ? project.apis_integrations.map(t => `\`${t}\``).join(' ')
    : '*None specified*';

  const screenshotSection = project.screenshots.length > 0
    ? `## 📸 Screenshots & Previews\n\n` +
      project.screenshots.map(s => `![${project.name} Preview](${s})`).join('\n\n')
    : ``;

  return `---
title: "${project.name}"
slug: "${project.slug}"
category: "${project.category}"
status: "${project.project_status}"
hosting: "${project.hosting_provider || 'Not specified'}"
last_synced: "${new Date().toISOString()}"
---

# ${project.name}

${statusBadge} ${healthBadge} ![Category](https://img.shields.io/badge/Category-${encodeURIComponent(project.category)}-indigo?style=flat-square)

> ${project.short_description}

---

## 🔗 Quick Links

| Resource | Link |
| :--- | :--- |
| **Live Application** | ${liveLinkText} |
| **Source Code** | ${repoLinkText} |
| **Custom Domain** | ${project.custom_domain ? `\`${project.custom_domain}\`` : '*None*'} |
| **Hosting Platform** | **${project.hosting_provider || 'Not specified'}** |
| **Initial Deployment** | ${project.deployment_date || '*In Progress*'} |

---

## 📖 Detailed Description

${project.detailed_description || '*No detailed description provided yet.*'}

---

## 🛠️ Architecture & Tech Stack

### Frontend
${frontendTechList}

### Backend & Runtime
${backendTechList}

### Database & Storage
${project.database ? `\`${project.database}\`` : '*None / Stateless*'}

### APIs, Services & Integrations
${integrationsList}

---

## 🩺 Health & Deployment Monitoring

- **Current Status:** \`${project.health_status.toUpperCase()}\`
- **Last Status Code:** \`${project.last_http_status ?? 'N/A'}\`
- **Response Latency:** \`${project.last_response_time_ms ? `${project.last_response_time_ms} ms` : 'N/A'}\`
- **Last Monitored:** \`${project.last_health_check ? new Date(project.last_health_check).toUTCString() : 'Never'}\`

---

${screenshotSection}

## 📝 Additional Notes

${project.additional_notes || '*No additional notes logged.*'}

---

*Auto-generated & synchronized with [ProjectVault](https://github.com/hrishabhgupt/my-live-projects) on ${new Date().toUTCString()}*
`;
}

/**
 * Generate the root repository README.md
 */
export function generateReadmeMarkdown(
  projects: Project[],
  repoOwner = 'hrishabhgupt',
  repoName = 'my-live-projects'
): string {
  const total = projects.length;
  const liveCount = projects.filter(p => p.project_status === 'Live').length;
  const devCount = projects.filter(p => p.project_status === 'In Development').length;
  const verificationCount = projects.filter(p => p.project_status === 'Needs Verification').length;

  const categories: ProjectCategory[] = [
    'Client Projects',
    'Personal Projects',
    'AI & Machine Learning',
    'Web Applications',
    'Mobile Applications',
    'Experimental Projects',
    'Academic Projects'
  ];

  const nowIso = new Date().toUTCString();

  return `# 🚀 My Live Projects Directory

[![Total Projects](https://img.shields.io/badge/Total%20Projects-${total}-6366f1?style=for-the-badge&logo=codeforces)](PROJECTS.md)
[![Live Deployments](https://img.shields.io/badge/Live%20Deployments-${liveCount}-22c55e?style=for-the-badge&logo=statuspage)](PROJECTS.md)
[![In Development](https://img.shields.io/badge/In%20Development-${devCount}-3b82f6?style=for-the-badge)](PROJECTS.md)
[![Last Synced](https://img.shields.io/badge/Last%20Sync-${encodeURIComponent(nowIso)}-slate?style=for-the-badge&logo=github)](https://github.com/${repoOwner}/${repoName})

> Permanent public directory of deployed applications, client deliverables, AI/ML models, and experimental systems built and managed via **[ProjectVault](https://github.com/${repoOwner}/${repoName})**.

---

## 📌 Featured & Live Deployments

| Project | Category | Live Demo | Repository | Hosting | Tech Stack | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${projects
  .map(p => {
    const docPath = getProjectMarkdownPath(p);
    const liveLink = p.live_url ? `[Visit Site](${p.live_url})` : '`Pending`';
    const repoLink = p.github_repo_url ? `[Code](${p.github_repo_url})` : '`Private`';
    const stack = [...p.frontend_technologies, ...p.backend_technologies].slice(0, 3).join(', ') || 'N/A';
    return `| [**${p.name}**](${docPath}) | ${p.category} | ${liveLink} | ${repoLink} | ${p.hosting_provider || 'N/A'} | ${stack} | ${getStatusBadge(p.project_status)} |`;
  })
  .join('\n')}

---

## 🗂️ Categorized Directory

${categories
  .map(cat => {
    const inCat = projects.filter(p => p.category === cat);
    if (inCat.length === 0) return '';
    return `### ${cat} (${inCat.length})

${inCat
  .map(p => {
    const docPath = getProjectMarkdownPath(p);
    const liveNote = p.live_url ? ` · [Live Demo](${p.live_url})` : '';
    const hostingNote = p.hosting_provider ? ` · *${p.hosting_provider}*` : '';
    return `- [**${p.name}**](${docPath}) – ${p.short_description}${liveNote}${hostingNote}`;
  })
  .join('\n')}
`;
  })
  .filter(Boolean)
  .join('\n')}

---

## 📁 Repository Structure

\`\`\`
${repoName}/
├── README.md               # Main showcase & directory index
├── PROJECTS.md             # Complete technical catalog with specs
├── projects/
│   ├── client-projects/    # Client deliverables & production portals
│   ├── personal-projects/  # Personal software & portfolio tools
│   ├── ai-ml-projects/     # Machine learning, CV & NLP applications
│   ├── web-applications/   # Full-stack SaaS & dashboards
│   └── experimental-projects/
├── assets/                 # Screenshots, architecture diagrams, badges
└── templates/              # Markdown templates for project dossiers
\`\`\`

---

## ⚡ Automated Synchronization

All updates, health telemetry, and status changes in this repository are managed and published automatically via **ProjectVault**.

- **Dashboard:** ProjectVault Management System
- **Engine:** Cloudflare Workers + Supabase PostgreSQL
- **Last Sync:** \`${nowIso}\`
`;
}

/**
 * Generate full catalog file PROJECTS.md
 */
export function generateProjectsCatalogMarkdown(projects: Project[]): string {
  return `# Complete Project Catalog

*Comprehensive catalog of all software, web applications, and AI systems.*

---

## 📊 Summary Statistics

- **Total Projects:** ${projects.length}
- **Active Live Deployments:** ${projects.filter(p => p.project_status === 'Live').length}
- **In Development:** ${projects.filter(p => p.project_status === 'In Development').length}
- **Needs Verification:** ${projects.filter(p => p.project_status === 'Needs Verification').length}
- **Archived:** ${projects.filter(p => p.project_status === 'Archived').length}

---

## 📋 Comprehensive Directory

| # | Project Name | Category | Status | Hosting | Database | Frontend | Backend | Direct File |
| -: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${projects
  .map((p, idx) => {
    const docPath = getProjectMarkdownPath(p);
    return `| ${idx + 1} | **${p.name}** | ${p.category} | ${p.project_status} | ${p.hosting_provider || '-'} | ${p.database || '-'} | ${p.frontend_technologies.join(', ') || '-'} | ${p.backend_technologies.join(', ') || '-'} | [View Specs](${docPath}) |`;
  })
  .join('\n')}

---

*Generated by ProjectVault.*
`;
}

/**
 * Generate default project template
 */
export function generateTemplateMarkdown(): string {
  return `---
title: "Project Name"
slug: "project-slug"
category: "Client Projects | Personal Projects | AI & Machine Learning | ..."
status: "Live | Offline | In Development"
hosting: "Cloudflare | Vercel | Netlify | AWS"
---

# Project Name

> Short one-line summary.

## 🔗 Quick Links
- **Live Demo:** https://...
- **Repository:** https://github.com/...

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js / Python
- **Database:** PostgreSQL
`;
}
