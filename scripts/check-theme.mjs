import { readFile } from "node:fs/promises";
import vm from "node:vm";

const markup = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const scripts = [...markup.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const resolver = scripts.find(([, attributes, source]) => !/\bsrc\s*=/.test(attributes) && source.includes("pdd-theme"))?.[2];

if (!resolver) throw new Error("Generated homepage is missing the inline theme resolver.");

function resolveTheme({ saved = null, systemDark = false, supportsMatchMedia = true, storageThrows = false }) {
  const document = { documentElement: { dataset: {} } };
  const context = {
    document,
    localStorage: {
      getItem() {
        if (storageThrows) throw new Error("Storage unavailable");
        return saved;
      },
    },
  };
  if (supportsMatchMedia) context.matchMedia = () => ({ matches: systemDark });
  vm.runInNewContext(resolver, context);
  return document.documentElement.dataset.theme;
}

const cases = [
  ["saved dark overrides a light system", { saved: "dark", systemDark: false }, "dark"],
  ["saved light overrides a dark system", { saved: "light", systemDark: true }, "light"],
  ["dark system defaults to dark", { systemDark: true }, "dark"],
  ["light system defaults to light", { systemDark: false }, "light"],
  ["missing matchMedia defaults to light", { supportsMatchMedia: false }, "light"],
  ["unavailable storage defaults to light", { supportsMatchMedia: false, storageThrows: true }, "light"],
];

for (const [name, options, expected] of cases) {
  const actual = resolveTheme(options);
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, received ${actual}`);
}

console.log(`Theme resolver checks passed for ${cases.length} preference scenarios.`);
