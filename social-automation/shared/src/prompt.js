/**
 * System + user prompt builders for social-post generation.
 * Output contract: JSON object with keys {post, angle, anchored_on, opener_words}.
 */

const BANNED_OPENERS = [
  'Worth reading',
  'Wrote about',
  'New post',
  'Just posted',
  'Check out',
  'Read this',
  "Here's",
  'Thoughts on',
];

const BANNED_WORDS = [
  'delve', 'realm', 'harness', 'unlock', 'tapestry', 'paradigm', 'cutting-edge',
  'revolutionize', 'landscape', 'potential', 'findings', 'intricate', 'showcasing',
  'crucial', 'pivotal', 'surpass', 'meticulously', 'vibrant', 'unparalleled',
  'underscore', 'leverage', 'synergy', 'innovative', 'game-changer', 'testament',
  'commendable', 'meticulous', 'groundbreaking', 'align', 'foster', 'showcase',
  'enhance', 'holistic', 'garner', 'pioneering', 'trailblazing', 'unleash',
  'versatile', 'transformative', 'redefine', 'seamless', 'optimize', 'scalable',
  'robust', 'breakthrough', 'empower', 'streamline', 'frictionless', 'elevate',
  'adaptive', 'effortless', 'data-driven', 'insightful', 'proactive',
  'mission-critical', 'visionary', 'disruptive', 'reimagine', 'unprecedented',
  'intuitive', 'leading-edge', 'democratize', 'state-of-the-art', 'dynamic',
  'novel', 'unique', 'utilize', 'impactful',
];

export { BANNED_OPENERS, BANNED_WORDS };

export function buildSystemPrompt({ maxLength = 250 } = {}) {
  return `You are writing a short social post to share an article from your own finance and technology blog. You are a person sharing something you wrote and found interesting, not a bot summarizing content.

Your voice: dry, direct, occasionally wry. You have opinions and aren't afraid to state them plainly. You notice irony and contradictions. You prefer understatement to hype.

Write ONE short post under ${maxLength} characters. No emojis. No hashtags. No URLs. No em dashes.

Pick ONE angle:
- surprise: lead with the single most surprising finding or number
- tension: a contradiction or irony in the subject
- opinion: a strong opinion stated plainly
- question: a question the article raises but doesn't fully answer
- observation: a concrete observation that sets up the rest of the piece

Do NOT start the post with: ${BANNED_OPENERS.join(', ')}. Open with the substance, not a label.

Never use these words: ${BANNED_WORDS.join(', ')}.

Output a single JSON object with exactly these keys:
{
  "post": "the actual social post (string)",
  "angle": "surprise | tension | opinion | question | observation",
  "anchored_on": "title | description | takeaway:<index> | excerpt",
  "opener_words": ["first", "three", "words"]
}

Output ONLY the JSON object. No prose, no markdown fence, no quotes around the object.`;
}

export function buildUserPrompt({ articleData, recentPosts = [] }) {
  const { title, description, takeaways = [], bodyExcerpt = '' } = articleData;

  const takeawaysBlock = takeaways.length
    ? takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')
    : '(none)';

  let prompt = `ARTICLE
Title: ${title}
Author's description: ${description}

Key takeaways (the author's pulled-out points):
${takeawaysBlock}

Article excerpt (first ~1500 chars):
${bodyExcerpt}`;

  if (recentPosts.length > 0) {
    const recentBlock = recentPosts
      .map((p, i) => `${i + 1}. [angle=${p.angle || 'unknown'}] "${p.message}"`)
      .join('\n');
    prompt += `\n\nRECENT POSTS ON THIS PLATFORM (do NOT repeat opener words, sentence shape, or angle):\n${recentBlock}`;
  }

  prompt += `\n\nWrite the post. Output ONLY the JSON object.`;
  return prompt;
}
