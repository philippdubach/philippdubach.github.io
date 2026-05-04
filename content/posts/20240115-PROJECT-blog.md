+++
title = "The Tech behind this Site"
seoTitle = "Hugo Blog Tech Stack: GitHub Pages, Cloudflare R2 & Workers"
date = 2024-01-15
images = ["https://static.philippdubach.com/ograph/ograph-projects.jpg"]
description = "A Hugo blog tech stack with Cloudflare R2 image hosting, responsive WebP shortcodes, Workers AI social automation, and GitHub Pages CI/CD deployment."
keywords = ["Hugo blog tech stack", "Hugo GitHub Pages Cloudflare", "Hugo responsive images shortcode", "Hugo Cloudflare R2 images", "Hugo site automation Cloudflare Workers"]
categories = ["Tech"]
tags = ["Project"]
type = "Project"
aliases = ["/2024/01/15/the-tech-behind-this-site/"]
takeaways = [
  "The site runs on Hugo with Cloudflare R2 image hosting, serving responsive WebP images from 320px to 1600px via a custom shortcode that generates picture elements from a single upload",
  "Social media posts to Bluesky and Twitter are generated automatically by Cloudflare Workers running Llama 4 Scout 17B, with no manual intervention",
  "A security headers Worker on Cloudflare injects HSTS, CSP, and COEP headers because GitHub Pages does not process _headers files natively",
]
faq = [
  {question = "How do you serve responsive images from Cloudflare R2 in Hugo?", answer = "You build a custom Hugo shortcode that generates <picture> elements with breakpoint-specific sources. Upload images at full quality to Cloudflare R2, then use Cloudflare's image resizing service to serve optimized versions (320px for mobile up to 1600px for desktop) with automatic WebP conversion. This way you maintain a single source image but deliver the right size to each device."},
  {question = "What tech stack does this Hugo blog use?", answer = "The site runs on Hugo deployed to GitHub Pages, with Cloudflare as CDN and images hosted on Cloudflare R2. Social media automation is handled by Cloudflare Workers using Llama 4 Scout 17B for AI-generated posts to Bluesky and Twitter. A newsletter system uses Cloudflare Workers + KV with Resend for email delivery."},
  {question = "How do you automate social media posting from a Hugo blog?", answer = "Cloudflare Workers monitor the Hugo site's feed and automatically generate social media posts using Workers AI (Llama 4 Scout 17B). The workers create neutral, non-clickbait posts with banned word filtering, posting to both Bluesky and Twitter/X without manual intervention."},
  {question = "How does IndexNow work with Hugo for faster indexing?", answer = "IndexNow integration is automated through GitHub Actions. When content changes, the workflow checks which URLs have been recently modified based on the lastmod frontmatter field and submits only those URLs to search engines, resulting in faster discovery and indexing of new or updated content."},
  {question = "How do you add security headers to a GitHub Pages site?", answer = "GitHub Pages doesn't process _headers files, so a Cloudflare Worker intercepts all requests on the domain and injects HTTP security headers including HSTS, Content-Security-Policy with frame-ancestors, Cross-Origin-Embedder-Policy, Cross-Origin-Opener-Policy, and Permissions-Policy. The CSP must be kept in sync across the Worker, head.html meta tag, and _headers reference file."},
  {question = "How do you show most-read posts on a Hugo static site?", answer = "A Cloudflare Worker proxy queries the GoatCounter analytics API for the top 10 posts over the past 7 days. The Hugo site footer fetches this data client-side and renders a \"Most Read\" section. The Worker adds CORS headers and caches responses for 1 hour."},
]
+++

This site runs on Hugo, deployed to GitHub Pages with Cloudflare CDN. Images are hosted on R2 (`static.philippdubach.com`) with automatic resizing and WebP conversion.

The core challenge was responsive images. Standard markdown `![alt](url)` doesn't support multiple sizes. I built a [Hugo shortcode](https://gist.github.com/philippdubach/167189c7090c6813c5110c467cb5ebe9) that generates `<picture>` elements with breakpoint-specific sources—upload once at full quality, serve optimized versions (320px mobile to 1600px desktop) automatically.

<br>
 

**Updates**

> **May 2026**

*Hugo 0.161.1 Upgrade* — Bumped from 0.157.0. Byte-identical output, zero deprecation warnings. Added a local diff harness (`scripts/upgrade-diff.sh`) that builds with two Hugo versions and diffs `public/`, used to validate the bump as a no-op. The new release window opened up `strings.ReplacePairs` (collapsed an 8-call entity-decode chain in `llms-full.txt`) and fixed enough Goldmark / `RenderShortcodes` edge cases that 8 of 9 post-render regex passes in the markdown variant template could go. One was actively harmful: the math-delimiter regex was corrupting Wikipedia URLs like `Universal_Serial_Bus_\(USB\)` into `_$USB$_` because the pattern was over-eager.

*Index Redesign* — Articles and projects now share the same structure: hero dropped, the featured row *is* the masthead (red overline, 1.5px red rule, large headline), hairline divider, filter chips reframed as "browse the archive" rather than page nav. Quiet `<h1 class="page-label">` for SEO and screen readers without competing visually with the featured headline. Featured card image now requests a 1200×630 landscape source matching the CSS aspect-ratio (was getting a 480×600 portrait stretched sideways, which clipped faces).

*Markdown Variant Maturity* — `/posts/<slug>/index.md` now emits clean markdown via output-format-aware sibling shortcodes (`img.markdown.md`, `disclaimer.markdown.md`, `newsletter.markdown.md`, `readnext.markdown.md`). HTML pollution never enters the markdown stream. YAML preamble parseable by gray-matter and every major LLM tooling SDK. Dropped the `eq .Section "posts"` gate so `/about/`, `/research/`, `/subscribe/` ship real markdown content too.

*Worker Audit* — Three parallel reviews (perf, reliability, security) of the Hugo site and remaining Cloudflare Workers found nine issues worth fixing, clustered in the social-automation workers. Bluesky's 300-char post limit was being silently exceeded when the appended URL pushed total length over budget, leaving stuck-loop posts that retried every 15 minutes. The `og:image` URL was being fetched without domain validation (SSRF gap, low probability). Cron ticks could race the same article when a tick took longer than 15 minutes. The bluesky worker fetched each article URL twice per post. All four fixed, plus a GoatCounter title sanitizer at the Worker boundary so a downstream consumer that uses `innerHTML` can't be tricked into executing script regardless of how the rendering side is written.

*Template Hardening* — `readnext` shortcode now emits a build-time `warnf` when the slug doesn't match a post, instead of silently rendering nothing. FAQ aggregation extracted to a cached partial (one scan per category instead of two on every faq/* page). Homepage and projects `ItemList` JSON-LD capped at 20 entries (Google rich-result band). `posts.json` prefers `.Description` over `.Summary` to skip 86 of 87 markdown renders at build time.

*Decommissioning* — Removed the post composer (`post-composer.pages.dev`) and URL shortener (`pdub.click`). Both unused. Deleted source from the repo, then deleted the Pages project, KV namespaces, D1 database via wrangler.

*Accessibility* — Sidebar wordmark `aria-label` now starts with the visible text per WCAG 2.5.3 (voice-control users saying "click philippdubach" can now activate it). Newsletter card meta switched to `--text-secondary` for 7.0:1 contrast on the pink tint (was 3.91:1, below AA).

> **April 2026**

*Agent Readiness* — Shipped three coordinated changes so AI agents and content-aware crawlers can discover and consume the site through standardized protocols. Every response now carries a `Link:` header (RFC 8288) advertising machine-readable resources: the api-catalog, sitemap, RSS and JSON feeds, `llms.txt`, and a per-page markdown alternate. A new `/.well-known/api-catalog` endpoint returns an RFC 9264 Linkset enumerating those endpoints (RFC 9727). Content negotiation now works: requesting any page with `Accept: text/markdown` returns a markdown variant with `Content-Type: text/markdown`, `Vary: Accept`, and an `x-markdown-tokens` count for LLM context-window planning. The robots.txt declares `Content-Signal: search=yes, ai-input=yes, ai-train=yes` per draft-romm-aipref-contentsignals.

*Worker Refactor* — The 60-line security-headers Worker grew into four focused modules (`accept`, `links`, `cache`, `index`) with 32 unit tests. The `cache` module is the interesting bit: Cloudflare's edge cache doesn't honor `Vary: Accept` by default, so the Worker uses the Cache API with synthetic keys (`?_v=html|md`) to keep HTML and Markdown variants isolated under the same URL. Origin fetches HTML or rewrites to `/index.md` based on the client's Accept header.

> **March 2026**

*Hugo Upgrade* — Upgraded from Hugo v0.128.0 to v0.157.0. Migrated deprecated `.Site.AllPages` to `.Site.Pages` in the sitemap template and `.Site.Data` to `site.Data` across navigation, structured data, and research templates. Removed a dead `readFile` security config key from `hugo.toml`. No breaking changes, zero deprecation warnings.

> **February 2026**

*Frontmatter Unification* — Converted all 70 YAML frontmatter posts to TOML and added Key Takeaways to all 73 posts. Takeaways render as a visible summary box between the post header and content body, optimized for Generative Engine Optimization (GEO) so AI search engines can extract citation-ready passages.

*Design Streamlining* — Unified left-bordered aside components (key takeaways, newsletter CTA, disclaimer) to consistent 3px borders and aligned padding. Established a vertical spacing rhythm across post zones: key takeaways, content body, newsletter CTA, footer divider, related posts. Added breathing room around images (1.5rem padding). Refined key takeaways heading to 0.85rem uppercase label with square bullets.

*Homepage Redesign* — Rebuilt the homepage with a tabbed layout (Articles/Projects), year dividers, and thumbnail images served via Cloudflare Image Resizing. Consolidated navigation into a unified sidebar.

*Security Headers Worker* — Deployed a dedicated Cloudflare Worker on `philippdubach.com/*` that injects HSTS, CSP with `frame-ancestors`, COEP, COOP, and `Permissions-Policy` headers. GitHub Pages doesn't process `_headers` files, so the Worker fills that gap. SHA-pinned all GitHub Actions and added Hugo binary checksum verification in CI.

*Machine-Readable Feeds* — Added [JSON Feed 1.1](/feed.json) alongside RSS, a [Posts API](/api/posts.json) for programmatic access, and `llms.txt`/`llms-full.txt` for AI crawler discovery. All output formats configured in `hugo.toml`.

*GoatCounter "Most Read" API* — Built a Cloudflare Worker proxy that queries the GoatCounter API for the top 10 posts over the past 7 days. The footer's "Most Read" section now fetches live data from this worker instead of a static list.

*FAQ Section* — New `/faq/` section with per-category pages (Finance, AI, Tech, Economics, Medicine). Each post can define `faq` entries in frontmatter; Hugo aggregates them into browsable FAQ pages with `FAQPage` structured data for search engines.

*Readnext Shortcode* — Inline "Related" link to another post: `{{</* readnext slug="post-slug" */>}}`. Links are validated against live permalinks at build time.

*RSS Feed Fixes* — Stripped lightbox overlay elements from full-content RSS to prevent images appearing twice in feed readers. Added XSLT stylesheet for browser-friendly RSS rendering.

*Cloudflare Cache Purge* — GitHub Actions deployment now automatically purges the Cloudflare cache after each build.

*Research Page* — Dynamic `/research/` page pulling publication data from `data/research.yaml` with SSRN links, DOIs, and structured data.

> **January 2026**

*Social Automation & AI Model Upgrade* — Upgraded Workers AI model from Llama 3.1 8B to **Llama 4 Scout 17B** for better post generation. Added Twitter/X automation worker alongside Bluesky. AI generates neutral, non-clickbait posts with extensive banned word filtering.

*UI/UX Polish* — Fixed mobile footer spacing consistency. Increased homepage post spacing (3.75rem). Disclaimers now only display on individual posts, hidden on homepage. Centered related posts heading.

*Content Organization* — Taxonomy system with categories (Finance, AI, Medicine, Tech, Economics) and types (Project, Commentary, Essay, Review). Hugo generates browsable `/categories/` and `/types/` pages.

*Disclaimer Shortcode* — Six types: finance, medical, general, AI, research, gambling. Syntax: `{{</* disclaimer type="finance" */>}}`.

*IndexNow Integration* — Automated submissions via GitHub Actions for faster search engine discovery. Only pings recently changed URLs based on `lastmod`.

> **December 2025**

*Code Blocks* — Syntax highlighting via Chroma with line numbers in table layout. GitHub-inspired color theme.

*Newsletter System* — [Integrated email subscriptions](/posts/building-a-no-tracking-newsletter-from-markdown-to-distribution/) via Cloudflare Workers + KV. Welcome emails via Resend.

*Security & Performance Audit* — Fixed multiple H1 tags per page. Hardened CSP with `frame-ancestors`. Added preconnect hints for external domains. Added `seoTitle` frontmatter for long titles.

> **November 2025**

*Shortcodes* — [HTML table shortcode](https://gist.github.com/philippdubach/b703005536d6030c87e17d21cb0d430b). Lightbox support on images.

> **June 2025**

*SEO & Math* — [Open Graph integration](https://gist.github.com/philippdubach/39838f8e9e1b9fb085947a6b92062e0a) for social previews. Per-post keyword management. [LaTeX rendering via MathJax 3](https://gist.github.com/philippdubach/42ef6e05f5c44b76ef3f66f27a17c41e) (conditional loading).

> **May 2025**

*Full Rebuild* — Migrated from [hugo-blog-awesome](https://github.com/hugo-sid/hugo-blog-awesome) fork to fully custom Hugo build.
