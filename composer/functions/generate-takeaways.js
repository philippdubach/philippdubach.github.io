/**
 * POST /generate-takeaways - Generate key takeaways for a blog post
 * Uses Anthropic API to produce 3-4 data-first, citation-ready takeaways
 */

function sanitizeForPrompt(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/```[\s\S]*?```/g, '[code block removed]')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const allowedOrigins = [
    'https://post-composer.pages.dev',
    'http://localhost:8788',
    'http://127.0.0.1:8788',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

function createResponse(body, status, origin) {
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store',
        }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const origin = request.headers.get('Origin') || '';

    if (!env.ANTHROPIC_API_KEY) {
        return createResponse({ error: 'API key not configured' }, 500, origin);
    }

    if (!allowedOrigins.includes(origin)) {
        return createResponse({ error: `Origin not allowed: ${origin || '(none)'}` }, 403, origin);
    }

    try {
        let title, content;
        try {
            const body = await request.json();
            title = body.title;
            content = body.content;
        } catch {
            return createResponse({ error: 'Invalid JSON in request body' }, 400, origin);
        }

        if (!content || content.trim().length < 100) {
            return createResponse({ error: 'Content too short for takeaway generation' }, 400, origin);
        }

        if (content.length > 50000) {
            return createResponse({ error: 'Content too long (max 50,000 characters)' }, 400, origin);
        }

        const systemPrompt = `You generate key takeaways for blog posts on philippdubach.com. Takeaways render as a visible summary box between the post header and content, optimized for AI search citation (GEO).

STYLE RULES — follow exactly:
- Data-first: Every takeaway MUST lead with a specific number, formula, percentage, or concrete finding from the post
- One sentence each. NEVER use em dashes (—). Connect clauses with commas, colons, "meaning", "because", or "but"
- 3-4 takeaways per post
- Standalone and citation-ready: each must make sense without reading the post. An AI search engine should be able to quote it directly
- Under ~30 words each (average 20-25)
- Match the author's voice: direct, quantitative, slightly opinionated. Not academic, not promotional

BANNED patterns (these are signs of AI writing — never use them):
- "highlights the importance of", "serves as a testament to", "underscores"
- "crucial", "pivotal", "landscape", "tapestry", "multifaceted", "delve"
- "fostering", "garnering", "showcasing", "enhancing"
- Rule-of-three lists
- Vague attributions ("experts say", "industry observers note")
- Inflated significance language

GOOD examples from the site:
- "Variance drain equals 1/2 sigma squared: doubling volatility quadruples the cost to compound returns"
- "A 30-second Super Bowl spot costs $8M but $16-23M fully loaded with production, talent, and mandatory companion buys"
- "Oral semaglutide has ~1% bioavailability, meaning each pill destroys 99% of its active ingredient"

Respond ONLY with valid JSON: {"takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]}`;

        const safeTitle = sanitizeForPrompt(title || 'Untitled');
        const safeContent = sanitizeForPrompt(content.substring(0, 12000));

        const userPrompt = `Generate key takeaways for this blog post:

Title: ${safeTitle}

Content:
${safeContent}

Remember: Lead each takeaway with the most specific data point. Respond ONLY with the JSON object.`;

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
            if (response.status === 401) return createResponse({ error: 'API authentication failed' }, 500, origin);
            if (response.status === 429) return createResponse({ error: 'Rate limit exceeded. Try again later.' }, 429, origin);
            if (response.status >= 500) return createResponse({ error: 'AI service temporarily unavailable' }, 502, origin);
            return createResponse({ error: 'AI service error' }, 500, origin);
        }

        const data = await response.json();
        const aiResponse = data.content[0].text;

        let result;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response:', aiResponse);
            return createResponse({ error: 'Failed to parse AI response' }, 500, origin);
        }

        if (!Array.isArray(result.takeaways) || result.takeaways.length === 0) {
            return createResponse({ error: 'AI returned no takeaways' }, 500, origin);
        }

        return createResponse(result, 200, origin);
    } catch (error) {
        console.error('Function error:', error);
        return createResponse({ error: 'Internal server error' }, 500, origin);
    }
}

export async function onRequestOptions(context) {
    const origin = context.request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
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
