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

test('soft score: bonus for containing a specific number', () => {
  const withNumber = { ...validCandidate, post: 'Hedge funds shorting utilities at the 99th percentile have increased positions dramatically.' };
  const withoutNumber = { ...validCandidate, post: 'Hedge funds shorting utilities at peak levels have increased positions very dramatically so far.' };
  const sNum = scoreCandidate(withNumber, [], { maxLength: 250 });
  const sNo = scoreCandidate(withoutNumber, [], { maxLength: 250 });
  assert.ok(sNum.score > sNo.score, 'number-bearing candidate should score higher');
});

test('soft score: bonus for angle differing from last 3', () => {
  const recent = [
    { message: 'a', angle: 'surprise' },
    { message: 'b', angle: 'surprise' },
    { message: 'c', angle: 'surprise' },
  ];
  const sameAngle = { ...validCandidate, angle: 'surprise', post: 'A different sentence with the word ninety-nine in it. Markets are shifting in unexpected directions.' };
  const diffAngle = { ...validCandidate, angle: 'opinion', post: 'A different sentence with the word ninety-nine in it. Markets are shifting in unexpected directions.' };
  const sSame = scoreCandidate(sameAngle, recent, { maxLength: 250 });
  const sDiff = scoreCandidate(diffAngle, recent, { maxLength: 250 });
  assert.ok(sDiff.score > sSame.score, 'differing angle should score higher');
});

test('pick chooses highest-scoring among survivors', () => {
  const lowScore = { post: 'Hedge funds have been shorting utilities at peak levels during the most recent quarter ending last month.', angle: 'opinion', anchored_on: 'title', opener_words: ['Hedge', 'funds', 'have'] };
  const highScore = { post: 'Hedge funds shorting utilities at the 99th percentile have increased positions dramatically against demand projections.', angle: 'surprise', anchored_on: 'title', opener_words: ['Hedge', 'funds', 'shorting'] };
  const result = pick([lowScore, highScore], [], { maxLength: 250 });
  assert.strictEqual(result.message, highScore.post);
});

test('pick returns null when all candidates hard-rejected', () => {
  const bad1 = { ...validCandidate, post: 'Worth reading: this article on transformative paradigms.' };
  const bad2 = { ...validCandidate, post: 'New post — check it out at https://example.com' };
  const result = pick([bad1, bad2], [], { maxLength: 250 });
  assert.strictEqual(result, null);
});
