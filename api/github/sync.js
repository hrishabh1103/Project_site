export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const serverToken = process.env.GITHUB_TOKEN || process.env.PROJECTVAULT_GITHUB_TOKEN;
    const token = body.config?.token || serverToken;
    const owner = (body.config?.owner || body.config?.repo_owner || process.env.GITHUB_OWNER || 'hrishabh1103').trim();
    const repo = (body.config?.repo || body.config?.repo_name || process.env.GITHUB_REPO || 'my-live-projects').trim();
    const branch = (body.config?.branch || process.env.GITHUB_BRANCH || 'main').trim();
    const authorName = body.config?.authorName || body.config?.author_name || 'ProjectVault Bot';
    const authorEmail = body.config?.authorEmail || body.config?.author_email || 'vault@projectvault.internal';

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'No GitHub token configured. Please enter your Personal Access Token in Settings.',
      });
    }

    const files = body.files || [];
    const commitMessage = body.commitMessage || 'chore(sync): update repository specifications';

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided to commit',
      });
    }

    const headers = {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ProjectVault-Vercel-Integration',
    };

    // 1. Get branch commit SHA
    let refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      { headers }
    );

    let parentCommitSha = null;
    let baseTreeSha = null;

    if (refRes.ok) {
      const refData = await refRes.json();
      parentCommitSha = refData.object.sha;

      const commitRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/commits/${parentCommitSha}`,
        { headers }
      );
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    }

    // 2. Create Blobs
    const treeItems = await Promise.all(
      files.map(async (file) => {
        const blobRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              content: file.content,
              encoding: 'utf-8',
            }),
          }
        );

        if (!blobRes.ok) {
          const blobErr = await blobRes.json().catch(() => ({}));
          throw new Error(
            `Failed to upload blob for ${file.path}: ${blobErr.message || blobRes.statusText}`
          );
        }

        const blobData = await blobRes.json();
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        };
      })
    );

    // 3. Create Tree
    const treePayload = { tree: treeItems };
    if (baseTreeSha) treePayload.base_tree = baseTreeSha;

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(treePayload),
      }
    );

    if (!treeRes.ok) {
      const treeErr = await treeRes.json().catch(() => ({}));
      throw new Error(`Failed to create Git tree: ${treeErr.message || treeRes.statusText}`);
    }
    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;

    // 4. Create Commit
    const commitPayload = {
      message: commitMessage,
      tree: newTreeSha,
      author: {
        name: authorName,
        email: authorEmail,
        date: new Date().toISOString(),
      },
    };
    if (parentCommitSha) commitPayload.parents = [parentCommitSha];

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(commitPayload),
      }
    );

    if (!commitRes.ok) {
      const commitErr = await commitRes.json().catch(() => ({}));
      throw new Error(`Failed to create Git commit: ${commitErr.message || commitRes.statusText}`);
    }
    const commitData = await commitRes.json();
    const newCommitSha = commitData.sha;

    // 5. Update branch ref
    if (parentCommitSha) {
      const updateRefRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ sha: newCommitSha, force: false }),
        }
      );

      if (!updateRefRes.ok) {
        const updateErr = await updateRefRes.json().catch(() => ({}));
        throw new Error(`Failed to update branch reference: ${updateErr.message || updateRefRes.statusText}`);
      }
    } else {
      const createRefRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: newCommitSha }),
        }
      );

      if (!createRefRes.ok) {
        const createErr = await createRefRes.json().catch(() => ({}));
        throw new Error(`Failed to create branch reference: ${createErr.message || createRefRes.statusText}`);
      }
    }

    return res.status(200).json({
      success: true,
      commitSha: newCommitSha,
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
      filesAffected: files.map((f) => f.path),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to synchronize files to GitHub',
    });
  }
}
