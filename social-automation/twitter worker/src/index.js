import { parseRSS, extractPostInfo, fetchArticleData } from '@social/shared/rss';
import { timingSafeEqual } from '@social/shared/auth';
import { checkRateLimit } from '@social/shared/rate-limit';
import { generate } from '@social/shared/generator';
import { pick } from '@social/shared/scorer';
import { postToTwitter } from './twitter.js';

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
    
    const expectedAuth = `Bearer ${env.API_SECRET || ''}`;
    if (!env.API_SECRET || !auth || !timingSafeEqual(auth, expectedAuth)) {
      return json({ error: 'unauthorized' }, 401);
    }

    // Rate limit authenticated endpoints
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!(await checkRateLimit(env.POSTED_STATE, clientIP))) {
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

      // Validate URL is from trusted domain (prevent SSRF)
      try {
        const parsedUrl = new URL(testUrl);
        const trustedDomains = ['philippdubach.com', 'www.philippdubach.com'];
        if (!trustedDomains.includes(parsedUrl.hostname)) {
          return json({ error: 'URL must be from trusted domain' }, 400);
        }
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return json({ error: 'URL must use http or https protocol' }, 400);
        }
      } catch {
        return json({ error: 'Invalid URL format' }, 400);
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
 * Backfill KV state with all current RSS items to prevent re-posting
 */
async function backfillPostedState(env) {
  const results = { marked: [], skipped: 0, errors: [] };

  const rssResponse = await fetch(env.RSS_URL, {
    headers: { 'User-Agent': 'TwitterPoster/1.0' }
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
    headers: { 'User-Agent': 'TwitterPoster/1.0' }
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

    // Cron overlap guard: if another tick is already processing this post,
    // skip. Lock TTL (60s) is shorter than cron interval (15min) so a
    // crashed run can't deadlock subsequent ticks.
    const lockKey = `lock:${id}`;
    if (await env.POSTED_STATE.get(lockKey)) {
      results.skipped++;
      continue;
    }
    if (!dryRun) {
      await env.POSTED_STATE.put(lockKey, '1', { expirationTtl: 60 });
    }

    try {
      // Fetch full article text and takeaways for LLM context
      const articleData = await fetchArticleData(info.link);

      // Generate tweet text via two-model generator + scorer
      const candidates = await generate(env.AI, {
        articleData: {
          title: info.title,
          description: info.description,
          takeaways: Array.isArray(articleData.takeaways)
            ? articleData.takeaways
            : (articleData.takeaways ? articleData.takeaways.split('\n').filter(Boolean) : []),
          bodyExcerpt: (articleData.text || '').substring(0, 1500),
        },
        recentPosts: [],
        maxLength: 257,
      });
      const winner = pick(candidates, [], { maxLength: 257 });
      if (!winner) {
        results.errors.push({ id, error: 'all candidates rejected by scorer' });
        continue;
      }
      const message = winner.message;

      // Twitter free tier: 280 chars total, include URL
      // URLs are shortened to 23 chars by Twitter's t.co
      const tweetText = `${message}\n\n${info.link}`;

      if (dryRun) {
        results.posted.push({ id, title: info.title, message: tweetText });
        continue;
      }

      // Validate Twitter credentials
      if (!env.TWITTER_API_KEY || !env.TWITTER_API_SECRET ||
          !env.TWITTER_ACCESS_TOKEN || !env.TWITTER_ACCESS_TOKEN_SECRET) {
        throw new Error('Twitter API credentials not configured');
      }

      const credentials = {
        apiKey: env.TWITTER_API_KEY,
        apiSecret: env.TWITTER_API_SECRET,
        accessToken: env.TWITTER_ACCESS_TOKEN,
        accessTokenSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
      };

      const tweet = await postToTwitter(credentials, tweetText);
      await env.POSTED_STATE.put(id, JSON.stringify({
        title: info.title,
        message,
        angle: winner.angle,
        anchored_on: winner.anchored_on,
        score: winner.score,
        candidates_considered: winner.candidates_considered,
        tweetId: tweet.data?.id,
        at: new Date().toISOString(),
      }));
      results.posted.push({ id, title: info.title, tweetId: tweet.data?.id });
    } catch (e) {
      results.errors.push({ id, error: e.message });
    } finally {
      if (!dryRun) {
        await env.POSTED_STATE.delete(lockKey).catch(() => {});
      }
    }
  }

  return results;
}

/**
 * Post a single URL directly (for testing)
 */
async function postSingleUrl(env, url) {
  // Fetch page metadata
  const response = await fetch(url, { headers: { 'User-Agent': 'TwitterPoster/1.0' } });
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
  
  // Fetch full article text and takeaways
  const articleData = await fetchArticleData(url);

  // Generate tweet text via two-model generator + scorer
  const candidates = await generate(env.AI, {
    articleData: {
      title,
      description: '',
      takeaways: Array.isArray(articleData.takeaways)
        ? articleData.takeaways
        : (articleData.takeaways ? articleData.takeaways.split('\n').filter(Boolean) : []),
      bodyExcerpt: (articleData.text || '').substring(0, 1500),
    },
    recentPosts: [],
    maxLength: 257,
  });
  const winner = pick(candidates, [], { maxLength: 257 });
  if (!winner) {
    throw new Error('all candidates rejected by scorer');
  }
  const message = winner.message;

  // Build tweet
  const tweetText = `${message}\n\n${url}`;
  
  // Validate credentials
  if (!env.TWITTER_API_KEY || !env.TWITTER_API_SECRET || 
      !env.TWITTER_ACCESS_TOKEN || !env.TWITTER_ACCESS_TOKEN_SECRET) {
    throw new Error('Twitter API credentials not configured');
  }
  
  const credentials = {
    apiKey: env.TWITTER_API_KEY,
    apiSecret: env.TWITTER_API_SECRET,
    accessToken: env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
  };
  
  const tweet = await postToTwitter(credentials, tweetText);
  
  return {
    success: true,
    title,
    message: tweetText,
    tweetId: tweet.data?.id,
    fullTextLength: (articleData.text || '').length,
  };
}
