import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildSystemPrompt, buildUserPrompt } from '../src/prompt.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(join(__dirname, 'fixtures', name), 'utf8');

test('buildSystemPrompt with default maxLength matches fixture', () => {
  const actual = buildSystemPrompt({ maxLength: 250 });
  assert.strictEqual(actual.trim(), fixture('prompt-system.txt').trim());
});

test('buildSystemPrompt includes the platform-specific length cap', () => {
  const out = buildSystemPrompt({ maxLength: 230 });
  assert.ok(out.includes('230 characters'), 'should mention 230 char cap');
});

test('buildSystemPrompt always includes opener-ban list', () => {
  const out = buildSystemPrompt({ maxLength: 250 });
  for (const banned of ['Worth reading', 'Wrote about', 'New post', 'Just posted', 'Check out', 'Read this', "Here's", 'Thoughts on']) {
    assert.ok(out.includes(banned), `system prompt missing banned opener "${banned}"`);
  }
});

test('buildUserPrompt with no recent posts matches fixture', () => {
  const actual = buildUserPrompt({
    articleData: {
      title: 'The SaaSpocalypse Paradox',
      description: 'The market is simultaneously pricing AI capex failure and AI destroying all software.',
      takeaways: [
        'The IGV software ETF fell 32% to an RSI of 18, the most oversold reading since 1990.',
        'Software trades at 32.4x forward earnings versus 43.6x for semiconductors.',
      ],
      bodyExcerpt: 'On January 30 2026, Anthropic released 11 open-source plugins for Claude Cowork.',
    },
    recentPosts: [],
  });
  assert.strictEqual(actual.trim(), fixture('prompt-user-basic.txt').trim());
});

test('buildUserPrompt includes recent posts when supplied', () => {
  const out = buildUserPrompt({
    articleData: { title: 'X', description: 'd', takeaways: [], bodyExcerpt: 'b' },
    recentPosts: [
      { message: 'Passive investing trends, the numbers were surprising.', angle: 'surprise' },
      { message: 'Private equity might just be leveraged beta with a lockup period.', angle: 'opinion' },
    ],
  });
  assert.ok(out.includes('RECENT POSTS'), 'should include recent-posts section header');
  assert.ok(out.includes('[angle=surprise]'), 'should annotate angles');
  assert.ok(out.includes('Passive investing trends'), 'should include message text');
});

test('buildUserPrompt omits recent-posts section when array empty', () => {
  const out = buildUserPrompt({
    articleData: { title: 'X', description: 'd', takeaways: [], bodyExcerpt: 'b' },
    recentPosts: [],
  });
  assert.ok(!out.includes('RECENT POSTS'), 'should not include recent-posts header when empty');
});
