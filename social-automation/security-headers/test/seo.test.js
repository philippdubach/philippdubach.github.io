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

test("web app manifest receives the standards-defined MIME type", async () => {
  const response = new Response('{"name":"philippdubach.com"}', {
    headers: { "Content-Type": "text/plain" },
  });
  const decorated = await decorate(response, {
    url: new URL("https://philippdubach.com/icons/site.webmanifest"),
    servedMarkdown: false,
    isCatalog: false,
  });
  assert.equal(
    decorated.headers.get("Content-Type"),
    "application/manifest+json; charset=utf-8",
  );
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

test("Vary preserves origin cache dimensions when adding Accept", async () => {
  for (const [value, expected] of [["Accept-Encoding", "Accept-Encoding, Accept"], ["*", "*"], ["accept", "accept"]]) {
    const response = await decorate(new Response("body", { headers: { Vary: value } }), {
      url: new URL("https://philippdubach.com/"), servedMarkdown: false, isCatalog: false,
    });
    assert.equal(response.headers.get("Vary"), expected);
  }
});

test("missing fonts and failed catalogs preserve error types and cannot be cached", async () => {
  for (const [path, isCatalog] of [["/fonts/missing.woff2", false], ["/.well-known/api-catalog", true]]) {
    const response = await decorate(new Response("<h1>Not found</h1>", {
      status: 404, headers: { "Content-Type": "text/html", "Cache-Control": "public, max-age=3600" },
    }), { url: new URL(`https://philippdubach.com${path}`), servedMarkdown: false, isCatalog });
    assert.equal(response.headers.get("Content-Type"), "text/html");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
  }
});

test("large Markdown remains readable without unbounded token counting", async () => {
  const body = "# Large article\n" + "x".repeat(600 * 1024);
  const response = await decorate(new Response(body), {
    url: new URL("https://philippdubach.com/posts/large/"), servedMarkdown: true, isCatalog: false,
  });
  assert.equal(response.headers.get("Content-Type"), "text/markdown; charset=utf-8");
  assert.equal(response.headers.get("x-markdown-tokens"), null);
  assert.equal(await response.text(), body);
});
