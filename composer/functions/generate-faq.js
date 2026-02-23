/**
 * POST /generate-faq - Generate FAQ Schema entries for a blog post
 * Uses Anthropic API to produce 3-5 Q&A pairs for FAQPage structured data
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
            return createResponse({ error: 'Content too short for FAQ generation' }, 400, origin);
        }

        if (content.length > 50000) {
            return createResponse({ error: 'Content too long (max 50,000 characters)' }, 400, origin);
        }

        const systemPrompt = `You generate FAQ Schema entries for blog posts on philippdubach.com. These become FAQPage structured data (JSON-LD) which appears in Google rich results.

The blog covers: quantitative finance, AI/ML infrastructure, technology, economic analysis.

RULES:
- Generate 3-5 question/answer pairs
- Questions should be ones the post genuinely answers — not generic filler
- Questions should match what real people would search for (think "People Also Ask")
- Answers should be 2-4 sentences, standalone and factual
- Answers must be based on the post's actual content and data, not generic knowledge
- Use the author's voice: direct, quantitative, slightly opinionated
- No em dashes (—). Use commas, colons, or conjunctions instead

BANNED patterns:
- Generic questions like "Why is X important?" or "What are the benefits of X?"
- Answers starting with "Yes," or "No," without substance
- "crucial", "pivotal", "landscape", "serves as", "highlights the importance"
- Vague or promotional language
- Questions that don't reflect genuine search intent

GOOD question patterns:
- "How much does X cost compared to Y?"
- "What is the formula for X?"
- "Why did X happen in [specific year/context]?"
- "What percentage of X goes to Y?"

Respond ONLY with valid JSON: {"faq": [{"question": "...", "answer": "..."}, ...]}`;

        const safeTitle = sanitizeForPrompt(title || 'Untitled');
        const safeContent = sanitizeForPrompt(content.substring(0, 12000));

        const userPrompt = `Generate FAQ Schema entries for this blog post:

Title: ${safeTitle}

Content:
${safeContent}

Remember: Questions should match real search intent. Answers must use data from the post. Respond ONLY with the JSON object.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
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

        if (!Array.isArray(result.faq) || result.faq.length === 0) {
            return createResponse({ error: 'AI returned no FAQ entries' }, 500, origin);
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
