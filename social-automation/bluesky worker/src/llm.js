/**
 * LLM Integration using Cloudflare Workers AI
 */

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
    // Limit length to prevent context overflow attacks
    .substring(0, 3000)
    .trim();
}

const SYSTEM_PROMPT = `You write short social media posts for a finance and technology blog.

Style rules:
- Use neutral, factual tone
- Vary your sentence structure, do not always start with "We"
- Be understated, not dramatic or clickbaity
- State what the post covers plainly
- Maximum 200 characters
- No emojis
- No hashtags
- No em dashes, connect sentences directly or use commas
- Do not include URLs

Vary openings. Good examples:
- A new paper on market microstructure has some interesting points.
- The Fed decision and what it means for rates.
- Passive investing trends, the numbers were surprising.
- Looking at how GLP-1 drugs might affect addiction treatment.
- This paper challenges some assumptions about Bitcoin security.
- Worth reading: Apple's AI strategy and why they're holding back.

Banned words (never use): delve, realm, harness, unlock, tapestry, paradigm, cutting-edge, revolutionize, landscape, potential, findings, intricate, showcasing, crucial, pivotal, surpass, meticulously, vibrant, unparalleled, underscore, leverage, synergy, innovative, game-changer, testament, commendable, meticulous, highlight, emphasize, boast, groundbreaking, align, foster, showcase, enhance, holistic, garner, accentuate, pioneering, trailblazing, unleash, versatile, transformative, redefine, seamless, optimize, scalable, robust, breakthrough, empower, streamline, intelligent, smart, next-gen, frictionless, elevate, adaptive, effortless, data-driven, insightful, proactive, mission-critical, visionary, disruptive, reimagine, agile, customizable, personalized, unprecedented, intuitive, leading-edge, synergize, democratize, automate, accelerate, state-of-the-art, dynamic, reliable, efficient, cloud-native, immersive, predictive, transparent, proprietary, integrated, plug-and-play, turnkey, future-proof, open-ended, AI-powered, next-generation, always-on, hyper-personalized, results-driven, machine-first, paradigm-shifting, novel, unique, utilize, impactful`;

export async function generatePostMessage(ai, title, description, fullText = '') {
  try {
    // Sanitize inputs to prevent prompt injection
    const safeTitle = sanitizeForPrompt(title);
    const context = fullText || description;
    const safeContext = sanitizeForPrompt(context);

    const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Write a post for: ${safeTitle}\n\nFull article:\n${safeContext}\n\nOutput only the post text, under 200 characters.` },
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    if (response?.response) {
      let msg = response.response.trim().replace(/^["']|["']$/g, '').replace(/https?:\/\/[^\s]+/g, '').replace(/—/g, ',').trim();
      return msg.length > 200 ? msg.substring(0, 197) + '...' : msg;
    }
    throw new Error('No response');
  } catch (e) {
    // Use sanitized title in fallback
    const safeTitle = sanitizeForPrompt(title);
    const fallback = `New post: ${safeTitle}`;
    return fallback.length > 200 ? fallback.substring(0, 197) + '...' : fallback;
  }
}
