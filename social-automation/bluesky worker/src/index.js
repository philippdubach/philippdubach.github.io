import { parseRSS, extractPostInfo, fetchArticleData } from '@social/shared/rss';
import { timingSafeEqual } from '@social/shared/auth';
import { checkRateLimit } from '@social/shared/rate-limit';
import { generate } from '@social/shared/generator';
import { pick } from '@social/shared/scorer';
import { recentPosts } from '@social/shared/state';
import { createPostJob, jobKey, parsePostJob } from '@social/shared/post-job';
import { classifyPublishError } from '@social/shared/post-gate-state';
import { postToBluesky } from './bluesky.js';

export { PostGate } from '@social/shared/post-gate-do';

// Bluesky enforces a 300-character post limit. The link is appended after
// the LLM-generated message with a "\n\n" separator, so the message budget
// is `300 - 2 - link.length`. Without this guard the LLM cap (250) plus a
// typical 70-char link (322) overflowed and threw, leaving the post stuck
// in a re-attempt loop forever (KV is only marked posted on success).
const BLUESKY_POST_LIMIT = 300;
const MAIN_QUEUE = 'social-poster-post-jobs';
const DEAD_LETTER_QUEUE = 'social-poster-post-jobs-dlq';
const RETRY_DELAY_SECONDS = 300;

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      processNewPosts(env).catch(err => {
        console.error('Scheduled task failed:', err);
      })
    );
  },

  async queue(batch, env) {
    for (const message of batch.messages) {
      if (batch.queue === DEAD_LETTER_QUEUE) {
        await archiveFailedDelivery(env, message);
      } else if (batch.queue === MAIN_QUEUE) {
        await deliverPostJob(env, message);
      } else {
        message.retry();
      }
    }
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

    const dryRunRequest = (
      (url.pathname === '/trigger' || url.pathname === '/test')
      && url.searchParams.get('dry') === 'true'
    );

    // Dry previews enforce existing recorded limits without mutating KV.
    // Non-dry authenticated endpoints retain the existing sliding-window
    // accounting behavior.
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitState = dryRunRequest
      ? {
          get: (...args) => env.POSTED_STATE.get(...args),
          put: async () => {},
        }
      : env.POSTED_STATE;
    if (!(await checkRateLimit(rateLimitState, clientIP))) {
      return json({ error: 'rate limit exceeded', retry_after: 60 }, 429);
    }

    if (url.pathname === '/trigger') {
      const dryRun = url.searchParams.get('dry') === 'true';
      try {
        return json(await processNewPosts(env, dryRun), dryRun ? 200 : 202);
      } catch (err) {
        console.error('Trigger error:', err);
        return json({ error: 'Processing failed' }, 500);
      }
    }

    if (url.pathname === '/status') {
      const list = await env.POSTED_STATE.list({ prefix: 'posts:', limit: 1000 });
      const entries = (await Promise.all(
        list.keys.map(k => env.POSTED_STATE.get(k.name, 'json'))
      )).filter(Boolean);

      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const last24h = entries.filter(e => new Date(e.at || 0).getTime() > dayAgo);

      const angleStats = {};
      for (const e of entries) {
        if (e.angle) angleStats[e.angle] = (angleStats[e.angle] || 0) + 1;
      }

      const newest = entries.sort((a, b) => (b.at || '').localeCompare(a.at || ''))[0] || {};

      return json({
        posted_count: entries.length,
        posted_last_24h: last24h.length,
        last_posted_at: newest.at || null,
        last_angle: newest.angle || null,
        last_anchored_on: newest.anchored_on || null,
        angle_stats: angleStats,
      });
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
      const dryRun = url.searchParams.get('dry') === 'true';
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
        const result = await postSingleUrl(env, testUrl, dryRun);
        return json(result, dryRun ? 200 : 202);
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

    try {
      const gate = env.POST_GATE.getByName(`v1:bluesky:${id}`);
      const gateState = await gate.markBackfilled({
        articleId: id,
        title: info.title,
      });
      if (gateState.status !== 'backfilled') {
        results.skipped++;
        continue;
      }
      await env.POSTED_STATE.delete(`jobmeta:v1:bluesky:${id}`);
      if (await env.POSTED_STATE.get(`posts:${id}`)) {
        results.skipped++;
        continue;
      }
      await env.POSTED_STATE.put(`posts:${id}`, JSON.stringify({
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
  const results = dryRun
    ? { posted: [], skipped: 0, errors: [] }
    : { queued: 0, skipped: 0, errors: [] };

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

  const recent = await recentPosts(env.POSTED_STATE, { n: 15 });

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

    if (await env.POSTED_STATE.get(`posts:${id}`)) {
      results.skipped++;
      continue;
    }

    // Cron overlap guard: if another tick is already processing this post,
    // skip it. The lock TTL (60s) is shorter than the cron interval (15min),
    // so a stuck lock from a crashed run can't deadlock subsequent ticks.
    const lockKey = `lock:${id}`;
    if (await env.POSTED_STATE.get(lockKey)) {
      results.skipped++;
      continue;
    }
    if (!dryRun) {
      await env.POSTED_STATE.put(lockKey, '1', { expirationTtl: 60 });
    }

    try {
      // Single fetch covers both OG metadata and article body.
      const articleData = await fetchArticleData(info.link);
      info.image = articleData.image;
      info.ogDescription = articleData.description || info.description;

      // Reserve URL + "\n\n" budget so the LLM truncation respects the
      // 300-char Bluesky limit. See BLUESKY_POST_LIMIT comment at top.
      const maxMsgLen = BLUESKY_POST_LIMIT - 2 - info.link.length;
      const candidates = await generate(env.AI, {
        articleData: {
          title: info.title,
          description: info.description,
          takeaways: Array.isArray(articleData.takeaways)
            ? articleData.takeaways
            : (articleData.takeaways ? articleData.takeaways.split('\n').filter(Boolean) : []),
          bodyExcerpt: (articleData.text || '').substring(0, 1500),
        },
        recentPosts: recent,
        maxLength: maxMsgLen,
      });
      const winner = pick(candidates, recent, { maxLength: maxMsgLen });
      if (!winner) {
        results.errors.push({ id, error: 'all candidates rejected by scorer' });
        continue;
      }
      const message = winner.message;

      if (dryRun) {
        results.posted.push({ id, title: info.title, message, image: info.image, description: info.ogDescription });
        continue;
      }

      const job = createPostJob('bluesky', {
        id,
        url: info.link,
        title: info.title,
      }, message);
      await enqueuePostJob(env, job, {
        angle: winner.angle,
        anchored_on: winner.anchored_on,
        score: winner.score,
        candidates_considered: winner.candidates_considered,
        image: info.image,
        description: info.ogDescription,
      });
      results.queued++;
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
async function postSingleUrl(env, url, dryRun = false) {
  // One fetch covers title extraction + OG metadata + article body.
  const response = await fetch(url, { headers: { 'User-Agent': 'SocialPoster/1.0' } });
  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
  const html = await response.text();

  let title = 'New Post';
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (ogTitleMatch) {
    title = ogTitleMatch[1];
  } else {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) title = titleMatch[1];
  }

  // Reuse the same unified fetch (second round-trip on this code path is
  // unavoidable because we already needed the HTML for title extraction
  // above; in the scheduled path the unified fetch is the only one).
  const articleData = await fetchArticleData(url);

  const recent = await recentPosts(env.POSTED_STATE, { n: 15 });

  // Reserve URL + "\n\n" budget against Bluesky's 300-char post limit.
  const maxMsgLen = BLUESKY_POST_LIMIT - 2 - url.length;
  const candidates = await generate(env.AI, {
    articleData: {
      title,
      description: '',
      takeaways: Array.isArray(articleData.takeaways)
        ? articleData.takeaways
        : (articleData.takeaways ? articleData.takeaways.split('\n').filter(Boolean) : []),
      bodyExcerpt: (articleData.text || '').substring(0, 1500),
    },
    recentPosts: recent,
    maxLength: maxMsgLen,
  });
  const winner = pick(candidates, recent, { maxLength: maxMsgLen });
  if (!winner) {
    throw new Error('all candidates rejected by scorer');
  }
  const message = winner.message;

  if (dryRun) {
    return {
      success: true,
      dry_run: true,
      title,
      message,
      fullTextLength: (articleData.text || '').length,
    };
  }

  const id = articleId(url);
  const job = createPostJob('bluesky', { id, url, title }, message);
  await enqueuePostJob(env, job, {
    angle: winner.angle,
    anchored_on: winner.anchored_on,
    score: winner.score,
    candidates_considered: winner.candidates_considered,
    image: articleData.image,
    description: articleData.description || '',
  });

  return {
    queued: 1,
    id,
    title,
    message,
    fullTextLength: (articleData.text || '').length,
  };
}

function articleId(url) {
  return url.match(/\/posts\/([^\/]+)\/?$/)?.[1]
    || url.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').substring(0, 100);
}

function terminalError(message, code = 'AUTH_FAILED') {
  const error = new Error(message);
  error.code = code;
  error.stage = 'pre-send';
  error.requestSent = false;
  return error;
}

async function enqueuePostJob(env, job, metadata) {
  const metadataKey = `jobmeta:${jobKey(job)}`;
  await env.POSTED_STATE.put(metadataKey, JSON.stringify(metadata));
  try {
    await env.POST_QUEUE.send(job);
  } catch (error) {
    await env.POSTED_STATE.delete(metadataKey).catch(() => {});
    throw error;
  }
}

async function jobMetadata(env, job) {
  return await env.POSTED_STATE.get(`jobmeta:${jobKey(job)}`, 'json') || {};
}

function legacyMetadata(metadata) {
  const value = {};
  if (typeof metadata.angle === 'string') value.angle = metadata.angle;
  if (typeof metadata.anchored_on === 'string') value.anchored_on = metadata.anchored_on;
  if (Number.isFinite(metadata.score)) value.score = metadata.score;
  if (Number.isInteger(metadata.candidates_considered)) {
    value.candidates_considered = metadata.candidates_considered;
  }
  return value;
}

async function writePublishedReadModel(
  env,
  job,
  result,
  at = new Date().toISOString(),
  metadata,
) {
  const staged = metadata || await jobMetadata(env, job);
  await env.POSTED_STATE.put(`posts:${job.articleId}`, JSON.stringify({
    title: job.title,
    message: job.message,
    ...legacyMetadata(staged),
    uri: result.uri,
    at,
  }));
  await env.POSTED_STATE.delete(`jobmeta:${jobKey(job)}`);
}

async function handleDeniedClaim(env, gateState, message) {
  if (gateState?.status === 'published') {
    if (!(await env.POSTED_STATE.get(`posts:${gateState.job.articleId}`))) {
      await writePublishedReadModel(
        env,
        gateState.job,
        gateState.result,
        gateState.updatedAt,
      );
    }
    message.ack();
    return;
  }
  if (gateState?.status === 'backfilled') {
    message.ack();
    return;
  }
  message.retry();
}

async function deliverPostJob(env, message) {
  let job;
  try {
    job = parsePostJob(message.body);
  } catch {
    message.retry();
    return;
  }

  const gate = env.POST_GATE.getByName(jobKey(job));
  const claim = await gate.claim(job);
  if (!claim.claimed) {
    await handleDeniedClaim(env, claim.state, message);
    return;
  }

  try {
    if (!env.BLUESKY_HANDLE || !env.BLUESKY_APP_PASSWORD) {
      throw terminalError('Bluesky credentials are required');
    }
    const metadata = await jobMetadata(env, job);
    const result = await postToBluesky(
      env.BLUESKY_HANDLE,
      env.BLUESKY_APP_PASSWORD,
      job.message,
      job.url,
      metadata.image,
      job.title,
      metadata.description || '',
    );
    const gateState = await gate.markPublished({ uri: result.uri, cid: result.cid });
    await writePublishedReadModel(env, job, result, gateState.updatedAt, metadata);
    message.ack();
  } catch (error) {
    const classification = classifyPublishError(error);
    if (classification === 'retryable') {
      await gate.markPending(error);
      message.retry({ delaySeconds: RETRY_DELAY_SECONDS });
    } else if (classification === 'uncertain') {
      await gate.markUncertain(error);
      message.retry();
    } else {
      await gate.markFailed(error);
      message.retry();
    }
  }
}

async function archiveFailedDelivery(env, message) {
  let job;
  try {
    job = parsePostJob(message.body);
  } catch {
    message.retry();
    return;
  }

  const key = jobKey(job);
  const gateState = await env.POST_GATE.getByName(key).getState();
  await env.POSTED_STATE.put(`failed:${key}`, JSON.stringify({
    job,
    messageId: message.id,
    attempts: message.attempts,
    gateState,
    archivedAt: new Date().toISOString(),
  }));
  message.ack();
}
