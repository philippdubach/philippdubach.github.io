import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

const MODELS = [
  { name: '@cf/openai/gpt-oss-120b', temperature: 0.85 },
  { name: '@cf/openai/gpt-oss-20b',  temperature: 0.95 },
];

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

async function callOne(ai, model, system, user, temperature) {
  try {
    const r = await ai.run(model, {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
      max_tokens: 250,
      temperature,
    });
    const raw = r?.response;
    if (!raw) return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed?.post) return null;
    return { ...parsed, _model: model };
  } catch (e) {
    console.error(`[generate] ${model} failed:`, e?.message || e);
    return null;
  }
}

export async function generate(ai, { articleData, recentPosts = [], maxLength = 250 }) {
  const system = buildSystemPrompt({ maxLength });
  const user = buildUserPrompt({ articleData, recentPosts });
  const results = await Promise.all(
    MODELS.map(m => callOne(ai, m.name, system, user, m.temperature))
  );
  return results.filter(Boolean);
}
