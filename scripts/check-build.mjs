import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const outputDirectory = resolve(process.argv[2] ?? "public");
const failures = [];
const brand = "Philipp D. Dubach";
const expectedNavigation = ["/", "/writing/", "/projects/", "/research/", "https://link.philippdubach.com/", "/subscribe/"];

// CSP script-src hash allowlist. Every executable inline script in the built
// output must hash to one of these values, which must match the hashes in
// layouts/partials/head.html, static/_headers, and
// social-automation/security-headers/src/index.js. When an inline script
// changes: rebuild, take the new hash this check reports, update all three
// CSP copies, then update this list.
const inlineScriptHashes = new Set([
  "sha256-RBavWsCHzy8pY5yYq+Fcr1YOGBQ8N1wO2ojltcQWRPQ=", // theme snippet (head.html)
  "sha256-4qVeyGJe9myWelMbNnOnhUsPBgSyDNusLjIA/+DdyA0=", // MathJax config (math.html)
]);

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

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name === "index.html" || entry.name === "404.html") files.push(path);
  }
  return files;
}

function inspectNavigation(markup, label) {
  const navigationBlocks = [...markup.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)];
  for (const navigationClass of ["site-navigation", "mobile-menu__navigation"]) {
    const navigation = navigationBlocks.find((match) => {
      const classes = values(`<nav ${match[1]}>`, "class")[0]?.split(/\s+/) ?? [];
      return classes.includes(navigationClass);
    })?.[2] ?? "";
    const links = tags(navigation, "a");
    const hrefs = links.map((tag) => values(`<a ${tag}>`, "href")[0]).filter(Boolean);
    record(JSON.stringify(hrefs) === JSON.stringify(expectedNavigation), `${label}: ${navigationClass} has ${JSON.stringify(hrefs)}`);
    const externalLink = links.find((tag) => values(`<a ${tag}>`, "href")[0] === "https://link.philippdubach.com/");
    const externalAnchor = externalLink ? `<a ${externalLink}>` : "";
    const relationship = (values(externalAnchor, "rel")[0] ?? "").split(/\s+/);
    const externalContent = navigation.match(/<a\b(?=[^>]*href=(?:"https:\/\/link\.philippdubach\.com\/"|https:\/\/link\.philippdubach\.com\/))[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "";
    record(values(externalAnchor, "target")[0] === "_blank", `${label}: ${navigationClass} Links must open in a new tab`);
    record(["external", "noopener", "noreferrer"].every((value) => relationship.includes(value)), `${label}: ${navigationClass} Links needs safe external-link semantics`);
    record(/Links\s*<span\b(?=[^>]*class=(?:"external-link-indicator"|external-link-indicator))(?=[^>]*aria-hidden=(?:"true"|true))[^>]*>↗<\/span>/i.test(externalContent), `${label}: ${navigationClass} Links needs a styled, hidden north-east arrow indicator`);
  }
}

async function inspectPage(path) {
  const label = `/${relative(outputDirectory, path).replace(/index\.html$/, "")}`;
  const markup = await readFile(path, "utf8");
  const documentTitle = markup.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() ?? "";
  const brandOccurrences = documentTitle.match(/Philipp D\. Dubach/g)?.length ?? 0;
  record(Boolean(documentTitle), `${label}: missing document title`);
  record(brandOccurrences === 1, `${label}: document title must contain the brand exactly once (${documentTitle})`);
  if (/<meta\b[^>]*http-equiv=(?:"refresh"|refresh)/i.test(markup)) {
    record(documentTitle === `Redirecting · ${brand}`, `${label}: inconsistent redirect title (${documentTitle})`);
    record(/<a\b[^>]*href=/i.test(markup), `${label}: alias redirect needs a fallback link`);
    return;
  }
  const ids = values(markup, "id");
  const duplicateIds = [...new Set(ids.filter((id, index) => id && ids.indexOf(id) !== index))];

  const mainAttributes = tags(markup, "main");
  const anchorAttributes = tags(markup, "a");
  record(/<html\b[^>]*lang=(?:"en|en)/i.test(markup), `${label}: missing language`);
  record(/<meta\b(?=[^>]*name=(?:"viewport"|viewport))(?=[^>]*content=(?:"[^"]*viewport-fit=cover[^"]*"|[^\s>]*viewport-fit=cover))[^>]*>/i.test(markup), `${label}: viewport must expose safe-area insets`);
  record(/<header\b/i.test(markup), `${label}: missing header landmark`);
  record(mainAttributes.some((attributes) => values(`<main ${attributes}>`, "id")[0] === "main-content"), `${label}: missing main landmark`);
  record(/<footer\b/i.test(markup), `${label}: missing footer landmark`);
  record(anchorAttributes.some((attributes) => (values(`<a ${attributes}>`, "class")[0] ?? "").split(/\s+/).includes("skip-link")), `${label}: missing skip link`);
  record(/<dialog\b[^>]*data-mobile-menu/i.test(markup), `${label}: missing mobile menu`);
  record((markup.match(/<h1\b/gi) ?? []).length === 1, `${label}: expected one h1`);
  record(duplicateIds.length === 0, `${label}: duplicate ids ${duplicateIds.join(", ")}`);
  record(!/UIcons by Flaticon/i.test(markup), `${label}: includes removed attribution`);
  record(!/\bcode-(?:lang|copy)\b/i.test(markup), `${label}: code blocks must not show language or copy controls`);
  record(/<script\b[^>]*data-goatcounter="?https:\/\/stats\.philippdubach\.com\/count"?/i.test(markup), `${label}: missing GoatCounter analytics`);
  record(/<meta\b[^>]*http-equiv="?Content-Security-Policy"?/i.test(markup), `${label}: missing Content-Security-Policy meta tag`);
  record(/typeof matchMedia\s*={2,3}\s*["']function["']/.test(markup), `${label}: theme resolver must detect matchMedia support`);
  record(/prefers-color-scheme:\s*dark/.test(markup), `${label}: theme resolver must follow the system dark-mode preference`);
  inspectNavigation(markup, label);

  if (label === "/") {
    record(documentTitle === `${brand} — Quantitative Finance, AI & Macro`, `${label}: homepage needs its descriptive SEO title (${documentTitle})`);
    record(!/\bhome-biography\b/i.test(markup), `${label}: homepage must not repeat the full biography`);
    const introduction = markup.match(/<p\b[^>]*\bhome-intro\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "";
    const introductionLinks = tags(introduction, "a")
      .map((attributes) => values(`<a ${attributes}>`, "href")[0])
      .filter(Boolean);
    record(introductionLinks.includes("/about/"), `${label}: homepage introduction must link to /about/`);
    const projectsSection = markup.match(/<section\b(?=[^>]*aria-labelledby=(?:"projects-title"|projects-title))[^>]*>([\s\S]*?)<\/section>/i)?.[1] ?? "";
    const projectItems = [...projectsSection.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)];
    const projectDates = projectItems.map((match) => match[1].match(/<time\b[^>]*>([^<]+)<\/time>/i)?.[1].trim() ?? "");
    record(/<h2\b[^>]*>Latest projects<\/h2>/i.test(projectsSection), `${label}: missing Latest projects heading`);
    record(/<a\b[^>]*href=(?:"\/projects\/"|\/projects\/)[^>]*>All projects<\/a>/i.test(projectsSection), `${label}: missing All projects archive link`);
    record(projectItems.length === 4, `${label}: expected four latest projects, found ${projectItems.length}`);
    record(projectDates.every((date) => /^\d{2} [A-Z][a-z]{2} \d{4}$/.test(date)), `${label}: latest project dates must match the writing date format`);
    record(!/\bhome-paths\b/i.test(markup), `${label}: redundant Projects and Research footer links remain`);
  } else {
    record(documentTitle.endsWith(` · ${brand}`), `${label}: document title must end with the brand (${documentTitle})`);
  }

  if (label === "/projects/") {
    const projectDates = [...markup.matchAll(/<time\b[^>]*writing-index__date[^>]*>([^<]+)<\/time>/gi)]
      .map((match) => match[1].trim());
    record(projectDates.length > 0, `${label}: missing project dates`);
    record(projectDates.every((date) => /^\d{2} [A-Z][a-z]{2} \d{4}$/.test(date)), `${label}: project dates must match the Writing date format`);
  }

  if (label === "/research/") {
    const profilesIndex = markup.search(/class=(?:"[^"]*\bresearch-profiles\b[^"]*"|research-profiles)\b/i);
    const firstYearIndex = markup.search(/class=(?:"[^"]*\bresearch-year\b[^"]*"|research-year)\b/i);
    record(profilesIndex >= 0 && profilesIndex < firstYearIndex, `${label}: research profiles must precede the publication list`);
    const profiles = markup.match(/<nav\b(?=[^>]*\bclass=(?:"[^"]*\bresearch-profiles\b[^"]*"|research-profiles\b))[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? "";
    const profileLabels = [...profiles.matchAll(/<a\b[^>]*>([^<]+)<\/a>/gi)].map((match) => match[1].trim());
    record(
      JSON.stringify(profileLabels) === JSON.stringify(["arXiv", "Google Scholar", "ResearchGate", "SSRN"]),
      `${label}: research profile labels have incorrect brand capitalization: ${JSON.stringify(profileLabels)}`,
    );
  }

  if (label === "/newsletter-archive/") {
    record(/data-newsletter-archive(?:\s|>)/i.test(markup), `${label}: missing embedded archive container`);
    record(/data-newsletter-archive-endpoint=(?:"https:\/\/newsletter-api\.philippd\.workers\.dev\/api\/newsletters"|https:\/\/newsletter-api\.philippd\.workers\.dev\/api\/newsletters)(?:\s|>)/i.test(markup), `${label}: missing archive API endpoint`);
    record(/data-newsletter-archive-base-url=(?:"https:\/\/static\.philippdubach\.com\/newsletter\/"|https:\/\/static\.philippdubach\.com\/newsletter\/)(?:\s|>)/i.test(markup), `${label}: missing archive fallback URL`);
    record(/Loading issues…/i.test(markup), `${label}: missing accessible loading state`);
    record(/href=(?:"\/subscribe\/"|\/subscribe\/)[^>]*>Subscribe to get the next issue →<\/a>/i.test(markup), `${label}: missing archive subscription link`);
    record(/<script\b(?=[^>]*src=(?:"\/js\/newsletter-archive\.[^\"]+\.js"|\/js\/newsletter-archive\.[^\s>]+\.js))(?=[^>]*integrity=)[^>]*><\/script>/i.test(markup), `${label}: missing fingerprinted archive script`);
    record(!/not loaded in the local preview|makes no newsletter API request/i.test(markup), `${label}: stale preview placeholder remains`);
  }

  const themeControls = [...markup.matchAll(/<button\b([^>]*data-theme-toggle[^>]*)>([\s\S]*?)<\/button>/gi)];
  record(themeControls.length === 2, `${label}: expected two theme switches`);
  for (const [, attributes, content] of themeControls) {
    const control = `<button ${attributes}>`;
    record(values(control, "role")[0] === "switch", `${label}: theme control needs switch semantics`);
    record(values(control, "aria-checked")[0] === "false", `${label}: theme switch needs an initial checked state`);
    record(values(control, "aria-label")[0] === "Dark mode", `${label}: theme switch needs a stable accessible name`);
    record(values(control, "title")[0] === "Switch to dark theme", `${label}: theme switch needs its initial action hint`);
    record(/theme-toggle__track/.test(content) && /theme-toggle__thumb/.test(content), `${label}: theme switch needs a track and thumb`);
    record(!/theme-icon|☾|☀/.test(content), `${label}: theme switch still contains theme icons`);
  }

  for (const name of ["aria-describedby", "aria-labelledby"]) {
    for (const value of values(markup, name)) {
      for (const id of value.split(/\s+/).filter(Boolean)) record(ids.includes(id), `${label}: ${name} points to missing #${id}`);
    }
  }

  for (const attributes of anchorAttributes) {
    const hrefValues = values(`<a ${attributes}>`, "href");
    if (hrefValues.length === 0) continue;
    const href = hrefValues[0] ?? "";
    record(Boolean(href.trim()), `${label}: empty link`);
    if (href.startsWith("#") && href.length > 1) record(ids.includes(decodeURIComponent(href.slice(1))), `${label}: missing ${href}`);
  }

  for (const attributes of tags(markup, "img")) {
    const alt = values(`<img ${attributes}>`, "alt")[0];
    record(alt !== undefined && alt.trim().length > 0, `${label}: image needs alt text`);
    record(!/^alt(?: text here)?$/i.test(alt?.trim() ?? ""), `${label}: image has placeholder alt text`);
    const src = values(`<img ${attributes}>`, "src")[0] ?? "";
    record(!/^https?:\/\//.test(src) || src.startsWith("https://static.philippdubach.com/"), `${label}: unapproved image host ${src}`);
  }

  for (const attributes of tags(markup, "script")) {
    const scriptTag = `<script ${attributes}>`;
    const resource = values(scriptTag, "src")[0] ?? "";
    const integrity = values(scriptTag, "integrity")[0] ?? "";
    const allowedRemote = resource.startsWith("https://cdn.jsdelivr.net/") && integrity.length > 0;
    record(!/^(?:https?:)?\/\//.test(resource) || allowedRemote, `${label}: remote script resource ${resource}`);
  }
  for (const match of markup.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(match[1]) || /ld\+json/.test(match[1])) continue;
    const hash = `sha256-${createHash("sha256").update(match[2], "utf8").digest("base64")}`;
    record(inlineScriptHashes.has(hash), `${label}: inline script not in CSP hash allowlist (${hash})`);
  }
  for (const attributes of tags(markup, "video")) {
    const video = `<video ${attributes}>`;
    record(values(video, "controls").length > 0 || /\scontrols(?:\s|>|$)/i.test(video), `${label}: video needs playback controls`);
    record(values(video, "autoplay").length === 0 && !/\sautoplay(?:\s|>|$)/i.test(video), `${label}: video must not autoplay in markup`);
  }
  for (const attributes of tags(markup, "link")) {
    const link = `<link ${attributes}>`;
    const rel = values(link, "rel")[0] ?? "";
    const resource = values(link, "href")[0] ?? "";
    if (rel.split(/\s+/).includes("icon")) {
      record(resource === "/icons/favicon-96x96.png", `${label}: favicon must use the compact PNG (${resource})`);
      record(values(link, "type")[0] === "image/png", `${label}: favicon needs its image/png MIME declaration`);
      record(values(link, "sizes")[0] === "96x96", `${label}: favicon needs its intrinsic 96x96 size`);
    }
    if (/stylesheet|preload|modulepreload|manifest/i.test(rel)) {
      record(!/^https?:\/\//.test(resource), `${label}: remote link resource ${resource}`);
    }
  }
}

const files = await htmlFiles(outputDirectory);
record(files.length >= 90, `Expected at least 90 generated HTML pages, found ${files.length}`);
await Promise.all(files.map(inspectPage));

const favicon = await readFile(join(outputDirectory, "icons", "favicon-96x96.png"));
record(favicon.byteLength <= 8192, `Compact favicon exceeds its 8 KiB budget (${favicon.byteLength} bytes)`);
try {
  await readFile(join(outputDirectory, "icons", "favicon.svg"));
  record(false, "Obsolete embedded-raster favicon.svg is present in the generated site");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const referenceHeaders = await readFile(join(outputDirectory, "_headers"), "utf8");
record(
  /\/icons\/site\.webmanifest\s+Content-Type:\s*application\/manifest\+json; charset=utf-8/i.test(referenceHeaders),
  "Reference _headers must declare the web app manifest MIME type",
);

if (failures.length) {
  console.error(`Build checks failed (${failures.length}):`);
  failures.slice(0, 80).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 80) console.error(`- ${failures.length - 80} more failures`);
  process.exitCode = 1;
} else {
  console.log(`Build checks passed for ${files.length} HTML pages.`);
}
