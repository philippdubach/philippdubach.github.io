/**
 * RSS Parsing utilities for Cloudflare Worker
 * Simple XML parsing without external dependencies
 */

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
  // Strip HTML from description
  const cleanDescription = item.description 
    ? item.description.replace(/<[^>]*>/g, '').trim()
    : '';

  return {
    title: item.title || 'New Post',
    link: item.link || '',
    description: cleanDescription.substring(0, 300),
    pubDate: item.pubDate ? new Date(item.pubDate) : null,
    image: null, // Will be fetched separately from the page
  };
}

/**
 * Fetch full article text from a post's HTML page
 * @param {string} url - Post URL
 * @returns {Promise<string>} Article text (truncated to ~4000 chars for LLM context)
 */
export async function fetchFullArticleText(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SocialPoster/1.0' },
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
    
    // Strip script, style, nav, header, footer tags
    articleHtml = articleHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
    
    // Strip all HTML tags and decode entities
    let text = articleHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    // Truncate to ~4000 chars for LLM context window
    return text.substring(0, 4000);
  } catch (e) {
    return '';
  }
}

/**
 * Fetch OG metadata from a post's HTML page
 * @param {string} url - Post URL
 * @returns {Promise<{image: string|null, description: string|null}>}
 */
export async function fetchOGMetadata(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SocialPoster/1.0' },
    });
    
    if (!response.ok) return { image: null, description: null };
    
    const html = await response.text();
    
    // Extract og:image
    let image = null;
    const imgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (imgMatch) image = imgMatch[1];
    
    // Extract og:description or meta description
    let description = null;
    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
      || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) description = descMatch[1];
    
    return { image, description };
  } catch (e) {
    return { image: null, description: null };
  }
}
