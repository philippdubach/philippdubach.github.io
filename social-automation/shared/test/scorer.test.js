import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pick, scoreCandidate } from '../src/scorer.js';

const validCandidate = {
  post: 'Hedge funds are shorting utilities at the 99th percentile. A bet against AI power demand.',
  angle: 'surprise',
  anchored_on: 'takeaway:1',
  opener_words: ['Hedge', 'funds', 'are'],
};

test('pick returns null on empty candidates', () => {
  assert.strictEqual(pick([], [], { maxLength: 250 }), null);
});

test('pick returns single valid candidate', () => {
  const result = pick([validCandidate], [], { maxLength: 250 });
  assert.deepStrictEqual(result.message, validCandidate.post);
});

test('hard reject: contains banned word', () => {
  const bad = { ...validCandidate, post: 'This is a transformative paradigm.' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
  assert.ok(s.reasons.some(r => r.includes('banned word')));
});

test('hard reject: starts with banned opener "Worth reading"', () => {
  const bad = { ...validCandidate, post: 'Worth reading: A look at hedge funds shorting utilities.' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
  assert.ok(s.reasons.some(r => r.includes('banned opener')));
});

test('hard reject: starts with banned opener case-insensitive', () => {
  const bad = { ...validCandidate, post: 'WORTH READING this analysis' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
});

test('hard reject: first 5 words match a recent post', () => {
  const recent = [{ message: 'Hedge funds are shorting utilities at peak levels last quarter.', angle: 'surprise' }];
  const s = scoreCandidate(validCandidate, recent, { maxLength: 250 });
  assert.strictEqual(s.score, 0);
  assert.ok(s.reasons.some(r => r.includes('first-5-words')));
});

test('hard reject: too long', () => {
  const bad = { ...validCandidate, post: 'x'.repeat(300) };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
  assert.ok(s.reasons.some(r => r.includes('length')));
});

test('hard reject: too short', () => {
  const bad = { ...validCandidate, post: 'too short' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
});

test('hard reject: contains em dash', () => {
  const bad = { ...validCandidate, post: 'Hedge funds are shorting utilities — a bet against demand.' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
  assert.ok(s.reasons.some(r => r.includes('em dash')));
});

test('hard reject: contains URL', () => {
  const bad = { ...validCandidate, post: 'Hedge funds are shorting utilities. See https://example.com for details.' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
});

test('hard reject: contains emoji', () => {
  const bad = { ...validCandidate, post: 'Hedge funds are shorting utilities at the 99th percentile 📉.' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
});

test('hard reject: contains hashtag', () => {
  const bad = { ...validCandidate, post: 'Hedge funds are shorting utilities at the 99th percentile #finance.' };
  const s = scoreCandidate(bad, [], { maxLength: 250 });
  assert.strictEqual(s.score, 0);
});
