const PLATFORMS = new Set(['bluesky', 'twitter']);
const JOB_FIELDS = [
  'version',
  'platform',
  'articleId',
  'url',
  'title',
  'message',
  'createdAt',
];

function requireNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function requirePlatform(platform) {
  if (!PLATFORMS.has(platform)) {
    throw new TypeError('platform must be bluesky or twitter');
  }
  return platform;
}

function requireIsoDate(value) {
  if (typeof value !== 'string') {
    throw new TypeError('createdAt must be an ISO timestamp');
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== value) {
    throw new TypeError('createdAt must be an ISO timestamp');
  }
  return value;
}

export function parsePostJob(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('post job must be a plain JSON object');
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('post job must be a plain JSON object');
  }

  try {
    JSON.stringify(value);
  } catch {
    throw new TypeError('post job must be serializable as JSON');
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key !== 'string')) {
    throw new TypeError('post job must contain only JSON fields');
  }
  const keys = ownKeys.sort();
  const expectedKeys = [...JOB_FIELDS].sort();
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    throw new TypeError('post job has malformed fields');
  }
  if (value.version !== 1) {
    throw new TypeError('post job version must be 1');
  }

  return {
    version: 1,
    platform: requirePlatform(value.platform),
    articleId: requireNonEmptyString(value.articleId, 'articleId'),
    url: requireNonEmptyString(value.url, 'url'),
    title: requireNonEmptyString(value.title, 'title'),
    message: requireNonEmptyString(value.message, 'message'),
    createdAt: requireIsoDate(value.createdAt),
  };
}

export function createPostJob(platform, article, message, now = new Date()) {
  if (article === null || typeof article !== 'object' || Array.isArray(article)) {
    throw new TypeError('article must be an object');
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new TypeError('now must be a valid Date');
  }

  return parsePostJob({
    version: 1,
    platform,
    articleId: article.id,
    url: article.url,
    title: article.title,
    message,
    createdAt: now.toISOString(),
  });
}

export function jobKey(job) {
  const parsed = parsePostJob(job);
  return `v1:${parsed.platform}:${parsed.articleId}`;
}
