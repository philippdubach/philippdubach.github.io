import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRedirect, buildRedirectResponse } from "../src/redirects.js";

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

test("rename: gambling-vs-investing → gambling-vs.-investing", () => {
  const r = resolveRedirect("/posts/gambling-vs-investing/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/gambling-vs.-investing/");
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
test("pagination: /page/2/ → /posts/page/2/", () => {
  const r = resolveRedirect("/page/2/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/page/2/");
});

test("pagination: /page/3 (no slash) → /posts/page/3/", () => {
  const r = resolveRedirect("/page/3");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/posts/page/3/");
});

// --- Taxonomy renames ---
test("taxonomy: /categories/commentary/ → /types/commentary/", () => {
  const r = resolveRedirect("/categories/commentary/");
  assert.equal(r.status, 301);
  assert.equal(r.location, "/types/commentary/");
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

test("buildRedirectResponse: 410 returns Gone body", async () => {
  const res = buildRedirectResponse({ status: 410 });
  assert.equal(res.status, 410);
  assert.equal(await res.text(), "Gone");
  assert.equal(res.headers.get("Content-Type"), "text/plain; charset=utf-8");
});
