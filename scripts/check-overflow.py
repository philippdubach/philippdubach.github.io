#!/usr/bin/env python3
"""Check built HTML for overflow with headless Python Playwright.

Run `npm run build` first. With no --base-url, serve public/ on an ephemeral
loopback port; --base-url checks the same built route inventory on another
server. Requires the Python playwright package and a Chromium installation.

Examples:
  python3 scripts/check-overflow.py
  python3 scripts/check-overflow.py --widths 320 390 --routes '/posts/*'
  python3 scripts/check-overflow.py --browser-executable '/path/to/chrome'

Analytics and non-read-only requests are blocked. No forms are submitted.
"""

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
from fnmatch import fnmatch
from functools import partial
import hashlib
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
from threading import Thread
from urllib.parse import quote, urlsplit


class RedirectDetector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.redirect = False

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "meta" and values.get("http-equiv", "").lower() == "refresh":
            self.redirect = True


def built_routes(directory, filters):
    routes = []
    for file in sorted(directory.rglob("*.html")):
        parser = RedirectDetector()
        parser.feed(file.read_text(encoding="utf-8"))
        if parser.redirect:
            continue
        relative = file.relative_to(directory).as_posix()
        route = "/" + (relative[:-10] if relative.endswith("index.html") else relative)
        if not filters or any(fnmatch(route, pattern) for pattern in filters):
            routes.append(route)
    if (directory / "index.xml").is_file() and (not filters or any(fnmatch("/index.xml", pattern) for pattern in filters)):
        routes.append("/index.xml")
    return sorted(set(routes))


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


@contextmanager
def local_server(directory, supplied_url):
    if supplied_url:
        yield supplied_url.rstrip("/")
        return
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(directory)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


GEOMETRY = r"""() => {
  const tolerance = 2;
  const root = document.documentElement;
  const visible = el => {
    const style = getComputedStyle(el);
    return el.getClientRects().length && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const describe = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const all = [...document.body.querySelectorAll('*')].filter(visible);
  const scrollers = all.filter(el => {
    const style = getComputedStyle(el);
    return /^(auto|scroll)$/.test(style.overflowX) && el.scrollWidth > el.clientWidth + tolerance;
  });
  window.__overflowCheckScrollers = scrollers;
  const scrollerData = scrollers.map((el, index) => ({index, element: describe(el),
    clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, tabIndex: el.tabIndex,
    role: el.getAttribute('role'), name: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')}));
  const clippedMath = [];
  for (const container of document.querySelectorAll('.article-body mjx-container')) {
    const math = container.querySelector('mjx-math');
    if (!math || !visible(container)) continue;
    let boundary = container;
    while (boundary && !/^(auto|scroll|hidden|clip)$/.test(getComputedStyle(boundary).overflowX)) boundary = boundary.parentElement;
    if (!boundary || boundary === document.body || boundary === root) continue;
    const originalScroll = boundary.scrollLeft;
    boundary.scrollLeft = 0;
    const box = boundary.getBoundingClientRect(), content = math.getBoundingClientRect();
    const left = box.left + boundary.clientLeft;
    if (content.left < left - tolerance) clippedMath.push({element: describe(container),
      reason: 'Equation begins left of the reachable scroll origin', left: content.left, scrollOrigin: left});
    if (content.width > boundary.clientWidth + tolerance && boundary.scrollWidth <= boundary.clientWidth + tolerance)
      clippedMath.push({element: describe(container), reason: 'Wide equation has no scrollable extent'});
    boundary.scrollLeft = originalScroll;
  }
  return {viewportWidth: root.clientWidth, documentWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
    scrollX: window.scrollX, scrollers: scrollerData, clippedMath,
    overflowElements: all.filter(el => {const r = el.getBoundingClientRect(); return r.right > root.clientWidth + tolerance || r.left < -tolerance;})
      .slice(0, 25).map(el => {const r = el.getBoundingClientRect(); return {element: describe(el), left:r.left, right:r.right};})};
}"""


def settle(page, timeout, is_feed=False):
    warnings = []
    if is_feed:
        page.wait_for_selector(".items-list", state="attached", timeout=timeout)
    try:
        page.wait_for_load_state("networkidle", timeout=min(timeout, 5000))
    except Exception:
        warnings.append("Network did not become fully idle; critical font/math readiness checked separately.")
    fonts_ready = page.evaluate("""async () => Promise.race([
      document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 5000))])""")
    if not fonts_ready:
        raise RuntimeError("Fonts did not finish loading; layout result would be unreliable.")
    if page.locator("#MathJax-script").count():
        page.wait_for_function("window.MathJax?.startup?.promise && window.MathJax?.startup?.document", timeout=timeout)
        ready = page.evaluate("""async () => Promise.race([
          MathJax.startup.promise.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 10000))])""")
        if not ready:
            raise RuntimeError("MathJax did not typeset; refusing to pass a pre-typesetting layout.")
        # MathJax can request its CHTML fonts after the ordinary page fonts resolve.
        fonts_ready = page.evaluate("""async () => Promise.race([
          document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 5000))])""")
        if not fonts_ready:
            raise RuntimeError("MathJax fonts did not finish loading.")
    if page.locator("[data-newsletter-archive]").count():
        page.wait_for_function("!document.querySelector('[data-newsletter-archive][aria-busy=\"true\"]')", timeout=timeout)
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")
    return warnings


def check_keyboard_scrollers(page, scrollers):
    failures = []
    for item in scrollers:
        handle = page.evaluate_handle(f"window.__overflowCheckScrollers[{item['index']}]").as_element()
        original = handle.evaluate("el => el.scrollLeft")
        target = handle.evaluate_handle("""el => {
          if (el.tabIndex >= 0) return el;
          return [...el.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
            .find(child => child.tabIndex >= 0 && !child.disabled && child.getClientRects().length) || el;
        }""").as_element()
        target.focus()
        focused = target.evaluate("el => document.activeElement === el")
        if focused:
            # Programmatic focus alone does not prove participation in Tab order.
            page.keyboard.press("Shift+Tab")
            page.keyboard.press("Tab")
            focused = handle.evaluate("el => el === document.activeElement || el.contains(document.activeElement)")
        if not focused:
            failures.append(f"Scrollable {item['element']} is not reachable in sequential keyboard navigation")
        else:
            handle.evaluate("el => el.scrollTo({left:0, behavior:'instant'})")
            page.keyboard.press("ArrowRight")
            try:
                page.wait_for_function("el => el.scrollLeft > 0", arg=handle, timeout=1000)
            except Exception:
                failures.append(f"Scrollable {item['element']}[{item['index']}] did not respond to ArrowRight")
            page.wait_for_timeout(200)
            handle.evaluate("el => el.scrollTo({left:el.scrollWidth, behavior:'instant'})")
            right = handle.evaluate("el => el.scrollLeft")
            page.keyboard.press("ArrowLeft")
            try:
                page.wait_for_function("([el, maximum]) => el.scrollLeft < maximum", arg=[handle, right], timeout=1000)
            except Exception:
                failures.append(f"Scrollable {item['element']}[{item['index']}] did not respond to ArrowLeft")
            page.wait_for_timeout(200)
        handle.evaluate("(el, value) => el.scrollLeft = value", original)
        target.dispose()
        handle.dispose()
    return failures


def check_interactions(page, width, completed):
    failures, checked = [], []
    opener = page.locator("[data-menu-open]").first
    if width not in completed["menu"] and opener.count() and opener.is_visible():
        opener.click()
        page.wait_for_function("document.querySelector('#mobile-menu')?.open && document.querySelector('#mobile-menu')?.dataset.state === 'open'")
        page.wait_for_timeout(100)
        bounds = page.locator(".mobile-menu__panel").evaluate("""el => {
          const r=el.getBoundingClientRect(); return {left:r.left,right:r.right,viewport:innerWidth,
            scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}; }""")
        if bounds["left"] < -2 or bounds["right"] > bounds["viewport"] + 2 or bounds["scrollWidth"] > bounds["clientWidth"] + 2:
            failures.append(f"Mobile menu exceeds its viewport: {bounds}")
        page.keyboard.press("Tab")
        if not page.locator("#mobile-menu").evaluate("el => el.contains(document.activeElement)"):
            failures.append("Keyboard focus escaped the open modal menu")
        page.keyboard.press("Escape")
        page.wait_for_function("!document.querySelector('#mobile-menu')?.open")
        if not opener.evaluate("el => document.activeElement === el"):
            failures.append("Closing mobile menu did not restore focus to its opener")
        completed["menu"].add(width)
        checked.append("mobile-menu")
    trigger = page.locator("[data-lightbox-target]").first
    if width not in completed["lightbox"] and trigger.count():
        trigger.click()
        dialog = page.locator("dialog.lightbox-dialog[open]")
        dialog.wait_for(state="visible")
        page.wait_for_function("""() => {
          const img = document.querySelector('dialog.lightbox-dialog[open] img');
          return img?.complete && img.naturalWidth > 0;
        }""", timeout=15000)
        bounds = dialog.evaluate("""el => {const r=el.getBoundingClientRect(); return {
          left:r.left,right:r.right,viewport:innerWidth,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};}""")
        if bounds["left"] < -2 or bounds["right"] > bounds["viewport"] + 2 or bounds["scrollWidth"] > bounds["clientWidth"] + 2:
            failures.append(f"Image dialog exceeds its viewport: {bounds}")
        page.keyboard.press("Escape")
        page.wait_for_function("!document.querySelector('dialog.lightbox-dialog[open]')")
        completed["lightbox"].add(width)
        checked.append("image-dialog")
    return failures, checked


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base-url", help="Existing HTTP(S) server; default: serve built public/ on loopback")
    parser.add_argument("--public-dir", type=Path, default=Path(__file__).resolve().parents[1] / "public")
    parser.add_argument("--output-dir", type=Path, help="JSON report and failure screenshots; default: unique temp directory")
    parser.add_argument("--widths", nargs="+", default=["320", "390", "768", "1024", "1440"], help="Viewport widths, space/comma-separated")
    parser.add_argument("--routes", nargs="+", default=[], help="Built route glob filters, e.g. '/posts/*' or '/'")
    parser.add_argument("--browser-executable", type=Path, help="Explicit Chromium/Chrome binary, otherwise Playwright's Chromium")
    parser.add_argument("--height", type=int, default=900)
    parser.add_argument("--timeout-ms", type=int, default=15000)
    parser.add_argument("--color-scheme", choices=["light", "dark"], default="light")
    parser.add_argument("--skip-interactions", action="store_true", help="Skip representative menu/lightbox checks")
    args = parser.parse_args()
    try:
        widths = list(dict.fromkeys(int(value) for group in args.widths for value in group.split(",")))
    except ValueError:
        parser.error("--widths must contain positive integers")
    if not widths or any(width <= 0 for width in widths) or args.height <= 0 or args.timeout_ms <= 0:
        parser.error("Viewport sizes and timeouts must be positive")
    if not args.public_dir.is_dir():
        parser.error(f"Built directory not found: {args.public_dir}; run npm run build first")
    if args.base_url and urlsplit(args.base_url).scheme not in ("http", "https"):
        parser.error("--base-url must use HTTP or HTTPS")
    routes = built_routes(args.public_dir, args.routes)
    if not routes:
        parser.error("No nonredirect built HTML routes matched")
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        parser.error("Python Playwright is required. Use an environment with playwright and a Chromium browser installed.")
    output = args.output_dir or Path(tempfile.mkdtemp(prefix="pdd-overflow-"))
    output.mkdir(parents=True, exist_ok=True)
    report = {"generatedAt": datetime.now(timezone.utc).isoformat(), "widths": widths,
              "routes": routes, "colorScheme": args.color_scheme, "results": [], "blockedRequests": 0}
    completed = {"menu": set(), "lightbox": set()}

    def intercept(route):
        request = route.request
        parsed = urlsplit(request.url)
        hostname = parsed.hostname or ""
        analytics = (hostname == "stats.philippdubach.com" or hostname.endswith("cloudflareinsights.com")
                     or parsed.path.startswith("/cdn-cgi/rum") or "/assets/count." in parsed.path)
        if analytics or request.method not in ("GET", "HEAD", "OPTIONS"):
            report["blockedRequests"] += 1
            route.abort()
        else:
            route.continue_()

    try:
        with local_server(args.public_dir.resolve(), args.base_url) as base_url, sync_playwright() as playwright:
            report["baseURL"] = base_url
            options = {"headless": True}
            if args.browser_executable:
                options["executable_path"] = str(args.browser_executable)
            browser = playwright.chromium.launch(**options)
            context = browser.new_context(viewport={"width": widths[0], "height": args.height},
                                          color_scheme=args.color_scheme, reduced_motion="reduce", service_workers="block")
            context.route("**/*", intercept)
            try:
                for route_index, route_path in enumerate(routes):
                    page = context.new_page()
                    page_errors, csp_errors = [], []
                    page.on("pageerror", lambda error: page_errors.append(str(error)))
                    page.on("console", lambda message: csp_errors.append(message.text)
                            if message.type == "error" and ("Content Security Policy" in message.text or "content-security-policy" in message.text.lower())
                            and not any(host in message.text for host in ("stats.philippdubach.com", "cloudflareinsights.com", "/cdn-cgi/rum")) else None)
                    page.set_default_timeout(args.timeout_ms)
                    try:
                        url = base_url + quote(route_path, safe="/%:@")
                        response = page.goto(url, wait_until="domcontentloaded", timeout=args.timeout_ms)
                        if not response or response.status >= 400:
                            # A custom 404 document itself is intentionally inspectable.
                            if route_path != "/404.html" or not response or response.status != 404:
                                raise RuntimeError(f"HTML request failed: {response.status if response else 'no response'}")
                        warnings = settle(page, args.timeout_ms, route_path == "/index.xml")
                        for width in widths:
                            result = {"route": route_path, "width": width, "failures": [], "warnings": warnings, "interactions": []}
                            try:
                                page.set_viewport_size({"width": width, "height": args.height})
                                page.evaluate("() => {window.scrollTo(0,0); return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));}")
                                page.wait_for_timeout(100)
                                geometry = page.evaluate(GEOMETRY)
                                result["geometry"] = geometry
                                if geometry["documentWidth"] > geometry["viewportWidth"] + 2:
                                    result["failures"].append(f"Page overflow: {geometry['documentWidth']}px in {geometry['viewportWidth']}px viewport")
                                result["failures"].extend(item["reason"] for item in geometry["clippedMath"])
                                result["failures"].extend(check_keyboard_scrollers(page, geometry["scrollers"]))
                                # RSS reuses article markup but intentionally has no site.js
                                # lightbox/menu handlers; exercise those on HTML pages only.
                                if not args.skip_interactions and route_path != "/index.xml":
                                    issues, checked = check_interactions(page, width, completed)
                                    result["failures"].extend(issues)
                                    result["interactions"] = checked
                            except Exception as error:
                                result["failures"].append(f"Check could not complete: {error}")
                            result["failures"].extend(f"JavaScript error: {error}" for error in dict.fromkeys(page_errors))
                            result["failures"].extend(f"CSP error: {error}" for error in dict.fromkeys(csp_errors))
                            if result["failures"]:
                                screenshot = output / f"{hashlib.sha256(route_path.encode()).hexdigest()[:12]}-{width}.png"
                                try:
                                    page.screenshot(path=str(screenshot), full_page=False)
                                    result["screenshot"] = str(screenshot)
                                except Exception:
                                    pass
                            report["results"].append(result)
                    except Exception as error:
                        report["results"].append({"route": route_path, "width": None, "failures": [str(error)]})
                    finally:
                        page.close()
                    if (route_index + 1) % 10 == 0:
                        print(f"Checked {route_index + 1}/{len(routes)} routes", flush=True)
            finally:
                context.close()
                browser.close()
    except Exception as error:
        report["fatalError"] = str(error)
    failures = [result for result in report["results"] if result["failures"]]
    report["summary"] = {"routeCount": len(routes), "completedChecks": len(report["results"]),
                         "failedChecks": len(failures), "passed": not failures and "fatalError" not in report}
    report_file = output / "overflow-report.json"
    report_file.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({**report["summary"], "report": str(report_file)}, indent=2))
    if report.get("fatalError"):
        print(report["fatalError"])
    for result in failures[:20]:
        print(f"FAIL {result['route']} @ {result.get('width')}: {'; '.join(result['failures'])}")
    return 0 if report["summary"]["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
