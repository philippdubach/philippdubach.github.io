/**
 * RSS Parsing utilities for Cloudflare Worker
 * Simple XML parsing without external dependencies
 */

// Fetch timeout in milliseconds (30 seconds)
const FETCH_TIMEOUT_MS = 30000;

/**
 * Fetch with timeout using AbortController
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Safely strip HTML tags from text
 * Handles nested tags and common attack patterns
 * @param {string} html - HTML string to strip
 * @returns {string} Plain text
 */
function stripHtmlTags(html) {
  if (!html || typeof html !== 'string') return '';

  // First remove script, style, and other dangerous tags with their content
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '');

  // Remove all remaining HTML tags (loop to handle nested/malformed tags)
  let prevText;
  do {
    prevText = text;
    text = text.replace(/<[^>]*>/g, ' ');
  } while (text !== prevText);

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Handle numeric entities safely (validate range)
  text = text.replace(/&#(\d+);/g, (_, num) => {
    const code = parseInt(num, 10);
    return code > 0 && code < 65536 ? String.fromCharCode(code) : '';
  });
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const code = parseInt(hex, 16);
    return code > 0 && code < 65536 ? String.fromCharCode(code) : '';
  });

  // Normalize whitespace
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Parse RSS XML string into an array of items
 * @param {string} xml - RSS XML content
 * @returns {Array} Array of item objects
 */
export function parseRSS(xml) {
  const items = [];
  
  // Match all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  
  for (const match of xml.matchAll(itemRegex)) {
    const itemXml = match[1];
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link'),
      description: extractTag(itemXml, 'description'),
      pubDate: extractTag(itemXml, 'pubDate'),
      guid: extractTag(itemXml, 'guid'),
    });
  }

  return items;
}

/**
 * Extract content from an XML tag
 * @param {string} xml - XML string to search
 * @param {string} tag - Tag name to extract
 * @returns {string|null} Tag content or null
 */
function extractTag(xml, tag) {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }
  
  // Try regular tag
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (match) {
    return decodeHTMLEntities(match[1].trim());
  }
  
  return null;
}

/**
 * Decode HTML entities
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHTMLEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };
  
  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  
  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return result;
}

/**
 * Extract structured post info from an RSS item (basic info only)
 * @param {Object} item - RSS item object
 * @returns {Object} Structured post info
 */
export function extractPostInfo(item) {
  // Safely strip HTML from description
  const cleanDescription = stripHtmlTags(item.description);

  return {
    title: stripHtmlTags(item.title) || 'New Post',
    link: item.link || '',
    description: cleanDescription.substring(0, 300),
    pubDate: item.pubDate ? new Date(item.pubDate) : null,
  };
}

/**
 * Fetch full article text from a post's HTML page
 * @param {string} url - Post URL
 * @returns {Promise<string>} Article text (truncated to ~4000 chars for LLM context)
 */
export async function fetchFullArticleText(url) {
  try {
    const response = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'TwitterPoster/1.0' },
    });

    if (!response.ok) return '';

    const html = await response.text();

    // Try to find article content - common patterns
    let articleHtml = '';

    // Try <article> tag first
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      articleHtml = articleMatch[1];
    } else {
      // Try main content area
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      if (mainMatch) {
        articleHtml = mainMatch[1];
      } else {
        // Fallback to body
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) articleHtml = bodyMatch[1];
      }
    }

    // Strip nav, header, footer, aside tags
    articleHtml = articleHtml
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Use safe HTML stripping
    const text = stripHtmlTags(articleHtml);

    // Truncate to ~4000 chars for LLM context window
    return text.substring(0, 4000);
  } catch (e) {
    return '';
  }
}
