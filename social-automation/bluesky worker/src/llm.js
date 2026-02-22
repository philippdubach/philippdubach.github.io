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

const SYSTEM_PROMPT = `You are writing a short social post to share an article from your own finance and technology blog. You are a person sharing something you wrote and found interesting, not a bot summarizing content.

Your voice: dry, direct, occasionally wry. You have opinions and aren't afraid to state them plainly. You notice irony and contradictions. You prefer understatement to hype.

Write ONE short post (under 250 characters). No emojis. No hashtags. No URLs.

Pick ONE of these angles:
- The single most surprising finding or number from the article
- A tension, contradiction, or irony in the subject
- A strong opinion stated plainly
- A question the article raises but doesn't fully answer
- "Worth reading" or "Wrote about" framing with a specific hook

Examples of the voice and variety you should aim for:
- Passive investing trends, the numbers were surprising.
- Worth reading: Apple's AI strategy and why they're holding back.
- A 3x leveraged S&P ETF returned less than 2x over the last decade. The math of why is more interesting than you'd expect.
- 85% of enterprise AI projects fail. The problem isn't the AI.
- Hedge funds are shorting utilities at the 99th percentile. That's a bet against AI power demand.
- Wrote about the Super Bowl ad market. An $8M spot actually costs $23M and the ROI evidence is surprisingly thin.
- The Fed decision and what it means for rates.
- Private equity might just be leveraged beta with a lockup period attached.
- Funny thing about variance drain: you can average +10% a year and still lose money.

Never use these words: delve, realm, harness, unlock, tapestry, paradigm, cutting-edge, revolutionize, landscape, potential, findings, intricate, showcasing, crucial, pivotal, surpass, meticulously, vibrant, unparalleled, underscore, leverage, synergy, innovative, game-changer, testament, commendable, meticulous, groundbreaking, align, foster, showcase, enhance, holistic, garner, pioneering, trailblazing, unleash, versatile, transformative, redefine, seamless, optimize, scalable, robust, breakthrough, empower, streamline, frictionless, elevate, adaptive, effortless, data-driven, insightful, proactive, mission-critical, visionary, disruptive, reimagine, unprecedented, intuitive, leading-edge, democratize, state-of-the-art, dynamic, novel, unique, utilize, impactful

Output ONLY the post text. No quotes. No labels. No explanation.`;

export async function generatePostMessage(ai, title, description, fullText = '', takeaways = '') {
  try {
    const safeTitle = sanitizeForPrompt(title);

    // Build structured user prompt with all available context
    let userPrompt = `Article title: ${safeTitle}\n`;

    if (description) {
      userPrompt += `Author's summary: ${sanitizeForPrompt(description)}\n`;
    }

    if (takeaways) {
      userPrompt += `\nKey points the author highlighted:\n${sanitizeForPrompt(takeaways)}\n`;
    }

    if (fullText) {
      userPrompt += `\nArticle excerpt:\n${sanitizeForPrompt(fullText)}\n`;
    }

    userPrompt += '\nWrite your post.';

    const response = await ai.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 0.85,
    });

    if (response?.response) {
      let msg = response.response.trim()
        // Strip surrounding quotes (single, double, or smart quotes)
        .replace(/^[\u201C\u201D\u2018\u2019"']+|[\u201C\u201D\u2018\u2019"']+$/g, '')
        // Strip URLs
        .replace(/https?:\/\/[^\s]+/g, '')
        // Replace em dashes with periods for deliberate pauses
        .replace(/\s*—\s*/g, '. ')
        // Clean up double periods
        .replace(/\.\s*\./g, '.')
        // Clean up double spaces
        .replace(/\s{2,}/g, ' ')
        .trim();

      // Truncate to 250 chars with sentence-boundary awareness
      const MAX_MSG_LENGTH = 250;
      if (msg.length > MAX_MSG_LENGTH) {
        const truncated = msg.substring(0, MAX_MSG_LENGTH);
        const lastPeriod = truncated.lastIndexOf('.');
        const lastQuestion = truncated.lastIndexOf('?');
        const lastBreak = Math.max(lastPeriod, lastQuestion);
        msg = lastBreak > MAX_MSG_LENGTH * 0.6
          ? truncated.substring(0, lastBreak + 1)
          : truncated.substring(0, MAX_MSG_LENGTH - 3) + '...';
      }

      return msg;
    }
    throw new Error('No response');
  } catch (e) {
    // Use sanitized title in fallback
    const safeTitle = sanitizeForPrompt(title);
    const fallback = `New post: ${safeTitle}`;
    return fallback.length > 250 ? fallback.substring(0, 247) + '...' : fallback;
  }
}
