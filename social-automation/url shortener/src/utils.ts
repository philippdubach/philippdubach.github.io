// Utility functions for the URL Shortener

import { APP_CONSTANTS } from './types';

/**
 * Generate a random short code using cryptographically secure random values
 */
export function generateShortCode(length = APP_CONSTANTS.DEFAULT_SHORT_CODE_LENGTH): string {
  // Use URL-safe characters only (no confusing chars like 0/O, 1/l)
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Hash IP address for privacy-preserving unique visitor counting
 * Uses a daily salt rotation for additional privacy
 */
export async function hashIP(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  // Add daily rotation to prevent long-term tracking
  const dailySalt = Math.floor(Date.now() / (24 * 60 * 60 * 1000)).toString();
  const data = encoder.encode(ip + salt + dailySalt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Only use first 8 bytes (16 hex chars) for privacy
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse User-Agent to extract device, browser, and OS info
 */
export function parseUserAgent(ua: string | null): {
  deviceType: string;
  browser: string;
  os: string;
} {
  if (!ua) {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  // Device type
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser detection
  let browser = 'unknown';
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  // OS detection
  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { deviceType, browser, os };
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate short code format (alphanumeric, hyphens, underscores)
 * Prevents SQL injection and path traversal by only allowing safe characters
 */
export function isValidShortCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,50}$/.test(code);
}

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeInput(input: string | undefined | null): string | null {
  if (!input || typeof input !== 'string') return null;
  // Remove control characters and limit length
  return input
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim()
    .slice(0, 2000);
}

/**
 * Reserved paths that cannot be used as short codes
 */
export const RESERVED_PATHS = [
  'api',
  'admin',
  'dashboard',
  'login',
  'logout',
  'static',
  'assets',
  '_next',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'health',
  'status',
  '.well-known',
] as const;

/**
 * Check if a short code is reserved
 */
export function isReservedPath(code: string): boolean {
  return RESERVED_PATHS.includes(code.toLowerCase() as typeof RESERVED_PATHS[number]);
}

/**
 * Create JSON response with security headers
 */
export function jsonResponse<T>(data: T, status = 200, origin?: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Allow-Credentials': 'true',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

/**
 * Create error response with security headers
 */
export function errorResponse(message: string, status = 400, origin?: string): Response {
  return jsonResponse({ success: false, error: message }, status, origin);
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: string | null, limit: string | null): { page: number; limit: number } {
  const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
  const parsedLimit = Math.min(
    APP_CONSTANTS.MAX_PAGINATION_LIMIT,
    Math.max(1, parseInt(limit || String(APP_CONSTANTS.DEFAULT_PAGINATION_LIMIT), 10) || APP_CONSTANTS.DEFAULT_PAGINATION_LIMIT)
  );
  return { page: parsedPage, limit: parsedLimit };
}
