/**
 * Twitter API v2 integration for Cloudflare Workers
 * Uses OAuth 1.0a User Context for free tier (1500 tweets/month)
 */

const TWITTER_API = 'https://api.twitter.com/2';

/**
 * Post a tweet to Twitter
 * @param {Object} credentials - Twitter API credentials
 * @param {string} text - Tweet text (max 280 characters)
 * @returns {Promise<Object>} - Tweet response data
 */
export async function postToTwitter(credentials, text) {
  const { apiKey, apiSecret, accessToken, accessTokenSecret } = credentials;
  
  // Twitter free tier limit: 280 characters
  const MAX_TWEET_LENGTH = 280;
  if (text.length > MAX_TWEET_LENGTH) {
    throw new Error(`Tweet exceeds ${MAX_TWEET_LENGTH} characters (got ${text.length})`);
  }

  const url = `${TWITTER_API}/tweets`;
  const method = 'POST';
  const body = JSON.stringify({ text });

  // Generate OAuth 1.0a signature
  const oauthParams = generateOAuthParams(apiKey, accessToken);
  const signature = await generateSignature(
    method,
    url,
    oauthParams,
    apiSecret,
    accessTokenSecret
  );
  oauthParams.oauth_signature = signature;

  const authHeader = buildAuthHeader(oauthParams);

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter post error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Generate OAuth 1.0a parameters
 */
function generateOAuthParams(consumerKey, accessToken) {
  return {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };
}

/**
 * Generate a random nonce for OAuth
 */
function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate OAuth 1.0a signature using Web Crypto API
 */
async function generateSignature(method, url, oauthParams, consumerSecret, tokenSecret) {
  // Create parameter string (sorted alphabetically)
  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeRFC3986(key)}=${encodeRFC3986(oauthParams[key])}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    encodeRFC3986(url),
    encodeRFC3986(paramString),
  ].join('&');

  // Create signing key
  const signingKey = `${encodeRFC3986(consumerSecret)}&${encodeRFC3986(tokenSecret)}`;

  // Generate HMAC-SHA1 signature using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureBaseString)
  );

  // Convert to base64
  return btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
}

/**
 * RFC 3986 percent-encode (required for OAuth 1.0a)
 */
function encodeRFC3986(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

/**
 * Build OAuth Authorization header
 */
function buildAuthHeader(oauthParams) {
  const params = Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeRFC3986(key)}="${encodeRFC3986(oauthParams[key])}"`)
    .join(', ');
  
  return `OAuth ${params}`;
}
