import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLinkHeader, isContentPath } from "../src/links.js";

test("isContentPath: homepage", () => {
  assert.equal(isContentPath("/"), true);
});

test("isContentPath: a post", () => {
  assert.equal(isContentPath("/posts/foo/"), true);
});

test("isContentPath: category page", () => {
  assert.equal(isContentPath("/categories/ai/"), true);
});

test("isContentPath: research page", () => {
  assert.equal(isContentPath("/research/"), true);
});

test("isContentPath: api JSON", () => {
  assert.equal(isContentPath("/api/posts.json"), false);
});

test("isContentPath: sitemap", () => {
  assert.equal(isContentPath("/sitemap.xml"), false);
});

test("isContentPath: well-known", () => {
  assert.equal(isContentPath("/.well-known/api-catalog"), false);
});

test("isContentPath: cdn-cgi", () => {
  assert.equal(isContentPath("/cdn-cgi/foo"), false);
});

test("buildLinkHeader: homepage gets all site-wide rels + per-page alternate", () => {
  const header = buildLinkHeader("/");
  assert.match(header, /rel="api-catalog"/);
  assert.match(header, /rel="sitemap"/);
  assert.match(header, /rel="alternate".*application\/rss\+xml/);
  assert.match(header, /rel="alternate".*application\/feed\+json/);
  assert.match(header, /rel="describedby"/);
  assert.match(header, /<\/index\.md>;\s*rel="alternate";\s*type="text\/markdown"/);
});

test("buildLinkHeader: post page includes its own .md alternate", () => {
  const header = buildLinkHeader("/posts/foo/");
  assert.match(header, /<\/posts\/foo\/index\.md>;\s*rel="alternate";\s*type="text\/markdown"/);
});

test("buildLinkHeader: non-content path has site-wide only, no per-page alternate", () => {
  const header = buildLinkHeader("/api/posts.json");
  assert.match(header, /rel="api-catalog"/);
  assert.doesNotMatch(header, /rel="alternate";\s*type="text\/markdown"/);
});
