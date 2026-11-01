export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const serverToken = process.env.GITHUB_TOKEN || process.env.PROJECTVAULT_GITHUB_TOKEN;
    const token = body.config?.token || serverToken;
    const owner = (body.config?.owner || process.env.GITHUB_OWNER || 'hrishabh1103').trim();
    const repo = (body.config?.repo || process.env.GITHUB_REPO || 'my-live-projects').trim();
    const branch = (body.config?.branch || process.env.GITHUB_BRANCH || 'main').trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'No GitHub token provided. Please enter your Personal Access Token in Settings.',
      });
    }

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ProjectVault-Vercel-Integration',
      },
    });

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return res.status(404).json({
          success: false,
          error: `Repository '${owner}/${repo}' not found or token lacks access permissions.`,
        });
      }
      if (ghRes.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Invalid GitHub Personal Access Token. Please verify credentials.',
        });
      }
      const err = await ghRes.json().catch(() => ({}));
      return res.status(ghRes.status).json({
        success: false,
        error: err.message || `GitHub API returned HTTP ${ghRes.status}`,
      });
    }

    const data = await ghRes.json();
    return res.status(200).json({
      success: true,
      repoFullName: data.full_name,
      defaultBranch: data.default_branch || branch,
      canPush: data.permissions?.push ?? true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while testing GitHub connection',
    });
  }
}
