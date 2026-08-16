import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPostJob, jobKey, parsePostJob } from '../src/post-job.js';

const canonicalJob = {
  version: 1,
  platform: 'bluesky',
  articleId: 'sovereign-ai-infrastructure',
  url: 'https://philippdubach.com/posts/sovereign-ai-infrastructure/',
  title: 'Sovereign AI Infrastructure',
  message: 'The expensive part of sovereign AI is not the model. It is everything underneath it.',
  createdAt: '2026-08-16T10:15:30.000Z',
};

test('createPostJob produces the exact plain-JSON queue body', () => {
  const job = createPostJob(
    'bluesky',
    {
      id: 'sovereign-ai-infrastructure',
      url: 'https://philippdubach.com/posts/sovereign-ai-infrastructure/',
      title: 'Sovereign AI Infrastructure',
      ignored: 'not part of the queue contract',
    },
    'The expensive part of sovereign AI is not the model. It is everything underneath it.',
    new Date('2026-08-16T10:15:30.000Z'),
  );

  assert.deepStrictEqual(job, canonicalJob);
  assert.strictEqual(Object.getPrototypeOf(job), Object.prototype);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(job)), canonicalJob);
});

test('parsePostJob accepts a literal canonical job without retaining caller identity', () => {
  const parsed = parsePostJob(canonicalJob);

  assert.deepStrictEqual(parsed, canonicalJob);
  assert.notStrictEqual(parsed, canonicalJob);
});

test('jobKey uses the canonical article identifier and exact version prefix', () => {
  assert.strictEqual(jobKey(canonicalJob), 'v1:bluesky:sovereign-ai-infrastructure');
  assert.strictEqual(
    jobKey({ ...canonicalJob, platform: 'twitter' }),
    'v1:twitter:sovereign-ai-infrastructure',
  );
});

test('changing a Queue message id does not change its job key', () => {
  const firstDelivery = { id: 'queue-message-a', body: canonicalJob };
  const redelivery = { id: 'queue-message-b', body: canonicalJob };

  assert.strictEqual(jobKey(firstDelivery.body), jobKey(redelivery.body));
  assert.strictEqual(jobKey(redelivery.body), 'v1:bluesky:sovereign-ai-infrastructure');
});

test('job helpers reject unsupported platforms', () => {
  assert.throws(
    () => createPostJob('mastodon', {
      id: canonicalJob.articleId,
      url: canonicalJob.url,
      title: canonicalJob.title,
    }, canonicalJob.message, new Date(canonicalJob.createdAt)),
    /platform/i,
  );
  assert.throws(() => parsePostJob({ ...canonicalJob, platform: 'mastodon' }), /platform/i);
});

test('parsePostJob rejects malformed job fields and extra envelope data', () => {
  const malformed = [
    null,
    [],
    { ...canonicalJob, version: 2 },
    { ...canonicalJob, articleId: '' },
    { ...canonicalJob, url: 42 },
    { ...canonicalJob, title: undefined },
    { ...canonicalJob, message: '' },
    { ...canonicalJob, createdAt: 'not-a-date' },
    { ...canonicalJob, queueMessageId: 'delivery-1' },
  ];

  for (const value of malformed) {
    assert.throws(() => parsePostJob(value), TypeError);
  }
});

test('parsePostJob rejects non-serializable payloads', () => {
  const cyclic = { ...canonicalJob };
  cyclic.self = cyclic;
  const symbolKeyed = { ...canonicalJob, [Symbol('delivery')]: 'hidden' };
  const customPrototype = Object.assign(Object.create({ inherited: true }), canonicalJob);

  assert.throws(() => parsePostJob(cyclic), TypeError);
  assert.throws(() => parsePostJob({ ...canonicalJob, title: 1n }), TypeError);
  assert.throws(() => parsePostJob({ ...canonicalJob, message: () => 'post' }), TypeError);
  assert.throws(() => parsePostJob(symbolKeyed), TypeError);
  assert.throws(() => parsePostJob(customPrototype), TypeError);
});

test('createPostJob rejects missing article data and invalid timestamps', () => {
  assert.throws(
    () => createPostJob('twitter', { id: '', url: canonicalJob.url, title: canonicalJob.title }, canonicalJob.message, new Date(canonicalJob.createdAt)),
    TypeError,
  );
  assert.throws(
    () => createPostJob('twitter', { id: canonicalJob.articleId, url: canonicalJob.url, title: canonicalJob.title }, canonicalJob.message, new Date('invalid')),
    TypeError,
  );
});
