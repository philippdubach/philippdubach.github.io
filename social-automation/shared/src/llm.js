/**
 * Single-model JSON-mode generation. Returns the post message string.
 * This is a Phase 2 transition module — Phase 3 replaces it with shared/generator.js.
 */
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

const MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';

const JSON_SCHEMA = {
  type: 'object',
  required: ['post', 'angle', 'anchored_on', 'opener_words'],
  properties: {
    post: { type: 'string' },
    angle: { type: 'string', enum: ['surprise', 'tension', 'opinion', 'question', 'observation'] },
    anchored_on: { type: 'string' },
    opener_words: { type: 'array', items: { type: 'string' } },
  },
};

export async function generatePostMessage(ai, title, description, fullText = '', takeaways = '', maxLength = 250) {
  const MAX_MSG_LENGTH = Math.max(80, Math.min(280, maxLength));

  const articleData = {
    title,
    description: description || '',
    takeaways: Array.isArray(takeaways)
      ? takeaways
      : (typeof takeaways === 'string' && takeaways.length > 0
          ? takeaways.split('\n').filter(Boolean)
          : []),
    bodyExcerpt: (fullText || '').substring(0, 1500),
  };

  const system = buildSystemPrompt({ maxLength: MAX_MSG_LENGTH });
  const user = buildUserPrompt({ articleData, recentPosts: [] });

  try {
    const response = await ai.run(MODEL, {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
      max_tokens: 250,
      temperature: 0.85,
    });

    const raw = response?.response;
    if (!raw) throw new Error('No LLM response');

    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    let msg = (parsed.post || '').trim();
    if (!msg) throw new Error('Empty post field in JSON');

    if (msg.length > MAX_MSG_LENGTH) {
      const truncated = msg.substring(0, MAX_MSG_LENGTH);
      const lastBreak = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('?'));
      msg = lastBreak > MAX_MSG_LENGTH * 0.6
        ? truncated.substring(0, lastBreak + 1)
        : truncated.substring(0, MAX_MSG_LENGTH - 3) + '...';
    }

    return msg;
  } catch (e) {
    console.error('LLM generation failed:', e?.message || e);
    const fallback = title || '';
    return fallback.length > MAX_MSG_LENGTH ? fallback.substring(0, MAX_MSG_LENGTH - 3) + '...' : fallback;
  }
}
