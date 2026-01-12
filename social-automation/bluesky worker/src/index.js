import { parseRSS, extractPostInfo, fetchOGMetadata, fetchFullArticleText } from './rss.js';
import { generatePostMessage } from './llm.js';
import { postToBluesky } from './bluesky.js';

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      processNewPosts(env).catch(err => {
        console.error('Scheduled task failed:', err);
      })
    );
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const auth = request.headers.get('Authorization');
    
    // All endpoints require auth except health
    if (url.pathname === '/health') {
      return json({ status: 'ok', timestamp: new Date().toISOString() });
    }
    
    if (!env.API_SECRET || auth !== `Bearer ${env.API_SECRET}`) {
      return json({ error: 'unauthorized' }, 401);
    }

    // Rate limit authenticated endpoints
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!(await checkRateLimit(env, clientIP))) {
      return json({ error: 'rate limit exceeded', retry_after: 60 }, 429);
    }

    if (url.pathname === '/trigger') {
      const dryRun = url.searchParams.get('dry') === 'true';
      try {
        return json(await processNewPosts(env, dryRun));
      } catch (err) {
        console.error('Trigger error:', err);
        return json({ error: 'Processing failed' }, 500);
      }
    }

    if (url.pathname === '/status') {
      const posted = await env.POSTED_STATE.list();
      // Only return count, not keys (avoid information leakage)
      return json({ posted: posted.keys.length });
    }

    // Backfill endpoint - mark all current RSS items as posted without actually posting
    if (url.pathname === '/backfill') {
      try {
        const result = await backfillPostedState(env);
        return json(result);
      } catch (err) {
        console.error('Backfill error:', err);
        return json({ error: 'Backfill failed' }, 500);
      }
    }

    // Test endpoint - post a specific URL directly
    if (url.pathname === '/test') {
      const testUrl = url.searchParams.get('url');
      if (!testUrl) {
        return json({ error: 'url parameter required' }, 400);
      }
      try {
        const result = await postSingleUrl(env, testUrl);
        return json(result);
      } catch (err) {
        console.error('Test post error:', err);
        return json({ error: 'Post failed' }, 500);
      }
    }

    return json({ error: 'not found' }, 404);
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { 
    status, 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    } 
  });
}

/**
 * Simple rate limiter using KV - allows 10 requests per minute per IP
 * Uses sliding window algorithm for more accurate rate limiting
 */
async function checkRateLimit(env, ip) {
  // Sanitize IP to prevent KV key injection
  const sanitizedIp = ip.replace(/[^a-zA-Z0-9.:]/g, '').substring(0, 45);
  const key = `ratelimit:${sanitizedIp}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;
  
  try {
    const data = await env.POSTED_STATE.get(key, 'json');
    const requests = data?.requests || [];
    
    // Filter to requests within the window
    const recentRequests = requests.filter(ts => now - ts < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limited
    }
    
    // Add current request and store
    recentRequests.push(now);
    await env.POSTED_STATE.put(key, JSON.stringify({ requests: recentRequests }), {
      expirationTtl: 120 // Expire after 2 minutes
    });
    
    return true;
  } catch (e) {
    console.warn('Rate limit check failed:', e);
    return true; // Fail open to avoid blocking legitimate requests
  }
}

/**
 * Backfill KV state with all current RSS items to prevent re-posting
 */
async function backfillPostedState(env) {
  const results = { marked: [], skipped: 0, errors: [] };

  const rssResponse = await fetch(env.RSS_URL, {
    headers: { 'User-Agent': 'SocialPoster/1.0' }
  });
  if (!rssResponse.ok) throw new Error(`RSS fetch failed: ${rssResponse.status}`);
  
  const rssText = await rssResponse.text();
  const posts = parseRSS(rssText);

  for (const post of posts) {
    const info = extractPostInfo(post);
    if (!info.link) continue;
    
    const id = info.link.match(/\/posts\/([^\/]+)\/?$/)?.[1] || 
               info.link.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').substring(0, 100);

    // Skip if already marked
    if (await env.POSTED_STATE.get(id)) {
      results.skipped++;
      continue;
    }

    try {
      await env.POSTED_STATE.put(id, JSON.stringify({ 
        title: info.title, 
        backfilled: true, 
        at: new Date().toISOString() 
      }));
      results.marked.push({ id, title: info.title });
    } catch (e) {
      results.errors.push({ id, error: e.message });
    }
  }

  return results;
}

async function processNewPosts(env, dryRun = false) {
  const results = { posted: [], skipped: 0, errors: [] };

  // Validate required environment variables
  if (!env.RSS_URL) {
    throw new Error('RSS_URL environment variable not configured');
  }

  // Validate RSS_URL is a valid URL with http/https
  let rssUrl;
  try {
    rssUrl = new URL(env.RSS_URL);
  } catch (e) {
    throw new Error('RSS_URL must be a valid URL');
  }
  if (rssUrl.protocol !== 'http:' && rssUrl.protocol !== 'https:') {
    throw new Error('RSS_URL must use http or https protocol');
  }
  
  // Security: Only allow fetching from trusted domains
  const trustedDomains = ['philippdubach.com', 'www.philippdubach.com'];
  if (!trustedDomains.includes(rssUrl.hostname)) {
    throw new Error('RSS_URL must be from a trusted domain');
  }

  const rssResponse = await fetch(rssUrl.toString(), {
    headers: { 'User-Agent': 'SocialPoster/1.0' }
  });
  if (!rssResponse.ok) throw new Error(`RSS fetch failed: ${rssResponse.status}`);
  
  const rssText = await rssResponse.text();
  if (!rssText || rssText.length < 50) {
    throw new Error('RSS response is empty or too short');
  }
  
  const posts = parseRSS(rssText);
  if (!Array.isArray(posts)) {
    throw new Error('Failed to parse RSS feed');
  }
  if (posts.length === 0) {
    console.warn(`RSS feed at ${env.RSS_URL} is valid but contains no items`);
    return results;
  }

  // Only process posts from the last 7 days to avoid re-posting old content
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  for (const post of posts) {
    const info = extractPostInfo(post);
    
    // Validate extracted info
    if (!info.link || !info.title) {
      results.errors.push({ error: 'Missing link or title', post: post.guid || 'unknown' });
      continue;
    }
    
    // Skip posts older than cutoff date
    if (info.pubDate && info.pubDate < cutoffDate) {
      results.skipped++;
      continue;
    }
    
    // Sanitize and create safe ID
    const id = info.link.match(/\/posts\/([^\/]+)\/?$/)?.[1] || 
               info.link.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').substring(0, 100);

    if (await env.POSTED_STATE.get(id)) {
      results.skipped++;
      continue;
    }

    try {
      const og = await fetchOGMetadata(info.link);
      info.image = og.image;
      info.ogDescription = og.description || info.description;
      
      // Fetch full article text for better LLM context
      const fullText = await fetchFullArticleText(info.link);
      const message = await generatePostMessage(env.AI, info.title, info.description, fullText);

      if (dryRun) {
        results.posted.push({ id, title: info.title, message, image: info.image, description: info.ogDescription });
        continue;
      }

      if (!env.BLUESKY_HANDLE || !env.BLUESKY_APP_PASSWORD) {
        throw new Error('BLUESKY_HANDLE and BLUESKY_APP_PASSWORD secrets are required');
      }
      const bsky = await postToBluesky(env.BLUESKY_HANDLE, env.BLUESKY_APP_PASSWORD, message, info.link, info.image, info.title, info.ogDescription);
      await env.POSTED_STATE.put(id, JSON.stringify({ title: info.title, uri: bsky.uri, at: new Date().toISOString() }));
      results.posted.push({ id, title: info.title, uri: bsky.uri });
    } catch (e) {
      results.errors.push({ id, error: e.message });
    }
  }

  return results;
}

/**
 * Post a single URL directly (for testing)
 */
async function postSingleUrl(env, url) {
  // Fetch page metadata
  const response = await fetch(url, { headers: { 'User-Agent': 'SocialPoster/1.0' } });
  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
  
  const html = await response.text();
  
  // Extract title from og:title or <title>
  let title = 'New Post';
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (ogTitleMatch) {
    title = ogTitleMatch[1];
  } else {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) title = titleMatch[1];
  }
  
  // Fetch OG metadata for image
  const og = await fetchOGMetadata(url);
  
  // Fetch full article text
  const fullText = await fetchFullArticleText(url);
  
  // Generate message with LLM
  const message = await generatePostMessage(env.AI, title, '', fullText);
  
  // Validate credentials
  if (!env.BLUESKY_HANDLE || !env.BLUESKY_APP_PASSWORD) {
    throw new Error('BLUESKY_HANDLE and BLUESKY_APP_PASSWORD secrets are required');
  }
  
  const bsky = await postToBluesky(
    env.BLUESKY_HANDLE, 
    env.BLUESKY_APP_PASSWORD, 
    message, 
    url, 
    og.image, 
    title, 
    og.description || ''
  );
  
  return {
    success: true,
    title,
    message,
    uri: bsky.uri,
    fullTextLength: fullText.length,
  };
}
