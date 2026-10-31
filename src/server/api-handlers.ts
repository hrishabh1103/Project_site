import { GitHubService, GitFileCommit } from '../lib/github-api';

export async function handleHealthCheck(url: string): Promise<{
  isHealthy: boolean;
  statusCode: number;
  responseTime: number;
  error?: string;
}> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return {
      isHealthy: false,
      statusCode: 0,
      responseTime: 0,
      error: 'Invalid or missing HTTP/HTTPS URL',
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ProjectVault-HealthMonitor/1.0',
        Accept: '*/*',
      },
    });
    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const statusCode = response.status;
    const isHealthy = statusCode >= 200 && statusCode < 400;

    return {
      isHealthy,
      statusCode,
      responseTime,
      error: isHealthy ? undefined : `HTTP Status ${statusCode}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';

    return {
      isHealthy: false,
      statusCode: isTimeout ? 408 : 503,
      responseTime,
      error: isTimeout ? 'Request timed out after 8s' : (err.message || 'Connection unreachable'),
    };
  }
}

export async function handleGithubTest(config: {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}) {
  const gh = new GitHubService(config);
  return await gh.testConnection();
}

export async function handleGithubSync(params: {
  files: GitFileCommit[];
  commitMessage: string;
  config: {
    token: string;
    owner: string;
    repo: string;
    branch?: string;
    authorName?: string;
    authorEmail?: string;
  };
}) {
  const gh = new GitHubService(params.config);
  return await gh.commitFiles(params.files, params.commitMessage);
}

