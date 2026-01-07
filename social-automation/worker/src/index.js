import { parseRSS, extractPostInfo, fetchOGMetadata } from './rss.js';
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

    if (url.pathname === '/trigger') {
      const dryRun = url.searchParams.get('dry') === 'true';
      try {
        return json(await processNewPosts(env, dryRun));
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    if (url.pathname === '/status') {
      const posted = await env.POSTED_STATE.list();
      return json({ posted: posted.keys.length, keys: posted.keys.map(k => k.name) });
    }

    // Backfill endpoint - mark all current RSS items as posted without actually posting
    if (url.pathname === '/backfill') {
      try {
        const result = await backfillPostedState(env);
        return json(result);
      } catch (err) {
        return json({ error: err.message }, 500);
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
      const message = await generatePostMessage(env.AI, info.title, info.description);

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
