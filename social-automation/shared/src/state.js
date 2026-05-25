/**
 * Read variety memory: the last N posted entries on this platform, scoped to
 * the `posts:` key prefix (so lock: and ratelimit: keys are not included).
 *
 * Returns an array of {message, angle, anchored_on?, at} sorted newest-first.
 * Drops entries without a `message` field (legacy/backfilled entries).
 */
export async function recentPosts(kv, { n = 15 } = {}) {
  const list = await kv.list({ prefix: 'posts:', limit: 1000 });
  const entries = await Promise.all(
    list.keys.map(async (k) => {
      const data = await kv.get(k.name, 'json');
      if (!data || !data.message) return null;
      return data;
    })
  );
  return entries
    .filter(Boolean)
    .sort((a, b) => (b.at || '').localeCompare(a.at || ''))
    .slice(0, n);
}
