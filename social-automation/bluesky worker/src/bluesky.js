/**
 * Bluesky API integration for Cloudflare Workers
 */

const BLUESKY_API = 'https://bsky.social/xrpc';

/**
 * Retry wrapper with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts (default 3)
 * @param {number} baseDelay - Base delay in ms (default 1000)
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isRateLimit = error.status === 429;
      const isServerError = error.status >= 500;
      const isNetworkError = error.code === 'NETWORK_ERROR';
      
      // Authentication/session requests are safe to repeat because they do not
      // create a social post. The create-record request never uses this helper.
      if (!isRateLimit && !isServerError && !isNetworkError) throw error;
      
      // Exponential backoff with jitter
      const delay = error.retryAfter !== undefined
        ? error.retryAfter * 1000
        : baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

class BlueskyPublishError extends Error {
  constructor(message, { code, status, stage, retryAfter, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'BlueskyPublishError';
    if (code !== undefined) this.code = code;
    if (status !== undefined) this.status = status;
    if (stage !== undefined) this.stage = stage;
    if (retryAfter !== undefined) this.retryAfter = retryAfter;
  }
}

function retryAfterSeconds(response) {
  const value = response.headers.get('Retry-After');
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = new Date(value).getTime();
  if (!Number.isFinite(date)) return undefined;
  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

function statusCode(status) {
  if (status === 429) return 'RATE_LIMITED';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  return undefined;
}

/**
 * Post to Bluesky
 */
export async function postToBluesky(handle, appPassword, message, url, imageUrl, title, description) {
  const MAX_POST_LENGTH = 300;
  const fullText = url ? `${message}\n\n${url}` : message;
  if (fullText.length > MAX_POST_LENGTH) {
    throw new BlueskyPublishError('Bluesky post exceeds the platform limit', {
      code: 'VALIDATION_ERROR',
      stage: 'pre-send',
    });
  }

  const session = await withRetry(() => createSession(handle, appPassword));
  const { accessJwt, did } = session;
  const record = {
    $type: 'app.bsky.feed.post',
    text: fullText,
    createdAt: new Date().toISOString(),
    facets: detectFacets(fullText),
  };

  if (url) {
    const embed = await createEmbed(url, imageUrl, title, description, accessJwt);
    if (embed) record.embed = embed;
  }

  let response;
  try {
    response = await fetch(`${BLUESKY_API}/com.atproto.repo.createRecord`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: did,
        collection: 'app.bsky.feed.post',
        record,
      }),
    });
  } catch (cause) {
    throw new BlueskyPublishError('Bluesky create-record request had an ambiguous outcome', {
      code: 'NETWORK_ERROR',
      stage: 'post-response',
      cause,
    });
  }

  if (!response.ok) {
    throw new BlueskyPublishError('Bluesky create-record request failed', {
      code: statusCode(response.status),
      status: response.status,
      stage: 'response',
      retryAfter: retryAfterSeconds(response),
    });
  }

  try {
    const result = await response.json();
    if (!result || typeof result.uri !== 'string' || typeof result.cid !== 'string') {
      throw new TypeError('Malformed create-record response');
    }
    return result;
  } catch (cause) {
    throw new BlueskyPublishError('Bluesky create-record response could not be validated', {
      code: 'RESPONSE_PARSE_FAILED',
      status: response.status,
      stage: 'response-parse',
      cause,
    });
  }
}

/**
 * Create Bluesky session
 */
async function createSession(handle, appPassword) {
  let response;
  try {
    response = await fetch(`${BLUESKY_API}/com.atproto.server.createSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: handle,
        password: appPassword,
      }),
    });
  } catch (cause) {
    throw new BlueskyPublishError('Bluesky session request failed', {
      code: 'NETWORK_ERROR',
      stage: 'pre-send',
      cause,
    });
  }

  if (!response.ok) {
    throw new BlueskyPublishError('Bluesky session request was rejected', {
      code: statusCode(response.status),
      status: response.status,
      stage: 'pre-send',
      retryAfter: retryAfterSeconds(response),
    });
  }

  try {
    const session = await response.json();
    if (!session || typeof session.accessJwt !== 'string' || typeof session.did !== 'string') {
      throw new TypeError('Malformed session response');
    }
    return session;
  } catch (cause) {
    throw new BlueskyPublishError('Bluesky session response could not be validated', {
      code: 'RESPONSE_PARSE_FAILED',
      status: response.status,
      stage: 'pre-send',
      cause,
    });
  }
}

/**
 * Detect facets (links) in text
 * Uses TextEncoder for proper byte position calculation in Workers
 */
function detectFacets(text) {
  const facets = [];
  const encoder = new TextEncoder();
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let match;
  
  while ((match = urlRegex.exec(text)) !== null) {
    // Trim common trailing punctuation that is likely not part of the URL
    const rawUrl = match[1];
    const url = rawUrl.replace(/[)\]\}.,!?;:]+$/u, '');
    if (!url) continue;
    
    const beforeText = text.substring(0, match.index);
    const byteStart = encoder.encode(beforeText).length;
    const byteEnd = byteStart + encoder.encode(url).length;
    
    facets.push({
      index: { byteStart, byteEnd },
      features: [{
        $type: 'app.bsky.richtext.facet#link',
        uri: url,
      }],
    });
  }

  return facets;
}

/**
 * Create external embed with website card
 */
async function createEmbed(url, imageUrl, title, description, accessJwt) {
  try {
    let thumb = null;
    if (imageUrl) {
      thumb = await uploadImage(imageUrl, accessJwt);
    }

    return {
      $type: 'app.bsky.embed.external',
      external: {
        uri: url,
        title: title || url,
        description: description || '',
        ...(thumb && { thumb }),
      },
    };
  } catch (error) {
    console.warn('Failed to create embed:', error);
    return null;
  }
}

// SSRF gate. The OG image URL comes from a remote HTML page's <meta>
// content; even though we only fetch RSS items from trusted domains,
// the og:image field inside those pages is attacker-controllable in
// principle. Restrict to the CDN + canonical site so a poisoned tag
// can't make the Worker fetch internal/private endpoints.
const TRUSTED_IMAGE_DOMAINS = new Set([
  'static.philippdubach.com',
  'philippdubach.com',
  'www.philippdubach.com',
]);

function isTrustedImageUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return TRUSTED_IMAGE_DOMAINS.has(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Upload image to Bluesky
 */
async function uploadImage(imageUrl, accessJwt) {
  const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB limit
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!isTrustedImageUrl(imageUrl)) {
    console.warn('Image URL rejected (not from trusted domain):', imageUrl);
    return null;
  }

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.warn('Could not fetch image:', imageUrl);
      return null;
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    if (!ALLOWED_TYPES.some(t => contentType.startsWith(t))) {
      console.warn('Invalid image type:', contentType);
      return null;
    }
    
    const contentLength = imageResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
      console.warn('Image too large:', contentLength);
      return null;
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    if (imageBuffer.byteLength > MAX_IMAGE_SIZE) {
      console.warn('Image exceeds size limit after download');
      return null;
    }

    const uploadResponse = await fetch(`${BLUESKY_API}/com.atproto.repo.uploadBlob`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': contentType,
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      console.warn(`Image upload failed with status ${uploadResponse.status}`);
      return null;
    }

    const data = await uploadResponse.json();
    return data.blob;
  } catch (error) {
    console.warn('Error uploading image:', error);
    return null;
  }
}
