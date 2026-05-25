import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate } from '../src/generator.js';

function makeAi({ responses }) {
  const calls = [];
  return {
    calls,
    run: async (model, args) => {
      calls.push({ model, args });
      const r = responses[model];
      if (typeof r === 'function') return r();
      return r;
    },
  };
}

const articleData = {
  title: 'T',
  description: 'D',
  takeaways: ['take 1'],
  bodyExcerpt: 'B',
};

test('generate calls both models in parallel', async () => {
  const ai = makeAi({
    responses: {
      '@cf/openai/gpt-oss-120b': { response: JSON.stringify({ post: 'A', angle: 'surprise', anchored_on: 'title', opener_words: ['A'] }) },
      '@cf/openai/gpt-oss-20b':  { response: JSON.stringify({ post: 'B', angle: 'opinion',  anchored_on: 'title', opener_words: ['B'] }) },
    },
  });
  const candidates = await generate(ai, { articleData, recentPosts: [], maxLength: 250 });
  assert.strictEqual(candidates.length, 2);
  const models = ai.calls.map(c => c.model).sort();
  assert.deepStrictEqual(models, ['@cf/openai/gpt-oss-120b', '@cf/openai/gpt-oss-20b']);
});

test('generate returns single candidate when one model errors', async () => {
  const ai = makeAi({
    responses: {
      '@cf/openai/gpt-oss-120b': { response: JSON.stringify({ post: 'OK', angle: 'surprise', anchored_on: 'title', opener_words: ['OK'] }) },
      '@cf/openai/gpt-oss-20b':  () => { throw new Error('boom'); },
    },
  });
  const candidates = await generate(ai, { articleData, recentPosts: [], maxLength: 250 });
  assert.strictEqual(candidates.length, 1);
  assert.strictEqual(candidates[0].post, 'OK');
});

test('generate drops candidates with malformed JSON', async () => {
  const ai = makeAi({
    responses: {
      '@cf/openai/gpt-oss-120b': { response: 'not valid json {' },
      '@cf/openai/gpt-oss-20b':  { response: JSON.stringify({ post: 'OK', angle: 'surprise', anchored_on: 'title', opener_words: ['OK'] }) },
    },
  });
  const candidates = await generate(ai, { articleData, recentPosts: [], maxLength: 250 });
  assert.strictEqual(candidates.length, 1);
  assert.strictEqual(candidates[0].post, 'OK');
});

test('generate returns empty array when both fail', async () => {
  const ai = makeAi({
    responses: {
      '@cf/openai/gpt-oss-120b': () => { throw new Error('x'); },
      '@cf/openai/gpt-oss-20b':  () => { throw new Error('y'); },
    },
  });
  const candidates = await generate(ai, { articleData, recentPosts: [], maxLength: 250 });
  assert.deepStrictEqual(candidates, []);
});

test('generate passes maxLength through to system prompt', async () => {
  const ai = makeAi({
    responses: {
      '@cf/openai/gpt-oss-120b': { response: JSON.stringify({ post: 'A', angle: 'surprise', anchored_on: 'title', opener_words: ['A'] }) },
      '@cf/openai/gpt-oss-20b':  { response: JSON.stringify({ post: 'B', angle: 'opinion',  anchored_on: 'title', opener_words: ['B'] }) },
    },
  });
  await generate(ai, { articleData, recentPosts: [], maxLength: 230 });
  const sys = ai.calls[0].args.messages[0].content;
  assert.ok(sys.includes('230 characters'), 'system prompt should reflect 230 char cap');
});
