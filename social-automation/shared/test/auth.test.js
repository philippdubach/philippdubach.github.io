import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timingSafeEqual } from '../src/auth.js';

test('timingSafeEqual returns true for equal strings', () => {
  assert.strictEqual(timingSafeEqual('foo', 'foo'), true);
});

test('timingSafeEqual returns false for different strings', () => {
  assert.strictEqual(timingSafeEqual('foo', 'bar'), false);
});

test('timingSafeEqual returns false for different lengths', () => {
  assert.strictEqual(timingSafeEqual('foo', 'foobar'), false);
});

test('timingSafeEqual returns false for non-string inputs', () => {
  assert.strictEqual(timingSafeEqual(null, 'foo'), false);
  assert.strictEqual(timingSafeEqual('foo', undefined), false);
  assert.strictEqual(timingSafeEqual(123, 'foo'), false);
});

test('timingSafeEqual handles empty strings', () => {
  assert.strictEqual(timingSafeEqual('', ''), true);
  assert.strictEqual(timingSafeEqual('', 'foo'), false);
});
