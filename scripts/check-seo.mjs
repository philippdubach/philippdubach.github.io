import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { resolveRedirect } from "../social-automation/security-headers/src/redirects.js";

const outputDirectory = resolve(process.argv[2] ?? "public");
const failures = [];
const indexableCanonicals = new Set();
const documentTitles = new Map();
const internalLinks = new Map();
const breadcrumbLinks = new Map();

function record(condition, message) {
  if (!condition) failures.push(message);
}

function values(markup, attribute) {
  const expression = new RegExp(`\\s${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "gi");
  return [...markup.matchAll(expression)].map((match) => match[1] ?? match[2] ?? match[3] ?? "");
}

function tags(markup, element) {
  return [...markup.matchAll(new RegExp(`<${element}\\b([^>]*)>`, "gi"))].map((match) => match[1]);
}

function metadata(markup, key, value) {
  const matches = tags(markup, "meta").filter((attributes) =>
    values(`<meta ${attributes}>`, key)[0]?.toLowerCase() === value.toLowerCase());
  return matches.map((attributes) => values(`<meta ${attributes}>`, "content")[0] ?? "");
}

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name === "index.html") files.push(path);
  }
  return files;
}

function visitObjects(value, callback) {
  if (!value || typeof value !== "object") return;
  callback(value);
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach((item) => visitObjects(item, callback));
    else visitObjects(child, callback);
  }
}

for (const path of await htmlFiles(outputDirectory)) {
  const pathname = `/${relative(outputDirectory, path).replace(/index\.html$/, "")}`;
  const markup = await readFile(path, "utf8");
  const canonicalTags = tags(markup, "link").filter((attributes) =>
    values(`<link ${attributes}>`, "rel")[0]?.toLowerCase().split(/\s+/).includes("canonical"));
  const canonical = canonicalTags.length === 1
    ? values(`<link ${canonicalTags[0]}>`, "href")[0]
    : "";

  if (/<meta\b[^>]*http-equiv=(?:"refresh"|refresh)/i.test(markup)) {
    const redirect = resolveRedirect(pathname);
    record(redirect?.status === 301, `${pathname}: generated alias lacks an edge 301`);
    if (redirect?.location && canonical) {
      record(new URL(canonical).pathname === redirect.location, `${pathname}: edge redirect and alias canonical disagree`);
    }
    continue;
  }

  for (const attributes of tags(markup, "a")) {
    const href = values(`<a ${attributes}>`, "href")[0];
    if (!href || href.startsWith("#")) continue;
    try {
      const target = new URL(href, "https://philippdubach.com/");
      if (target.protocol !== "https:" || target.hostname !== "philippdubach.com") continue;
      const sources = internalLinks.get(target.pathname) ?? new Set();
      sources.add(pathname);
      internalLinks.set(target.pathname, sources);
    } catch {
      record(false, `${pathname}: invalid internal link ${href}`);
    }
  }

  const title = markup.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() ?? "";
  const descriptions = metadata(markup, "name", "description");
  const robots = metadata(markup, "name", "robots");
  const noindex = robots[0]?.toLowerCase().includes("noindex") ?? false;
  const requiredMetadata = [
    ["property", "og:title"], ["property", "og:description"],
    ["property", "og:url"], ["property", "og:type"],
    ["property", "og:image"], ["property", "og:image:alt"],
    ["property", "og:site_name"], ["property", "og:locale"],
    ["name", "twitter:card"], ["name", "twitter:creator"],
    ["name", "twitter:title"], ["name", "twitter:description"],
    ["name", "twitter:image"], ["name", "twitter:image:alt"],
  ];

  record(Boolean(title), `${pathname}: missing title`);
  record(descriptions.length === 1 && descriptions[0].trim().length > 0, `${pathname}: needs one non-empty description`);
  record(robots.length === 1, `${pathname}: needs one robots meta value`);
  record(canonicalTags.length === 1 && /^https:\/\/philippdubach\.com\//.test(canonical), `${pathname}: needs one absolute apex canonical`);
  for (const [key, value] of requiredMetadata) {
    const entries = metadata(markup, key, value);
    record(entries.length === 1 && entries[0].trim().length > 0, `${pathname}: needs one non-empty ${value}`);
  }
  record(metadata(markup, "property", "og:url")[0] === canonical, `${pathname}: og:url must match canonical`);

  const schemaObjects = [];
  for (const match of markup.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/ld\+json/i.test(match[1])) continue;
    try {
      const graph = JSON.parse(match[2]);
      visitObjects(graph, (object) => schemaObjects.push(object));
    } catch (error) {
      record(false, `${pathname}: invalid JSON-LD (${error.message})`);
    }
  }
  const graphDefinitions = new Map(schemaObjects
    .filter((object) => object["@id"] && object["@type"])
    .map((object) => [object["@id"], object]));
  for (const object of schemaObjects) {
    const type = object["@type"];
    record(!["Claim", "SpeakableSpecification"].includes(type), `${pathname}: unsupported ${type} schema remains`);
    record(type !== "FAQPage" || pathname.startsWith("/faq/"), `${pathname}: FAQ schema must describe visible FAQ content`);
    if (object["@id"] && Object.keys(object).length === 1) {
      record(graphDefinitions.has(object["@id"]), `${pathname}: unresolved schema reference ${object["@id"]}`);
    }
    record(object.codeRepository === undefined || type === "SoftwareSourceCode", `${pathname}: codeRepository must describe software source, not an article`);
    record(object.numberOfItems === undefined || type === "ItemList", `${pathname}: numberOfItems belongs to ItemList`);
    if (type === "BreadcrumbList") {
      const items = object.itemListElement ?? [];
      record(items.length >= 2, `${pathname}: breadcrumb needs at least two items`);
      items.forEach((item, index) => {
        record(item.position === index + 1 && item.name, `${pathname}: breadcrumb positions/names are invalid`);
        const target = typeof item.item === "string" ? item.item : item.item?.["@id"];
        if (target) {
          const sources = breadcrumbLinks.get(target) ?? new Set();
          sources.add(pathname);
          breadcrumbLinks.set(target, sources);
        }
      });
    }
  }

  if (pathname.startsWith("/posts/")) {
    record(metadata(markup, "property", "article:published_time").length === 1, `${pathname}: missing article publication time`);
    record(metadata(markup, "property", "article:modified_time").length === 1, `${pathname}: missing article modification time`);
    record((metadata(markup, "property", "article:tag").length) <= 8, `${pathname}: too many article tags`);
    const article = graphDefinitions.get(`${canonical}#article`);
    record(Boolean(article), `${pathname}: missing canonical article identity`);
    if (article) {
      const published = metadata(markup, "property", "article:published_time")[0];
      const modified = metadata(markup, "property", "article:modified_time")[0];
      record(article.datePublished === published && article.dateModified === modified, `${pathname}: article dates must agree across schema and Open Graph`);
      record(Number.isFinite(Date.parse(published)) && Date.parse(modified) >= Date.parse(published), `${pathname}: invalid article chronology`);
      record(graphDefinitions.get(article.author?.["@id"])?.name, `${pathname}: article author must resolve to a named entity`);
      record(![].concat(article.sameAs ?? []).some((url) => url.startsWith("https://doi.org/")), `${pathname}: source paper DOI must be a citation, not an identity alias`);
    }
    const slug = pathname.slice("/posts/".length).replace(/\/$/, "");
    const legacyResolution = resolveRedirect(`/2000/01/01/${slug}/`);
    record(legacyResolution?.status === 301 && legacyResolution.location === pathname,
      `${pathname}: missing from the legacy date-URL canonical inventory`);
  }

  if (!noindex && canonical) {
    record(!indexableCanonicals.has(canonical), `${pathname}: duplicate canonical ${canonical}`);
    indexableCanonicals.add(canonical);
    const previous = documentTitles.get(title);
    record(!previous, `${pathname}: duplicate title also used by ${previous}`);
    documentTitles.set(title, pathname);
  }
}

const notFoundMarkup = await readFile(join(outputDirectory, "404.html"), "utf8");
record(metadata(notFoundMarkup, "name", "robots")[0] === "noindex, nofollow", "404: must be noindex, nofollow");
record(!tags(notFoundMarkup, "link").some((attributes) =>
  values(`<link ${attributes}>`, "rel")[0]?.toLowerCase().split(/\s+/).includes("canonical")), "404: must not declare a canonical URL");
record(!/"@type"\s*:\s*"BreadcrumbList"/.test(notFoundMarkup), "404: must not emit breadcrumb schema");

for (const [pathname, sources] of internalLinks) {
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const targetPath = pathname.endsWith("/")
    ? join(outputDirectory, relativePath, "index.html")
    : join(outputDirectory, relativePath || "index.html");
  if (await fileExists(targetPath)) continue;
  const redirect = resolveRedirect(pathname);
  const sourceList = [...sources].slice(0, 3).join(", ");
  if (redirect?.status === 301) {
    record(false, `${sourceList}: internal link ${pathname} creates a redirect hop to ${redirect.location}`);
  } else if (redirect?.status === 410) {
    record(false, `${sourceList}: internal link ${pathname} points to retired content`);
  } else {
    record(false, `${sourceList}: internal link target ${pathname} is missing`);
  }
}

const sitemap = await readFile(join(outputDirectory, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
record(!/<(?:changefreq|priority)>/.test(sitemap), "sitemap: ignored priority/changefreq fields remain");
record(JSON.stringify([...sitemapUrls].sort()) === JSON.stringify([...indexableCanonicals].sort()), "sitemap: URLs must exactly match canonical indexable HTML pages");
for (const [target, sources] of breadcrumbLinks) {
  // A noindexed utility may still include itself as the last breadcrumb.
  const isCurrentPage = [...sources].every((pathname) => target === `https://philippdubach.com${pathname}`);
  record(indexableCanonicals.has(target) || isCurrentPage,
    `${[...sources].slice(0, 3).join(", ")}: breadcrumb target ${target} is not a canonical indexable page`);
}

const robotsText = await readFile(join(outputDirectory, "robots.txt"), "utf8");
record((robotsText.match(/^User-agent:/gm) ?? []).length === 1, "robots.txt: use one complete wildcard group");
record(/^User-agent:\s*\*$/m.test(robotsText), "robots.txt: wildcard crawler group missing");
record(/^Sitemap:\s*https:\/\/philippdubach\.com\/sitemap\.xml$/m.test(robotsText), "robots.txt: canonical sitemap missing");

const catalog = JSON.parse(await readFile(join(outputDirectory, "api-catalog.json"), "utf8"));
const catalogEntry = catalog.linkset?.[0] ?? {};
record(Array.isArray(catalogEntry.item) && catalogEntry.item.length > 0, "API catalog: RFC 9727 item relation missing");
record(catalogEntry.items === undefined && catalogEntry["service-desc"] === undefined, "API catalog: stale relation names remain");

const llms = await readFile(join(outputDirectory, "llms.txt"), "utf8");
const firstSubheading = llms.match(/^##+\s.+$/m)?.[0] ?? "";
record(firstSubheading.startsWith("## "), "llms.txt: first subheading must be H2");
for (const match of llms.matchAll(/\]\(https:\/\/philippdubach\.com\/([^)]*\/index\.md)\)/g)) {
  record(await fileExists(join(outputDirectory, match[1])), `llms.txt: missing Markdown target /${match[1]}`);
}

const llmsFull = await readFile(join(outputDirectory, "llms-full.txt"), "utf8");
const llmsFullArticleUrls = [...llmsFull.matchAll(/^### .+\((https:\/\/philippdubach\.com\/posts\/[^)]+)\)$/gm)]
  .map((match) => match[1]);
record(llmsFullArticleUrls.length === new Set(llmsFullArticleUrls).size,
  "llms-full.txt: each article must appear exactly once");
record(llmsFullArticleUrls.length === [...indexableCanonicals].filter((url) => new URL(url).pathname.startsWith("/posts/")).length,
  "llms-full.txt: article inventory must match canonical posts");

if (failures.length) {
  console.error(`SEO checks failed (${failures.length}):`);
  failures.slice(0, 100).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 100) console.error(`- ${failures.length - 100} more failures`);
  process.exitCode = 1;
} else {
  console.log(`SEO checks passed for ${indexableCanonicals.size} canonical pages and ${sitemapUrls.size} sitemap URLs.`);
}

async function fileExists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}
