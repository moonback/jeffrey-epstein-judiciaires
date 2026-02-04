import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/doj': {
          target: 'https://www.justice.gov',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/doj/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Remove X-Frame-Options and CSP to allow iframe embedding
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];

              // Rewrite Location header for redirects to keep using the proxy
              if (proxyRes.headers['location']) {
                proxyRes.headers['location'] = proxyRes.headers['location'].replace('https://www.justice.gov', '/api/doj');
              }
            });
          }
        },
        // Proxy rules for DOJ Drupal assets (scripts, styles, images)
        '/modules': {
          target: 'https://www.justice.gov',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          }
        },
        '/core': {
          target: 'https://www.justice.gov',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          }
        },
        '/themes': {
          target: 'https://www.justice.gov',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          }
        },
        '/sites': {
          target: 'https://www.justice.gov',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          }
        },
        '/d9': {
          target: 'https://www.justice.gov',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          }
        },
        '/files': {
          target: 'https://www.justice.gov',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options'];
              delete proxyRes.headers['content-security-policy'];
            });
          }
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
