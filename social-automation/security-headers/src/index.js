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
import {
  buildLinkHeader,
  isContentPath,
  isMachineReadablePath,
  isMarkdownPath,
} from "./links.js";
import { cacheKeyFor, canReadCache, canWriteCache } from "./cache.js";
import { resolveRedirect, buildRedirectResponse } from "./redirects.js";

const SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; " +
    // Inline scripts are hash-allowlisted (theme snippet + MathJax config);
    // re-hash via scripts/check-build.mjs guidance when either changes.
    "script-src 'self' 'sha256-RBavWsCHzy8pY5yYq+Fcr1YOGBQ8N1wO2ojltcQWRPQ=' 'sha256-i4Wj54cu/w/KZy91/+HVWZ9VsbDh+5DeAX0Lt5u+DCQ=' 'sha256-4qVeyGJe9myWelMbNnOnhUsPBgSyDNusLjIA/+DdyA0=' https://cdn.jsdelivr.net https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://static.philippdubach.com https://imagedelivery.net; " +
    "media-src 'self' https://static.philippdubach.com; " +
    "font-src 'self' data: https://cdn.jsdelivr.net; " +
    "connect-src 'self' https://stats.philippdubach.com https://weekly-top-goatcounter-api.philippd.workers.dev https://newsletter-api.philippd.workers.dev https://cdn.jsdelivr.net https://cloudflareinsights.com; " +
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
  // Experimental Cloudflare compatibility signal. The originating IETF draft
  // expired in April 2026; this is an explicit permissive preference, not a
  // finalized standard, crawler instruction, or licensing substitute.
  "Content-Signal": "search=yes, ai-input=yes, ai-train=yes",
};

const logFailure = (operation, error) => console.error(JSON.stringify({
  message: "security_worker_failure", operation,
  error: error instanceof Error ? error.name : "UnknownError",
}));

// Token counts are a convenience, not a reason to buffer unbounded content.
// Count normal article exports incrementally and omit the estimate if an
// unexpected origin payload exceeds the per-article budget.
const estimateTokens = async (response) => {
  if (!response.body) return null;
  const reader = response.clone().body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let characters = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return Math.ceil((characters + decoder.decode().length) / 4);
      bytes += value.byteLength;
      if (bytes > 512 * 1024) {
        // A tee branch's cancellation waits for the response branch too.
        // Do not await it before returning that response to the client.
        void reader.cancel().catch(() => {});
        return null;
      }
      characters += decoder.decode(value, { stream: true }).length;
    }
  } catch (error) {
    logFailure("markdown_estimate", error);
    return null;
  } finally {
    reader.releaseLock();
  }
};

const forRequest = (response, request) =>
  request.method === "HEAD" ? new Response(null, response) : response;

const validIndexNowKey = (key) =>
  typeof key === "string" && /^[A-Za-z0-9-]{8,128}$/.test(key);

export const buildPreviewHostRedirect = (url) => {
  if (url.hostname !== "new.philippdubach.com") return null;

  const destination = new URL("https://philippdubach.com/");
  destination.pathname = url.pathname;
  destination.search = url.search;

  const response = new Response(null, {
    status: 301,
    headers: {
      Location: destination.toString(),
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex, follow",
    },
  });
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
};

export const buildIndexNowKeyResponse = (request, url, env) => {
  const key = env?.INDEXNOW_KEY;
  if (!validIndexNowKey(key) || url.pathname !== `/${key}.txt`) return null;
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const response = new Response(request.method === "HEAD" ? null : key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
};

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
  // redirect: 'manual' so origin 3xx (e.g. Caddy `redir /old /new 301`)
  // pass through to the client instead of being silently followed and
  // served as 200 with the target's body.
  // Request as the init object preserves method, headers and streaming body.
  const originRequest = new Request(originUrl, request);
  return fetch(new Request(originRequest, { redirect: "manual" }), {
    // The origin CDN cache is separate from our synthetic Cache API. Exclude
    // errors before storage there, too; final response no-store is too late.
    cf: { cacheTtlByStatus: { "400-599": -1 } },
  });
};

export const decorate = async (response, { url, servedMarkdown, isCatalog }) => {
  const newResponse = new Response(response.body, response);

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    newResponse.headers.set(k, v);
  }

  // Self-hosted font assets: 1-year immutable cache + CORS for cross-subdomain
  // <link rel="preload" crossorigin>. Files in /fonts/ are content-stable
  // (rename on re-subset).
  if (url.pathname.startsWith("/fonts/") && (newResponse.ok || newResponse.status === 304)) {
    newResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
  }

  // Caddy does not recognize the .webmanifest extension and otherwise serves
  // the application manifest as text/plain. Keep the standards-defined MIME
  // type at the edge, where production response headers are authoritative.
  if (url.pathname === "/icons/site.webmanifest" && newResponse.ok) {
    newResponse.headers.set("Content-Type", "application/manifest+json; charset=utf-8");
  }

  // A missing content page may resemble a negotiable route syntactically,
  // but must not advertise a nonexistent Markdown alternate or canonical.
  newResponse.headers.set("Link", buildLinkHeader(url.pathname, {
    includePageRelations: newResponse.ok,
  }));

  // Feeds, APIs, discovery files, and Markdown alternates are useful crawler
  // inputs but should not compete with their canonical HTML pages in search.
  if (isMachineReadablePath(url.pathname)) {
    newResponse.headers.set("X-Robots-Tag", "noindex, follow");
  }

  // Error documents must never enter the index, even when an origin-generated
  // 404 page contains otherwise complete site metadata.
  if (newResponse.status >= 400) {
    newResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
    newResponse.headers.set("Cache-Control", "no-store");
  }

  // Vary on every content-negotiable response so downstream caches (browser,
  // corporate proxies) know HTML and Markdown variants differ. The CF edge
  // cache uses the synthetic _v key in cacheKeyFor for the same purpose.
  if (isContentPath(url.pathname)) {
    const vary = (newResponse.headers.get("Vary") || "").split(",")
      .map((name) => name.trim()).filter(Boolean);
    if (!vary.some((name) => name === "*" || name.toLowerCase() === "accept")) {
      vary.push("Accept");
    }
    newResponse.headers.set("Vary", vary.join(", "));
  }

  // Catalog and markdown branches are mutually exclusive: the catalog has
  // its own dedicated path and content-type, regardless of what the client's
  // Accept header asked for. The wantsMd branch additionally guards on
  // newResponse.ok so we don't stamp text/markdown on 4xx/5xx bodies if a
  // path slips past isContentPath without having an .md variant on origin.
  if (isCatalog && (newResponse.ok || newResponse.status === 304)) {
    newResponse.headers.set("Content-Type", "application/linkset+json");
  } else if (servedMarkdown && newResponse.ok) {
    newResponse.headers.set("Content-Type", "text/markdown; charset=utf-8");
    const tokens = await estimateTokens(newResponse);
    if (tokens !== null) newResponse.headers.set("x-markdown-tokens", String(tokens));
  }

  return newResponse;
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // The retired editorial preview now has one purpose: permanently forward
    // every path and query to the corresponding canonical production URL.
    // Handle this before cache lookup or origin access so the old Pages site
    // can be deleted without leaving a dependency behind.
    const previewRedirect = buildPreviewHostRedirect(url);
    if (previewRedirect) return previewRedirect;

    // IndexNow requires the submitted key to be publicly retrievable from the
    // apex host. The primary Hetzner build cannot materialize GitHub Actions
    // secrets, so the edge serves this intentionally public verification file.
    const indexNowKeyResponse = buildIndexNowKeyResponse(request, url, env);
    if (indexNowKeyResponse) return indexNowKeyResponse;

    // Legacy URL redirects (slug renames, deleted posts, Substack-era date-prefix
    // paths, /page/N pagination, old taxonomy aliases). Evaluated before cache
    // lookup so that a stale cached origin response can't shadow a redirect.
    // Apply to GET and HEAD — search engines and browsers issue HEAD before
    // following links, and 301/410 responses are valid for both methods.
    if (request.method === "GET" || request.method === "HEAD") {
      const redirect = resolveRedirect(url.pathname);
      if (redirect) {
        // Redirects and 410s carry the security headers too — HSTS in
        // particular must appear on every response for preload consistency.
        const redirectResponse = buildRedirectResponse(redirect);
        for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
          redirectResponse.headers.set(k, v);
        }
        if (redirect.status === 410) {
          redirectResponse.headers.set("X-Robots-Tag", "noindex, follow");
        }
        return forRequest(redirectResponse, request);
      }
    }

    const safeMethod = request.method === "GET" || request.method === "HEAD";
    const wantsMd = safeMethod && wantsMarkdown(request);
    const isCatalog =
      url.pathname === "/.well-known/api-catalog" || url.pathname === "/api-catalog" ||
      url.pathname === "/api-catalog.json";

    const cache = caches.default;
    const cacheKey = cacheKeyFor(request, wantsMd);

    if (canReadCache(request)) {
      try {
        const cached = await cache.match(cacheKey);
        if (cached) return forRequest(cached, request);
      } catch (error) {
        // Cache outages must not discard the origin response or its headers.
        logFailure("cache_read", error);
      }
    }

    const rewritePath = safeMethod ? rewriteOriginPath(url, wantsMd) : null;
    const servedMarkdown = isMarkdownPath(url.pathname) ||
      (Boolean(rewritePath) && rewritePath.endsWith(".md"));
    let originUrl = url.toString();
    if (rewritePath) {
      const u = new URL(url.toString());
      u.pathname = rewritePath;
      originUrl = u.toString();
    }

    let originResponse;
    try {
      originResponse = await fetchOrigin(request, originUrl);
    } catch (error) {
      logFailure("origin_fetch", error);
      originResponse = new Response("The site is temporarily unavailable. Please try again shortly.\n", {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" },
      });
    }
    const decorated = await decorate(originResponse, { url, servedMarkdown, isCatalog });

    // Cache stores the fully-decorated response. Header changes (CSP,
    // Permissions-Policy, Link) only propagate after entries expire or are
    // purged — pair such changes with `wrangler deploy` plus a CF cache
    // purge to avoid serving stale headers.
    if (canWriteCache(request, decorated)) {
      const write = (async () => {
        try {
          await cache.put(cacheKey, decorated.clone());
        } catch (error) {
          logFailure("cache_write", error);
        }
      })();
      if (ctx?.waitUntil) ctx.waitUntil(write);
      else await write;
    }

    return forRequest(decorated, request);
  },
};
