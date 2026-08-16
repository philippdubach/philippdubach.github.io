import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  claimPost,
  classifyPublishError,
  createPendingPostState,
  markPostBackfilled,
  markPostFailed,
  markPostPending,
  markPostPublished,
  markPostUncertain,
} from '../src/post-gate-state.js';

const job = {
  version: 1,
  platform: 'twitter',
  articleId: 'durable-social-delivery',
  url: 'https://philippdubach.com/posts/durable-social-delivery/',
  title: 'Durable Social Delivery',
  message: 'At-least-once queues and non-idempotent APIs are an awkward combination.',
  createdAt: '2026-08-16T10:00:00.000Z',
};

const firstTransitionAt = new Date('2026-08-16T10:01:00.000Z');
const secondTransitionAt = new Date('2026-08-16T10:02:00.000Z');

function attemptingState() {
  return claimPost(createPendingPostState(firstTransitionAt), job, firstTransitionAt).state;
}

test('first pending claim becomes attempting before publication is granted', () => {
  const result = claimPost(createPendingPostState(firstTransitionAt), job, firstTransitionAt);

  assert.strictEqual(result.claimed, true);
  assert.strictEqual(result.state.status, 'attempting');
  assert.deepStrictEqual(result.state.job, job);
  assert.strictEqual(result.state.updatedAt, '2026-08-16T10:01:00.000Z');
});

test('an attempting job never grants a second publish claim', () => {
  const attempting = attemptingState();
  const result = claimPost(attempting, job, secondTransitionAt);

  assert.strictEqual(result.claimed, false);
  assert.deepStrictEqual(result.state, attempting);
});

test('published and backfilled states are terminal for claims and retry transitions', () => {
  const published = markPostPublished(
    attemptingState(),
    { id: 'tweet-123' },
    secondTransitionAt,
  );
  const backfilled = markPostBackfilled(
    createPendingPostState(firstTransitionAt),
    { source: 'rss' },
    secondTransitionAt,
  );

  for (const terminal of [published, backfilled]) {
    assert.strictEqual(claimPost(terminal, job, secondTransitionAt).claimed, false);
    assert.deepStrictEqual(
      markPostPending(terminal, { status: 429 }, secondTransitionAt),
      terminal,
    );
  }
});

test('retryable failure returns an attempting job to pending', () => {
  const pending = markPostPending(
    attemptingState(),
    { name: 'PublishError', status: 429, stage: 'response' },
    secondTransitionAt,
  );

  assert.strictEqual(pending.status, 'pending');
  assert.strictEqual(pending.error.status, 429);
  assert.strictEqual(pending.updatedAt, '2026-08-16T10:02:00.000Z');
  assert.strictEqual(claimPost(pending, job, secondTransitionAt).claimed, true);
});

test('published, failed, uncertain, and backfilled transitions store their terminal result', () => {
  const attempting = attemptingState();
  const cases = [
    [markPostPublished(attempting, { id: 'post-123' }, secondTransitionAt), 'published', 'result'],
    [markPostFailed(attempting, { code: 'INVALID_PAYLOAD' }, secondTransitionAt), 'failed', 'error'],
    [markPostUncertain(attempting, { code: 'ETIMEDOUT' }, secondTransitionAt), 'uncertain', 'error'],
    [markPostBackfilled(createPendingPostState(firstTransitionAt), { source: 'rss' }, secondTransitionAt), 'backfilled', 'metadata'],
  ];

  for (const [state, status, detailField] of cases) {
    assert.strictEqual(state.status, status);
    assert.ok(state[detailField]);
    assert.strictEqual(claimPost(state, job, secondTransitionAt).claimed, false);
  }
});

test('429 and known pre-send failures classify retryable', () => {
  assert.strictEqual(classifyPublishError({ status: 429, stage: 'response' }), 'retryable');
  assert.strictEqual(
    classifyPublishError({ code: 'EAI_AGAIN', stage: 'pre-send' }),
    'retryable',
  );
});

test('network and timeout errors after an attempted request classify uncertain', () => {
  assert.strictEqual(classifyPublishError(new TypeError('fetch failed')), 'uncertain');
  assert.strictEqual(classifyPublishError({ name: 'AbortError' }), 'uncertain');
  assert.strictEqual(classifyPublishError({ code: 'ETIMEDOUT' }), 'uncertain');
});

test('5xx and post-response parse failures classify uncertain', () => {
  assert.strictEqual(classifyPublishError({ status: 500, stage: 'response' }), 'uncertain');
  assert.strictEqual(classifyPublishError({ status: 503, stage: 'response' }), 'uncertain');
  assert.strictEqual(classifyPublishError({ stage: 'response-parse' }), 'uncertain');
});

test('authentication and invalid payload errors classify failed', () => {
  assert.strictEqual(classifyPublishError({ status: 401, stage: 'response' }), 'failed');
  assert.strictEqual(classifyPublishError({ status: 403, stage: 'response' }), 'failed');
  assert.strictEqual(classifyPublishError({ status: 400, code: 'INVALID_PAYLOAD' }), 'failed');
  assert.strictEqual(classifyPublishError({ code: 'AUTH_FAILED' }), 'failed');
});
