/**
 * Sliding-window rate limiter using KV.
 * Allows `maxRequests` per `windowMs` per IP. Fails closed on KV errors.
 */
export async function checkRateLimit(kv, ip, { windowMs = 60000, maxRequests = 10 } = {}) {
  const sanitizedIp = ip.replace(/[^a-zA-Z0-9.:]/g, '').substring(0, 45);
  const key = `ratelimit:${sanitizedIp}`;
  const now = Date.now();

  try {
    const data = await kv.get(key, 'json');
    const recent = (data?.requests || []).filter(ts => now - ts < windowMs);
    if (recent.length >= maxRequests) return false;
    recent.push(now);
    await kv.put(key, JSON.stringify({ requests: recent }), { expirationTtl: 120 });
    return true;
  } catch (e) {
    console.error('Rate limit check failed:', e);
    return false; // Fail closed.
  }
}
