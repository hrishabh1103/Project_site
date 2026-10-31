# 🛡️ PROJECTVAULT – Personal Project & Deployment Management System

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge&logo=shield)](https://github.com/hrishabhgupt/my-live-projects)
[![React 18](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-6366f1?style=for-the-badge&logo=react)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Backend-Supabase%20PostgreSQL%20%7C%20Auth-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Cloudflare Workers](https://img.shields.io/badge/Hosting-Cloudflare%20Workers-f38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![GitHub REST API](https://img.shields.io/badge/Sync-GitHub%20REST%20API%20Git%20Data-black?style=for-the-badge&logo=github)](https://github.com/hrishabhgupt/my-live-projects)

**PROJECTVAULT** is a developer operating system and project management dashboard engineered to monitor, catalog, and synchronize every website, application, client project, AI/ML model, and software deliverable you have built.

Every creation, modification, or deletion made in ProjectVault is automatically translated into structured Markdown dossiers and committed directly to your public GitHub repository: **`my-live-projects`**.

---

## 🌟 Core System Highlights

1. **Automated GitHub Synchronization (`my-live-projects`)**:
   - Zero-latency Git Data API atomic commits (Blobs $\to$ Trees $\to$ Commits $\to$ Refs).
   - Generates and synchronizes individual Markdown files in `projects/{category-slug}/{project-slug}.md`.
   - Maintains the master directory index in **`README.md`** and technical catalog in **`PROJECTS.md`**.
   - Server-side token isolation: GitHub PAT tokens are protected in server-side memory and never leaked into client bundles.

2. **Deployment Health Telemetry & Probe Runner**:
   - Built-in HTTP probe engine that pings live deployment URLs without browser CORS restrictions.
   - Measures real-time latency (ms) and tracks HTTP response codes (200 OK, 301, 404, 500).
   - Flags unreachable services as potentially offline while guaranteeing **zero accidental project deletion**.
   - Manual status overrides with complete audit history.

3. **Supabase PostgreSQL & Row Level Security (RLS)**:
   - Normalized relational database schema with dedicated tables: `profiles`, `projects`, `project_technologies`, `project_screenshots`, `deployment_checks`, `github_sync_logs`, and `integrations`.
   - Production Row Level Security (RLS) policies allowing public read access for your portfolio catalog while strictly restricting write/update/delete operations to authenticated administrators.

4. **Premium SaaS Developer UI/UX**:
   - Polished dark and light themes with subtle glow accents, responsive navigation, and smooth animations.
   - Global search by project name, tech stack, slug, or hosting platform.
   - Dual action controls: **"Save Project"** and **"Save & Sync to GitHub"**.
   - Interactive live preview modal for generated Markdown and repository file trees.

---

## 🗂️ Target Repository Structure (`my-live-projects`)

```
my-live-projects/
│
├── README.md               # Main directory showcase, badges & featured projects table
├── PROJECTS.md             # Comprehensive technical directory with specifications
│
├── projects/
│   ├── client-projects/    # Production client deliverables & healthcare portals
│   ├── personal-projects/  # Personal software, startup tools & portfolios
│   ├── ai-ml-projects/     # Computer vision, NLP, and RAG conversational agents
│   ├── web-applications/   # Modern SaaS web applications
│   └── experimental-projects/
│
├── assets/                 # Architecture diagrams, screenshots & icons
└── templates/              # Standardized Markdown templates
```

---

## 📋 Initial Seed Data (Requirement 12)

The system is pre-configured with the exact 8 initial projects:

| # | Project Name | Category | Hosting | Live URL | Status | Tech Stack |
| -: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Dr. Vishal Bhattacharya Clinic** | Client Projects | Cloudflare Workers | [workers.dev URL](https://dr-vishal-clinic.hrishabhbase.workers.dev/) | `Live` | Next.js, OpenNext, Supabase |
| 2 | **Traviyaa** | Client Projects | Pending verification | *Pending verification* | `Needs Verification` | React, TypeScript, Node.js |
| 3 | **Personal Portfolio** | Personal Projects | Vercel | [hrishabhgupt.vercel.app](https://hrishabhgupt.vercel.app/) | `Live` | React, Next.js, Tailwind CSS |
| 4 | **SavingsKaro** | Personal Projects | Netlify | *Pending verification* | `Needs Verification` | React, Vite, Netlify Functions |
| 5 | **Genius AI Assistant** | AI & Machine Learning | Render / GCP | *In Development* | `In Development` | React, Flask, Flask-SocketIO, Vosk |
| 6 | **Virtual Stylist** | AI & Machine Learning | AWS / Modal | *In Development* | `In Development` | React, Flask, Python |
| 7 | **Video Analyzer** | AI & Machine Learning | GCP Cloud Run | *In Development* | `In Development` | Python, face_recognition, EasyOCR |
| 8 | **Customer Support Bot** | AI & Machine Learning | Fly.io | *In Development* | `In Development` | FastAPI, ChromaDB, SentenceTransformers |

*(Missing URLs are not invented; placeholders are provided awaiting verification).*

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
git clone <repo-url> projectvault
cd projectvault
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
# 1. Supabase PostgreSQL & Auth
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"

# 2. GitHub REST API (Server-Side Secrets)
GITHUB_TOKEN="ghp_your_personal_access_token_with_repo_scope"
GITHUB_OWNER="hrishabhgupt"
GITHUB_REPO="my-live-projects"
GITHUB_BRANCH="main"
```

> **Note on Local Active Mode:** If Supabase environment variables are left blank, ProjectVault seamlessly boots in **Local Mode** with localStorage persistence and an instant 1-click Administrator session, enabling you to test full creation, editing, health checks, and GitHub synchronization immediately!

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

ProjectVault includes an automated test suite verifying data integrity, Markdown generation, and schema conformity:

```bash
npm test
```

Expected output:
```
--- PROJECTVAULT TEST SUITE ---
Checking Initial Projects count: 8
✓ All 8 initial projects verified with exact URLs, categories, stacks, and hosting providers.
✓ Project [Dr. Vishal Bhattacharya Clinic] -> projects/client-projects/dr-vishal-bhattacharya-clinic.md (2221 bytes)
✓ Project [Traviyaa] -> projects/client-projects/traviyaa.md (1741 bytes)
✓ Project [Personal Portfolio] -> projects/personal-projects/personal-portfolio.md (2046 bytes)
✓ Project [SavingsKaro] -> projects/personal-projects/savingskaro.md (1723 bytes)
✓ Project [Genius AI Assistant] -> projects/ai-ml-projects/genius-ai-assistant.md (1888 bytes)
✓ Project [Virtual Stylist] -> projects/ai-ml-projects/virtual-stylist.md (1773 bytes)
✓ Project [Video Analyzer] -> projects/ai-ml-projects/video-analyzer.md (1791 bytes)
✓ Project [Customer Support Bot] -> projects/ai-ml-projects/customer-support-bot.md (1812 bytes)
✓ README.md successfully generated (6109 bytes)
✓ PROJECTS.md successfully generated (2204 bytes)
--- ALL TEST ASSERTIONS PASSED! ---
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to the **SQL Editor**.
2. Run the migration script located at:
   ```
   supabase/migrations/20261031_init.sql
   ```
3. Run the initial seed script to populate the 8 starting projects:
   ```
   supabase/seed.sql
   ```
4. Copy your project's `Project URL` and `anon public key` from **Project Settings $\to$ API** and paste them into your `.env` or Cloudflare Worker environment variables.

---

## ☁️ Deployment Guide (Cloudflare Workers)

ProjectVault is natively configured to build and deploy to **Cloudflare Workers** using the provided `wrangler.toml` and `src/worker.ts` server entrypoint.

### 1. Build Production Assets
```bash
npm run build
```

### 2. Configure Cloudflare Secrets
Store your GitHub token securely as an encrypted Cloudflare Worker secret:
```bash
npx wrangler secret put GITHUB_TOKEN
```
*(Paste your GitHub Personal Access Token when prompted).*

### 3. Deploy
```bash
npm run deploy
```
Your application will be compiled, assets bundled into Cloudflare Workers Static Assets, and deployed globally with an edge-worker API handling probes and GitHub sync!

---

## 🔒 Security Architecture

- **Token Safety**: GitHub tokens are managed server-side via Cloudflare Worker secrets or Vite API proxy middleware. Tokens are never embedded in compiled frontend chunks.
- **RLS Enforcement**: Every database query verifies authentication. Public visitors can view the directory while mutations (inserts, updates, deletes) are rejected at the database engine level unless signed by an authorized JWT.
- **Fail-Safe Monitoring**: Failed health probes do **not** trigger destructive actions. Unresponsive deployments are safely flagged for manual review.
- **Repository Safety**: All file writes to GitHub verify tree heads to avoid commit races, maintaining clean, linear commit histories.
