import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recentPosts } from '../src/state.js';

function makeKv(entries) {
  return {
    list: async ({ prefix = '', limit = 1000 } = {}) => {
      const keys = entries
        .filter(([k]) => k.startsWith(prefix))
        .slice(0, limit)
        .map(([name]) => ({ name }));
      return { keys, list_complete: true };
    },
    get: async (key, type) => {
      const found = entries.find(([k]) => k === key);
      if (!found) return null;
      return type === 'json' ? JSON.parse(found[1]) : found[1];
    },
  };
}

test('recentPosts returns empty when KV is empty', async () => {
  const kv = makeKv([]);
  const out = await recentPosts(kv, { n: 15 });
  assert.deepStrictEqual(out, []);
});

test('recentPosts returns last N posted entries sorted by recency', async () => {
  const entries = [
    ['posts:a', JSON.stringify({ message: 'first', angle: 'opinion', at: '2026-05-01T00:00:00Z' })],
    ['posts:b', JSON.stringify({ message: 'second', angle: 'surprise', at: '2026-05-15T00:00:00Z' })],
    ['posts:c', JSON.stringify({ message: 'third', angle: 'question', at: '2026-05-10T00:00:00Z' })],
  ];
  const kv = makeKv(entries);
  const out = await recentPosts(kv, { n: 2 });
  assert.strictEqual(out.length, 2);
  assert.strictEqual(out[0].message, 'second');
  assert.strictEqual(out[1].message, 'third');
});

test('recentPosts skips entries without message field (backfilled or legacy)', async () => {
  const entries = [
    ['posts:a', JSON.stringify({ title: 'legacy', uri: 'at://x', at: '2026-05-15T00:00:00Z' })],
    ['posts:b', JSON.stringify({ message: 'modern', angle: 'opinion', at: '2026-05-10T00:00:00Z' })],
  ];
  const kv = makeKv(entries);
  const out = await recentPosts(kv, { n: 15 });
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].message, 'modern');
});

test('recentPosts respects prefix to ignore lock keys', async () => {
  const entries = [
    ['lock:x', '1'],
    ['ratelimit:1.2.3.4', '{}'],
    ['posts:a', JSON.stringify({ message: 'only this', angle: 'opinion', at: '2026-05-15T00:00:00Z' })],
  ];
  const kv = makeKv(entries);
  const out = await recentPosts(kv, { n: 15 });
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].message, 'only this');
});
