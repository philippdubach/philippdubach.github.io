// Authentication handlers

import type { Env } from './types';
import { errorResponse } from './utils';

// Session validity duration in milliseconds (24 hours)
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to maintain constant time
    b = a;
  }
  
  let result = a.length === b.length ? 0 : 1;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify API key from request header (timing-safe)
 */
export function verifyApiKey(request: Request, env: Env): boolean {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey || !env.API_KEY) return false;
  return timingSafeEqual(apiKey, env.API_KEY);
}

/**
 * Verify session cookie for dashboard access
 */
export async function verifySession(request: Request, env: Env): Promise<boolean> {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return false;

  const sessionMatch = cookie.match(/pdub_session=([^;]+)/);
  if (!sessionMatch) return false;

  const sessionToken = sessionMatch[1];
  
  // Parse the token: format is "timestamp:hmac"
  const parts = sessionToken.split(':');
  if (parts.length !== 2) return false;
  
  const [timestampStr, providedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  
  // Check if token is expired (24 hour validity)
  if (isNaN(timestamp) || Date.now() - timestamp > SESSION_DURATION_MS) {
    return false;
  }
  
  // Verify HMAC
  const expectedHmac = await computeHmac(env.ADMIN_PASSWORD, timestampStr);
  return timingSafeEqual(providedHmac, expectedHmac);
}

/**
 * Compute HMAC-SHA256 for session token
 */
async function computeHmac(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a session token with timestamp and HMAC
 * Token format: "timestamp:hmac" - valid for 24 hours
 */
export async function generateSessionToken(password: string): Promise<string> {
  const timestamp = Date.now().toString();
  const hmac = await computeHmac(password, timestamp);
  return `${timestamp}:${hmac}`;
}

/**
 * Handle login request
 */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await request.json() as { password?: string };
    const { password } = body;

    if (!password || password !== env.ADMIN_PASSWORD) {
      return errorResponse('Invalid password', 401);
    }

    const sessionToken = await generateSessionToken(env.ADMIN_PASSWORD);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `pdub_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      },
    });
  } catch {
    return errorResponse('Invalid request body', 400);
  }
}

/**
 * Handle logout request
 */
export function handleLogout(): Response {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'pdub_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    },
  });
}

/**
 * Middleware to require authentication (API key or session)
 */
export async function requireAuth(
  request: Request,
  env: Env
): Promise<Response | null> {
  // Check API key first
  if (verifyApiKey(request, env)) {
    return null; // Authenticated
  }

  // Check session cookie
  if (await verifySession(request, env)) {
    return null; // Authenticated
  }

  return errorResponse('Unauthorized', 401);
}
