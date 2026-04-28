const SITE_WIDE = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</sitemap.xml>; rel="sitemap"',
  '</feed/index.xml>; rel="alternate"; type="application/rss+xml"; title="RSS"',
  '</feed.json>; rel="alternate"; type="application/feed+json"; title="JSON Feed"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
];

const CONTENT_PREFIXES = [
  "/posts/",
  "/categories/",
  "/projects/",
  "/standalone/",
  "/faq/",
];

const CONTENT_EXACT = new Set([
  "/",
  "/about/",
  "/research/",
  "/newsletter/",
]);

// SYNC POINT: when adding a new machine-readable endpoint, update both this
// file and layouts/index.apicatalog.json.

export const isContentPath = (path) => {
  if (CONTENT_EXACT.has(path)) return true;
  return CONTENT_PREFIXES.some((p) => path.startsWith(p));
};

const perPageAlternate = (path) => {
  const mdPath = path.endsWith("/") ? `${path}index.md` : `${path}/index.md`;
  return `<${mdPath}>; rel="alternate"; type="text/markdown"`;
};

export const buildLinkHeader = (path) => {
  const parts = [...SITE_WIDE];
  if (isContentPath(path)) parts.push(perPageAlternate(path));
  return parts.join(", ");
};
