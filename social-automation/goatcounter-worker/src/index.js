/**
 * GoatCounter Weekly Top Posts API
 *
 * Returns the most-read blog posts from the past 7 days.
 * Filters to only include /posts/* paths (actual blog posts).
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      const hits = await fetchTopPosts(env);

      return new Response(JSON.stringify({
        hits: hits,
        total: hits.reduce((sum, h) => sum + (h.count || 0), 0),
        more: false
      }), {
        headers: corsHeaders()
      });
    } catch (error) {
      console.error('Error fetching GoatCounter stats:', error);
      return new Response(JSON.stringify({
        error: 'Failed to fetch stats',
        hits: [],
        total: 0
      }), {
        status: 500,
        headers: corsHeaders()
      });
    }
  }
};

/**
 * Fetch top posts from GoatCounter API
 */
async function fetchTopPosts(env) {
  const GOATCOUNTER_SITE = 'philippdubach';
  const API_TOKEN = env.GOATCOUNTER_API_TOKEN;

  if (!API_TOKEN) {
    throw new Error('GOATCOUNTER_API_TOKEN not configured');
  }

  // Calculate date range: last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  // Fetch from GoatCounter API
  const url = `https://${GOATCOUNTER_SITE}.goatcounter.com/api/v0/stats/hits?start=${startDate}&end=${endDate}&limit=100`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GoatCounter API error: ${response.status} - ${text}`);
  }

  const data = await response.json();

  // Paths to exclude (navigation pages)
  const excludePaths = new Set([
    '/',
    '/blog/',
    '/projects/',
    '/research/',
    '/about/',
    '/subscribe/',
    '/subscribe',
    '/notes/'
  ]);

  // Filter to only blog posts (/posts/*) and exclude navigation
  const blogPosts = (data.hits || []).filter(hit => {
    const path = hit.path;
    if (!path) return false;

    // Must have a valid title (GoatCounter sometimes returns empty titles)
    if (!hit.title || hit.title.trim() === '') return false;

    // Must be a blog post
    if (!path.startsWith('/posts/')) return false;

    // Exclude navigation pages (shouldn't match anyway, but belt & suspenders)
    if (excludePaths.has(path)) return false;

    // Exclude the posts listing page itself
    if (path === '/posts/' || path === '/posts') return false;

    return true;
  });

  // Sort by count descending
  blogPosts.sort((a, b) => (b.count || 0) - (a.count || 0));

  // Return top 10
  return blogPosts.slice(0, 10);
}

/**
 * CORS headers for cross-origin requests
 */
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://philippdubach.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=3600'  // Cache for 1 hour
  };
}
