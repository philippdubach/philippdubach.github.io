import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const cssPath = resolve(process.argv[2] ?? "assets/css/main.css");
const css = await readFile(cssPath, "utf8");

function remMaxWidth(selector, startAt = 0) {
  const source = css.slice(startAt);
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  const value = block.match(/max-width:\s*([\d.]+)rem/)?.[1];
  return value ? Number(value) : null;
}

function declarations(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.match(new RegExp(`(?:^|})\\s*${escaped}(?:\\s*,[^{}]*)?\\s*\\{([^}]*)\\}`, "m"))?.[1] ?? "";
}

function remProperty(source, selector, property) {
  const block = declarations(source, selector);
  const value = block.match(new RegExp(`${property}:\\s*([\\d.]+)rem`))?.[1];
  return value ? Number(value) : null;
}

function topPadding(source, selector) {
  const block = declarations(source, selector);
  const explicit = block.match(/padding-top:\s*([\d.]+)rem/)?.[1];
  const shorthand = block.match(/padding:\s*([\d.]+)rem/)?.[1];
  const value = explicit ?? shorthand;
  return value ? Number(value) : null;
}

function remGridTracks(source, selector) {
  const block = declarations(source, selector);
  const value = block.match(/grid-template-columns:\s*([^;]+)/)?.[1] ?? "";
  return [...value.matchAll(/([\d.]+)rem/g)].map((match) => Number(match[1]));
}

function integerProperty(source, selector, property) {
  const block = declarations(source, selector);
  const value = block.match(new RegExp(`${property}:\\s*(\\d+)`))?.[1];
  return value ? Number(value) : null;
}

const topicLinkCss = declarations(css, ".topic-filter a");
const activeTopicCss = declarations(css, '.topic-filter a[aria-pressed="true"]');

if (/border-radius\s*:/.test(topicLinkCss) || /border\s*:\s*1px\s+solid/.test(topicLinkCss)) {
  throw new Error("The writing topic filter still uses bordered pill controls.");
}

if (!/border-bottom\s*:\s*1px\s+solid\s+transparent/.test(topicLinkCss)) {
  throw new Error("Topic links need a stable transparent underline in the resting state.");
}

if (!/border-bottom-color\s*:\s*var\(--heading\)/.test(activeTopicCss) || /background\s*:/.test(activeTopicCss)) {
  throw new Error("The active topic must use an editorial underline without a filled background.");
}

const themeToggleCss = declarations(css, ".theme-toggle");
const themeTrackCss = declarations(css, ".theme-toggle__track");
const externalIndicatorCss = declarations(css, ".external-link-indicator");

if (!/width\s*:\s*2\.75rem/.test(themeToggleCss) || !/height\s*:\s*2\.75rem/.test(themeToggleCss)) {
  throw new Error("The theme switch needs a 44px interaction target.");
}

if (!/width\s*:\s*2\.5rem/.test(themeTrackCss) || !/height\s*:\s*1\.375rem/.test(themeTrackCss)) {
  throw new Error("The theme switch track must use the approved 40px by 22px size.");
}

if (
  !/font-size\s*:\s*0\.62em/.test(externalIndicatorCss) ||
  !/margin-left\s*:\s*0\.22em/.test(externalIndicatorCss) ||
  !/transform\s*:\s*translateY\(-0\.18em\)/.test(externalIndicatorCss)
) {
  throw new Error("The external-link indicator needs compact superscript styling.");
}

const tabletStart = css.indexOf("@media (min-width: 48rem)");
const wideStart = css.indexOf("@media (min-width: 80rem)");
const finePointerStart = css.indexOf('@media (min-width: 80rem) and (hover: hover) and (pointer: fine)');
const timelineStart = css.indexOf("@media (min-width: 105rem)");
const tabletCss = css.slice(tabletStart, wideStart);
const wideCss = css.slice(wideStart, finePointerStart);
const finePointerCss = css.slice(finePointerStart, timelineStart);
const railToolsCss = declarations(tabletCss, ".rail-tools");
const baseWidth = remMaxWidth(".site-layout", wideStart);
const timelineWidth = remMaxWidth(".site-layout.has-timeline", wideStart) ?? baseWidth;

if (baseWidth === null || timelineWidth === null) {
  throw new Error("Could not resolve the desktop layout widths.");
}

if (!/margin:\s*1\.45rem\s+0\s+1\.75rem\s+-0\.125rem/.test(railToolsCss)) {
  throw new Error("The visible theme-switch track is not aligned with the navigation text.");
}

const viewport = 1800;
const homeRail = (viewport - baseWidth * 16) / 2;
const articleRail = (viewport - timelineWidth * 16) / 2;
const railShift = articleRail - homeRail;

if (Math.abs(railShift) > 0.5) {
  throw new Error(`The article rail moves ${railShift}px from the home rail.`);
}

const articleTop = topPadding(wideCss, ".site-layout") ?? topPadding(tabletCss, ".site-layout");
const homeTop = topPadding(wideCss, ".page-home .site-layout") ?? articleTop;
const articleNavHeight =
  remProperty(finePointerCss, ".site-navigation a", "min-height") ??
  remProperty(tabletCss, ".site-navigation a", "min-height");
const homeNavHeight =
  remProperty(finePointerCss, ".page-home .site-navigation a", "min-height") ?? articleNavHeight;

if (articleTop !== homeTop) {
  throw new Error(`The article rail starts at ${articleTop}rem instead of ${homeTop}rem.`);
}

if (articleNavHeight !== homeNavHeight) {
  throw new Error(`The article navigation rows are ${articleNavHeight}rem instead of ${homeNavHeight}rem.`);
}

const baseTracks = remGridTracks(wideCss, ".site-layout");
const homeTracks = remGridTracks(wideCss, ".page-home .site-layout");
const homeColumn = integerProperty(wideCss, ".page-home .home-content", "grid-column") ?? 2;
const writingContentX = homeRail + baseTracks.slice(0, 1).reduce((sum, track) => sum + track * 16, 0);
const activeHomeTracks = homeTracks.length ? homeTracks : baseTracks;
const homeContentX = homeRail + activeHomeTracks
  .slice(0, homeColumn - 1)
  .reduce((sum, track) => sum + track * 16, 0);

if (Math.abs(homeContentX - writingContentX) > 0.5) {
  throw new Error(`The home content starts at ${homeContentX}px instead of ${writingContentX}px.`);
}

console.log(`Layout check passed with rail at ${homeRail}px and content at ${homeContentX}px.`);

const targetViewports = [320, 390, 768, 1024, 1440, 1800];
for (const width of targetViewports) {
  if (width < 768) {
    const contentWidth = width - 40;
    if (contentWidth <= 0 || contentWidth > width) throw new Error(`Invalid mobile content width at ${width}px.`);
  } else if (width < 1280) {
    const layoutWidth = Math.min(width, 1000);
    if (layoutWidth > width) throw new Error(`Tablet layout overflows at ${width}px.`);
  } else {
    const layoutWidth = Math.min(width, baseWidth * 16);
    if (layoutWidth > width) throw new Error(`Desktop layout overflows at ${width}px.`);
  }
}

console.log(`Responsive geometry check passed at ${targetViewports.join(", ")}px.`);
