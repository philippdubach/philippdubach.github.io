import { test } from "node:test";
import assert from "node:assert/strict";
import { cacheKeyFor } from "../src/cache.js";

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
