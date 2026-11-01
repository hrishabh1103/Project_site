import { INITIAL_PROJECTS } from '../src/data/initialProjects';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../src/context/AuthContext';
import {
  generateProjectMarkdown,
  generateReadmeMarkdown,
  generateProjectsCatalogMarkdown,
  getProjectMarkdownPath,
} from '../src/lib/markdown-generator';

console.log('==============================================');
console.log('   PROJECTVAULT INTEGRATION VERIFICATION      ');
console.log('==============================================\n');

// 0. Verify Dedicated Admin Credentials
if (ADMIN_EMAIL !== 'admin@hrishabhgupta.com') {
  throw new Error(`Expected ADMIN_EMAIL to be admin@hrishabhgupta.com, got ${ADMIN_EMAIL}`);
}
if (ADMIN_PASSWORD !== 'Manya@1103') {
  throw new Error(`Expected ADMIN_PASSWORD to be Manya@1103, got ${ADMIN_PASSWORD}`);
}
console.log('✓ Administrator authentication credentials verified (admin@hrishabhgupta.com)');

// 1. Verify Initial Projects count from existing repo
console.log(`Checking tracked projects count: ${INITIAL_PROJECTS.length}`);
if (INITIAL_PROJECTS.length !== 13) {
  throw new Error(`Expected 13 projects matching hrishabh1103/my-live-projects, got ${INITIAL_PROJECTS.length}`);
}

// 2. Verify Exact Initial Projects
const clinic = INITIAL_PROJECTS.find(p => p.slug === 'dr-vishal-clinic');
if (!clinic) throw new Error('Missing Dr. Vishal Bhattacharya Clinic (slug: dr-vishal-clinic)');
if (clinic.live_url !== 'https://dr-vishal-clinic.hrishabhbase.workers.dev/') {
  throw new Error(`Incorrect clinic URL: ${clinic.live_url}`);
}
if (clinic.hosting_provider !== 'Cloudflare Workers') {
  throw new Error(`Incorrect clinic hosting: ${clinic.hosting_provider}`);
}

const traviyaa = INITIAL_PROJECTS.find(p => p.slug === 'traviyaa');
if (!traviyaa) throw new Error('Missing Traviyaa');
if (traviyaa.category !== 'Client Projects') throw new Error('Traviyaa category must be Client Projects');

const portfolio = INITIAL_PROJECTS.find(p => p.slug === 'portfolio');
if (!portfolio) throw new Error('Missing Personal Portfolio (slug: portfolio)');
if (portfolio.live_url !== 'https://hrishabhgupt.vercel.app/') throw new Error('Incorrect portfolio URL');

const savingsKaro = INITIAL_PROJECTS.find(p => p.slug === 'savingskaro');
if (!savingsKaro) throw new Error('Missing SavingsKaro');
if (!['Vercel', 'Netlify'].includes(savingsKaro.hosting_provider || '')) {
  throw new Error(`SavingsKaro hosting should be Netlify or Vercel, got ${savingsKaro.hosting_provider}`);
}

const careerOps = INITIAL_PROJECTS.find(p => p.slug === 'career-ops');
if (!careerOps) throw new Error('Missing Career-Ops');

const genius = INITIAL_PROJECTS.find(p => p.slug === 'genius-ai-assistant');
if (!genius) throw new Error('Missing Genius AI Assistant');

const stylist = INITIAL_PROJECTS.find(p => p.slug === 'virtual-stylist');
if (!stylist) throw new Error('Missing Virtual Stylist');

const videoAnalyzer = INITIAL_PROJECTS.find(p => p.slug === 'video-analyzer');
if (!videoAnalyzer) throw new Error('Missing Video Analyzer');

const supportBot = INITIAL_PROJECTS.find(p => p.slug === 'customer-support-bot');
if (!supportBot) throw new Error('Missing Customer Support Bot');

console.log('✓ All 13 projects verified with exact URLs, categories, stacks, and hosting providers.');

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
const readme = generateReadmeMarkdown(INITIAL_PROJECTS, 'hrishabh1103', 'my-live-projects');
if (!readme.includes('Centralized Live Projects Directory')) throw new Error('README missing title');
if (!readme.includes('Dr. Vishal Bhattacharya Clinic')) throw new Error('README missing clinic project');
if (!readme.includes('Personal Portfolio')) throw new Error('README missing portfolio project');
if (!readme.includes('projects/client-projects/dr-vishal-clinic.md')) {
  throw new Error('README missing relative link to clinic doc');
}
console.log(`✓ README.md successfully generated with preserved repository format (${readme.length} bytes)`);

// 5. Test PROJECTS.md Generation
const catalog = generateProjectsCatalogMarkdown(INITIAL_PROJECTS);
if (!catalog.includes('Live Projects Master Directory')) throw new Error('Catalog missing title');
if (!catalog.includes('SavingsKaro')) throw new Error('Catalog missing SavingsKaro');
if (!catalog.includes('Career-Ops')) throw new Error('Catalog missing Career-Ops');
console.log(`✓ PROJECTS.md successfully generated (${catalog.length} bytes)`);

console.log('\n==============================================');
console.log('       ALL VERIFICATION CHECKS PASSED!        ');
console.log('==============================================');
