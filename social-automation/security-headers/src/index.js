/**
 * Security Headers Worker
 * - Adds HTTP security headers to all responses from philippdubach.com.
 * - Performs Accept-aware URL rewriting for Markdown content negotiation.
 * - Emits RFC 8288 Link headers advertising machine-readable endpoints.
 *
 * Reference copy in static/_headers is documentation only — GitHub Pages
 * does not process it. This Worker is the source of truth for response
 * headers on philippdubach.com.
 */

import { wantsMarkdown } from "./accept.js";
import { buildLinkHeader, isContentPath } from "./links.js";
import { cacheKeyFor } from "./cache.js";

const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://gc.zgo.at https://cdn.jsdelivr.net https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://static.philippdubach.com https://imagedelivery.net; " +
    "font-src 'self' data: https://cdn.jsdelivr.net https://fonts.gstatic.com; " +
    "connect-src 'self' https://stats.philippdubach.com https://weekly-top-goatcounter-api.philippd.workers.dev https://newsletter-api.philippd.workers.dev https://gc.zgo.at https://cdn.jsdelivr.net https://cloudflareinsights.com; " +
    "object-src 'none'; " +
    "worker-src 'self'; " +
    "manifest-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://newsletter-api.philippd.workers.dev; " +
    "upgrade-insecure-requests;",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=(), unload=()",
  "Cross-Origin-Embedder-Policy": "credentialless",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-XSS-Protection": "0",
};

const estimateTokens = (body) => Math.ceil(body.length / 4);

// Path rewrites:
// - /.well-known/api-catalog and /api-catalog → /api-catalog.json on origin
// - HTML content paths with Accept: text/markdown → append index.md
const rewriteOriginPath = (url, wantsMd) => {
  const path = url.pathname;

  if (path === "/.well-known/api-catalog" || path === "/api-catalog") {
    return "/api-catalog.json";
  }

  if (wantsMd && isContentPath(path)) {
    return path.endsWith("/") ? `${path}index.md` : `${path}/index.md`;
  }

  return null; // no rewrite
};

const fetchOrigin = async (request, originUrl) => {
  const originRequest = new Request(originUrl, {
    method: request.method,
    headers: request.headers,
  });
  return fetch(originRequest);
};

const decorate = async (response, { url, wantsMd, isCatalog }) => {
  const newResponse = new Response(response.body, response);

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    newResponse.headers.set(k, v);
  }

  newResponse.headers.set("Link", buildLinkHeader(url.pathname));

  if (wantsMd) {
    const body = await newResponse.clone().text();
    newResponse.headers.set("Content-Type", "text/markdown; charset=utf-8");
    newResponse.headers.set("x-markdown-tokens", String(estimateTokens(body)));
    newResponse.headers.set("Vary", "Accept");
  }

  if (isCatalog) {
    newResponse.headers.set("Content-Type", "application/linkset+json");
  }

  return newResponse;
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const wantsMd = wantsMarkdown(request);
    const isCatalog =
      url.pathname === "/.well-known/api-catalog" || url.pathname === "/api-catalog";

    const cache = caches.default;
    const cacheKey = cacheKeyFor(request, wantsMd);

    const cached = await cache.match(cacheKey);
    if (cached) {
      // Cached response already carries our headers. Just return it.
      return cached;
    }

    const rewritePath = rewriteOriginPath(url, wantsMd);
    let originUrl = url.toString();
    if (rewritePath) {
      const u = new URL(url.toString());
      u.pathname = rewritePath;
      originUrl = u.toString();
    }

    const originResponse = await fetchOrigin(request, originUrl);
    const decorated = await decorate(originResponse, { url, wantsMd, isCatalog });

    // Only cache successful, cacheable responses.
    if (decorated.ok && request.method === "GET") {
      await cache.put(cacheKey, decorated.clone());
    }

    return decorated;
  },
};
