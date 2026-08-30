import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRedirect, buildRedirectResponse } from "../src/redirects.js";

test("rss: legacy feed file permanently redirects to canonical feed", () => {
  assert.deepEqual(resolveRedirect("/feed/index.xml"), {
    status: 301,
    location: "/index.xml",
  });
});

test("rss: legacy feed directory permanently redirects to canonical feed", () => {
  assert.deepEqual(resolveRedirect("/feed/"), {
    status: 301,
    location: "/index.xml",
  });
});

test("rss: canonical feed passes through", () => {
  assert.equal(resolveRedirect("/index.xml"), null);
});

test("Hugo aliases receive one-hop edge redirects", () => {
  const aliases = new Map([
    ["/backwards/", "/posts/enterprise-ai-strategy-is-backwards/"],
    ["/posts/a-bull-case/", "/posts/the-impossible-backhand/"],
    ["/posts/ai-productivity/", "/posts/93-of-developers-use-ai-coding-tools.-productivity-hasnt-moved./"],
    ["/posts/the-long-volatility-premium/", "/posts/long-volatility-premium/"],
    ["/posts/the-variance-tax/", "/posts/variance-tax/"],
    ["/standalone/hn-prediction/", "/posts/social-media-success-prediction-bert-models-for-post-titles/"],
    ["/standalone/hn-sentiment/", "/posts/65-of-hacker-news-posts-have-negative-sentiment-and-they-outperform/"],
    ["/standalone/rss-tinder/", "/posts/rss-swipr-find-blogs-like-you-find-your-dates/"],
  ]);
  for (const [source, location] of aliases) {
    assert.deepEqual(resolveRedirect(source), { status: 301, location }, source);
  }
});

// --- Slug rename: 301 to current canonical ---
test("rename: truncated share URL → current slug", () => {
  const r = resolveRedirect("/posts/ai-models-are-the-=/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/ai-models-are-the-new-rebar/");
});

test("rename: when-every-bulge-bracket → every-bulge-bracket", () => {
  const r = resolveRedirect("/posts/when-every-bulge-bracket-bank-agrees-on-ai/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/every-bulge-bracket-bank-agrees-on-ai/");
});

test("rename: works without trailing slash", () => {
  const r = resolveRedirect("/posts/europes-24-trillion-payment-breakup");
  assert.equal(r.status, 301);
  assert.equal(
    r.location,
    "/posts/europes-24-trillion-payment-breakup-is-really-a-bet-on-infrastructure-arbitrage/",
  );
});

test("gone: gambling-vs-investing has no redirect hop to a retired target", () => {
  const r = resolveRedirect("/posts/gambling-vs-investing/");
  assert.equal(r.status, 410);
});

// --- Gone slugs: 410 ---
test("gone: deleted post per audience.md", () => {
  const r = resolveRedirect("/posts/bitcoin-security/");
  assert.equal(r.status, 410);
  assert.equal(r.location, undefined);
});

test("gone: book-review-why-machines-learn", () => {
  const r = resolveRedirect("/posts/book-review-why-machines-learn/");
  assert.equal(r.status, 410);
});

// --- Pass-through: existing slug returns null ---
test("pass-through: existing post returns null (let origin serve it)", () => {
  const r = resolveRedirect("/posts/the-saaspocalypse-paradox/");
  assert.equal(r, null);
});

test("pass-through: unknown slug returns null (origin will 404)", () => {
  const r = resolveRedirect("/posts/some-future-post-not-yet-in-map/");
  assert.equal(r, null);
});

// --- Date-prefix paths ---
test("date-prefix: with current canonical slug → /posts/<slug>/", () => {
  const r = resolveRedirect("/2025/12/01/nikes-crisis-and-the-economics-of-brand-decay/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/nikes-crisis-and-the-economics-of-brand-decay/");
});

test("date-prefix: latest posts are present in the canonical inventory", () => {
  for (const slug of [
    "openai-hugging-face-incident-plain-english",
    "put-the-model-in-the-basement",
    "kimi-k3-inside-claude-code",
    "reconciling-enterprise-ai-revenue",
    "llm-performance-cost-speed-sweet-spot",
  ]) {
    assert.deepEqual(
      resolveRedirect(`/2026/08/01/${slug}/`),
      { status: 301, location: `/posts/${slug}/` },
      slug,
    );
  }
});

test("date-prefix: deleted post slug → 410", () => {
  const r = resolveRedirect("/2026/01/02/bitcoin-security/");
  assert.equal(r.status, 410);
});

test("date-prefix: rename-mapped slug applies the rename", () => {
  const r = resolveRedirect("/2025/11/22/is-ai-really-eating-the-world/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/is-ai-really-eating-the-world-1/2/");
});

test("date-prefix: unknown slug → 410 (legacy pattern, treat as gone)", () => {
  const r = resolveRedirect("/2025/12/15/some-old-post-from-substack-era/");
  assert.equal(r.status, 410);
});

test("date-prefix: works without trailing slash", () => {
  const r = resolveRedirect("/2025/12/01/nikes-crisis-and-the-economics-of-brand-decay");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/nikes-crisis-and-the-economics-of-brand-decay/");
});

// --- Pagination ---
test("pagination: /page/2/ → /writing/", () => {
  const r = resolveRedirect("/page/2/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/writing/");
});

test("pagination: /page/3 (no slash) → /writing/", () => {
  const r = resolveRedirect("/page/3");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/writing/");
});

// --- Taxonomy renames ---
test("taxonomy: /categories/commentary/ → /writing/", () => {
  const r = resolveRedirect("/categories/commentary/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/writing/");
});

test("taxonomy: /categories/finance/ → /categories/investing/", () => {
  const r = resolveRedirect("/categories/finance/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/categories/investing/");
});

// --- Pass-through: pages outside the redirect surface ---
test("pass-through: homepage", () => {
  assert.equal(resolveRedirect("/"), null);
});

test("pass-through: about page", () => {
  assert.equal(resolveRedirect("/about/"), null);
});

test("pass-through: api endpoint", () => {
  assert.equal(resolveRedirect("/api-catalog.json"), null);
});

test("pass-through: existing categories page", () => {
  assert.equal(resolveRedirect("/categories/ai/"), null);
});

// --- Response builder ---
test("buildRedirectResponse: 301 sets Location header", () => {
  const res = buildRedirectResponse({ status: 301, location: "/posts/two-anthropics/" });
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("Location"), "/posts/two-anthropics/");
  assert.match(res.headers.get("Cache-Control"), /max-age=86400/);
});

test("buildRedirectResponse: 410 returns HTML body with meta-refresh", async () => {
  const res = buildRedirectResponse({ status: 410 });
  assert.equal(res.status, 410);
  assert.equal(res.headers.get("Content-Type"), "text/html; charset=utf-8");
  const body = await res.text();
  assert.match(body, /<meta http-equiv="refresh" content="3;url=\/">/);
  assert.match(body, /<meta name="robots" content="noindex">/);
  assert.match(body, /This page has been removed/);
});
