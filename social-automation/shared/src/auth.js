/**
 * Timing-safe string comparison to prevent timing attacks on auth tokens.
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let result = a.length === b.length ? 0 : 1;
  if (a.length !== b.length) {
    b = a; // Still compare to maintain constant time.
  }
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
