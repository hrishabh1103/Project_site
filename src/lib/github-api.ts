export interface GitFileCommit {
  path: string;
  content: string;
}

export interface CommitResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  commitMessage?: string;
  filesAffected: string[];
  error?: string;
}

export class GitHubService {
  private token: string;
  private owner: string;
  private repo: string;
  private branch: string;
  private authorName: string;
  private authorEmail: string;

  constructor(config: {
    token: string;
    owner: string;
    repo: string;
    branch?: string;
    authorName?: string;
    authorEmail?: string;
  }) {
    this.token = config.token.trim();
    this.owner = config.owner.trim();
    this.repo = config.repo.trim();
    this.branch = (config.branch || 'main').trim();
    this.authorName = config.authorName || 'ProjectVault Bot';
    this.authorEmail = config.authorEmail || 'vault@projectvault.internal';
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ProjectVault-Sync-Agent',
    };
  }

  /**
   * Verify repository access and permissions
   */
  async testConnection(): Promise<{
    success: boolean;
    repoFullName?: string;
    defaultBranch?: string;
    canPush?: boolean;
    error?: string;
  }> {
    try {
      const res = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}`, {
        headers: this.headers(),
      });

      if (!res.ok) {
        if (res.status === 404) {
          return {
            success: false,
            error: `Repository '${this.owner}/${this.repo}' was not found or the provided token does not have read access to it.`,
          };
        }
        if (res.status === 401) {
          return {
            success: false,
            error: 'Invalid GitHub Personal Access Token. Please verify token credentials.',
          };
        }
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          error: (errJson as any)?.message || `GitHub API error: HTTP ${res.status}`,
        };
      }

      const data = await res.json() as any;
      const canPush = data.permissions?.push ?? true;

      return {
        success: true,
        repoFullName: data.full_name,
        defaultBranch: data.default_branch || this.branch,
        canPush,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network failure while contacting GitHub API.',
      };
    }
  }

  /**
   * Atomic multi-file commit via GitHub Git Data API
   */
  async commitFiles(
    files: GitFileCommit[],
    commitMessage: string
  ): Promise<CommitResult> {
    const filesAffected = files.map((f) => f.path);

    try {
      if (!this.token) {
        return {
          success: false,
          filesAffected,
          error: 'GitHub Token is missing. Please configure your token in Integrations Settings.',
        };
      }

      // Step 1: Get latest commit SHA for the branch
      let refRes = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}`,
        { headers: this.headers() }
      );

      let parentCommitSha: string | null = null;
      let baseTreeSha: string | null = null;

      if (refRes.ok) {
        const refData = await refRes.json() as any;
        parentCommitSha = refData.object.sha;

        // Get the commit to find its tree SHA
        const commitRes = await fetch(
          `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits/${parentCommitSha}`,
          { headers: this.headers() }
        );
        if (commitRes.ok) {
          const commitData = await commitRes.json() as any;
          baseTreeSha = commitData.tree.sha;
        }
      } else if (refRes.status === 404) {
        // Branch might not exist yet or repo might be empty. Check if repo is empty:
        const repoRes = await fetch(
          `https://api.github.com/repos/${this.owner}/${this.repo}`,
          { headers: this.headers() }
        );
        if (!repoRes.ok) {
          const repoErr = await repoRes.json().catch(() => ({}));
          return {
            success: false,
            filesAffected,
            error: (repoErr as any)?.message || `Cannot access repository ${this.owner}/${this.repo}`,
          };
        }
      }

      // Step 2: Create Blobs for each file
      const treeItems = await Promise.all(
        files.map(async (file) => {
          const blobRes = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/git/blobs`,
            {
              method: 'POST',
              headers: this.headers(),
              body: JSON.stringify({
                content: file.content,
                encoding: 'utf-8',
              }),
            }
          );

          if (!blobRes.ok) {
            const blobErr = await blobRes.json().catch(() => ({}));
            throw new Error(
              `Failed to upload blob for ${file.path}: ${(blobErr as any)?.message || blobRes.statusText}`
            );
          }

          const blobData = await blobRes.json() as any;
          return {
            path: file.path,
            mode: '100644', // standard file mode
            type: 'blob',
            sha: blobData.sha,
          };
        })
      );

      // Step 3: Create new Tree
      const treePayload: any = {
        tree: treeItems,
      };
      if (baseTreeSha) {
        treePayload.base_tree = baseTreeSha;
      }

      const treeRes = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`,
        {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify(treePayload),
        }
      );

      if (!treeRes.ok) {
        const treeErr = await treeRes.json().catch(() => ({}));
        throw new Error(
          `Failed to create Git tree: ${(treeErr as any)?.message || treeRes.statusText}`
        );
      }
      const treeData = await treeRes.json() as any;
      const newTreeSha = treeData.sha;

      // Step 4: Create Commit
      const commitPayload: any = {
        message: commitMessage,
        tree: newTreeSha,
        author: {
          name: this.authorName,
          email: this.authorEmail,
          date: new Date().toISOString(),
        },
      };
      if (parentCommitSha) {
        commitPayload.parents = [parentCommitSha];
      }

      const newCommitRes = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`,
        {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify(commitPayload),
        }
      );

      if (!newCommitRes.ok) {
        const commitErr = await newCommitRes.json().catch(() => ({}));
        throw new Error(
          `Failed to create Git commit: ${(commitErr as any)?.message || newCommitRes.statusText}`
        );
      }
      const newCommitData = await newCommitRes.json() as any;
      const newCommitSha = newCommitData.sha;

      // Step 5: Update or create branch reference
      if (parentCommitSha) {
        const updateRefRes = await fetch(
          `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${this.branch}`,
          {
            method: 'PATCH',
            headers: this.headers(),
            body: JSON.stringify({
              sha: newCommitSha,
              force: false,
            }),
          }
        );

        if (!updateRefRes.ok) {
          const updateErr = await updateRefRes.json().catch(() => ({}));
          throw new Error(
            `Failed to update branch ${this.branch}: ${(updateErr as any)?.message || updateRefRes.statusText}`
          );
        }
      } else {
        // Create initial ref
        const createRefRes = await fetch(
          `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`,
          {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({
              ref: `refs/heads/${this.branch}`,
              sha: newCommitSha,
            }),
          }
        );

        if (!createRefRes.ok) {
          const createErr = await createRefRes.json().catch(() => ({}));
          throw new Error(
            `Failed to create initial branch ${this.branch}: ${(createErr as any)?.message || createRefRes.statusText}`
          );
        }
      }

      const commitUrl = `https://github.com/${this.owner}/${this.repo}/commit/${newCommitSha}`;

      return {
        success: true,
        commitSha: newCommitSha,
        commitUrl,
        commitMessage,
        filesAffected,
      };
    } catch (err: any) {
      return {
        success: false,
        filesAffected,
        error: err.message || 'Unknown GitHub API error',
      };
    }
  }

  /**
   * Delete a project markdown file safely from the repository
   */
  async deleteProjectFile(
    filePath: string,
    commitMessage: string
  ): Promise<CommitResult> {
    try {
      // Get the existing file SHA first
      const getFileRes = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${this.branch}`,
        { headers: this.headers() }
      );

      if (!getFileRes.ok) {
        // If file doesn't exist on remote, consider it already deleted
        return {
          success: true,
          filesAffected: [filePath],
          commitMessage,
        };
      }

      const fileData = await getFileRes.json() as any;
      const fileSha = fileData.sha;

      const deleteRes = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}`,
        {
          method: 'DELETE',
          headers: this.headers(),
          body: JSON.stringify({
            message: commitMessage,
            sha: fileSha,
            branch: this.branch,
            author: {
              name: this.authorName,
              email: this.authorEmail,
            },
          }),
        }
      );

      if (!deleteRes.ok) {
        const delErr = await deleteRes.json().catch(() => ({}));
        throw new Error((delErr as any)?.message || `Delete failed with HTTP ${deleteRes.status}`);
      }

      const data = await deleteRes.json() as any;
      return {
        success: true,
        commitSha: data.commit?.sha,
        commitUrl: data.commit?.html_url,
        commitMessage,
        filesAffected: [filePath],
      };
    } catch (err: any) {
      return {
        success: false,
        filesAffected: [filePath],
        error: err.message || 'Failed to delete file from GitHub',
      };
    }
  }
}
