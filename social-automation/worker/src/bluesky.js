/**
 * Bluesky API integration for Cloudflare Workers
 */

const BLUESKY_API = 'https://bsky.social/xrpc';

/**
 * Post to Bluesky
 */
export async function postToBluesky(handle, appPassword, message, url, imageUrl, title, description) {
  const session = await createSession(handle, appPassword);
  const { accessJwt, did } = session;

  const fullText = `${message}\n\n${url}`;
  const facets = detectFacets(fullText);

  const record = {
    $type: 'app.bsky.feed.post',
    text: fullText,
    createdAt: new Date().toISOString(),
    facets,
  };

  if (url) {
    const embed = await createEmbed(url, imageUrl, title, description, accessJwt);
    if (embed) record.embed = embed;
  }

  // Create the post
  const response = await fetch(`${BLUESKY_API}/com.atproto.repo.createRecord`, {
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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bluesky post error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create Bluesky session
 */
async function createSession(handle, appPassword) {
  const response = await fetch(`${BLUESKY_API}/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: handle,
      password: appPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bluesky auth error: ${response.status} - ${error}`);
  }

  return response.json();
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
    const url = match[1];
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

/**
 * Upload image to Bluesky
 */
async function uploadImage(imageUrl, accessJwt) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.warn('Could not fetch image:', imageUrl);
      return null;
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const imageBuffer = await imageResponse.arrayBuffer();

    const uploadResponse = await fetch(`${BLUESKY_API}/com.atproto.repo.uploadBlob`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': contentType,
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.warn('Image upload failed:', error);
      return null;
    }

    const data = await uploadResponse.json();
    return data.blob;
  } catch (error) {
    console.warn('Error uploading image:', error);
    return null;
  }
}
