import { handleHealthCheck, handleGithubTest, handleGithubSync } from './server/api-handlers';

export interface Env {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

export default {
  async fetch(request: Request, env: Env, _ctx?: any): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Health check endpoint
    if (url.pathname === '/api/health-check' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const result = await handleHealthCheck(body.url);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. GitHub test connection endpoint
    if (url.pathname === '/api/github/test' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const config = {
          ...body.config,
          token: env.GITHUB_TOKEN || body.config?.token,
        };
        const result = await handleGithubTest(config);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. GitHub multi-file sync endpoint
    if (url.pathname === '/api/github/sync' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const config = {
          ...body.config,
          token: env.GITHUB_TOKEN || body.config?.token,
        };
        const result = await handleGithubSync({
          files: body.files,
          commitMessage: body.commitMessage,
          config,
        });
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 4. GitHub safe config endpoint
    if (url.pathname === '/api/github/config' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          hasServerToken: Boolean(env.GITHUB_TOKEN),
          defaultOwner: env.GITHUB_OWNER || 'hrishabhgupt',
          defaultRepo: env.GITHUB_REPO || 'my-live-projects',
          defaultBranch: env.GITHUB_BRANCH || 'main',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Fallback to Cloudflare Static Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },

  // Cloudflare Scheduled Cron Handler for periodic deployment health checks
  async scheduled(event: any, _env: Env, _ctx?: any): Promise<void> {
    console.log(`[ProjectVault Cron] Health check cycle triggered at ${new Date(event.scheduledTime).toISOString()}`);
  },
};
