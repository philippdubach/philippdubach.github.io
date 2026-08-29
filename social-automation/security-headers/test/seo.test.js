import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIndexNowKeyResponse, decorate } from "../src/index.js";

test("HTML is never relabeled when Markdown negotiation did not rewrite it", async () => {
  const response = new Response("<!doctype html><title>Utility</title>", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  const decorated = await decorate(response, {
    url: new URL("https://philippdubach.com/quick-dcf/privacy-policy.html"),
    servedMarkdown: false,
    isCatalog: false,
  });
  assert.equal(decorated.headers.get("Content-Type"), "text/html; charset=utf-8");
  assert.equal(decorated.headers.get("x-markdown-tokens"), null);
});

test("negotiated Markdown receives its type, canonical policy, and token count", async () => {
  const response = new Response("---\ntitle: Subscribe\n---\n# Subscribe\n");
  const decorated = await decorate(response, {
    url: new URL("https://philippdubach.com/subscribe/"),
    servedMarkdown: true,
    isCatalog: false,
  });
  assert.equal(decorated.headers.get("Content-Type"), "text/markdown; charset=utf-8");
  assert.equal(decorated.headers.get("X-Robots-Tag"), null);
  assert.match(decorated.headers.get("Vary"), /Accept/);
  assert.ok(Number(decorated.headers.get("x-markdown-tokens")) > 0);
});

test("direct Markdown alternates are noindex and point to canonical HTML", async () => {
  const response = new Response("# Article\n");
  const decorated = await decorate(response, {
    url: new URL("https://philippdubach.com/posts/example/index.md"),
    servedMarkdown: true,
    isCatalog: false,
  });
  assert.equal(decorated.headers.get("Content-Type"), "text/markdown; charset=utf-8");
  assert.equal(decorated.headers.get("X-Robots-Tag"), "noindex, follow");
  assert.match(decorated.headers.get("Link"), /<\/posts\/example\/>; rel="canonical"/);
});

test("404 responses are excluded from indexing", async () => {
  const response = new Response("<!doctype html><title>Not found</title>", {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  const decorated = await decorate(response, {
    url: new URL("https://philippdubach.com/missing/"),
    servedMarkdown: false,
    isCatalog: false,
  });
  assert.equal(decorated.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(decorated.headers.get("Link"), /rel="sitemap"/);
  assert.doesNotMatch(decorated.headers.get("Link"), /\/missing\/index\.md/);
});

test("IndexNow key verification is served only for the configured key", async () => {
  const key = "ABCDEF12-test-key";
  const request = new Request(`https://philippdubach.com/${key}.txt`);
  const response = buildIndexNowKeyResponse(request, new URL(request.url), { INDEXNOW_KEY: key });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), key);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");

  const other = new Request("https://philippdubach.com/not-the-key.txt");
  assert.equal(buildIndexNowKeyResponse(other, new URL(other.url), { INDEXNOW_KEY: key }), null);
});
