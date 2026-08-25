import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const outputDirectory = resolve(process.argv[2] ?? "public");
const failures = [];
const expectedNavigation = ["/", "/writing/", "/projects/", "/research/", "https://link.philippdubach.com/", "/subscribe/"];

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
  if (/<meta\b[^>]*http-equiv=(?:"refresh"|refresh)/i.test(markup)) {
    record(/<a\b[^>]*href=/i.test(markup), `${label}: alias redirect needs a fallback link`);
    return;
  }
  const ids = values(markup, "id");
  const duplicateIds = [...new Set(ids.filter((id, index) => id && ids.indexOf(id) !== index))];

  const mainAttributes = tags(markup, "main");
  const anchorAttributes = tags(markup, "a");
  record(/<html\b[^>]*lang=(?:"en|en)/i.test(markup), `${label}: missing language`);
  record(/<header\b/i.test(markup), `${label}: missing header landmark`);
  record(mainAttributes.some((attributes) => values(`<main ${attributes}>`, "id")[0] === "main-content"), `${label}: missing main landmark`);
  record(/<footer\b/i.test(markup), `${label}: missing footer landmark`);
  record(anchorAttributes.some((attributes) => (values(`<a ${attributes}>`, "class")[0] ?? "").split(/\s+/).includes("skip-link")), `${label}: missing skip link`);
  record(/<dialog\b[^>]*data-mobile-menu/i.test(markup), `${label}: missing mobile menu`);
  record((markup.match(/<h1\b/gi) ?? []).length === 1, `${label}: expected one h1`);
  record(duplicateIds.length === 0, `${label}: duplicate ids ${duplicateIds.join(", ")}`);
  record(!/UIcons by Flaticon/i.test(markup), `${label}: includes removed attribution`);
  record(!/\bcode-(?:lang|copy)\b/i.test(markup), `${label}: code blocks must not show language or copy controls`);
  record(!/<script\b[^>]*(?:data-goatcounter|src=[^>]*(?:gc\.zgo\.at|cloudflareinsights))/i.test(markup), `${label}: includes analytics`);
  inspectNavigation(markup, label);

  if (label === "/") {
    record(!/\bhome-biography\b/i.test(markup), `${label}: homepage must not repeat the full biography`);
    const introduction = markup.match(/<p\b[^>]*\bhome-intro\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "";
    const introductionLinks = tags(introduction, "a")
      .map((attributes) => values(`<a ${attributes}>`, "href")[0])
      .filter(Boolean);
    record(introductionLinks.includes("/about/"), `${label}: homepage introduction must link to /about/`);
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
      JSON.stringify(profileLabels) === JSON.stringify(["arXiv", "Google Scholar", "Reading List", "ResearchGate", "SSRN"]),
      `${label}: research profile labels have incorrect brand capitalization: ${JSON.stringify(profileLabels)}`,
    );
  }

  const themeControls = [...markup.matchAll(/<button\b([^>]*data-theme-toggle[^>]*)>([\s\S]*?)<\/button>/gi)];
  record(themeControls.length === 2, `${label}: expected two theme switches`);
  for (const [, attributes, content] of themeControls) {
    const control = `<button ${attributes}>`;
    record(values(control, "role")[0] === "switch", `${label}: theme control needs switch semantics`);
    record(values(control, "aria-checked")[0] === "false", `${label}: theme switch needs an initial checked state`);
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
    const src = values(`<img ${attributes}>`, "src")[0] ?? "";
    record(!/^https?:\/\//.test(src) || src.startsWith("https://static.philippdubach.com/"), `${label}: unapproved image host ${src}`);
  }

  for (const attributes of tags(markup, "script")) {
    const resource = values(`<script ${attributes}>`, "src")[0] ?? "";
    record(!/^https?:\/\//.test(resource), `${label}: remote script resource ${resource}`);
  }
  for (const attributes of tags(markup, "video")) {
    const video = `<video ${attributes}>`;
    record(values(video, "controls").length > 0 || /\scontrols(?:\s|>|$)/i.test(video), `${label}: video needs playback controls`);
    record(values(video, "autoplay").length === 0 && !/\sautoplay(?:\s|>|$)/i.test(video), `${label}: video must not autoplay in markup`);
  }
  for (const attributes of tags(markup, "link")) {
    const rel = values(`<link ${attributes}>`, "rel")[0] ?? "";
    const resource = values(`<link ${attributes}>`, "href")[0] ?? "";
    if (/stylesheet|preload|modulepreload|manifest/i.test(rel)) {
      record(!/^https?:\/\//.test(resource), `${label}: remote link resource ${resource}`);
    }
  }
}

const files = await htmlFiles(outputDirectory);
record(files.length >= 90, `Expected at least 90 generated HTML pages, found ${files.length}`);
await Promise.all(files.map(inspectPage));

if (failures.length) {
  console.error(`Build checks failed (${failures.length}):`);
  failures.slice(0, 80).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 80) console.error(`- ${failures.length - 80} more failures`);
  process.exitCode = 1;
} else {
  console.log(`Build checks passed for ${files.length} HTML pages.`);
}
