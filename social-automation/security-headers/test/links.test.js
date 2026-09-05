import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildLinkHeader,
  canonicalPathForMarkdown,
  isContentPath,
  isMachineReadablePath,
  isMarkdownPath,
} from "../src/links.js";

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

test("isContentPath: all top-level Markdown pages that Hugo emits", () => {
  for (const path of ["/subscribe/", "/writing/", "/categories/"]) {
    assert.equal(isContentPath(path), true, path);
  }
  assert.equal(isContentPath("/newsletter/"), false);
});

test("isContentPath: api JSON", () => {
  assert.equal(isContentPath("/api/posts.json"), false);
});

test("isContentPath: sitemap", () => {
  assert.equal(isContentPath("/sitemap.xml"), false);
});

test("isContentPath: direct Markdown alternate is not rewritten again", () => {
  assert.equal(isContentPath("/posts/foo/index.md"), false);
});

test("resources beneath content prefixes never advertise or rewrite Markdown alternates", () => {
  for (const path of ["/posts/index.xml", "/posts/example/chart.png", "/projects/tool/app.js", "/posts/example/index.html"])
    assert.equal(isContentPath(path), false, path);
  assert.equal(isContentPath("/posts/an-article-with-a-period./"), true);
});

test("Markdown paths map back to canonical HTML paths", () => {
  assert.equal(isMarkdownPath("/index.md"), true);
  assert.equal(isMarkdownPath("/posts/foo/index.md"), true);
  assert.equal(canonicalPathForMarkdown("/index.md"), "/");
  assert.equal(canonicalPathForMarkdown("/posts/foo/index.md"), "/posts/foo/");
  assert.equal(canonicalPathForMarkdown("/posts/foo/"), null);
});

test("machine-readable discovery surfaces are marked for noindex headers", () => {
  for (const path of ["/index.xml", "/feed.json", "/api/posts.json", "/llms.txt", "/posts/foo/index.md"]) {
    assert.equal(isMachineReadablePath(path), true, path);
  }
  assert.equal(isMachineReadablePath("/posts/foo/"), false);
});

test("isContentPath: well-known", () => {
  assert.equal(isContentPath("/.well-known/api-catalog"), false);
});

test("isContentPath: cdn-cgi", () => {
  assert.equal(isContentPath("/cdn-cgi/foo"), false);
});

test("isContentPath: bare /tags/ excluded", () => {
  assert.equal(isContentPath("/tags/"), false);
});

test("isContentPath: bare /types/ excluded", () => {
  assert.equal(isContentPath("/types/"), false);
});

test("isContentPath: term page under /categories/ still matches", () => {
  assert.equal(isContentPath("/categories/ai/"), true);
});

test("isContentPath: paginated section path excluded (Hugo emits HTML only)", () => {
  // Hugo's paginator (e.g. /posts/page/2/) generates HTML-only paginated
  // index pages — no index.md exists at those paths. Treating them as
  // content paths would advertise a dead .md URL via Link header and
  // rewrite Accept: text/markdown requests to a 404.
  assert.equal(isContentPath("/posts/page/2/"), false);
});

test("isContentPath: paginated term path excluded", () => {
  assert.equal(isContentPath("/categories/ai/page/3/"), false);
});

test("buildLinkHeader: paginated path has no per-page md alternate", () => {
  const header = buildLinkHeader("/posts/page/2/");
  assert.match(header, /rel="api-catalog"/);
  assert.doesNotMatch(header, /<\/posts\/page\/2\/index\.md>/);
});

test("buildLinkHeader: bare /categories/ advertises its generated Markdown alternate", () => {
  const header = buildLinkHeader("/categories/");
  assert.match(header, /rel="api-catalog"/);
  assert.match(header, /<\/categories\/index\.md>/);
});

test("buildLinkHeader: homepage gets all site-wide rels + per-page alternate", () => {
  const header = buildLinkHeader("/");
  assert.match(header, /rel="api-catalog"/);
  assert.match(header, /rel="sitemap"/);
  assert.match(header, /<\/index\.xml>/);
  assert.doesNotMatch(header, /<\/feed\/index\.xml>/);
  assert.match(header, /rel="alternate".*application\/rss\+xml/);
  assert.match(header, /rel="alternate".*application\/feed\+json/);
  assert.match(header, /rel="describedby"/);
  assert.match(header, /<\/index\.md>;\s*rel="alternate";\s*type="text\/markdown"/);
});

test("buildLinkHeader: post page includes its own .md alternate", () => {
  const header = buildLinkHeader("/posts/foo/");
  assert.match(header, /<\/posts\/foo\/index\.md>;\s*rel="alternate";\s*type="text\/markdown"/);
});

test("buildLinkHeader: direct Markdown variant points to canonical HTML", () => {
  const header = buildLinkHeader("/posts/foo/index.md");
  assert.match(header, /<\/posts\/foo\/>;\s*rel="canonical"/);
  assert.doesNotMatch(header, /index\.md\/index\.md/);
});

test("buildLinkHeader: non-content path has site-wide only, no per-page alternate", () => {
  const header = buildLinkHeader("/api/posts.json");
  assert.match(header, /rel="api-catalog"/);
  assert.doesNotMatch(header, /rel="alternate";\s*type="text\/markdown"/);
});
