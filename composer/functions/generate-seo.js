export async function onRequestPost(context) {
    const { request, env } = context;
    
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
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
        
        const systemPrompt = `You are an SEO expert for philippdubach.com, a blog focused on:
- Quantitative Finance & Macro Strategy
- AI/ML Infrastructure and LLM Economics
- Technology and Software Engineering
- Economic Analysis and Market Structure

Your task is to generate SEO metadata for blog posts. The target audience is professionals and enthusiasts interested in finance, technology, and data science.

Guidelines:
- Title: Keep the original title or suggest minor improvements for SEO (60 chars max)
- Description: Write a compelling meta description (150-160 chars) that summarizes the key value proposition
- Keywords: Generate 8-12 relevant keywords, mix of broad and specific terms
- Consider search intent: what would someone searching for this content type?
- Use natural language, avoid keyword stuffing
- Focus on unique angles and specific insights from the content

Respond ONLY with valid JSON in this exact format:
{
    "title": "SEO-optimized title",
    "description": "Meta description for search engines",
    "keywords": ["keyword1", "keyword2", "keyword3"]
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

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
