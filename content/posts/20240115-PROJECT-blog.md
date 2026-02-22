---
title: The Tech behind this Site
date: 2024-01-15
images:
- https://static.philippdubach.com/ograph/ograph-projects.jpg
seoTitle: "Hugo Blog Tech Stack: GitHub Pages, Cloudflare R2 & Workers"
description: "A Hugo blog tech stack with Cloudflare R2 image hosting, responsive WebP shortcodes, Workers AI social automation, and GitHub Pages CI/CD deployment."
keywords:
- Hugo blog tech stack
- Hugo GitHub Pages Cloudflare
- Hugo responsive images shortcode
- Hugo Cloudflare R2 images
- Hugo site automation Cloudflare Workers
tags:
- Project
categories:
- Tech
type: Project
aliases:
- /2024/01/15/the-tech-behind-this-site/

faq:
- question: How do you serve responsive images from Cloudflare R2 in Hugo?
  answer: You build a custom Hugo shortcode that generates <picture> elements with breakpoint-specific sources. Upload images at full quality to Cloudflare R2, then use Cloudflare's image resizing service to serve optimized versions (320px for mobile up to 1600px for desktop) with automatic WebP conversion. This way you maintain a single source image but deliver the right size to each device.
- question: What tech stack does this Hugo blog use?
  answer: The site runs on Hugo deployed to GitHub Pages, with Cloudflare as CDN and images hosted on Cloudflare R2. Social media automation is handled by Cloudflare Workers using Llama 3.3 70B for AI-generated posts to Bluesky and Twitter. A newsletter system uses Cloudflare Workers + KV with Resend for email delivery.
- question: How do you automate social media posting from a Hugo blog?
  answer: Cloudflare Workers monitor the Hugo site's feed and automatically generate social media posts using Workers AI (Llama 3.3 70B). The workers create neutral, non-clickbait posts with banned word filtering, posting to both Bluesky and Twitter/X without manual intervention.
- question: How does IndexNow work with Hugo for faster indexing?
  answer: IndexNow integration is automated through GitHub Actions. When content changes, the workflow checks which URLs have been recently modified based on the lastmod frontmatter field and submits only those URLs to search engines, resulting in faster discovery and indexing of new or updated content.
- question: How do you add security headers to a GitHub Pages site?
  answer: GitHub Pages doesn't process _headers files, so a Cloudflare Worker intercepts all requests on the domain and injects HTTP security headers including HSTS, Content-Security-Policy with frame-ancestors, Cross-Origin-Embedder-Policy, Cross-Origin-Opener-Policy, and Permissions-Policy. The CSP must be kept in sync across the Worker, head.html meta tag, and _headers reference file.
- question: How do you show most-read posts on a Hugo static site?
  answer: A Cloudflare Worker proxy queries the GoatCounter analytics API for the top 10 posts over the past 7 days. The Hugo site footer fetches this data client-side and renders a "Most Read" section. The Worker adds CORS headers and caches responses for 1 hour.
---

This site runs on Hugo, deployed to GitHub Pages with Cloudflare CDN. Images are hosted on R2 (`static.philippdubach.com`) with automatic resizing and WebP conversion.

The core challenge was responsive images. Standard markdown `![alt](url)` doesn't support multiple sizes. I built a [Hugo shortcode](https://gist.github.com/philippdubach/167189c7090c6813c5110c467cb5ebe9) that generates `<picture>` elements with breakpoint-specific sources—upload once at full quality, serve optimized versions (320px mobile to 1600px desktop) automatically.

<br>
 

**Updates**

> **February 2026**

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

*Social Automation & AI Model Upgrade* — Upgraded Workers AI model from Llama 3.1 8B to **Llama 3.3 70B** for better post generation. Added Twitter/X automation worker alongside Bluesky. AI generates neutral, non-clickbait posts with extensive banned word filtering.

*Post Composer Enhancements* — Added auto-closing brackets `[ ( {` in editor. Updated footer with social links matching main site. Deployed at [post-composer.pages.dev](https://post-composer.pages.dev).

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
