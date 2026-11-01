export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const hasServerToken = Boolean(process.env.GITHUB_TOKEN || process.env.PROJECTVAULT_GITHUB_TOKEN);
  return res.status(200).json({
    hasServerToken,
    defaultOwner: process.env.GITHUB_OWNER || 'hrishabh1103',
    defaultRepo: process.env.GITHUB_REPO || 'my-live-projects',
    defaultBranch: process.env.GITHUB_BRANCH || 'main',
  });
}
