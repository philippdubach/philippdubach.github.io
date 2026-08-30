import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [header, menu, script, styles] = await Promise.all([
  readFile(new URL("layouts/partials/mobile-header.html", root), "utf8"),
  readFile(new URL("layouts/partials/mobile-menu.html", root), "utf8"),
  readFile(new URL("assets/js/site.js", root), "utf8"),
  readFile(new URL("assets/css/main.css", root), "utf8"),
]);

function requireSource(source, pattern, message) {
  if (!pattern.test(source)) throw new Error(message);
}

requireSource(header, /data-menu-open[^>]*aria-controls="mobile-menu"[^>]*aria-expanded="false"/, "The menu opener must expose its controlled dialog and initial state.");
requireSource(menu, /<dialog[^>]*id="mobile-menu"[^>]*closedby="any"/, "The mobile menu must retain native modal and light-dismiss semantics.");
requireSource(menu, /data-menu-close[^>]*aria-label="Close menu"[^>]*autofocus/, "The close control must receive initial dialog focus.");
requireSource(menu, /<nav[^>]*mobile-menu__navigation[^>]*>[\s\S]*<ul>[\s\S]*<li>/, "Mobile navigation must use an ordinary semantic link list.");
requireSource(menu, /control-symbol--menu|control-symbol--close/, "Mobile menu controls must use CSS-drawn symbols.");
if (/[☰×]/.test(header + menu)) throw new Error("Platform-dependent menu glyphs must not return.");

requireSource(script, /menu\.showModal\(\)/, "The menu must open through the native modal dialog API.");
requireSource(script, /menu\?\.addEventListener\("cancel"[\s\S]*event\.preventDefault\(\)[\s\S]*closeMenu\(\)/, "Escape must use the race-safe animated close path.");
requireSource(script, /backdropPointerStarted[\s\S]*pointerdown[\s\S]*pointerup/, "Backdrop dismissal must validate both pointer edges.");
requireSource(script, /desktopMenuQuery[\s\S]*min-width: 48rem[\s\S]*closeMenu\(\{ immediate: true \}\)/, "The modal must close when the desktop navigation takes over.");
requireSource(script, /reducedMotionQuery\?\.matches[\s\S]*finishMenuClose\(\)/, "Reduced motion must close the dialog immediately.");
requireSource(script, /lockMenuScroll[\s\S]*position = "fixed"[\s\S]*unlockMenuScroll[\s\S]*window\.scrollTo\(0, menuScrollPosition\)/, "The menu must preserve the exact underlying page position.");

requireSource(styles, /\.mobile-menu__panel\s*\{[^}]*height:\s*100dvh[^}]*overflow-y:\s*auto[^}]*overscroll-behavior:\s*contain/s, "The sheet needs dynamic-height scrolling and contained overscroll.");
requireSource(styles, /\.mobile-menu__panel\s*\{[^}]*safe-area-inset-right[^}]*safe-area-inset-bottom[^}]*safe-area-inset-left/s, "The sheet must respect mobile safe areas.");
requireSource(styles, /\.mobile-menu__panel\s*\{[^}]*transform:\s*translateX\(100%\)/s, "The sheet must enter with a compositor-friendly transform.");
requireSource(styles, /transform 240ms cubic-bezier\(0\.2, 0\.8, 0\.2, 1\)/, "The menu must retain its restrained 240ms interaction beat.");
requireSource(styles, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*\.icon-button:hover/, "Menu hover feedback must be restricted to fine pointers.");
if (/\.mobile-menu::backdrop\s*\{[^}]*backdrop-filter/s.test(styles)) throw new Error("The mobile-menu backdrop must remain blur-free.");

console.log("Mobile menu source checks passed.");
