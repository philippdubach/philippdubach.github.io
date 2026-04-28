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

// Taxonomy listing roots — Hugo does not emit `<root>/index.md` for these,
// so they must not be treated as content paths even though /categories/<term>/
// (matching the prefix) is valid.
const CONTENT_EXCLUDE = new Set([
  "/categories/",
  "/tags/",
  "/types/",
]);

// Hugo's paginator emits HTML-only paginated index pages (e.g. /posts/page/2/,
// /categories/ai/page/3/). No index.md exists at those paths, so they must
// not be treated as content paths.
const PAGINATED_PATH = /\/page\/\d+\/?$/;

// SYNC POINT: when adding a new machine-readable endpoint, update both this
// file and layouts/index.apicatalog.json.

export const isContentPath = (path) => {
  if (CONTENT_EXCLUDE.has(path)) return false;
  if (PAGINATED_PATH.test(path)) return false;
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
