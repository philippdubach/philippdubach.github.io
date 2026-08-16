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

const MAIN_QUEUE = 'social-poster-post-jobs';
const DLQ = 'social-poster-post-jobs-dlq';
const CREATED_AT = '2026-08-16T12:00:00.000Z';
const runtimeFetch = globalThis.fetch.bind(globalThis);

function postJob(articleId = 'queue-safety') {
  return {
    version: 1,
    platform: 'bluesky',
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

function installBlueskyFetch(recordReply = () => jsonResponse({
  uri: 'at://did:plc:alice/app.bsky.feed.post/post-1',
  cid: 'bafy-post-1',
  validationStatus: 'valid',
})) {
  const calls = { session: 0, createRecord: 0 };
  const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url === 'https://bsky.social/xrpc/com.atproto.server.createSession') {
      calls.session++;
      return jsonResponse({
        accessJwt: 'test-access-jwt',
        refreshJwt: 'test-refresh-jwt',
        handle: 'alice.test',
        did: 'did:plc:alice',
        didDoc: { id: 'did:plc:alice', service: [] },
        email: 'alice@example.com',
        emailConfirmed: true,
        active: true,
        status: null,
      });
    }
    if (url === 'https://bsky.social/xrpc/com.atproto.repo.createRecord') {
      calls.createRecord++;
      return recordReply({ input, init, call: calls.createRecord });
    }
    return runtimeFetch(input, init);
  });
  return { calls, spy };
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(async () => {
  await reset();
});

describe('queue-backed Bluesky delivery', () => {
  it('retries a valid non-Bluesky job toward DLQ before claim or social fetch', async () => {
    const job = { ...postJob('wrong-platform'), platform: 'twitter' };
    const { calls } = installBlueskyFetch();

    const result = await deliver(messageBatch(job, { id: 'wrong-platform-1' }));

    expect(result.retryMessages).toEqual([{ msgId: 'wrong-platform-1' }]);
    expect(calls).toEqual({ session: 0, createRecord: 0 });
    expect((await env.POSTED_STATE.list()).keys).toEqual([]);
    expect(await listDurableObjectIds(env.POST_GATE)).toEqual([]);
  });

  it('treats a real metadata JSON read failure as retryable pre-send infrastructure', async () => {
    const job = postJob('metadata-read-failure');
    const gate = env.POST_GATE.getByName('v1:bluesky:metadata-read-failure');
    await env.POSTED_STATE.put('jobmeta:v1:bluesky:metadata-read-failure', '{not-json');
    const { calls } = installBlueskyFetch();
    const batch = messageBatch(job, { id: 'metadata-read-failure-1' });
    const retry = vi.spyOn(batch.messages[0], 'retry');

    const result = await deliver(batch);

    expect(result.retryMessages).toEqual([{ msgId: 'metadata-read-failure-1' }]);
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 300 });
    expect(calls).toEqual({ session: 0, createRecord: 0 });
    expect(await gate.getState()).toMatchObject({
      status: 'pending',
      error: { code: 'FETCH_FAILED', stage: 'pre-send' },
    });
    expect(await env.POSTED_STATE.get('jobmeta:v1:bluesky:metadata-read-failure')).toBe('{not-json');
  });

  it('persists attempting before fetch and concurrent duplicates create one record', async () => {
    const job = postJob('concurrent-delivery');
    const gate = env.POST_GATE.getByName('v1:bluesky:concurrent-delivery');
    let observedState;
    let releaseCreate;
    const createReleased = new Promise((resolve) => { releaseCreate = resolve; });
    let notifyStarted;
    const createStarted = new Promise((resolve) => { notifyStarted = resolve; });
    const { calls } = installBlueskyFetch(async () => {
      observedState = await gate.getState();
      notifyStarted();
      await createReleased;
      return jsonResponse({
        uri: 'at://did:plc:alice/app.bsky.feed.post/concurrent',
        cid: 'bafy-concurrent',
        validationStatus: 'valid',
      });
    });

    const first = deliver(messageBatch(job, { id: 'concurrent-1' }));
    await createStarted;
    const second = deliver(messageBatch(job, { id: 'concurrent-2' }));
    await vi.waitFor(() => expect(calls.createRecord).toBe(1));
    releaseCreate();
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(observedState.status).toBe('attempting');
    expect(observedState.job).toEqual(job);
    expect(calls.createRecord).toBe(1);
    expect(firstResult.explicitAcks).toEqual(['concurrent-1']);
    expect(secondResult.retryMessages).toEqual([{ msgId: 'concurrent-2' }]);
    expect((await gate.getState()).status).toBe('published');
  });

  it('published delivery is terminal and preserves the posts KV read model', async () => {
    const job = postJob('published-terminal');
    const gate = env.POST_GATE.getByName('v1:bluesky:published-terminal');
    const { calls } = installBlueskyFetch();
    await env.POSTED_STATE.put('jobmeta:v1:bluesky:published-terminal', JSON.stringify({
      angle: 'tension',
      anchored_on: 'the delivery crash boundary',
      score: 17,
      candidates_considered: 2,
    }));

    const first = await deliver(messageBatch(job, { id: 'published-1' }));
    const second = await deliver(messageBatch(job, { id: 'published-2' }));

    expect(first.explicitAcks).toEqual(['published-1']);
    expect(second.explicitAcks).toEqual(['published-2']);
    expect(calls.createRecord).toBe(1);
    expect(await gate.getState()).toMatchObject({
      status: 'published',
      result: {
        uri: 'at://did:plc:alice/app.bsky.feed.post/post-1',
        cid: 'bafy-post-1',
      },
    });
    expect(await env.POSTED_STATE.get('posts:published-terminal', 'json')).toMatchObject({
      title: 'Queue Safety',
      message: 'A durable gate makes delivery boring in the best way.',
      uri: 'at://did:plc:alice/app.bsky.feed.post/post-1',
      angle: 'tension',
      anchored_on: 'the delivery crash boundary',
      score: 17,
      candidates_considered: 2,
    });
    expect(await env.POSTED_STATE.get('jobmeta:v1:bluesky:published-terminal')).toBeNull();
  });

  it('published denied claim removes stale metadata after confirming the posts read model', async () => {
    const job = postJob('published-stale-metadata');
    const gate = env.POST_GATE.getByName('v1:bluesky:published-stale-metadata');
    await gate.claim(job);
    await gate.markPublished({
      uri: 'at://did:plc:alice/app.bsky.feed.post/already-published',
      cid: 'bafy-already-published',
    });
    await env.POSTED_STATE.put('posts:published-stale-metadata', JSON.stringify({
      title: 'Queue Safety',
      message: job.message,
      uri: 'at://did:plc:alice/app.bsky.feed.post/already-published',
      at: CREATED_AT,
    }));
    await env.POSTED_STATE.put('jobmeta:v1:bluesky:published-stale-metadata', '{"angle":"tension"}');
    const { calls } = installBlueskyFetch();

    const result = await deliver(messageBatch(job, { id: 'published-stale-1', attempts: 2 }));

    expect(result.explicitAcks).toEqual(['published-stale-1']);
    expect(calls).toEqual({ session: 0, createRecord: 0 });
    expect(await env.POSTED_STATE.get('jobmeta:v1:bluesky:published-stale-metadata')).toBeNull();
  });

  it('backfilled denied claim removes stale metadata before acknowledgement', async () => {
    const job = postJob('backfilled-stale-metadata');
    const gate = env.POST_GATE.getByName('v1:bluesky:backfilled-stale-metadata');
    await gate.markBackfilled({ articleId: job.articleId, title: job.title });
    await env.POSTED_STATE.put('jobmeta:v1:bluesky:backfilled-stale-metadata', '{"angle":"tension"}');
    const { calls } = installBlueskyFetch();

    const result = await deliver(messageBatch(job, { id: 'backfilled-stale-1', attempts: 2 }));

    expect(result.explicitAcks).toEqual(['backfilled-stale-1']);
    expect(calls).toEqual({ session: 0, createRecord: 0 });
    expect(await env.POSTED_STATE.get('jobmeta:v1:bluesky:backfilled-stale-metadata')).toBeNull();
  });

  it('429 returns the gate to pending and requests a 300-second retry', async () => {
    const job = postJob('rate-limited');
    const gate = env.POST_GATE.getByName('v1:bluesky:rate-limited');
    const { calls } = installBlueskyFetch(() => jsonResponse(
      { error: 'RateLimitExceeded', message: 'private-response-token' },
      429,
      { 'Retry-After': '120' },
    ));
    const batch = messageBatch(job, { id: 'rate-limited-1' });
    const retry = vi.spyOn(batch.messages[0], 'retry');

    const result = await deliver(batch);

    expect(calls.createRecord).toBe(1);
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
    const gate = env.POST_GATE.getByName(`v1:bluesky:${articleId}`);
    const { calls } = installBlueskyFetch(reply);

    const first = await deliver(messageBatch(job, { id: `${articleId}-1` }));
    const second = await deliver(messageBatch(job, { id: `${articleId}-2`, attempts: 2 }));

    expect(first.retryMessages).toEqual([{ msgId: `${articleId}-1` }]);
    expect(second.retryMessages).toEqual([{ msgId: `${articleId}-2` }]);
    expect(calls.session).toBe(1);
    expect(calls.createRecord).toBe(1);
    expect(await gate.getState()).toMatchObject({ status: 'uncertain', error });
    expect(JSON.stringify(await gate.getState())).not.toContain('private-response-token');
  });

  it('backfill claims terminal state while a matching job is queued', async () => {
    const job = {
      ...postJob('route-qualified'),
      title: 'Queue Safety Under Ambiguity',
    };
    const queuedBatch = messageBatch(job, { id: 'backfill-race-queued' });
    const { calls } = installBlueskyFetch();

    const response = await worker.fetch(new Request('https://worker.example/backfill', {
      headers: {
        Authorization: 'Bearer test-api-secret',
        'CF-Connecting-IP': '192.0.2.10',
      },
    }), env);
    const delivery = await deliver(queuedBatch);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      marked: [{ id: 'route-qualified', title: 'Queue Safety Under Ambiguity' }],
    });
    expect(delivery.explicitAcks).toEqual(['backfill-race-queued']);
    expect(calls).toEqual({ session: 0, createRecord: 0 });
    expect(await env.POST_GATE.getByName('v1:bluesky:route-qualified').getState()).toMatchObject({
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
    const { calls } = installBlueskyFetch();

    const response = await worker.fetch(new Request('https://worker.example/backfill', {
      headers: {
        Authorization: 'Bearer test-api-secret',
        'CF-Connecting-IP': '192.0.2.13',
      },
    }), env);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ marked: [], skipped: 1, errors: [] });
    expect(calls).toEqual({ session: 0, createRecord: 0 });
    expect(await env.POST_GATE.getByName('v1:bluesky:route-qualified').getState()).toMatchObject({
      status: 'backfilled',
      metadata: { articleId: 'route-qualified', title: 'Queue Safety Under Ambiguity' },
    });
  });

  it('DLQ archives uncertain delivery metadata in KV before acknowledgement', async () => {
    const job = postJob('uncertain-dlq');
    const gate = env.POST_GATE.getByName('v1:bluesky:uncertain-dlq');
    installBlueskyFetch(() => jsonResponse(
      { error: 'ServiceUnavailable', token: 'private-response-token' },
      503,
    ));
    await env.POSTED_STATE.put('jobmeta:v1:bluesky:uncertain-dlq', JSON.stringify({
      angle: 'tension',
      anchored_on: 'the delivery ambiguity boundary',
    }));
    await deliver(messageBatch(job, { id: 'uncertain-main-1' }));

    const beforeArchive = Date.now();
    const result = await deliver(messageBatch(job, {
      queue: DLQ,
      id: 'uncertain-dlq-1',
      attempts: 4,
    }));
    const afterArchive = Date.now();
    const archived = await env.POSTED_STATE.get('failed:v1:bluesky:uncertain-dlq', 'json');

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
    expect(await env.POSTED_STATE.get('jobmeta:v1:bluesky:uncertain-dlq')).toBeNull();
  });

  it('DLQ archives a failed delivery before removing its staged metadata', async () => {
    const job = postJob('failed-dlq');
    const gate = env.POST_GATE.getByName('v1:bluesky:failed-dlq');
    const failure = new Error('Bluesky credentials are required');
    failure.code = 'AUTH_FAILED';
    failure.stage = 'pre-send';
    failure.requestSent = false;
    await gate.claim(job);
    await gate.markFailed(failure);
    await env.POSTED_STATE.put('jobmeta:v1:bluesky:failed-dlq', '{"angle":"tension"}');

    const result = await deliver(messageBatch(job, {
      queue: DLQ,
      id: 'failed-dlq-1',
      attempts: 4,
    }));

    expect(result.explicitAcks).toEqual(['failed-dlq-1']);
    expect(await env.POSTED_STATE.get('failed:v1:bluesky:failed-dlq', 'json')).toMatchObject({
      job,
      messageId: 'failed-dlq-1',
      attempts: 4,
      gateState: {
        status: 'failed',
        error: { code: 'AUTH_FAILED', stage: 'pre-send' },
      },
    });
    expect(await env.POSTED_STATE.get('jobmeta:v1:bluesky:failed-dlq')).toBeNull();
  });

  it('dry trigger generates and scores a qualifying post without Queue, KV, DO, or Bluesky writes', async () => {
    const queue = vi.spyOn(worker, 'queue').mockImplementation(async () => {});
    const kvPut = vi.spyOn(env.POSTED_STATE, 'put');
    const kvDelete = vi.spyOn(env.POSTED_STATE, 'delete');
    const { calls } = installBlueskyFetch();
    const gateIdsBefore = (await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort();

    const response = await worker.fetch(new Request('https://worker.example/trigger?dry=true', {
      headers: {
        Authorization: 'Bearer test-api-secret',
        'CF-Connecting-IP': '192.0.2.11',
      },
    }), env);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      posted: [{
        id: 'route-qualified',
        title: 'Queue Safety Under Ambiguity',
        message: 'Queue-backed delivery forces an uncomfortable tradeoff: ambiguity must stop retries even when publication cannot be confirmed.',
        image: 'https://static.philippdubach.com/queue-safety.png',
        description: 'How durable state prevents duplicate social posts.',
      }],
      skipped: 0,
      errors: [],
    });
    expect((await env.POSTED_STATE.list()).keys).toEqual([]);
    expect(kvPut).not.toHaveBeenCalled();
    expect(kvDelete).not.toHaveBeenCalled();
    expect((await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort()).toEqual(gateIdsBefore);
    expect(queue).not.toHaveBeenCalled();
    expect(calls).toEqual({ session: 0, createRecord: 0 });
  });

  it('non-dry trigger sends a validated generated job through the real Queue without direct posting', async () => {
    const queue = vi.spyOn(worker, 'queue').mockImplementation(async () => {});
    const { calls } = installBlueskyFetch();
    const gateIdsBefore = (await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort();

    const response = await worker.fetch(new Request('https://worker.example/trigger', {
      headers: {
        Authorization: 'Bearer test-api-secret',
        'CF-Connecting-IP': '192.0.2.12',
      },
    }), env);

    await vi.waitFor(() => expect(queue).toHaveBeenCalledOnce());
    const [batch] = queue.mock.calls[0];
    const queuedJob = batch.messages[0].body;
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ queued: 1, skipped: 0, errors: [] });
    expect(queuedJob).toMatchObject({
      version: 1,
      platform: 'bluesky',
      articleId: 'route-qualified',
      url: 'https://philippdubach.com/posts/route-qualified/',
      title: 'Queue Safety Under Ambiguity',
      message: 'Queue-backed delivery forces an uncomfortable tradeoff: ambiguity must stop retries even when publication cannot be confirmed.',
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
    expect(calls).toEqual({ session: 0, createRecord: 0 });
    expect(await env.POSTED_STATE.get('posts:route-qualified')).toBeNull();
    expect(await env.POSTED_STATE.get('jobmeta:v1:bluesky:route-qualified', 'json')).toMatchObject({
      angle: 'tension',
      anchored_on: 'the delivery ambiguity boundary',
      image: 'https://static.philippdubach.com/queue-safety.png',
      description: 'How durable state prevents duplicate social posts.',
    });
    expect((await listDurableObjectIds(env.POST_GATE)).map((id) => id.toString()).sort()).toEqual(gateIdsBefore);
  });
});
