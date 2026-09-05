import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Run manually after adding article images. Existing entries are reused;
// --refresh rechecks originals replaced under an existing CDN filename.
// This never runs during a Hugo build and requires no image downloads.
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: node scripts/update-image-dimensions.mjs [--refresh]");
  process.exit(0);
}
if (args.some((arg) => arg !== "--refresh")) {
  throw new Error("Unknown option. Use --refresh to recheck all image dimensions.");
}

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(root, "data/image-dimensions.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sources = new Set();

async function collectImages(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectImages(file);
    } else if (file.endsWith(".md")) {
      const markdown = await readFile(file, "utf8");
      for (const match of markdown.matchAll(/\{\{<\s*img\s+([\s\S]*?)>\}\}/g)) {
        const source = match[1].match(/\bsrc="([^"]+)"/)?.[1];
        if (source) sources.add(source);
      }
    }
  }
}

await collectImages(path.join(root, "content"));
const pending = [...sources].filter((source) => args.includes("--refresh") || !Object.hasOwn(manifest, source));
const updates = new Map();
const failures = [];
let next = 0;

await Promise.all(Array.from({ length: Math.min(3, pending.length) }, async () => {
  while (next < pending.length) {
    const source = pending[next++];
    try {
      // format=json returns original metadata, keeping the source filename
      // identical to the image shortcode (including supported absolute URLs).
      const response = await fetch(`https://static.philippdubach.com/cdn-cgi/image/format=json,anim=false/${source}`, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const metadata = await response.json();
      const { width, height } = metadata.original ?? metadata;
      if (![width, height].every((value) => Number.isInteger(value) && value > 0)) {
        throw new Error("Invalid image dimensions");
      }
      updates.set(source, { width, height });
    } catch (error) {
      failures.push(`${source}: ${error.message}`);
    }
  }
}));

if (failures.length) {
  throw new Error(`Manifest left unchanged; ${failures.length} metadata request(s) failed:\n${failures.join("\n")}`);
}
if (updates.size) {
  for (const [source, dimensions] of updates) manifest[source] = dimensions;
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  const temporaryPath = `${manifestPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(sorted, null, 2)}\n`);
  await rename(temporaryPath, manifestPath);
}
console.log(`Checked ${sources.size} referenced images; updated ${updates.size}; reused ${sources.size - pending.length}.`);
