import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const site = "https://philippdubach.com";

const mockRuntime = (t, { origin, match, put } = {}) => {
  const pending = [];
  const reads = [];
  const writes = [];
  const requests = [];
  t.mock.method(globalThis, "fetch", async (request) => {
    requests.push(request);
    return origin ? origin(request) : new Response("origin", {
      headers: { "Content-Type": "text/html", "Cache-Control": "public, max-age=3600" },
    });
  });
  const originalCaches = globalThis.caches;
  globalThis.caches = { default: {
    async match(request) {
      reads.push(request);
      return match?.(request);
    },
    async put(request, response) {
      writes.push({ request, response });
      return put?.(request, response);
    },
  } };
  t.after(() => {
    if (originalCaches === undefined) delete globalThis.caches;
    else globalThis.caches = originalCaches;
  });
  return { pending, reads, writes, requests, ctx: { waitUntil(promise) { pending.push(promise); } } };
};

test("POST bypasses cached GET responses and forwards the complete body without a Markdown rewrite", async (t) => {
  const runtime = mockRuntime(t, {
    match: () => new Response("cached homepage"),
    origin: async (request) => {
      assert.equal(request.method, "POST");
      assert.equal(request.url, `${site}/`);
      assert.equal(request.redirect, "manual");
      assert.equal(await request.text(), "email=reader%40example.com");
      return new Response("method not allowed", { status: 405 });
    },
  });
  const response = await worker.fetch(new Request(`${site}/`, {
    method: "POST", body: "email=reader%40example.com", headers: { Accept: "text/markdown" },
  }), {}, runtime.ctx);
  assert.equal(response.status, 405);
  assert.equal(runtime.reads.length, 0);
  assert.equal(runtime.writes.length, 0);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.ok(response.headers.get("Content-Security-Policy"));
});

test("HEAD returns cached GET headers without a body", async (t) => {
  const runtime = mockRuntime(t, { match: () => new Response("cached", {
    headers: { "Content-Length": "6", "Content-Security-Policy": "default-src 'self'" },
  }) });
  const response = await worker.fetch(new Request(`${site}/`, { method: "HEAD" }), {}, runtime.ctx);
  assert.equal(response.status, 200);
  assert.equal(response.body, null);
  assert.equal(response.headers.get("Content-Length"), "6");
  assert.equal(runtime.requests.length, 0);
  assert.equal(runtime.writes.length, 0);
});

test("HEAD on a retired post returns 410 security headers without its HTML body", async (t) => {
  const runtime = mockRuntime(t);
  const response = await worker.fetch(new Request(`${site}/posts/bitcoin-security/`, { method: "HEAD" }), {}, runtime.ctx);
  assert.equal(response.status, 410);
  assert.equal(response.body, null);
  assert.ok(response.headers.get("Strict-Transport-Security"));
  assert.equal(runtime.requests.length, 0);
});

test("conditional cache lookup retains validators and returns the cache's 304", async (t) => {
  const runtime = mockRuntime(t, { match: (request) => {
    assert.equal(request.headers.get("If-None-Match"), '"article-v1"');
    assert.equal(request.headers.get("If-Modified-Since"), "Fri, 04 Sep 2026 12:00:00 GMT");
    return new Response(null, { status: 304, headers: { "Content-Security-Policy": "default-src 'self'" } });
  } });
  const response = await worker.fetch(new Request(`${site}/posts/variance-tax/`, {
    headers: { "If-None-Match": '"article-v1"', "If-Modified-Since": "Fri, 04 Sep 2026 12:00:00 GMT" },
  }), {}, runtime.ctx);
  assert.equal(response.status, 304);
  assert.equal(response.body, null);
  assert.ok(response.headers.get("Content-Security-Policy"));
  assert.equal(runtime.requests.length, 0);
});

test("range requests reach origin unchanged and partial responses are never cached", async (t) => {
  const runtime = mockRuntime(t, { origin: (request) => {
    assert.equal(request.headers.get("Range"), "bytes=0-3");
    assert.equal(request.headers.get("If-Range"), '"v1"');
    return new Response("part", { status: 206, headers: { "Content-Range": "bytes 0-3/20" } });
  } });
  const response = await worker.fetch(new Request(`${site}/asset.js`, {
    headers: { Range: "bytes=0-3", "If-Range": '"v1"' },
  }), {}, runtime.ctx);
  assert.equal(response.status, 206);
  assert.equal(runtime.reads.length, 0);
  assert.equal(runtime.writes.length, 0);
});

test("cache read and write failures keep the origin body and security headers", async (t) => {
  t.mock.method(console, "error", () => {});
  const runtime = mockRuntime(t, {
    match: () => { throw new Error("unavailable"); },
    put: () => { throw new Error("unavailable"); },
  });
  const response = await worker.fetch(new Request(`${site}/`), {}, runtime.ctx);
  await Promise.all(runtime.pending);
  assert.equal(await response.text(), "origin");
  assert.ok(response.headers.get("Content-Security-Policy"));
  assert.equal(console.error.mock.calls.length, 2);
});

test("cache writes do not hold the response until storage finishes", async (t) => {
  let finishWrite;
  const runtime = mockRuntime(t, { put: () => new Promise((resolve) => { finishWrite = resolve; }) });
  const response = await worker.fetch(new Request(`${site}/`), {}, runtime.ctx);
  assert.equal(await response.text(), "origin");
  assert.equal(runtime.pending.length, 1);
  finishWrite();
  await Promise.all(runtime.pending);
});

test("origin fetch failure returns an uncached 502 with security headers", async (t) => {
  t.mock.method(console, "error", () => {});
  const runtime = mockRuntime(t, { origin: () => { throw new Error("private origin detail"); } });
  const response = await worker.fetch(new Request(`${site}/`), {}, runtime.ctx);
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.ok(response.headers.get("Content-Security-Policy"));
  assert.doesNotMatch(await response.text(), /private origin detail/);
  assert.equal(runtime.writes.length, 0);
});

test("origin redirects preserve their status and destination", async (t) => {
  const runtime = mockRuntime(t, { origin: () => new Response(null, { status: 301, headers: { Location: "/writing/" } }) });
  const response = await worker.fetch(new Request(`${site}/old/`), {}, runtime.ctx);
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("Location"), "/writing/");
  assert.equal(runtime.requests[0].redirect, "manual");
  assert.equal(runtime.writes.length, 0);
});
