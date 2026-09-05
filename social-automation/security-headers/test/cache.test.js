import { test } from "node:test";
import assert from "node:assert/strict";
import { cacheKeyFor, canReadCache, canWriteCache } from "../src/cache.js";

test("html and md variants get different cache keys for same URL", () => {
  const orig = new Request("https://philippdubach.com/posts/foo/");
  const htmlKey = cacheKeyFor(orig, false);
  const mdKey = cacheKeyFor(orig, true);
  assert.notEqual(htmlKey.url, mdKey.url);
});

test("cache key URL never includes the synthetic param when fetched", () => {
  const orig = new Request("https://philippdubach.com/posts/foo/");
  const mdKey = cacheKeyFor(orig, true);
  assert.match(mdKey.url, /\/posts\/foo\//);
  assert.match(mdKey.url, /_v=md/);
});

test("html cache key has _v=html marker", () => {
  const orig = new Request("https://philippdubach.com/");
  const htmlKey = cacheKeyFor(orig, false);
  assert.match(htmlKey.url, /_v=html/);
});

test("preserves existing query string", () => {
  const orig = new Request("https://philippdubach.com/posts/foo/?utm=x");
  const mdKey = cacheKeyFor(orig, true);
  assert.match(mdKey.url, /utm=x/);
  assert.match(mdKey.url, /_v=md/);
});

test("private, reload, range and non-read requests cannot use the public GET cache", () => {
  for (const headers of [
    { Authorization: "Bearer test" }, { Cookie: "session=test" },
    { "Cache-Control": "no-cache" }, { "Cache-Control": "no-store" },
    { "Cache-Control": "max-age=0" }, { Pragma: "no-cache" },
    { Range: "bytes=0-10" }, { "If-Match": '"v1"' }, { "If-Unmodified-Since": "yesterday" },
  ]) assert.equal(canReadCache(new Request("https://philippdubach.com/", { headers })), false);
  for (const method of ["POST", "PUT", "DELETE", "OPTIONS"])
    assert.equal(canReadCache(new Request("https://philippdubach.com/", { method })), false);
  assert.equal(canReadCache(new Request("https://philippdubach.com/")), true);
});

test("uncacheable responses never enter public cache", () => {
  const request = new Request("https://philippdubach.com/");
  for (const headers of [
    { "Cache-Control": "private, max-age=3600" }, { "Cache-Control": "no-store" },
    { "Cache-Control": "no-cache" }, { "Set-Cookie": "session=test" },
    { Vary: "*" }, { Vary: "Accept, Authorization" },
  ]) assert.equal(canWriteCache(request, new Response("body", { headers })), false);
  assert.equal(canWriteCache(request, new Response("partial", { status: 206 })), false);
  assert.equal(canWriteCache(request, new Response("body", { headers: { Vary: "Accept, Accept-Encoding" } })), true);
});
