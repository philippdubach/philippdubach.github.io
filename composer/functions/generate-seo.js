/**
 * Sanitize user input before inserting into LLM prompts
 * Prevents prompt injection attacks
 */
function sanitizeForPrompt(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        // Remove markdown code blocks that could contain injected prompts
        .replace(/```[\s\S]*?```/g, '[code block removed]')
        // Remove potential prompt escape sequences
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// Allowed origins for CORS - defined at module scope
const allowedOrigins = [
    'https://post-composer.pages.dev',
    'http://localhost:8788',
    'http://127.0.0.1:8788'
];

/**
 * Create a JSON response with appropriate CORS headers
 * ALWAYS includes CORS headers so errors are readable by JavaScript
 */
function createResponse(body, status, origin) {
    // Determine the CORS origin to return
    // If origin is allowed, echo it back; otherwise use first allowed origin
    // This ensures the error response is readable even for rejected origins
    const corsOrigin = allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0];

    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const origin = request.headers.get('Origin') || '';

    // Check API key first (helps with debugging)
    if (!env.ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY not configured');
        return createResponse(
            { error: 'SEO service not configured' },
            500,
            origin
        );
    }

    // Reject requests from non-allowed origins
    if (!allowedOrigins.includes(origin)) {
        return createResponse(
            { error: `Origin not allowed: ${origin || '(none)'}` },
            403,
            origin
        );
    }

    try {
        // Parse request body
        let title, content;
        try {
            const body = await request.json();
            title = body.title;
            content = body.content;
        } catch (parseError) {
            return createResponse(
                { error: 'Invalid JSON in request body' },
                400,
                origin
            );
        }

        if (!content || content.trim().length < 50) {
            return createResponse(
                { error: 'Content too short for SEO generation' },
                400,
                origin
            );
        }

        if (content.length > 50000) {
            return createResponse(
                { error: 'Content too long (max 50,000 characters)' },
                400,
                origin
            );
        }

        if (title && title.length > 500) {
            return createResponse(
                { error: 'Title too long (max 500 characters)' },
                400,
                origin
            );
        }

        const systemPrompt = `You are an SEO expert for philippdubach.com, a blog focused on:
- Quantitative Finance & Macro Strategy
- AI/ML Infrastructure and LLM Economics
- Technology and Software Engineering
- Economic Analysis and Market Structure

Your task is to generate SEO metadata for blog posts. The target audience is professionals and enthusiasts interested in finance, technology, and data science.

STRICT Guidelines:
- Title: 50-60 characters MAXIMUM (aim for ~55 chars). Keep the original title or suggest minor improvements for SEO. Shorter titles perform better in search results.
- Description: 120-160 characters EXACTLY. Write a compelling meta description that summarizes the key value proposition. Must be complete sentences that entice clicks.
- Keywords: Generate 3-6 keywords total:
  * 1 primary keyword (most important, should appear naturally in title/description)
  * 2-5 secondary/long-tail keywords (supporting terms)
  * Focus on specificity over breadth
  * Aim for natural keyword density of 0.5-2%
  * NEVER stuff keywords - quality over quantity
- Consider search intent: what would someone searching for this content type?
- Focus on unique angles and specific insights from the content

Respond ONLY with valid JSON in this exact format:
{
    "title": "SEO-optimized title (50-60 chars)",
    "description": "Meta description (120-160 chars)",
    "keywords": ["primary keyword", "secondary1", "secondary2"]
}`;

        const safeTitle = sanitizeForPrompt(title || 'Untitled');
        const safeContent = sanitizeForPrompt(content.substring(0, 8000));

        const userPrompt = `Generate SEO metadata for this blog post:

Title: ${safeTitle}

Content:
${safeContent}

Remember: Respond ONLY with the JSON object, no other text.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [{ role: 'user', content: userPrompt }],
                system: systemPrompt
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', response.status, errorText);

            // Provide more specific error messages
            if (response.status === 401) {
                return createResponse({ error: 'API authentication failed' }, 500, origin);
            } else if (response.status === 429) {
                return createResponse({ error: 'Rate limit exceeded. Try again later.' }, 429, origin);
            } else if (response.status >= 500) {
                return createResponse({ error: 'AI service temporarily unavailable' }, 502, origin);
            }
            return createResponse({ error: 'AI service error' }, 500, origin);
        }

        const data = await response.json();
        const aiResponse = data.content[0].text;

        let seoData;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                seoData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response:', aiResponse);
            return createResponse({ error: 'Failed to parse AI response' }, 500, origin);
        }

        return createResponse(seoData, 200, origin);

    } catch (error) {
        console.error('Function error:', error);
        return createResponse({ error: 'Internal server error' }, 500, origin);
    }
}

export async function onRequestOptions(context) {
    const { request } = context;
    const origin = request.headers.get('Origin') || '';

    // For preflight requests, return CORS headers even for rejected origins
    // so the browser can read the subsequent POST response
    const corsOrigin = allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0];

    // Return 403 status for non-allowed origins, but WITH CORS headers
    const status = allowedOrigins.includes(origin) ? 204 : 403;

    return new Response(null, {
        status,
        headers: {
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
