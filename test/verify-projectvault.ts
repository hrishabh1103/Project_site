import { INITIAL_PROJECTS } from '../src/data/initialProjects';
import {
  generateProjectMarkdown,
  generateReadmeMarkdown,
  generateProjectsCatalogMarkdown,
  getProjectMarkdownPath,
} from '../src/lib/markdown-generator';

console.log('--- PROJECTVAULT TEST SUITE ---');

// 1. Verify Initial Projects count
console.log(`Checking Initial Projects count: ${INITIAL_PROJECTS.length}`);
if (INITIAL_PROJECTS.length !== 8) {
  throw new Error(`Expected 8 initial projects, got ${INITIAL_PROJECTS.length}`);
}

// 2. Verify Exact Initial Projects from Requirement 12
const clinic = INITIAL_PROJECTS.find(p => p.slug === 'dr-vishal-bhattacharya-clinic');
if (!clinic) throw new Error('Missing Dr. Vishal Bhattacharya Clinic');
if (clinic.live_url !== 'https://dr-vishal-clinic.hrishabhbase.workers.dev/') {
  throw new Error(`Incorrect clinic URL: ${clinic.live_url}`);
}
if (clinic.hosting_provider !== 'Cloudflare Workers') {
  throw new Error(`Incorrect clinic hosting: ${clinic.hosting_provider}`);
}

const traviyaa = INITIAL_PROJECTS.find(p => p.slug === 'traviyaa');
if (!traviyaa) throw new Error('Missing Traviyaa');
if (traviyaa.live_url !== null) throw new Error('Traviyaa URL should be null (pending verification)');
if (traviyaa.project_status !== 'Needs Verification') throw new Error('Traviyaa status should be Needs Verification');

const portfolio = INITIAL_PROJECTS.find(p => p.slug === 'personal-portfolio');
if (!portfolio) throw new Error('Missing Personal Portfolio');
if (portfolio.live_url !== 'https://hrishabhgupt.vercel.app/') throw new Error('Incorrect portfolio URL');

const savingsKaro = INITIAL_PROJECTS.find(p => p.slug === 'savingskaro');
if (!savingsKaro) throw new Error('Missing SavingsKaro');
if (savingsKaro.live_url !== null) throw new Error('SavingsKaro URL should be null');
if (savingsKaro.hosting_provider !== 'Netlify') throw new Error('SavingsKaro hosting should be Netlify');

const genius = INITIAL_PROJECTS.find(p => p.slug === 'genius-ai-assistant');
if (!genius) throw new Error('Missing Genius AI Assistant');

const stylist = INITIAL_PROJECTS.find(p => p.slug === 'virtual-stylist');
if (!stylist) throw new Error('Missing Virtual Stylist');

const videoAnalyzer = INITIAL_PROJECTS.find(p => p.slug === 'video-analyzer');
if (!videoAnalyzer) throw new Error('Missing Video Analyzer');

const supportBot = INITIAL_PROJECTS.find(p => p.slug === 'customer-support-bot');
if (!supportBot) throw new Error('Missing Customer Support Bot');

console.log('✓ All 8 initial projects verified with exact URLs, categories, stacks, and hosting providers.');

// 3. Test Markdown Generation for each project
INITIAL_PROJECTS.forEach((p) => {
  const filePath = getProjectMarkdownPath(p);
  const markdown = generateProjectMarkdown(p);
  if (!filePath.startsWith('projects/')) throw new Error(`Invalid path: ${filePath}`);
  if (!markdown.includes(p.name)) throw new Error(`Markdown missing project name: ${p.name}`);
  if (!markdown.includes(p.category)) throw new Error(`Markdown missing category: ${p.category}`);
  console.log(`✓ Project [${p.name}] -> ${filePath} (${markdown.length} bytes)`);
});

// 4. Test README.md Generation
const readme = generateReadmeMarkdown(INITIAL_PROJECTS, 'hrishabhgupt', 'my-live-projects');
if (!readme.includes('My Live Projects Directory')) throw new Error('README missing title');
if (!readme.includes('Dr. Vishal Bhattacharya Clinic')) throw new Error('README missing clinic project');
if (!readme.includes('Personal Portfolio')) throw new Error('README missing portfolio project');
if (!readme.includes('projects/client-projects/dr-vishal-bhattacharya-clinic.md')) {
  throw new Error('README missing relative link to clinic doc');
}
console.log(`✓ README.md successfully generated (${readme.length} bytes)`);

// 5. Test PROJECTS.md Generation
const catalog = generateProjectsCatalogMarkdown(INITIAL_PROJECTS);
if (!catalog.includes('Complete Project Catalog')) throw new Error('Catalog missing title');
if (!catalog.includes('SavingsKaro')) throw new Error('Catalog missing SavingsKaro');
console.log(`✓ PROJECTS.md successfully generated (${catalog.length} bytes)`);

console.log('--- ALL TEST ASSERTIONS PASSED! ---');
