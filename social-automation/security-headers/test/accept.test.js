import { test } from "node:test";
import assert from "node:assert/strict";
import { wantsMarkdown } from "../src/accept.js";

const req = (accept) =>
  new Request("https://philippdubach.com/", accept ? { headers: { Accept: accept } } : {});

test("no Accept header → false", () => {
  assert.equal(wantsMarkdown(req(null)), false);
});

test("Accept: text/html → false", () => {
  assert.equal(wantsMarkdown(req("text/html")), false);
});

test("Accept: text/markdown → true", () => {
  assert.equal(wantsMarkdown(req("text/markdown")), true);
});

test("Accept: text/markdown,text/html;q=0.9 → true (md preferred)", () => {
  assert.equal(wantsMarkdown(req("text/markdown,text/html;q=0.9")), true);
});

test("Accept: text/html,text/markdown;q=0.5 → false (html preferred)", () => {
  assert.equal(wantsMarkdown(req("text/html,text/markdown;q=0.5")), false);
});

test("Accept: */* → false (default to html)", () => {
  assert.equal(wantsMarkdown(req("*/*")), false);
});

test("equal q values prefer markdown", () => {
  assert.equal(wantsMarkdown(req("text/html;q=0.5,text/markdown;q=0.5")), true);
});
