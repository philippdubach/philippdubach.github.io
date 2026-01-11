// API handlers for URL management

import type { 
  Env, 
  LinkData, 
  CreateLinkRequest, 
  UpdateLinkRequest,
  LinkListItem, 
  LinkStats,
  DbLinkRow,
  DbClickRow,
  DbCountResult,
  DbAggregateRow,
} from '../types';
import { APP_CONSTANTS } from '../types';
import {
  generateShortCode,
  isValidUrl,
  isValidShortCode,
  isReservedPath,
  jsonResponse,
  errorResponse,
  sanitizeInput,
  validatePagination,
} from '../utils';
import { requireAuth } from '../auth';

/**
 * Route API requests
 */
export async function handleApi(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  const url = new URL(request.url);
  const origin = env.DASHBOARD_ORIGIN;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Require authentication for all API routes
  const authError = await requireAuth(request, env);
  if (authError) return authError;

  // Route to appropriate handler
  const segments = path.split('/').filter(Boolean);
  
  // /api/links
  if (segments[0] === 'links') {
    if (segments.length === 1) {
      if (request.method === 'GET') return getLinks(env, url, origin);
      if (request.method === 'POST') return createLink(request, env, origin);
    }
    // /api/links/:code
    if (segments.length === 2) {
      const code = segments[1];
      if (request.method === 'GET') return getLink(env, code, origin);
      if (request.method === 'PUT') return updateLink(request, env, code, origin);
      if (request.method === 'DELETE') return deleteLink(env, code, origin);
    }
    // /api/links/:code/stats
    if (segments.length === 3 && segments[2] === 'stats') {
      const code = segments[1];
      if (request.method === 'GET') return getLinkStats(env, code, url, origin);
    }
  }

  // /api/stats (global stats)
  if (segments[0] === 'stats' && segments.length === 1) {
    if (request.method === 'GET') return getGlobalStats(env, url, origin);
  }

  return errorResponse('Not found', 404, origin);
}

/**
 * GET /api/links - List all links with pagination
 */
async function getLinks(env: Env, url: URL, origin: string): Promise<Response> {
  const { page, limit } = validatePagination(
    url.searchParams.get('page'),
    url.searchParams.get('limit')
  );
  const offset = (page - 1) * limit;
  const search = sanitizeInput(url.searchParams.get('search')) || '';

  try {
    let query = `
      SELECT 
        l.short_code,
        l.long_url,
        l.title,
        l.created_at,
        l.is_active,
        COUNT(c.id) as total_clicks
      FROM links l
      LEFT JOIN clicks c ON l.short_code = c.short_code
    `;
    
    const params: (string | number)[] = [];
    
    if (search) {
      query += ` WHERE l.short_code LIKE ? OR l.long_url LIKE ? OR l.title LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ` GROUP BY l.short_code ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await env.DB.prepare(query).bind(...params).all<DbLinkRow>();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM links';
    if (search) {
      countQuery += ` WHERE short_code LIKE ? OR long_url LIKE ? OR title LIKE ?`;
    }
    const countResult = search 
      ? await env.DB.prepare(countQuery).bind(`%${search}%`, `%${search}%`, `%${search}%`).first<DbCountResult>()
      : await env.DB.prepare(countQuery).first<DbCountResult>();

    const links: LinkListItem[] = (result.results || []).map((row) => ({
      shortCode: row.short_code,
      longUrl: row.long_url,
      title: row.title,
      createdAt: row.created_at,
      totalClicks: row.total_clicks || 0,
      isActive: row.is_active === 1,
    }));

    return jsonResponse({
      success: true,
      data: {
        links,
        pagination: {
          page,
          limit,
          total: countResult?.count || 0,
          totalPages: Math.ceil((countResult?.count || 0) / limit),
        },
      },
    }, 200, origin);
  } catch (error) {
    console.error('Failed to get links:', error);
    return errorResponse('Failed to retrieve links', 500, origin);
  }
}

/**
 * POST /api/links - Create a new short link
 */
async function createLink(request: Request, env: Env, origin: string): Promise<Response> {
  try {
    const body = await request.json() as CreateLinkRequest;
    const { url: longUrl, customCode, title } = body;

    // Validate URL
    if (!longUrl || !isValidUrl(longUrl)) {
      return errorResponse('Invalid URL provided', 400, origin);
    }

    // Sanitize title
    const sanitizedTitle = sanitizeInput(title);

    // Generate or validate short code
    let shortCode: string;
    if (customCode) {
      if (!isValidShortCode(customCode)) {
        return errorResponse('Invalid short code format. Use alphanumeric characters, hyphens, or underscores (1-50 chars)', 400, origin);
      }
      if (isReservedPath(customCode)) {
        return errorResponse('This short code is reserved', 400, origin);
      }
      // Check if code already exists
      const existing = await env.URLS.get(customCode);
      if (existing) {
        return errorResponse('This short code is already in use', 409, origin);
      }
      shortCode = customCode;
    } else {
      // Generate unique code with collision detection
      let attempts = 0;
      const maxAttempts = 10;
      do {
        shortCode = generateShortCode();
        const existing = await env.URLS.get(shortCode);
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);
      
      if (attempts >= maxAttempts) {
        return errorResponse('Failed to generate unique short code. Please try again.', 500, origin);
      }
    }

    const now = new Date().toISOString();
    const linkData: LinkData = {
      url: longUrl,
      title: sanitizedTitle,
      createdAt: now,
    };

    // Store in KV for fast redirects (with metadata for debugging)
    await env.URLS.put(shortCode, JSON.stringify(linkData), {
      metadata: { createdAt: now, title: sanitizedTitle },
    });

    // Store in D1 for querying/analytics
    await env.DB.prepare(`
      INSERT INTO links (short_code, long_url, title, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(shortCode, longUrl, sanitizedTitle, now).run();

    return jsonResponse({
      success: true,
      data: {
        shortCode,
        shortUrl: `https://pdub.click/${shortCode}`,
        longUrl,
        title: sanitizedTitle,
        createdAt: now,
      },
    }, 201, origin);
  } catch (error) {
    console.error('Failed to create link:', error);
    return errorResponse('Failed to create link', 500, origin);
  }
}

/**
 * GET /api/links/:code - Get a specific link
 */
async function getLink(env: Env, code: string, origin: string): Promise<Response> {
  // Validate short code format
  if (!isValidShortCode(code)) {
    return errorResponse('Invalid short code format', 400, origin);
  }

  try {
    const linkData = await env.URLS.get<LinkData>(code, 'json');
    
    if (!linkData) {
      return errorResponse('Link not found', 404, origin);
    }

    // Get click count
    const clickResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM clicks WHERE short_code = ?'
    ).bind(code).first<DbCountResult>();

    return jsonResponse({
      success: true,
      data: {
        shortCode: code,
        shortUrl: `https://pdub.click/${code}`,
        longUrl: linkData.url,
        title: linkData.title,
        createdAt: linkData.createdAt,
        totalClicks: clickResult?.count || 0,
      },
    }, 200, origin);
  } catch (error) {
    console.error('Failed to get link:', error);
    return errorResponse('Failed to retrieve link', 500, origin);
  }
}

/**
 * PUT /api/links/:code - Update a link
 */
async function updateLink(request: Request, env: Env, code: string, origin: string): Promise<Response> {
  // Validate short code format
  if (!isValidShortCode(code)) {
    return errorResponse('Invalid short code format', 400, origin);
  }

  try {
    const existing = await env.URLS.get<LinkData>(code, 'json');
    if (!existing) {
      return errorResponse('Link not found', 404, origin);
    }

    const body = await request.json() as UpdateLinkRequest;
    const { url: newUrl, title, isActive } = body;

    // Validate new URL if provided
    if (newUrl !== undefined && newUrl !== null && !isValidUrl(newUrl)) {
      return errorResponse('Invalid URL provided', 400, origin);
    }

    // Sanitize title
    const sanitizedTitle = title !== undefined ? sanitizeInput(title) : existing.title;

    const updatedData: LinkData = {
      ...existing,
      url: newUrl || existing.url,
      title: sanitizedTitle,
    };

    // Update KV
    await env.URLS.put(code, JSON.stringify(updatedData));

    // Update D1
    await env.DB.prepare(`
      UPDATE links 
      SET long_url = ?, title = ?, is_active = ?, updated_at = datetime('now')
      WHERE short_code = ?
    `).bind(
      updatedData.url,
      updatedData.title,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      code
    ).run();

    return jsonResponse({
      success: true,
      data: {
        shortCode: code,
        shortUrl: `https://pdub.click/${code}`,
        longUrl: updatedData.url,
        title: updatedData.title,
        isActive: isActive !== undefined ? isActive : true,
      },
    }, 200, origin);
  } catch (error) {
    console.error('Failed to update link:', error);
    return errorResponse('Failed to update link', 500, origin);
  }
}

/**
 * DELETE /api/links/:code - Delete a link
 */
async function deleteLink(env: Env, code: string, origin: string): Promise<Response> {
  // Validate short code format
  if (!isValidShortCode(code)) {
    return errorResponse('Invalid short code format', 400, origin);
  }

  try {
    const existing = await env.URLS.get(code);
    if (!existing) {
      return errorResponse('Link not found', 404, origin);
    }

    // Delete from KV
    await env.URLS.delete(code);

    // Delete from D1 - also delete associated clicks for data consistency
    await env.DB.batch([
      env.DB.prepare('DELETE FROM clicks WHERE short_code = ?').bind(code),
      env.DB.prepare('DELETE FROM links WHERE short_code = ?').bind(code),
    ]);

    return jsonResponse({ success: true }, 200, origin);
  } catch (error) {
    console.error('Failed to delete link:', error);
    return errorResponse('Failed to delete link', 500, origin);
  }
}

/**
 * GET /api/links/:code/stats - Get detailed stats for a link
 */
async function getLinkStats(env: Env, code: string, url: URL, origin: string): Promise<Response> {
  // Validate short code format
  if (!isValidShortCode(code)) {
    return errorResponse('Invalid short code format', 400, origin);
  }

  const days = Math.min(Math.max(1, parseInt(url.searchParams.get('days') || '30', 10) || 30), 365);

  try {
    const linkData = await env.URLS.get<LinkData>(code, 'json');
    if (!linkData) {
      return errorResponse('Link not found', 404, origin);
    }

    // Get total clicks
    const totalResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM clicks WHERE short_code = ?'
    ).bind(code).first<DbCountResult>();

    // Get unique visitors
    const uniqueResult = await env.DB.prepare(
      'SELECT COUNT(DISTINCT ip_hash) as count FROM clicks WHERE short_code = ?'
    ).bind(code).first<DbCountResult>();

    // Get clicks by country
    const countryResult = await env.DB.prepare(`
      SELECT country, COUNT(*) as count 
      FROM clicks 
      WHERE short_code = ? AND country IS NOT NULL
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 20
    `).bind(code).all<DbAggregateRow>();

    // Get clicks by device
    const deviceResult = await env.DB.prepare(`
      SELECT device_type, COUNT(*) as count 
      FROM clicks 
      WHERE short_code = ?
      GROUP BY device_type
    `).bind(code).all<DbAggregateRow>();

    // Get clicks by browser
    const browserResult = await env.DB.prepare(`
      SELECT browser, COUNT(*) as count 
      FROM clicks 
      WHERE short_code = ?
      GROUP BY browser
    `).bind(code).all<DbAggregateRow>();

    // Get clicks over time
    const timeResult = await env.DB.prepare(`
      SELECT DATE(clicked_at) as date, COUNT(*) as count 
      FROM clicks 
      WHERE short_code = ? AND clicked_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(clicked_at)
      ORDER BY date
    `).bind(code, days).all<DbAggregateRow>();

    // Get recent clicks
    const recentResult = await env.DB.prepare(`
      SELECT short_code, clicked_at, referrer, country, city, device_type, browser, os, ip_hash
      FROM clicks 
      WHERE short_code = ?
      ORDER BY clicked_at DESC 
      LIMIT 50
    `).bind(code).all<DbClickRow>();

    const stats: LinkStats = {
      shortCode: code,
      longUrl: linkData.url,
      title: linkData.title || null,
      totalClicks: totalResult?.count || 0,
      uniqueVisitors: uniqueResult?.count || 0,
      clicksByCountry: Object.fromEntries(
        (countryResult.results || []).map((r) => [r.country, r.count as number])
      ),
      clicksByDevice: Object.fromEntries(
        (deviceResult.results || []).map((r) => [r.device_type, r.count as number])
      ),
      clicksByBrowser: Object.fromEntries(
        (browserResult.results || []).map((r) => [r.browser, r.count as number])
      ),
      clicksOverTime: (timeResult.results || []).map((r) => ({
        date: r.date as string,
        count: r.count as number,
      })),
      recentClicks: (recentResult.results || []).map((r) => ({
        shortCode: r.short_code,
        clickedAt: r.clicked_at,
        referrer: r.referrer,
        userAgent: null, // Excluded for privacy in stats view
        country: r.country,
        city: r.city,
        deviceType: r.device_type,
        browser: r.browser,
        os: r.os,
        ipHash: r.ip_hash,
      })),
    };

    return jsonResponse({ success: true, data: stats }, 200, origin);
  } catch (error) {
    console.error('Failed to get link stats:', error);
    return errorResponse('Failed to retrieve stats', 500, origin);
  }
}

/**
 * GET /api/stats - Get global statistics
 */
async function getGlobalStats(env: Env, url: URL, origin: string): Promise<Response> {
  const days = Math.min(Math.max(1, parseInt(url.searchParams.get('days') || '30', 10) || 30), 365);

  try {
    // Total links
    const linksResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM links'
    ).first<DbCountResult>();

    // Total clicks
    const clicksResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM clicks'
    ).first<DbCountResult>();

    // Clicks today
    const todayResult = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM clicks 
      WHERE DATE(clicked_at) = DATE('now')
    `).first<DbCountResult>();

    // Top links
    const topLinksResult = await env.DB.prepare(`
      SELECT 
        l.short_code,
        l.long_url,
        l.title,
        COUNT(c.id) as clicks
      FROM links l
      LEFT JOIN clicks c ON l.short_code = c.short_code
      GROUP BY l.short_code
      ORDER BY clicks DESC
      LIMIT 10
    `).all<DbAggregateRow>();

    // Clicks over time
    const timeResult = await env.DB.prepare(`
      SELECT DATE(clicked_at) as date, COUNT(*) as count 
      FROM clicks 
      WHERE clicked_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(clicked_at)
      ORDER BY date
    `).bind(days).all<DbAggregateRow>();

    // Top countries
    const countryResult = await env.DB.prepare(`
      SELECT country, COUNT(*) as count 
      FROM clicks 
      WHERE country IS NOT NULL
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 10
    `).all<DbAggregateRow>();

    return jsonResponse({
      success: true,
      data: {
        totalLinks: linksResult?.count || 0,
        totalClicks: clicksResult?.count || 0,
        clicksToday: todayResult?.count || 0,
        topLinks: (topLinksResult.results || []).map((r) => ({
          shortCode: r.short_code as string,
          longUrl: r.long_url as string,
          title: r.title as string | null,
          clicks: r.clicks as number,
        })),
        clicksOverTime: (timeResult.results || []).map((r) => ({
          date: r.date as string,
          count: r.count as number,
        })),
        topCountries: Object.fromEntries(
          (countryResult.results || []).map((r) => [r.country, r.count as number])
        ),
      },
    }, 200, origin);
  } catch (error) {
    console.error('Failed to get global stats:', error);
    return errorResponse('Failed to retrieve stats', 500, origin);
  }
}
