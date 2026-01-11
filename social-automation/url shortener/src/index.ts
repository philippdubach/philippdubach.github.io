// Main Worker entry point

import type { Env } from './types';
import { APP_CONSTANTS } from './types';
import { handleRedirect } from './handlers/redirect';
import { handleApi } from './handlers/api';
import { handleLogin, handleLogout, verifySession } from './auth';
import { RESERVED_PATHS, errorResponse } from './utils';

// Import dashboard HTML (embedded for single-worker deployment)
import { getDashboardHtml } from './dashboard-html';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Handle favicon - redirect to main site favicon
      if (path === '/favicon.ico') {
        return Response.redirect(`${APP_CONSTANTS.MAIN_SITE}/favicon.ico`, 301);
      }

      // Handle robots.txt - prevent indexing of all short URLs
      if (path === '/robots.txt') {
        const robotsTxt = `# pdub.click URL Shortener - Do not index
User-agent: *
Disallow: /

# Block all known AI/search crawlers explicitly
User-agent: Googlebot
Disallow: /

User-agent: Bingbot
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Bytespider
Disallow: /
`;
        return new Response(robotsTxt, { 
          headers: { 
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400',
            'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
          } 
        });
      }

      // Health check endpoint (no auth required)
      if (path === '/health' || path === '/status') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Auth endpoints
      if (path === '/api/auth/login') {
        return handleLogin(request, env);
      }
      if (path === '/api/auth/logout') {
        return handleLogout();
      }
      if (path === '/api/auth/check') {
        const isAuth = await verifySession(request, env);
        return new Response(JSON.stringify({ authenticated: isAuth }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // API routes
      if (path.startsWith('/api/')) {
        const apiPath = path.slice(5); // Remove '/api/'
        return handleApi(request, env, apiPath);
      }

      // Dashboard route - add security headers (noindex to prevent search engine indexing)
      if (path === '/admin' || path === '/admin/' || path.startsWith('/admin/')) {
        return new Response(getDashboardHtml(), {
          headers: { 
            'Content-Type': 'text/html',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          },
        });
      }

      // Root path - redirect to main site
      if (path === '/' || path === '') {
        return Response.redirect(APP_CONSTANTS.MAIN_SITE, 302);
      }

      // Short code redirect
      const shortCode = path.slice(1); // Remove leading '/'
      
      // Check if it's a reserved path
      if (RESERVED_PATHS.includes(shortCode.toLowerCase() as typeof RESERVED_PATHS[number])) {
        return Response.redirect(APP_CONSTANTS.MAIN_SITE, 302);
      }

      // Handle the redirect - returns 404 redirect if not found
      return handleRedirect(request, env, ctx, shortCode);
    } catch (error) {
      console.error('Worker error:', error);
      // On any error, redirect to main site
      return Response.redirect(APP_CONSTANTS.MAIN_SITE, 302);
    }
  },
};
