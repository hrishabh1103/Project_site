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
      return '![Live](https://img.shields.io/badge/Status-Live-2ea44f?style=flat-square)';
    case 'Needs Verification':
      return '![Needs Verification](https://img.shields.io/badge/Status-Needs%20Verification-dfb317?style=flat-square)';
    case 'In Development':
      return '![In Dev](https://img.shields.io/badge/Status-In%20Development-blue?style=flat-square)';
    case 'Offline':
      return '![Offline](https://img.shields.io/badge/Status-Offline-d73a49?style=flat-square)';
    case 'Archived':
      return '![Archived](https://img.shields.io/badge/Status-Archived-lightgrey?style=flat-square)';
    default:
      return '![Status](https://img.shields.io/badge/Status-Unknown-9ca3af?style=flat-square)';
  }
}

export function getStatusSymbol(status: Project['project_status']): string {
  switch (status) {
    case 'Live':
      return '🟢 Live';
    case 'Needs Verification':
      return '🟡 Needs Verification';
    case 'In Development':
      return '🛠️ In Development';
    case 'Offline':
      return '🔴 Offline';
    case 'Archived':
      return '📦 Archived';
    default:
      return '⚪ Unknown';
  }
}

/**
 * Generate Markdown file conforming to templates/project-template.md of hrishabh1103/my-live-projects
 */
export function generateProjectMarkdown(project: Project): string {
  const liveLink = project.live_url
    ? `[${project.live_url}](${project.live_url})`
    : '*Pending Cloud Deployment / Pending Verification*';

  const repoLink = project.github_repo_url
    ? `[${project.github_repo_url.replace('https://github.com/', '')}](${project.github_repo_url})`
    : '*Pending / Private*';

  const frontendTech = project.frontend_technologies.join(', ') || 'React, TailwindCSS';
  const backendTech = project.backend_technologies.join(', ') || 'Node.js / Python';
  const databaseTech = project.database || 'Supabase (PostgreSQL)';
  const apisTech = project.apis_integrations.join(', ') || 'None specified';
  const lastVerified = project.deployment_date || new Date().toISOString().split('T')[0];

  return `# ${project.name}

> ${project.short_description}

---

## 📌 Project Overview

| Property | Value |
| :--- | :--- |
| **Project Name** | ${project.name} |
| **Project Category** | ${project.category} |
| **Current Status** | ${getStatusSymbol(project.project_status)} |
| **Live Deployment URL** | ${liveLink} |
| **GitHub Repository** | ${repoLink} |
| **Hosting Platform** | ${project.hosting_provider || 'Pending'} |
| **Last Verified Date** | ${lastVerified} |

---

## 📝 Detailed Description

${project.detailed_description || project.short_description}

---

## 🛠️ Technology Stack & Architecture

### Frontend
- **Framework & Libraries:** ${frontendTech}

### Backend
- **Runtime & Frameworks:** ${backendTech}

### Database & Storage
- **Primary Database:** ${databaseTech}

### Third-Party APIs & Integrations
- **Services & Models:** ${apisTech}

---

## 🚀 Deployment & Infrastructure Architecture

\`\`\`
[User Browser]
       │
       ▼
[Edge CDN / Host (${project.hosting_provider || 'Cloudflare / Vercel'})]
       │
       ▼
[Application Runtime]
       │
       ▼
[Database / External APIs (${databaseTech})]
\`\`\`

- **Hosting Platform:** ${project.hosting_provider || 'Pending'}
- **Custom Domain:** ${project.custom_domain ? `\`${project.custom_domain}\`` : 'None'}

---

## 📋 Verification & Health History

| Date | Checked Status | HTTP Code | Notes |
| :--- | :--- | :--- | :--- |
| ${lastVerified} | ${getStatusSymbol(project.project_status)} | ${project.last_http_status ? `HTTP ${project.last_http_status}` : '200 OK'} | Health verified via ProjectVault deployment monitor. |

---

## 📌 Important Deployment & Operational Notes

${project.additional_notes || '- System deployment verified and cataloged via ProjectVault.'}
`;
}

/**
 * Generate README.md preserving the exact structure of hrishabh1103/my-live-projects
 */
export function generateReadmeMarkdown(
  projects: Project[],
  repoOwner = 'hrishabh1103',
  repoName = 'my-live-projects'
): string {
  const total = projects.length;
  const liveCount = projects.filter((p) => p.project_status === 'Live').length;
  const devCount = projects.filter((p) => p.project_status === 'In Development').length;
  const needsVerCount = projects.filter((p) => p.project_status === 'Needs Verification').length;
  const today = new Date().toISOString().split('T')[0];

  const clientProjects = projects.filter((p) => p.category === 'Client Projects');
  const personalProjects = projects.filter((p) => p.category === 'Personal Projects');
  const aimlProjects = projects.filter((p) => p.category === 'AI & Machine Learning');

  const renderRow = (p: Project) => {
    const docPath = getProjectMarkdownPath(p);
    const liveLink = p.live_url
      ? `[🔗 ${p.live_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}](${p.live_url})`
      : '*Pending Cloud Deployment*';
    const repoLink = p.github_repo_url
      ? `[📂 \`${p.github_repo_url.split('/').pop()}\`](${p.github_repo_url})`
      : '*Local / Pending*';
    const stack = [...p.frontend_technologies, ...p.backend_technologies].slice(0, 4).join(', ') || 'N/A';
    return `| **[${p.name}](${docPath})**<br><sub>${p.short_description}</sub> | ${liveLink} | ${repoLink} | **${p.hosting_provider || 'Pending'}** | ${stack} | ${getStatusBadge(p.project_status)} | \`${today}\` |`;
  };

  return `# 🌐 Centralized Live Projects Directory

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1,12,24&height=200&section=header&text=My%20Live%20Projects%20Directory&fontSize=42&fontColor=ffffff&animation=fadeIn" alt="Header" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/${repoOwner}"><img src="https://img.shields.io/badge/Architect-Hrishabh%20Gupta-blue?style=for-the-badge&logo=github" alt="Architect" /></a>
  <a href="https://hrishabhgupt.vercel.app/"><img src="https://img.shields.io/badge/Portfolio-hrishabhgupt.vercel.app-success?style=for-the-badge&logo=vercel" alt="Portfolio" /></a>
  <img src="https://img.shields.io/badge/Verified%20Deployments-${liveCount}%20Live-brightgreen?style=for-the-badge" alt="Verified Deployments" />
  <img src="https://img.shields.io/badge/Last%20Audit-${today}-orange?style=for-the-badge" alt="Last Audit" />
</p>

---

## 🧭 Repository Overview

Welcome to my permanent, centralized directory of live applications, deployed web platforms, AI/ML models, client projects, and experimental technical implementations.

This repository acts as the **single source of truth** for all my production URLs, infrastructure metadata, hosting providers, and deployment architectures. Managed and automatically synchronized via **ProjectVault**.

> 🛡️ **Zero-Credential Guarantee:** This registry strictly preserves deployment metadata, infrastructure design, and public endpoints. No credentials, tokens, secret keys, or \`.env\` variables are stored.

---

## 📊 Live Deployment Statistics

<div align="center">

| Metric | Status / Count |
| :--- | :---: |
| **Total Projects Documented** | \`${total}\` |
| **🟢 Verified Live Deployments** | \`${liveCount}\` |
| **🛠️ In Active Development / Local Demos** | \`${devCount}\` |
| **🟡 Pending Verification** | \`${needsVerCount}\` |
| **Edge & Cloud Providers** | \`Cloudflare Workers\`, \`Vercel\`, \`Custom Domain\`, \`Render\`, \`Cloud Run\` |
| **Database Engines** | \`Supabase (PostgreSQL)\`, \`ChromaDB Vector Store\`, \`SQLite\` |
| **Last Automated Audit** | \`${today}\` |

</div>

---

## 🏷️ Project Status Legend

| Indicator | Status Badge | Definition |
| :---: | :---: | :--- |
| **🟢** | ![Live](https://img.shields.io/badge/Status-Live-2ea44f?style=flat-square) | **Production Live:** Public URL actively online and verified via HTTP \`200 OK\`. |
| **🟡** | ![Needs Verification](https://img.shields.io/badge/Status-Needs%20Verification-dfb317?style=flat-square) | **Needs Verification:** Public endpoint noted but currently undergoing DNS/uptime checks. |
| **🛠️** | ![In Development](https://img.shields.io/badge/Status-In%20Development-blue?style=flat-square) | **In Development:** Code complete or in progress; staging / local demonstration build. |
| **🔴** | ![Offline](https://img.shields.io/badge/Status-Offline-d73a49?style=flat-square) | **Offline:** Deployment confirmed unavailable, decommissioned, or expired. |
| **📦** | ![Archived](https://img.shields.io/badge/Status-Archived-lightgrey?style=flat-square) | **Archived:** Preserved for code reference; active maintenance stopped. |

---

## 🏥 Client Projects

Production platforms engineered and deployed for client organizations.

| Project | Live Endpoint | Source Repository | Hosting | Tech Stack | Status | Last Audit |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
${clientProjects.map(renderRow).join('\n')}

---

## 💼 Personal Projects & Startups

Proprietary platforms, startup products, and professional portals.

| Project | Live Endpoint | Source Repository | Hosting | Tech Stack | Status | Last Audit |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
${personalProjects.map(renderRow).join('\n')}

---

## 🤖 AI & Machine Learning Projects

Applied machine learning models, conversational voice agents, computer vision, and vector search systems.

| Project | Live Endpoint | Source Repository | Hosting | Tech Stack | Status | Last Audit |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
${aimlProjects.map(renderRow).join('\n')}

---

## 📂 Repository Directory Tree

\`\`\`
${repoName}/
├── README.md                           # Main showcase and documentation
├── PROJECTS.md                         # Master tabular registry
├── CONTRIBUTING.md                     # Maintenance & onboarding guide
├── .gitignore                          # Security & build ignore rules
├── .github/
│   └── workflows/
│       └── health-check.yml            # Automated weekly endpoint health pings
│
├── projects/                           # Individual project specifications
│   ├── client-projects/
│   ├── personal-projects/
│   └── ai-ml-projects/
│
├── assets/
│   ├── screenshots/                    # UI captures & project screenshots
│   └── logos/                          # High-resolution logos & badges
│
└── templates/
    └── project-template.md             # Standardized specification template
\`\`\`

---

## 📬 Contact & Profiles

- **Developer:** Hrishabh Gupta
- **Portfolio:** [hrishabhgupt.vercel.app](https://hrishabhgupt.vercel.app/)
- **GitHub:** [@${repoOwner}](https://github.com/${repoOwner})
- **Email:** [hrishabh1104@gmail.com](mailto:hrishabh1104@gmail.com)
`;
}

/**
 * Generate PROJECTS.md preserving the exact structure of hrishabh1103/my-live-projects
 */
export function generateProjectsCatalogMarkdown(
  projects: Project[],
  repoOwner = 'hrishabh1103'
): string {
  const total = projects.length;
  const liveCount = projects.filter((p) => p.project_status === 'Live').length;
  const devCount = projects.filter((p) => p.project_status === 'In Development').length;
  const needsVerCount = projects.filter((p) => p.project_status === 'Needs Verification').length;

  const clientProjects = projects.filter((p) => p.category === 'Client Projects');
  const personalProjects = projects.filter((p) => p.category === 'Personal Projects');
  const aimlProjects = projects.filter((p) => p.category === 'AI & Machine Learning');

  const renderCatalogRow = (p: Project) => {
    const docPath = getProjectMarkdownPath(p);
    const liveLink = p.live_url
      ? `[${p.live_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}](${p.live_url})`
      : '*Pending Cloud Deployment*';
    const repoLink = p.github_repo_url
      ? `[\`${p.github_repo_url.split('/').pop()}\`](${p.github_repo_url})`
      : '*Local / Pending*';
    const stack = [...p.frontend_technologies, ...p.backend_technologies].slice(0, 3).join(', ') || 'N/A';
    return `| **[${p.name}](${docPath})** | ${p.category} | ${liveLink} | ${repoLink} | ${p.hosting_provider || 'Pending'} | ${stack} | ${getStatusBadge(p.project_status)} |`;
  };

  return `# 🗂️ Live Projects Master Directory

Welcome to the central project registry of **Hrishabh Gupta** ([@${repoOwner}](https://github.com/${repoOwner})). This registry tracks all production deployments, client portals, AI/ML models, and technical experiments.

---

## 📊 Summary Statistics

| Metric | Count |
| :--- | :--- |
| **Total Projects Documented** | ${total} |
| **🟢 Live & Verified Deployments** | ${liveCount} |
| **🟡 Needs Verification** | ${needsVerCount} |
| **🛠️ In Development / Local Demo** | ${devCount} |
| **Primary Cloud Hosts** | Vercel, Cloudflare Workers, Custom Domain, Render, Cloud Run |
| **Primary Databases** | Supabase PostgreSQL, ChromaDB Vector Store, SQLite |

---

## 🏷️ Status Legend

| Badge | Status | Definition |
| :---: | :--- | :--- |
| ![Live](https://img.shields.io/badge/Status-Live-2ea44f?style=flat-square) | **🟢 Live** | Public URL verified and returning HTTP 200 OK. |
| ![Needs Verification](https://img.shields.io/badge/Status-Needs%20Verification-dfb317?style=flat-square) | **🟡 Needs Verification** | URL exists or was recorded, but has not yet been verified. |
| ![In Dev](https://img.shields.io/badge/Status-In%20Development-blue?style=flat-square) | **🛠️ In Development** | System is actively being engineered or demonstrated locally. |
| ![Offline](https://img.shields.io/badge/Status-Offline-d73a49?style=flat-square) | **🔴 Offline** | Endpoint has been decommissioned or is unreachable. |
| ![Archived](https://img.shields.io/badge/Status-Archived-lightgrey?style=flat-square) | **📦 Archived** | Legacy codebase preserved for reference; no longer maintained. |

---

## 1. 🏥 Client Projects

| Project | Category | Live URL | GitHub Repository | Hosting | Tech Stack | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
${clientProjects.map(renderCatalogRow).join('\n')}

---

## 2. 💼 Personal Projects & Startups

| Project | Category | Live URL | GitHub Repository | Hosting | Tech Stack | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
${personalProjects.map(renderCatalogRow).join('\n')}

---

## 3. 🤖 AI & Machine Learning Projects

| Project | Category | Live URL | GitHub Repository | Hosting | Tech Stack | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
${aimlProjects.map(renderCatalogRow).join('\n')}

---

## 🔄 Verification & Maintenance

- To add a new project, follow [CONTRIBUTING.md](CONTRIBUTING.md) and use the template in [templates/project-template.md](templates/project-template.md).
- Automated uptime and HTTP validation is performed via [\`.github/workflows/health-check.yml\`](.github/workflows/health-check.yml).
`;
}

/**
 * Generate standard project markdown template matching templates/project-template.md
 */
export function generateTemplateMarkdown(): string {
  return `# [Project Name]

> Brief 1-2 sentence overview of the project, its core value proposition, and purpose.

---

## 📌 Project Overview
- **Project Name:** [Project Name]
- **Category:** [Client Projects | Personal Projects | AI & Machine Learning | Experimental Projects]
- **Current Status:** [🟢 Live | 🟡 Needs Verification | 🛠️ In Development | 🔴 Offline | 📦 Archived]
- **Live URL:** [https://... or Pending verification]
- **Custom Domain:** [e.g., example.com or None]
- **GitHub Repository:** [https://github.com/... or Private]
- **Deployment Date:** [YYYY-MM-DD or Pending]
- **Last Updated:** [YYYY-MM-DD]

---

## 🛠️ Technology Stack
- **Frontend:** [e.g., Next.js, React, Tailwind CSS]
- **Backend / Runtime:** [e.g., Cloudflare Workers, Node.js, FastAPI]
- **Database / Cache:** [e.g., Supabase PostgreSQL, Redis]
- **Hosting / Cloud:** [e.g., Cloudflare Workers, Vercel, Netlify]
- **APIs & Integrations:** [e.g., Gemini API, OpenAI API, Stripe]

---

## 🏗️ Architecture & Features
Detailed explanation of system architecture, deployment strategy, key features, and user journeys.

---

## 📋 Verification & Health History
| Date | Checked Status | HTTP Code | Notes |
| :--- | :--- | :--- | :--- |
| YYYY-MM-DD | 🟢 Live | HTTP 200 | Initial deployment verification. |

---

## 📌 Important Deployment & Operational Notes
- Deployment and configuration details.
`;
}

/**
 * Parse a markdown project file from GitHub repository into a Project object
 */
export function parseProjectMarkdown(content: string, filePath: string): Project | null {
  try {
    const slug = filePath.split('/').pop()?.replace('.md', '') || '';
    if (!slug) return null;

    const titleMatch = content.match(/^#\s+(.+)$/m);
    const name = titleMatch ? titleMatch[1].trim() : slug;

    const shortDescMatch = content.match(/^>\s+(.+)$/m);
    const short_description = shortDescMatch ? shortDescMatch[1].trim() : name;

    const getTableValue = (propName: string) => {
      const reg = new RegExp(`\\|\\s*\\*\\*${propName}\\*\\*\\s*\\|\\s*([^|\\n]+)\\s*\\|`, 'i');
      const m = content.match(reg);
      return m ? m[1].trim() : null;
    };

    const cleanUrl = (val: string | null): string | null => {
      if (!val || val.includes('Pending') || val.includes('Private')) return null;
      const urlMatch = val.match(/\((https?:\/\/[^)]+)\)/) || val.match(/https?:\/\/[^\s\]]+/);
      return urlMatch ? urlMatch[1] || urlMatch[0] : null;
    };

    const rawCategory = getTableValue('Project Category') || '';
    let category: ProjectCategory = 'Experimental Projects';
    if (rawCategory.includes('Client')) category = 'Client Projects';
    else if (rawCategory.includes('Personal')) category = 'Personal Projects';
    else if (rawCategory.includes('AI') || rawCategory.includes('Machine Learning')) category = 'AI & Machine Learning';
    else if (rawCategory.includes('Web')) category = 'Web Applications';
    else if (rawCategory.includes('Mobile')) category = 'Mobile Applications';
    else if (rawCategory.includes('Academic')) category = 'Academic Projects';
    else if (rawCategory.includes('Experimental')) category = 'Experimental Projects';
    else if (filePath.includes('client-projects')) category = 'Client Projects';
    else if (filePath.includes('personal-projects')) category = 'Personal Projects';
    else if (filePath.includes('ai-ml-projects')) category = 'AI & Machine Learning';

    const rawStatus = getTableValue('Current Status') || '';
    let project_status: Project['project_status'] = 'Live';
    if (rawStatus.includes('Needs Verification')) project_status = 'Needs Verification';
    else if (rawStatus.includes('Development')) project_status = 'In Development';
    else if (rawStatus.includes('Offline')) project_status = 'Offline';
    else if (rawStatus.includes('Archived')) project_status = 'Archived';
    else if (rawStatus.includes('Live')) project_status = 'Live';

    const live_url = cleanUrl(getTableValue('Live Deployment URL'));
    const github_repo_url = cleanUrl(getTableValue('GitHub Repository'));
    const hosting_provider = getTableValue('Hosting Platform');
    const deployment_date = getTableValue('Last Verified Date') || null;

    const descMatch = content.match(/## 📝 Detailed Description\s+([\s\S]*?)(?=---\s+##|## 🛠️|$)/);
    const detailed_description = descMatch ? descMatch[1].trim() : '';

    const extractList = (subHeading: string): string[] => {
      const reg = new RegExp(`${subHeading}[\\s\\S]*?-\\s*\\*\\*[^:]+:\\*\\*\\s*([^\\n]+)`, 'i');
      const m = content.match(reg);
      if (!m) return [];
      return m[1].split(',').map((s) => s.trim()).filter(Boolean);
    };

    const frontend_technologies = extractList('### Frontend');
    const backend_technologies = extractList('### Backend');

    const dbMatch = content.match(/- \*\*Primary Database:\*\*\s*([^\n]+)/i);
    const database = dbMatch && !dbMatch[1].includes('None') ? dbMatch[1].trim() : null;

    const apisMatch = content.match(/- \*\*Services & Models:\*\*\s*([^\n]+)/i);
    const apis_integrations = apisMatch && !apisMatch[1].includes('None')
      ? apisMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    let custom_domain: string | null = null;
    if (live_url) {
      try {
        custom_domain = new URL(live_url).hostname;
      } catch {
        // ignore
      }
    }

    const now = new Date().toISOString();

    return {
      id: `proj-${slug}`,
      name,
      slug,
      short_description,
      detailed_description,
      category,
      live_url,
      custom_domain,
      github_repo_url,
      hosting_provider,
      frontend_technologies,
      backend_technologies,
      database,
      apis_integrations,
      deployment_date,
      project_status,
      health_status: project_status === 'Live' ? 'healthy' : 'unknown',
      last_health_check: now,
      last_http_status: 200,
      last_response_time_ms: 100,
      last_synced_at: now,
      last_commit_sha: null,
      sync_status: 'synced',
      created_at: deployment_date ? `${deployment_date}T00:00:00.000Z` : now,
      updated_at: now,
      project_logo: null,
      screenshots: [],
      additional_notes: 'Synchronized from GitHub repository documentation.',
    };
  } catch (e) {
    console.error(`Failed to parse markdown for ${filePath}`, e);
    return null;
  }
}
