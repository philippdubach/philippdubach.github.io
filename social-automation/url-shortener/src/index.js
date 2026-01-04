/**
 * YOURLS URL Shortener Proxy
 * 
 * This Cloudflare Worker proxies requests to YOURLS API with authentication,
 * allowing client-side JavaScript to create short URLs without exposing credentials.
 * 
 * Endpoints:
 *   GET /shorten?url=<url> - Create or retrieve short URL
 *   GET /health - Health check
 * 
 * Required secrets (set via `wrangler secret put`):
 *   YOURLS_SIGNATURE - Your YOURLS API signature token
 * 
 * Environment variables (set in wrangler.toml):
 *   YOURLS_API_URL - YOURLS API endpoint
 *   ALLOWED_ORIGINS - Comma-separated allowed origins for CORS
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/shorten/health') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }
    
    // Only handle /shorten endpoint
    if (url.pathname !== '/shorten' && url.pathname !== '/shorten/') {
      return jsonResponse({ error: 'Not found', endpoint: '/shorten?url=<url>' }, 404);
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env);
    }
    
    // Only allow GET requests
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405, getCORSHeaders(request, env));
    }
    
    // Validate origin
    const origin = request.headers.get('Origin');
    if (origin && !isAllowedOrigin(origin, env)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403);
    }
    
    // Get URL to shorten
    const urlToShorten = url.searchParams.get('url');
    if (!urlToShorten) {
      return jsonResponse(
        { error: 'Missing url parameter', usage: '/shorten?url=<url_to_shorten>' },
        400,
        getCORSHeaders(request, env)
      );
    }
    
    // Validate URL format
    try {
      const parsed = new URL(urlToShorten);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch (e) {
      return jsonResponse(
        { error: 'Invalid URL format' },
        400,
        getCORSHeaders(request, env)
      );
    }
    
    // Check for required secret
    if (!env.YOURLS_SIGNATURE) {
      console.error('YOURLS_SIGNATURE secret not configured');
      return jsonResponse(
        { error: 'Service not configured' },
        500,
        getCORSHeaders(request, env)
      );
    }
    
    try {
      // Call YOURLS API with signature authentication
      const apiUrl = new URL(env.YOURLS_API_URL || 'https://pdub.click/yourls-api.php');
      apiUrl.searchParams.set('signature', env.YOURLS_SIGNATURE);
      apiUrl.searchParams.set('action', 'shorturl');
      apiUrl.searchParams.set('format', 'json');
      apiUrl.searchParams.set('url', urlToShorten);
      
      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'YOURLS-Shortener-Proxy/1.0',
        },
      });
      
      if (!response.ok) {
        console.error('YOURLS API error:', response.status, await response.text());
        return jsonResponse(
          { error: 'Upstream API error', status: response.status },
          502,
          getCORSHeaders(request, env)
        );
      }
      
      const data = await response.json();
      
      // YOURLS returns different responses for new vs existing URLs
      // status: "success" for new, status: "fail" with code "error:url" for existing
      if (data.status === 'success' || (data.status === 'fail' && data.code === 'error:url')) {
        // Return only necessary fields (don't expose internal details)
        return jsonResponse(
          {
            status: 'success',
            shorturl: data.shorturl,
            url: data.url?.url || urlToShorten,
            title: data.title || data.url?.title || '',
            isNew: data.status === 'success',
          },
          200,
          getCORSHeaders(request, env)
        );
      }
      
      // Handle other YOURLS errors
      console.error('YOURLS API returned error:', data);
      return jsonResponse(
        { error: data.message || 'URL shortening failed', code: data.code },
        400,
        getCORSHeaders(request, env)
      );
      
    } catch (error) {
      console.error('Proxy error:', error);
      return jsonResponse(
        { error: 'Service temporarily unavailable' },
        503,
        getCORSHeaders(request, env)
      );
    }
  },
};

/**
 * Create JSON response with proper headers
 */
function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...additionalHeaders,
    },
  });
}

/**
 * Get CORS headers for response
 */
function getCORSHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = isAllowedOrigin(origin, env) ? origin : '';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle CORS preflight requests
 */
function handleCORS(request, env) {
  const origin = request.headers.get('Origin');
  
  if (!isAllowedOrigin(origin, env)) {
    return new Response(null, { status: 403 });
  }
  
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders(request, env),
  });
}

/**
 * Check if origin is in allowed list
 */
function isAllowedOrigin(origin, env) {
  if (!origin) return true; // Allow non-browser requests
  
  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim().toLowerCase());
  
  return allowedOrigins.includes(origin.toLowerCase());
}
