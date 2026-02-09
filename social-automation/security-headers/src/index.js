/**
 * Security Headers Worker
 * Adds HTTP security headers to all responses from philippdubach.com.
 * GitHub Pages doesn't process _headers files — this Worker fills that gap.
 *
 * Synced with static/_headers — keep both in sync when updating.
 */

const SECURITY_HEADERS = {
  // CSP with frame-ancestors (only works via HTTP header, not <meta>)
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://gc.zgo.at https://static.zgo.at https://cdn.jsdelivr.net https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://static.philippdubach.com https://imagedelivery.net; " +
    "font-src 'self' data: https://cdn.jsdelivr.net https://fonts.gstatic.com; " +
    "connect-src 'self' https://philippdubach.goatcounter.com https://weekly-top-goatcounter-api.philippd.workers.dev https://newsletter-api.philippd.workers.dev https://gc.zgo.at https://static.zgo.at https://cdn.jsdelivr.net https://cloudflareinsights.com; " +
    "object-src 'none'; " +
    "worker-src 'self'; " +
    "manifest-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://newsletter-api.philippd.workers.dev; " +
    'upgrade-insecure-requests;',

  // HSTS — 2 years, preload ready
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Prevent clickjacking (redundant with CSP frame-ancestors but needed for older browsers)
  'X-Frame-Options': 'DENY',

  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy — disable unused browser features, enable bfcache
  'Permissions-Policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=(), unload=()',

  // Cross-origin isolation
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin',

  // Disable XSS auditor (deprecated, can cause issues)
  'X-XSS-Protection': '0',
};

export default {
  async fetch(request) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);

    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      newResponse.headers.set(header, value);
    }

    return newResponse;
  },
};
