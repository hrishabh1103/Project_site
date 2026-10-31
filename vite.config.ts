import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleHealthCheck, handleGithubTest, handleGithubSync } from './src/server/api-handlers';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'projectvault-api-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/')) {
            return next();
          }

          const parseBody = (): Promise<any> => {
            return new Promise((resolve) => {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  resolve(body ? JSON.parse(body) : {});
                } catch {
                  resolve({});
                }
              });
            });
          };

          res.setHeader('Content-Type', 'application/json');

          try {
            if (req.url === '/api/health-check' && req.method === 'POST') {
              const body = await parseBody();
              const result = await handleHealthCheck(body.url);
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/github/test' && req.method === 'POST') {
              const body = await parseBody();
              const serverToken = process.env.GITHUB_TOKEN || process.env.PROJECTVAULT_GITHUB_TOKEN;
              const config = {
                ...body.config,
                token: body.config?.token || serverToken,
              };
              const result = await handleGithubTest(config);
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/github/sync' && req.method === 'POST') {
              const body = await parseBody();
              const serverToken = process.env.GITHUB_TOKEN || process.env.PROJECTVAULT_GITHUB_TOKEN;
              const config = {
                ...body.config,
                token: body.config?.token || serverToken,
              };
              const result = await handleGithubSync({
                files: body.files,
                commitMessage: body.commitMessage,
                config,
              });
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/github/config' && req.method === 'GET') {
              const hasServerToken = Boolean(process.env.GITHUB_TOKEN || process.env.PROJECTVAULT_GITHUB_TOKEN);
              res.end(
                JSON.stringify({
                  hasServerToken,
                  defaultOwner: process.env.GITHUB_OWNER || 'hrishabhgupt',
                  defaultRepo: process.env.GITHUB_REPO || 'my-live-projects',
                  defaultBranch: process.env.GITHUB_BRANCH || 'main',
                })
              );
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'API route not found' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'remark-gfm'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
