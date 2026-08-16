import { env } from 'cloudflare:workers';
import {
  createExecutionContext,
  createMessageBatch,
  getQueueResult,
  listDurableObjectIds,
  reset,
} from 'cloudflare:test';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index.js';

const MAIN_QUEUE = 'twitter-poster-post-jobs';
const DLQ = 'twitter-poster-post-jobs-dlq';
const CREATED_AT = '2026-08-16T12:00:00.000Z';
const GENERATED_MESSAGE = 'Queue-backed delivery forces an uncomfortable tradeoff: ambiguity must stop retries even when publication cannot be confirmed.';
const QUALIFYING_URL = 'https://philippdubach.com/posts/route-qualified/';
const runtimeFetch = globalThis.fetch.bind(globalThis);

function postJob(articleId = 'queue-safety') {
  return {
    version: 1,
    platform: 'twitter',
    articleId,
    url: `https://philippdubach.com/posts/${articleId}/`,
    title: 'Queue Safety',
    message: 'A durable gate makes delivery boring in the best way.',
    createdAt: CREATED_AT,
  };
}

function messageBatch(job, {
  queue = MAIN_QUEUE,
  id = 'message-1',
  attempts = 1,
} = {}) {
  return createMessageBatch(queue, [{
    id,
    timestamp: new Date(CREATED_AT),
    body: job,
    attempts,
  }]);
}

async function deliver(batch) {
  const ctx = createExecutionContext();
  await worker.queue(batch, env, ctx);
  return getQueueResult(batch, ctx);
}

function jsonResponse(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function installTwitterFetch(tweetReply = () => jsonResponse({
  data: { id: 'tweet-1', text: 'published tweet' },
})) {
  const calls = { createTweet: 0 };
  const requests = [];
  const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url === 'https://api.twitter.com/2/tweets') {
      calls.createTweet++;
      requests.push({ input, init });
      return tweetReply({ input, init, call: calls.createTweet });
    }
    return runtimeFetch(input, init);
  });
  return { calls, requests, spy };
}

function authenticatedRequest(path, ip = '192.0.2.10') {
  return new Request(`https://worker.example${path}`, {
    headers: {
      Authorization: 'Bearer test-api-secret',
      'CF-Connecting-IP': ip,
    },
  });
}

async function stageJobMetadata(job, metadata = {}) {
  await env.POSTED_STATE.put(
    `jobmeta:v1:${job.platform}:${job.articleId}`,
    JSON.stringify(metadata),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(async () => {
  await reset();
});

describe('queue-backed Twitter delivery', () => {
  it('rejects a valid non-Twitter job before Durable Object, KV, or social I/O', async () => {
    const job = { ...postJob('wrong-platform'), platform: 'bluesky' };
    const gate = vi.spyOn(env.POST_GATE, 'getByName');
    const kvGet = vi.spyOn(env.POSTED_STATE, 'get');
    const kvPut = vi.spyOn(env.POSTED_STATE, 'put');
    const kvDelete = vi.spyOn(env.POSTED_STATE, 'delete');
    const kvList = vi.spyOn(env.POSTED_STATE, 'list');
    const { calls } = installTwitterFetch();

    const result = await deliver(messageBatch(job, { id: 'wrong-platform-1' }));

    expect(result.retryMessages).toEqual([{ msgId: 'wrong-platform-1' }]);
    expect(calls.createTweet).toBe(0);
    expect(gate).not.toHaveBeenCalled();
    expect(kvGet).not.toHaveBeenCalled();
    expect(kvPut).not.toHaveBeenCalled();
    expect(kvDelete).not.toHaveBeenCalled();
    expect(kvList).not.toHaveBeenCalled();
    expect(await listDurableObjectIds(env.POST_GATE)).toEqual([]);
  });

  it('treats a real metadata JSON read failure as retryable pre-send infrastructure', async () => {
    const job = postJob('metadata-read-failure');
    const gate = env.POST_GATE.getByName('v1:twitter:metadata-read-failure');
    await env.POSTED_STATE.put('jobmeta:v1:twitter:metadata-read-failure', '{not-json');
    const { calls } = installTwitterFetch();
    const batch = messageBatch(job, { id: 'metadata-read-failure-1' });
    const retry = vi.spyOn(batch.messages[0], 'retry');

    const result = await deliver(batch);

    expect(result.retryMessages).toEqual([{ msgId: 'metadata-read-failure-1' }]);
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 300 });
    expect(calls.createTweet).toBe(0);
    expect(await gate.getState()).toMatchObject({
      status: 'pending',
      error: { code: 'FETCH_FAILED', stage: 'pre-send' },
    });
    expect(await env.POSTED_STATE.get('jobmeta:v1:twitter:metadata-read-failure')).toBe('{not-json');
  });

  it('retries when staged metadata is temporarily invisible, then publishes with full scorer state', async () => {
    const job = postJob('metadata-visibility-delay');
    const key = 'v1:twitter:metadata-visibility-delay';
    const metadataKey = `jobmeta:${key}`;
    const metadata = {
      angle: 'tension',
      anchored_on: 'eventual KV visibility',
      score: 23,
      candidates_considered: 2,
    };
    await env.POSTED_STATE.put(metadataKey, JSON.stringify(metadata));
    const realGet = env.POSTED_STATE.get.bind(env.POSTED_STATE);
    let hideMetadata = true;
    vi.spyOn(env.POSTED_STATE, 'get').mockImplementation((requestedKey, ...args) => {
      if (requestedKey === metadataKey && hideMetadata) {
        hideMetadata = false;
        return Promise.resolve(null);
      }
      return realGet(requestedKey, ...args);
    });
    const gate = env.POST_GATE.getByName(key);
    const { calls } = installTwitterFetch();
    const firstBatch = messageBatch(job, { id: 'metadata-hidden-1' });
    const firstRetry = vi.spyOn(firstBatch.messages[0], 'retry');

    const first = await deliver(firstBatch);

    expect(first.retryMessages).toEqual([{ msgId: 'metadata-hidden-1' }]);
    expect(firstRetry).toHaveBeenCalledWith({ delaySeconds: 300 });
    expect(calls.createTweet).toBe(0);
    expect(await gate.getState()).toMatchObject({
      status: 'pending',
      error: { code: 'FETCH_FAILED', stage: 'pre-send' },
    });
    expect(await realGet(metadataKey, 'json')).toEqual(metadata);

    const second = await deliver(messageBatch(job, {
      id: 'metadata-visible-2',
      attempts: 2,
    }));

    expect(second.explicitAcks).toEqual(['metadata-visible-2']);
    expect(calls.createTweet).toBe(1);
    expect(await gate.getState()).toMatchObject({
      status: 'published',
      result: { tweetId: 'tweet-1' },
    });
    expect(await realGet('posts:metadata-visibility-delay', 'json')).toMatchObject({
      ...metadata,
      title: job.title,
      message: job.message,
      tweetId: 'tweet-1',
    });
    expect(await realGet(metadataKey)).toBeNull();
  });

  it('persists attempting before fetch and concurrent duplicates create one tweet', async () => {
    const job = postJob('concurrent-delivery');
    await stageJobMetadata(job);
    const gate = env.POST_GATE.getByName('v1:twitter:concurrent-delivery');
    let observedState;
    let releaseCreate;
    const createReleased = new Promise((resolve) => { releaseCreate = resolve; });
    let notifyStarted;
    const createStarted = new Promise((resolve) => { notifyStarted = resolve; });
    const { calls } = installTwitterFetch(async () => {
      observedState = await gate.getState();
      notifyStarted();
      await createReleased;
      return jsonResponse({ data: { id: 'tweet-concurrent', text: 'published tweet' } });
    });

    const first = deliver(messageBatch(job, { id: 'concurrent-1' }));
    await createStarted;
    const second = deliver(messageBatch(job, { id: 'concurrent-2' }));
    await vi.waitFor(() => expect(calls.createTweet).toBe(1));
    releaseCreate();
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(observedState.status).toBe('attempting');
    expect(observedState.job).toEqual(job);
    expect(calls.createTweet).toBe(1);
    expect(firstResult.explicitAcks).toEqual(['concurrent-1']);
    expect(secondResult.retryMessages).toEqual([{ msgId: 'concurrent-2' }]);
    expect((await gate.getState()).status).toBe('published');
  });

  it('published delivery is terminal and preserves OAuth and the posts KV read model', async () => {
    const job = postJob('published-terminal');
    const gate = env.POST_GATE.getByName('v1:twitter:published-terminal');
    const { calls, requests } = installTwitterFetch();
    await env.POSTED_STATE.put('jobmeta:v1:twitter:published-terminal', JSON.stringify({
      angle: 'tension',
      anchored_on: 'the delivery crash boundary',
      score: 17,
      candidates_considered: 2,
    }));

    const first = await deliver(messageBatch(job, { id: 'published-1' }));
    const second = await deliver(messageBatch(job, { id: 'published-2' }));

    expect(first.explicitAcks).toEqual(['published-1']);
    expect(second.explicitAcks).toEqual(['published-2']);
    expect(calls.createTweet).toBe(1);
    expect(requests[0].init.method).toBe('POST');
    expect(requests[0].init.headers.Authorization).toMatch(/^OAuth /);
    expect(JSON.parse(requests[0].init.body)).toEqual({
      text: `${job.message}\n\n${job.url}`,
    });
    expect(await gate.getState()).toMatchObject({
      status: 'published',
      result: { tweetId: 'tweet-1' },
    });
    expect(await env.POSTED_STATE.get('posts:published-terminal', 'json')).toMatchObject({
      title: 'Queue Safety',
      message: 'A durable gate makes delivery boring in the best way.',
      tweetId: 'tweet-1',
      angle: 'tension',
      anchored_on: 'the delivery crash boundary',
      score: 17,
      candidates_considered: 2,
    });
    expect(await env.POSTED_STATE.get('jobmeta:v1:twitter:published-terminal')).toBeNull();
  });

  it('published denied claim reconstructs the read model before metadata cleanup and acknowledgement', async () => {
    const job = postJob('published-stale-metadata');
    const gate = env.POST_GATE.getByName('v1:twitter:published-stale-metadata');
    await gate.claim(job);
    await gate.markPublished({ tweetId: 'tweet-already-published' });
    await env.POSTED_STATE.put('jobmeta:v1:twitter:published-stale-metadata', '{"angle":"tension"}');
    const put = vi.spyOn(env.POSTED_STATE, 'put');
    const del = vi.spyOn(env.POSTED_STATE, 'delete');
    const batch = messageBatch(job, { id: 'published-stale-1', attempts: 2 });
    const ack = vi.spyOn(batch.messages[0], 'ack');
    const { calls } = installTwitterFetch();

    const result = await deliver(batch);

    expect(result.explicitAcks).toEqual(['published-stale-1']);
    expect(calls.createTweet).toBe(0);
    expect(await env.POSTED_STATE.get('posts:published-stale-metadata', 'json')).toMatchObject({
      message: job.message,
      tweetId: 'tweet-already-published',
      angle: 'tension',
    });
    expect(await env.POSTED_STATE.get('jobmeta:v1:twitter:published-stale-metadata')).toBeNull();
    expect(put.mock.invocationCallOrder[0]).toBeLessThan(del.mock.invocationCallOrder[0]);
    expect(del.mock.invocationCallOrder[0]).toBeLessThan(ack.mock.invocationCallOrder[0]);
  });

  it('backfilled denied claim removes staged metadata before acknowledgement', async () => {
    const job = postJob('backfilled-stale-metadata');
    const gate = env.POST_GATE.getByName('v1:twitter:backfilled-stale-metadata');
    await gate.markBackfilled({ articleId: job.articleId, title: job.title });
    await env.POSTED_STATE.put('jobmeta:v1:twitter:backfilled-stale-metadata', '{"angle":"tension"}');
    const del = vi.spyOn(env.POSTED_STATE, 'delete');
    const batch = messageBatch(job, { id: 'backfilled-stale-1', attempts: 2 });
    const ack = vi.spyOn(batch.messages[0], 'ack');
    const { calls } = installTwitterFetch();

    const result = await deliver(batch);

    expect(result.explicitAcks).toEqual(['backfilled-stale-1']);
    expect(calls.createTweet).toBe(0);
    expect(await env.POSTED_STATE.get('jobmeta:v1:twitter:backfilled-stale-metadata')).toBeNull();
    expect(del.mock.invocationCallOrder[0]).toBeLessThan(ack.mock.invocationCallOrder[0]);
  });

  it('429 returns the gate to pending and requests a 300-second retry', async () => {
    const job = postJob('rate-limited');
    await stageJobMetadata(job);
    const gate = env.POST_GATE.getByName('v1:twitter:rate-limited');
    const { calls } = installTwitterFetch(() => jsonResponse(
      { error: 'RateLimitExceeded', message: 'private-response-token' },
      429,
      { 'Retry-After': '120' },
    ));
    const batch = messageBatch(job, { id: 'rate-limited-1' });
    const retry = vi.spyOn(batch.messages[0], 'retry');

    const result = await deliver(batch);

    expect(calls.createTweet).toBe(1);
    expect(retry).toHaveBeenCalledOnce();
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 300 });
    expect(result.retryMessages).toEqual([{ msgId: 'rate-limited-1' }]);
    expect(await gate.getState()).toMatchObject({
      status: 'pending',
      error: {
        code: 'RATE_LIMITED',
        status: 429,
        stage: 'response',
        retryAfter: 120,
      },
    });
    expect(JSON.stringify(await gate.getState())).not.toContain('private-response-token');
  });

  it.each([
    {
      name: 'a 503 response',
      articleId: 'ambiguous-503',
      reply: () => jsonResponse(
        { error: 'UpstreamFailure', message: 'private-response-token' },
        503,
      ),
      error: { status: 503, stage: 'response' },
    },
    {
      name: 'a network failure',
      articleId: 'ambiguous-network',
      reply: () => {
        const error = new Error('socket failed after request dispatch');
        error.code = 'ECONNRESET';
        throw error;
      },
      error: { code: 'NETWORK_ERROR', stage: 'post-response' },
    },
    {
      name: 'a timeout',
      articleId: 'ambiguous-timeout',
      reply: () => {
        const error = new Error('request timed out after dispatch');
        error.code = 'ETIMEDOUT';
        throw error;
      },
      error: { code: 'TIMEOUT', stage: 'post-response' },
    },
    {
      name: 'an invalid success response',
      articleId: 'ambiguous-response-parse',
      reply: () => new Response('not-json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
      error: { code: 'RESPONSE_PARSE_FAILED', status: 200, stage: 'response-parse' },
    },
  ])('$name becomes uncertain and later delivery never calls fetch', async ({
    articleId,
    reply,
    error,
  }) => {
    const job = postJob(articleId);
    await stageJobMetadata(job);
    const gate = env.POST_GATE.getByName(`v1:twitter:${articleId}`);
    const { calls } = installTwitterFetch(reply);

    const first = await deliver(messageBatch(job, { id: `${articleId}-1` }));
    const second = await deliver(messageBatch(job, { id: `${articleId}-2`, attempts: 2 }));

    expect(first.retryMessages).toEqual([{ msgId: `${articleId}-1` }]);
    expect(second.retryMessages).toEqual([{ msgId: `${articleId}-2` }]);
    expect(calls.createTweet).toBe(1);
    expect(await gate.getState()).toMatchObject({ status: 'uncertain', error });
    expect(JSON.stringify(await gate.getState())).not.toContain('private-response-token');
  });

  it.each([
    { status: 401, code: 'UNAUTHORIZED', articleId: 'auth-rejected' },
    { status: 400, code: 'INVALID_PAYLOAD', articleId: 'payload-rejected' },
  ])('terminally fails a $status response and never resends it', async ({
    status,
    code,
    articleId,
  }) => {
    const job = postJob(articleId);
    await stageJobMetadata(job);
    const gate = env.POST_GATE.getByName(`v1:twitter:${articleId}`);
    const { calls } = installTwitterFetch(() => jsonResponse(
      { detail: 'private-response-token' },
      status,
    ));

    const first = await deliver(messageBatch(job, { id: `${articleId}-1` }));
    const second = await deliver(messageBatch(job, { id: `${articleId}-2`, attempts: 2 }));

    expect(first.retryMessages).toEqual([{ msgId: `${articleId}-1` }]);
    expect(second.retryMessages).toEqual([{ msgId: `${articleId}-2` }]);
    expect(calls.createTweet).toBe(1);
    expect(await gate.getState()).toMatchObject({
      status: 'failed',
      error: { code, status, stage: 'response' },
    });
    expect(JSON.stringify(await gate.getState())).not.toContain('private-response-token');
  });

  it('backfill claims terminal state while a matching job is queued', async () => {
    const job = {
      ...postJob('route-qualified'),
      title: 'Queue Safety Under Ambiguity',
    };
    const queuedBatch = messageBatch(job, { id: 'backfill-race-queued' });
    const { calls } = installTwitterFetch();

    const response = await worker.fetch(authenticatedRequest('/backfill'), env);
    const delivery = await deliver(queuedBatch);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      marked: [{ id: 'route-qualified', title: 'Queue Safety Under Ambiguity' }],
    });
    expect(delivery.explicitAcks).toEqual(['backfill-race-queued']);
    expect(calls.createTweet).toBe(0);
    expect(await env.POST_GATE.getByName('v1:twitter:route-qualified').getState()).toMatchObject({
      status: 'backfilled',
      metadata: { articleId: 'route-qualified', title: 'Queue Safety Under Ambiguity' },
    });
  });

  it('backfill terminally gates an article already present in legacy posts KV', async () => {
    await env.POSTED_STATE.put('posts:route-qualified', JSON.stringify({
      title: 'Queue Safety Under Ambiguity',
      backfilled: true,
      at: CREATED_AT,
    }));
    const { calls } = installTwitterFetch();

    const response = await worker.fetch(authenticatedRequest('/backfill', '192.0.2.13'), env);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ marked: [], skipped: 1, errors: [] });
    expect(calls.createTweet).toBe(0);
    expect(await env.POST_GATE.getByName('v1:twitter:route-qualified').getState()).toMatchObject({
      status: 'backfilled',
      metadata: { articleId: 'route-qualified', title: 'Queue Safety Under Ambiguity' },
    });
  });

  it('DLQ archives uncertain metadata before cleanup and acknowledgement', async () => {
    const job = postJob('uncertain-dlq');
    const gate = env.POST_GATE.getByName('v1:twitter:uncertain-dlq');
    installTwitterFetch(() => jsonResponse(
      { error: 'ServiceUnavailable', token: 'private-response-token' },
      503,
    ));
    await env.POSTED_STATE.put('jobmeta:v1:twitter:uncertain-dlq', JSON.stringify({
      angle: 'tension',
      anchored_on: 'the delivery ambiguity boundary',
    }));
    await deliver(messageBatch(job, { id: 'uncertain-main-1' }));
    const put = vi.spyOn(env.POSTED_STATE, 'put');
    const del = vi.spyOn(env.POSTED_STATE, 'delete');
    const batch = messageBatch(job, {
      queue: DLQ,
      id: 'uncertain-dlq-1',
      attempts: 4,
    });
    const ack = vi.spyOn(batch.messages[0], 'ack');

    const beforeArchive = Date.now();
    const result = await deliver(batch);
    const afterArchive = Date.now();
    const archived = await env.POSTED_STATE.get('failed:v1:twitter:uncertain-dlq', 'json');

    expect(result.explicitAcks).toEqual(['uncertain-dlq-1']);
    expect(archived).toMatchObject({
      job,
      messageId: 'uncertain-dlq-1',
      attempts: 4,
      gateState: {
        status: 'uncertain',
        error: { status: 503, stage: 'response' },
      },
    });
    expect(new Date(archived.archivedAt).toISOString()).toBe(archived.archivedAt);
    expect(Date.parse(archived.archivedAt)).toBeGreaterThanOrEqual(beforeArchive);
    expect(Date.parse(archived.archivedAt)).toBeLessThanOrEqual(afterArchive);
    expect(JSON.stringify(archived)).not.toContain('private-response-token');
    expect((await gate.getState()).status).toBe('uncertain');
    expect(await env.POSTED_STATE.get('jobmeta:v1:twitter:uncertain-dlq')).toBeNull();
    expect(put.mock.invocationCallOrder[0]).toBeLessThan(del.mock.invocationCallOrder[0]);
    expect(del.mock.invocationCallOrder[0]).toBeLessThan(ack.mock.invocationCallOrder[0]);
  });

  it('the real Queue broker exhausts main retries into DLQ without a second tweet', async () => {
    const job = postJob('broker-dlq-transfer');
    const key = 'v1:twitter:broker-dlq-transfer';
    await env.POSTED_STATE.put(`jobmeta:${key}`, JSON.stringify({
      angle: 'tension',
      anchored_on: 'the broker retry boundary',
      score: 19,
      candidates_considered: 2,
    }));
    const { calls } = installTwitterFetch(() => jsonResponse(
      { error: 'ServiceUnavailable', token: 'private-response-token' },
      503,
    ));
    const deliveries = [];
    const realQueue = worker.queue;
    vi.spyOn(worker, 'queue').mockImplementation(async (batch, runtimeEnv, ctx) => {
      deliveries.push(...batch.messages.map((message) => ({
        queue: batch.queue,
        id: message.id,
        attempts: message.attempts,
      })));
      return realQueue(batch, runtimeEnv, ctx);
    });

    await env.POST_QUEUE.send(job);
    await vi.waitFor(async () => {
      expect(await env.POSTED_STATE.get(`failed:${key}`)).not.toBeNull();
    }, { timeout: 5000, interval: 10 });

    expect(deliveries.map(({ queue, attempts }) => ({ queue, attempts }))).toEqual([
      { queue: MAIN_QUEUE, attempts: 1 },
      { queue: MAIN_QUEUE, attempts: 2 },
      { queue: MAIN_QUEUE, attempts: 3 },
      { queue: MAIN_QUEUE, attempts: 4 },
      { queue: DLQ, attempts: 1 },
    ]);
    expect(new Set(deliveries.map(({ id }) => id)).size).toBe(1);
    expect(calls.createTweet).toBe(1);
    expect(await env.POST_GATE.getByName(key).getState()).toMatchObject({
      status: 'uncertain',
      error: { status: 503, stage: 'response' },
    });
    expect(await env.POSTED_STATE.get(`failed:${key}`, 'json')).toMatchObject({
      job,
      messageId: deliveries[0].id,
      attempts: 1,
      gateState: { status: 'uncertain' },
    });
    expect(await env.POSTED_STATE.get(`jobmeta:${key}`)).toBeNull();
  });

  it('DLQ archives a failed delivery before removing its staged metadata', async () => {
    const job = postJob('failed-dlq');
    const gate = env.POST_GATE.getByName('v1:twitter:failed-dlq');
    const failure = new Error('Twitter credentials are required');
    failure.code = 'AUTH_FAILED';
    failure.stage = 'pre-send';
    failure.requestSent = false;
    await gate.claim(job);
    await gate.markFailed(failure);
    await env.POSTED_STATE.put('jobmeta:v1:twitter:failed-dlq', '{"angle":"tension"}');

    const result = await deliver(messageBatch(job, {
      queue: DLQ,
      id: 'failed-dlq-1',
      attempts: 4,
    }));

    expect(result.explicitAcks).toEqual(['failed-dlq-1']);
    expect(await env.POSTED_STATE.get('failed:v1:twitter:failed-dlq', 'json')).toMatchObject({
      job,
      messageId: 'failed-dlq-1',
      attempts: 4,
      gateState: {
        status: 'failed',
        error: { code: 'AUTH_FAILED', stage: 'pre-send' },
      },
    });
    expect(await env.POSTED_STATE.get('jobmeta:v1:twitter:failed-dlq')).toBeNull();
  });

  it('dry trigger generates and scores a qualifying post without Queue, KV, DO, or Twitter writes', async () => {
    const queue = vi.spyOn(worker, 'queue').mockImplementation(async () => {});
    const queueSend = vi.spyOn(env.POST_QUEUE, 'send');
    const kvPut = vi.spyOn(env.POSTED_STATE, 'put');
    const kvDelete = vi.spyOn(env.POSTED_STATE, 'delete');
    const { calls } = installTwitterFetch();
    const gateIdsBefore = (await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort();

    const response = await worker.fetch(authenticatedRequest('/trigger?dry=true', '192.0.2.11'), env);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      posted: [{
        id: 'route-qualified',
        title: 'Queue Safety Under Ambiguity',
        message: `${GENERATED_MESSAGE}\n\n${QUALIFYING_URL}`,
      }],
      skipped: 0,
      errors: [],
    });
    expect((await env.POSTED_STATE.list()).keys).toEqual([]);
    expect(kvPut).not.toHaveBeenCalled();
    expect(kvDelete).not.toHaveBeenCalled();
    expect((await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort()).toEqual(gateIdsBefore);
    expect(queue).not.toHaveBeenCalled();
    expect(queueSend).not.toHaveBeenCalled();
    expect(calls.createTweet).toBe(0);
  });

  it('dry test route traverses article generation without Queue, KV, DO, or Twitter writes', async () => {
    const queue = vi.spyOn(worker, 'queue').mockImplementation(async () => {});
    const queueSend = vi.spyOn(env.POST_QUEUE, 'send');
    const kvPut = vi.spyOn(env.POSTED_STATE, 'put');
    const kvDelete = vi.spyOn(env.POSTED_STATE, 'delete');
    const { calls } = installTwitterFetch();
    const gateIdsBefore = (await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort();

    const response = await worker.fetch(authenticatedRequest(
      `/test?dry=true&url=${encodeURIComponent(QUALIFYING_URL)}`,
      '192.0.2.14',
    ), env);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      dry_run: true,
      title: 'Queue Safety Under Ambiguity',
      message: `${GENERATED_MESSAGE}\n\n${QUALIFYING_URL}`,
    });
    expect((await env.POSTED_STATE.list()).keys).toEqual([]);
    expect(kvPut).not.toHaveBeenCalled();
    expect(kvDelete).not.toHaveBeenCalled();
    expect((await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort()).toEqual(gateIdsBefore);
    expect(queue).not.toHaveBeenCalled();
    expect(queueSend).not.toHaveBeenCalled();
    expect(calls.createTweet).toBe(0);
  });

  it('non-dry trigger sends a strict generated job and stages scorer metadata without direct posting', async () => {
    const queue = vi.spyOn(worker, 'queue').mockImplementation(async () => {});
    const { calls } = installTwitterFetch();
    const gateIdsBefore = (await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort();

    const response = await worker.fetch(authenticatedRequest('/trigger', '192.0.2.12'), env);

    await vi.waitFor(() => expect(queue).toHaveBeenCalledOnce());
    const [batch] = queue.mock.calls[0];
    const queuedJob = batch.messages[0].body;
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ queued: 1, skipped: 0, errors: [] });
    expect(queuedJob).toMatchObject({
      version: 1,
      platform: 'twitter',
      articleId: 'route-qualified',
      url: QUALIFYING_URL,
      title: 'Queue Safety Under Ambiguity',
      message: GENERATED_MESSAGE,
    });
    expect(Object.keys(queuedJob).sort()).toEqual([
      'articleId',
      'createdAt',
      'message',
      'platform',
      'title',
      'url',
      'version',
    ]);
    expect(new Date(queuedJob.createdAt).toISOString()).toBe(queuedJob.createdAt);
    expect(calls.createTweet).toBe(0);
    expect(await env.POSTED_STATE.get('posts:route-qualified')).toBeNull();
    expect(await env.POSTED_STATE.get('jobmeta:v1:twitter:route-qualified', 'json')).toMatchObject({
      angle: 'tension',
      anchored_on: 'the delivery ambiguity boundary',
      score: expect.any(Number),
      candidates_considered: 2,
    });
    expect((await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort()).toEqual(gateIdsBefore);
  });

  it('non-dry test route returns 202 and queues without directly posting', async () => {
    const queue = vi.spyOn(worker, 'queue').mockImplementation(async () => {});
    const { calls } = installTwitterFetch();

    const response = await worker.fetch(authenticatedRequest(
      `/test?url=${encodeURIComponent(QUALIFYING_URL)}`,
      '192.0.2.15',
    ), env);

    await vi.waitFor(() => expect(queue).toHaveBeenCalledOnce());
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({
      queued: 1,
      id: 'route-qualified',
      title: 'Queue Safety Under Ambiguity',
      message: `${GENERATED_MESSAGE}\n\n${QUALIFYING_URL}`,
    });
    expect(queue.mock.calls[0][0].messages[0].body).toMatchObject({
      platform: 'twitter',
      articleId: 'route-qualified',
      message: GENERATED_MESSAGE,
    });
    expect(calls.createTweet).toBe(0);
  });
});
