import { readFile } from "node:fs/promises";
import vm from "node:vm";

const markup = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const siteScript = await readFile(new URL("../assets/js/site.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../assets/css/main.css", import.meta.url), "utf8");
const scripts = [...markup.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const resolver = scripts.find(([, attributes, source]) => !/\bsrc\s*=/.test(attributes) && source.includes("pdd-theme"))?.[2];

if (!resolver) throw new Error("Generated homepage is missing the inline theme resolver.");

function resolveTheme({ saved = null, legacySaved = null, systemDark = false, supportsMatchMedia = true, storageThrows = false }) {
  const document = { documentElement: { dataset: {} } };
  const context = {
    document,
    localStorage: {
      getItem(key) {
        if (storageThrows) throw new Error("Storage unavailable");
        if (key === "pdd-theme-v2") return saved;
        if (key === "pdd-theme") return legacySaved;
        return null;
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
  ["legacy dark preference does not override a light system", { legacySaved: "dark", systemDark: false }, "light"],
  ["missing matchMedia defaults to light", { supportsMatchMedia: false }, "light"],
  ["unavailable storage defaults to light", { supportsMatchMedia: false, storageThrows: true }, "light"],
];

for (const [name, options, expected] of cases) {
  const actual = resolveTheme(options);
  if (actual !== expected) throw new Error(`${name}: expected ${expected}, received ${actual}`);
}

if (!siteScript.includes('button.setAttribute("aria-label", "Dark mode")')) {
  throw new Error("Theme controls must retain one accessible name while their state changes.");
}
if (!siteScript.includes('typeof document.startViewTransition !== "function"')) {
  throw new Error("Theme animation must retain an unsupported-browser fallback.");
}
if (!siteScript.includes("reducedMotionQuery?.matches")) {
  throw new Error("Theme animation must bypass View Transitions for reduced motion.");
}
if (!styles.includes("animation: theme-reveal 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both")) {
  throw new Error("Theme reveal must keep its restrained 240ms interaction beat.");
}
if (!styles.includes("transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 200ms linear")) {
  throw new Error("Theme thumb must use transform-only spatial motion.");
}
if (!styles.includes("@media (forced-colors: active)")) {
  throw new Error("Theme controls need a forced-colors treatment.");
}

console.log(`Theme resolver checks passed for ${cases.length} preference scenarios.`);
