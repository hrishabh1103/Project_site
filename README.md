# 🛡️ PROJECTVAULT – Personal Project & Deployment Management System

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge&logo=shield)](https://github.com/hrishabh1103/my-live-projects)
[![React 18](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-slate?style=for-the-badge&logo=react)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Backend-Supabase%20PostgreSQL%20%7C%20Auth-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Cloudflare Workers](https://img.shields.io/badge/Hosting-Cloudflare%20Workers-f38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![GitHub REST API](https://img.shields.io/badge/Sync-GitHub%20REST%20API%20Git%20Data-black?style=for-the-badge&logo=github)](https://github.com/hrishabh1103/my-live-projects)

**PROJECTVAULT** is a personal project & deployment management platform engineered to catalog, monitor, and synchronize every live application, website, client deliverable, and AI/ML model.

Built with a **clean, minimal, recruiter-friendly design**, it allows HR managers, clients, and technical leads to effortlessly browse your work, test live URLs, and view architectures. Every change made through ProjectVault automatically generates structured Markdown dossiers and synchronizes with your existing GitHub repository: **[`hrishabh1103/my-live-projects`](https://github.com/hrishabh1103/my-live-projects)**.

---

## 🌟 Key Features

1. **Clean, Minimalist Showcase (HR & Recruiter Friendly)**:
   - Modern, readable portfolio interface without distracting visual noise or "hacker" elements.
   - Prominent **"Visit Live App"**, **"Code"**, and **"Details"** links for instant evaluation.
   - Built-in **Light & Dark Theme Switcher** (clean light mode by default, soft dark mode).
   - Fast instant search across project names, technologies, hosting providers, and categories.

2. **Automated GitHub Synchronization (`my-live-projects`)**:
   - Seamless integration with your existing repository [`hrishabh1103/my-live-projects`](https://github.com/hrishabh1103/my-live-projects).
   - Generates and synchronizes Markdown files adhering to `templates/project-template.md`.
   - Maintains and updates **`README.md`** and **`PROJECTS.md`** while preserving all existing project entries.
   - Server-side GitHub token isolation: tokens are stored securely and never leaked to client bundles.

3. **Live Deployment Health Telemetry**:
   - HTTP probe engine that pings live deployment endpoints.
   - Measures real-time latency (ms) and tracks HTTP response codes (200 OK, 301, 404, 500).
   - Flags unreachable endpoints without ever deleting or corrupting project records.
   - One-click manual status overrides with complete audit history.

4. **Normalized PostgreSQL & Row Level Security (RLS)**:
   - Full PostgreSQL schema with tables: `profiles`, `projects`, `deployment_checks`, `github_sync_logs`, and `integrations`.
   - Row Level Security (RLS) ensures public read access for recruiters while restricting create/update/delete operations to authenticated administrators.

5. **Cloudflare Workers Edge Architecture**:
   - Single-command deployment to Cloudflare Workers via `wrangler.toml`.
   - Edge Worker API endpoints handle secure GitHub commits and CORS-free endpoint health probes.

---

## 🗂️ Integrated Repository Structure (`hrishabh1103/my-live-projects`)

```
my-live-projects/
│
├── README.md               # Main directory showcase, shields, and quick links
├── PROJECTS.md             # Complete technical directory with specs
│
├── projects/
│   ├── client-projects/    # Production client applications & clinics
│   ├── personal-projects/  # Personal platforms, portfolios & blogs
│   └── ai-ml-projects/     # Computer vision, NLP & LLM assistants
│
├── assets/                 # Project assets and screenshots
└── templates/
    └── project-template.md # Standard markdown template
```

---

## 📋 Tracked Projects (13 Integrated Projects)

ProjectVault comes pre-seeded with all 13 projects from [`hrishabh1103/my-live-projects`](https://github.com/hrishabh1103/my-live-projects):

| # | Project Name | Category | Hosting Provider | Live URL | Status | Primary Stack |
| -: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Dr. Vishal Bhattacharya Clinic** | Client Projects | Cloudflare Workers | [workers.dev URL](https://dr-vishal-clinic.hrishabhbase.workers.dev/) | `Live` | Next.js, OpenNext, Supabase |
| 2 | **Traviyaa** | Client Projects | Vercel | [traviyaa.vercel.app](https://traviyaa.vercel.app/) | `Live` | React, TypeScript, Node.js |
| 3 | **Personal Portfolio** | Personal Projects | Vercel | [hrishabhgupt.vercel.app](https://hrishabhgupt.vercel.app/) | `Live` | Three.js, React, Tailwind CSS |
| 4 | **SavingsKaro** | Personal Projects | Vercel | [savingskaro.vercel.app](https://savingskaro.vercel.app/) | `Live` | React, TypeScript, Supabase |
| 5 | **Career-Ops** | Personal Projects | Custom Domain | [career-ops.org](https://career-ops.org/) | `Live` | React, Tailwind, Analytics |
| 6 | **Kautilyam / Zylar** | Personal Projects | Vercel | [zylar-ai.vercel.app](https://zylar-ai.vercel.app/) | `Live` | React, TypeScript, AI APIs |
| 7 | **Kisan Mitra** | Personal Projects | Vercel | [kissan-mitra.vercel.app](https://kissan-mitra.vercel.app/) | `Live` | React, Multi-Language, OpenData |
| 8 | **Hrishabh's Blog** | Personal Projects | Vercel | [hrishabh-blog.vercel.app](https://hrishabh-blog.vercel.app/) | `Live` | Next.js, MDX, Tailwind CSS |
| 9 | **Genius AI Assistant** | AI & Machine Learning | Vercel | [genius-ai.vercel.app](https://genius-ai.vercel.app/) | `Live` | React, Flask, Gemini API, Vosk |
| 10 | **SocketComm AI Chat** | AI & Machine Learning | Vercel | [socketcomm.vercel.app](https://socketcomm.vercel.app/) | `Live` | React, WebSockets, Socket.IO |
| 11 | **Virtual Stylist** | AI & Machine Learning | Render (Target) | *In Development* | `In Development` | React, Flask, Python |
| 12 | **Video Analyzer** | AI & Machine Learning | Cloud Run (Target) | *In Development* | `In Development` | Python, face_recognition, EasyOCR |
| 13 | **Customer Support Bot** | AI & Machine Learning | Railway (Target) | *In Development* | `In Development` | FastAPI, ChromaDB, Hugging Face |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
git clone <repo-url> projectvault
cd projectvault
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
# Supabase PostgreSQL & Auth (Optional for local testing)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"

# GitHub REST API (Server-Side Secrets)
GITHUB_TOKEN="ghp_your_personal_access_token_with_repo_scope"
GITHUB_OWNER="hrishabh1103"
GITHUB_REPO="my-live-projects"
GITHUB_BRANCH="main"
```

> **Local Demo Mode**: If Supabase credentials are not provided, ProjectVault automatically operates in **Local Cache Mode** with an instant 1-click Administrator session, allowing full project creation, editing, Markdown previews, and GitHub sync testing immediately!

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

Run the comprehensive integration test suite:
```bash
npm test
```

Expected output:
```
==============================================
   PROJECTVAULT INTEGRATION VERIFICATION      
==============================================

Checking tracked projects count: 13
✓ All 13 projects verified with exact URLs, categories, stacks, and hosting providers.
✓ Project [Dr. Vishal Bhattacharya Clinic] -> projects/client-projects/dr-vishal-clinic.md
✓ Project [Traviyaa] -> projects/client-projects/traviyaa.md
✓ Project [Personal Portfolio] -> projects/personal-projects/portfolio.md
✓ Project [SavingsKaro] -> projects/personal-projects/savingskaro.md
✓ Project [Career-Ops] -> projects/personal-projects/career-ops.md
✓ Project [Kautilyam / Zylar] -> projects/personal-projects/kautilyam.md
✓ Project [Kisan Mitra] -> projects/personal-projects/kissan-mitra.md
✓ Project [Hrishabh's Blog] -> projects/personal-projects/hrishabh-blog.md
✓ Project [Genius AI Assistant] -> projects/ai-ml-projects/genius-ai-assistant.md
✓ Project [SocketComm AI Chat] -> projects/ai-ml-projects/socketcomm-ai-chat.md
✓ Project [Virtual Stylist] -> projects/ai-ml-projects/virtual-stylist.md
✓ Project [Video Analyzer] -> projects/ai-ml-projects/video-analyzer.md
✓ Project [Customer Support Bot] -> projects/ai-ml-projects/customer-support-bot.md
✓ README.md successfully generated with preserved repository format
✓ PROJECTS.md successfully generated

==============================================
       ALL VERIFICATION CHECKS PASSED!        
==============================================
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard) and open the **SQL Editor**.
2. Run the initialization migration located at:
   ```
   supabase/migrations/20261031_init.sql
   ```
3. Run the project seed file to populate the 13 live and in-development projects:
   ```
   supabase/seed.sql
   ```
4. Copy `Project URL` and `anon public key` from **Project Settings $\to$ API** and set them in `.env`.

---

## ☁️ Deployment Guide (Cloudflare Workers)

ProjectVault is pre-configured for global serverless deployment via Cloudflare Workers Static Assets & Worker API:

### 1. Build
```bash
npm run build
```

### 2. Set Cloudflare Secret
```bash
npx wrangler secret put GITHUB_TOKEN
```
*(Enter your GitHub Personal Access Token when prompted).*

### 3. Deploy
```bash
npm run deploy
```

---

## 🔒 Security & Data Integrity

- **Zero Token Leakage**: GitHub tokens are held only in server-side memory (`src/server/api-handlers.ts` or Cloudflare Worker environment bindings) and never exported in client bundles.
- **Atomic Git Commits**: Commits are pushed via GitHub REST Data API with proper tree parent hashing, preventing conflicts and maintaining clean commit histories.
- **Fail-Safe Health Probes**: Endpoints returning non-200 HTTP status are marked for review, but are **never automatically deleted**.
- **Row Level Security**: Non-authenticated visitors can query projects for portfolio review, but database modifications require authenticated Supabase admin JWTs.
