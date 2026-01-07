export async function onRequestPost(context) {
    const { request, env } = context;
    
    // Get origin for CORS - restrict to same origin in production
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
        'https://post-composer.pages.dev',
        'http://localhost:8788',
        'http://127.0.0.1:8788'
    ];
    
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    try {
        const { title, content } = await request.json();
        
        if (!content || content.trim().length < 50) {
            return new Response(JSON.stringify({ error: 'Content too short for SEO generation' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        // Validate input lengths to prevent abuse
        if (content.length > 50000) {
            return new Response(JSON.stringify({ error: 'Content too long (max 50,000 characters)' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        if (title && title.length > 500) {
            return new Response(JSON.stringify({ error: 'Title too long (max 500 characters)' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
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

        const userPrompt = `Generate SEO metadata for this blog post:

Title: ${title || 'Untitled'}

Content:
${content.substring(0, 8000)}

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
                messages: [
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                system: systemPrompt
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Anthropic API error:', errorText);
            return new Response(JSON.stringify({ error: 'AI service error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        const data = await response.json();
        const aiResponse = data.content[0].text;
        
        // Parse the JSON response
        let seoData;
        try {
            // Try to extract JSON from the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                seoData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response:', aiResponse);
            return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify(seoData), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Function error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestOptions(context) {
    const { request } = context;
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
        'https://post-composer.pages.dev',
        'http://localhost:8788',
        'http://127.0.0.1:8788'
    ];
    
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
