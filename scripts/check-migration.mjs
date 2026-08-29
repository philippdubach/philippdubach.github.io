import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(process.argv[2] ?? ".");
// Comparison source: a pinned worktree of the pre-redesign site state.
// Create it with: git worktree add --detach /private/tmp/pdd-main-worktree 1f4c38dc
const sourceRoot = resolve(process.argv[3] ?? "/private/tmp/pdd-main-worktree");
const outputRoot = join(projectRoot, "public");
const failures = [];

function record(condition, message) {
  if (!condition) failures.push(message);
}

async function markdownFiles(directory) {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && extname(entry.name) === ".md" && entry.name !== "_index.md")
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

async function countProjects(directory, files) {
  let count = 0;
  for (const filename of files) {
    const source = await readFile(join(directory, filename), "utf8");
    const isProject = /^type\s*(?::|=)\s*["']?Project["']?\s*$/mi.test(source);
    const isUnlisted = /^unlisted\s*(?::|=)\s*true\s*$/mi.test(source);
    if (isProject && !isUnlisted) count += 1;
  }
  return count;
}

async function countResearchRecords(directory) {
  const source = await readFile(join(directory, "data", "research.yaml"), "utf8");
  return (source.match(/^\s{6}- title:/gm) ?? []).length;
}

async function countGeneratedAliases(directory) {
  let count = 0;
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith(".html")) {
        const html = await readFile(path, "utf8");
        if (/<meta\s+http-equiv=(?:"refresh"|refresh)\b/i.test(html)) count += 1;
      }
    }
  }
  await walk(directory);
  return count;
}

function csvRow(row) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"' && quoted && row[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { values.push(value); value = ""; }
    else value += character;
  }
  values.push(value);
  return values;
}

function hugoPostManifest(directory) {
  const result = spawnSync(process.env.HUGO_BIN ?? "hugo", ["list", "all"], { cwd: directory, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`hugo list all failed in ${directory}: ${result.stderr}`);
  const rows = result.stdout.trim().split(/\r?\n/).map(csvRow);
  const headers = rows.shift();
  const pathIndex = headers.indexOf("path");
  const permalinkIndex = headers.indexOf("permalink");
  const sectionIndex = headers.indexOf("section");
  return new Map(rows
    .filter((row) => row[sectionIndex] === "posts" && row[pathIndex]?.endsWith(".md"))
    .map((row) => [row[pathIndex], row[permalinkIndex]]));
}

const sourcePostDirectory = join(sourceRoot, "content", "posts");
const destinationPostDirectory = join(projectRoot, "content", "posts");
const sourcePosts = await markdownFiles(sourcePostDirectory);
const destinationPosts = await markdownFiles(destinationPostDirectory);
const sourceRoutes = hugoPostManifest(sourceRoot);
const destinationRoutes = hugoPostManifest(projectRoot);

record(sourcePosts.length > 0, "The source post manifest is empty.");
record(
  JSON.stringify(destinationPosts) === JSON.stringify(sourcePosts),
  `Post manifest mismatch: source=${sourcePosts.length}, destination=${destinationPosts.length}`,
);

// Posts deliberately edited after the migration freeze. Each entry needs a
// reason; anything not listed here must stay byte-identical to the baseline.
const intentionalPostEdits = new Set([
  // og:image repointed from the raw 1.8 MB PNG to a 60 KB resized JPEG.
  "20260816-openai-hugging-face-incident-plain-english.md",
  // Removed an internal link to an intentionally retired (410) article.
  "20260106-Buffet-Retirement.md",
  // Replaced a legacy redirect hop with the article's canonical URL.
  "20260215-a-bull-case.md",
  // Normalized an internal link to the canonical trailing-slash route.
  "20251224-PROJECT-Newsletter-Setup.md",
  // Replaced placeholder image alt text with descriptive alternatives.
  "20250706-PROJECT-BlackJack.md",
]);

for (const filename of destinationPosts) {
  const contentPath = `content/posts/${filename}`;
  const sourceMarkdown = await readFile(join(sourcePostDirectory, filename), "utf8");
  const destinationMarkdown = await readFile(join(destinationPostDirectory, filename), "utf8");
  record(
    sourceMarkdown === destinationMarkdown || intentionalPostEdits.has(filename),
    `${filename}: imported Markdown differs from the source`,
  );
  const sourceURL = sourceRoutes.get(contentPath);
  const destinationURL = destinationRoutes.get(contentPath);
  record(sourceURL === destinationURL, `${filename}: route changed from ${sourceURL} to ${destinationURL}`);
  const relativeURL = new URL(destinationURL).pathname.replace(/^\//, "");
  const htmlPath = join(outputRoot, relativeURL, "index.html");
  try {
    const html = await readFile(htmlPath, "utf8");
    record(
      html.includes(`rel=canonical href=${destinationURL}`) || html.includes(`rel="canonical" href="${destinationURL}"`),
      `${filename}: canonical URL does not preserve ${destinationURL}`,
    );
    record(/<main\b[^>]*id=(?:"main-content"|main-content)/i.test(html), `${filename}: missing main landmark`);
    record(/<script\b[^>]*data-goatcounter="?https:\/\/stats\.philippdubach\.com\/count"?/i.test(html), `${filename}: missing GoatCounter analytics`);
    record(!/UIcons by Flaticon/i.test(html), `${filename}: local output includes removed attribution`);
  } catch {
    failures.push(`${filename}: missing generated route ${destinationURL}`);
  }
}

const sourceProjectCount = await countProjects(sourcePostDirectory, sourcePosts);
const destinationProjectCount = await countProjects(destinationPostDirectory, destinationPosts);
record(sourceProjectCount === destinationProjectCount, `Project count changed from ${sourceProjectCount} to ${destinationProjectCount}.`);
record(destinationProjectCount === 17, `Expected 17 projects, found ${destinationProjectCount}.`);

const sourceResearchCount = await countResearchRecords(sourceRoot);
const destinationResearchCount = await countResearchRecords(projectRoot);
record(sourceResearchCount === destinationResearchCount, `Research record count changed from ${sourceResearchCount} to ${destinationResearchCount}.`);
record(destinationResearchCount === 8, `Expected 8 research records, found ${destinationResearchCount}.`);

const aliasCount = await countGeneratedAliases(outputRoot);
record(aliasCount === 38, `Expected 38 generated aliases, found ${aliasCount}.`);

const requiredArtifacts = [
  "writing/index.html",
  "projects/index.html",
  "research/index.html",
  "about/index.html",
  "faq/index.html",
  "index.xml",
  "feed.json",
  "api/posts.json",
  "llms.txt",
  "llms-full.txt",
  "api-catalog.json",
];

for (const artifact of requiredArtifacts) {
  try {
    await access(join(outputRoot, artifact));
  } catch {
    failures.push(`Missing generated artifact: /${artifact}`);
  }
}

const placeholderDirectory = join(projectRoot, "content", "writing");
const placeholderEntries = await readdir(placeholderDirectory, { withFileTypes: true });
const placeholderPosts = [];
for (const entry of placeholderEntries.filter((candidate) => candidate.isDirectory())) {
  try {
    await access(join(placeholderDirectory, entry.name, "index.md"));
    placeholderPosts.push(entry.name);
  } catch {}
}
record(placeholderPosts.length === 0, `Placeholder article bundles remain: ${placeholderPosts.join(", ")}`);

for (const slug of ["lorem-ipsum", "dolor-sit-amet", "consectetur-adipiscing", "mauris-viverra"]) {
  try {
    await access(join(outputRoot, "writing", slug, "index.html"));
    failures.push(`Stale placeholder output remains: /writing/${slug}/`);
  } catch {}
}

const siteScript = await readFile(join(projectRoot, "assets", "js", "site.js"), "utf8");
const hardcodedURLs = siteScript.match(/https?:\/\/[^\s"'`)]+/g) ?? [];
record(
  hardcodedURLs.every((url) => url.startsWith("https://newsletter-api.philippd.workers.dev/")),
  "Site JavaScript may only reference the newsletter API host.",
);
record(siteScript.includes("[data-newsletter-endpoint]"), "Live newsletter submit handler is missing.");
record(siteScript.includes("Preview only — no subscription was created"), "Newsletter preview message is missing.");
record(!siteScript.includes("navigator.clipboard"), "Removed code-copy behavior must not remain in local JavaScript.");
record(siteScript.includes('matchMedia("(prefers-reduced-motion: reduce)")'), "Ambient video must respect reduced motion.");
record(siteScript.includes('typeof window.matchMedia === "function"'), "Theme detection must tolerate browsers without matchMedia.");
record(siteScript.includes('return darkModeQuery?.matches ? "dark" : "light"'), "Theme detection must fall back to light mode.");
record(siteScript.includes('button.setAttribute("aria-checked", String(dark))'), "Theme controls must expose their switch state.");

if (failures.length) {
  console.error(`Migration checks failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Migration checks passed for ${destinationPosts.length} posts.`);
}
