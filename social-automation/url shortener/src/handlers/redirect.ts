// Redirect handler - handles short URL redirects

import type { Env, LinkData } from '../types';
import { APP_CONSTANTS } from '../types';
import { hashIP, parseUserAgent } from '../utils';

/**
 * Handle redirect for a short code
 * Returns 301 permanent redirect for SEO optimization
 * Returns 302 redirect to main site if not found or inactive
 */
export async function handleRedirect(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  shortCode: string
): Promise<Response> {
  // Look up the URL in KV
  const linkData = await env.URLS.get<LinkData>(shortCode, 'json');

  if (!linkData) {
    // Redirect to main site instead of 404
    return Response.redirect(APP_CONSTANTS.MAIN_SITE, 302);
  }

  // Check if link is active in D1 (for consistency with dashboard)
  const linkStatus = await env.DB.prepare(
    'SELECT is_active FROM links WHERE short_code = ?'
  ).bind(shortCode).first<{ is_active: number }>();

  if (linkStatus && linkStatus.is_active === 0) {
    // Link is disabled, redirect to main site
    return Response.redirect(APP_CONSTANTS.MAIN_SITE, 302);
  }

  // Log the click asynchronously (non-blocking)
  ctx.waitUntil(logClick(request, env, shortCode));

  // Return 301 permanent redirect (critical for SEO)
  // This passes full link equity to the destination URL
  return Response.redirect(linkData.url, 301);
}

/**
 * Log click event to D1 database
 * This function is called via ctx.waitUntil for non-blocking execution
 */
async function logClick(
  request: Request,
  env: Env,
  shortCode: string
): Promise<void> {
  try {
    const cf = request.cf;
    const userAgent = request.headers.get('User-Agent');
    const referrer = request.headers.get('Referer');
    const clientIP = request.headers.get('CF-Connecting-IP') || '';
    
    // Parse user agent for device/browser/OS info
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    
    // Hash IP for privacy-preserving unique visitor counting
    const ipHash = await hashIP(clientIP, shortCode);

    // Insert into D1 database using parameterized query for security
    await env.DB.prepare(`
      INSERT INTO clicks (
        short_code, clicked_at, referrer, user_agent, 
        country, city, device_type, browser, os, ip_hash
      ) VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      shortCode,
      referrer?.slice(0, 2000) || null, // Limit referrer length
      userAgent?.slice(0, 500) || null, // Limit UA length
      (cf?.country as string)?.slice(0, 2) || null,
      (cf?.city as string)?.slice(0, 100) || null,
      deviceType,
      browser,
      os,
      ipHash
    ).run();
  } catch (error) {
    // Log error but don't fail the redirect
    console.error('Failed to log click:', error);
  }
}
