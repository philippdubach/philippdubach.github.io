---
title: The Tech behind this Site
date: 2024-01-15
images:
- https://static.philippdubach.com/ograph/ograph-projects.jpg
description: Technical guide to implementing responsive images in Hugo using Cloudflare's
  CDN and custom shortcodes for optimized WebP delivery.
keywords:
- Hugo static site
- GitHub Pages deployment
- Hugo GitHub Actions workflow
- Cloudflare image resizing
- responsive images shortcode
- WebP optimization
- Open Graph metadata SEO
- Content Security Policy (CSP)
- IndexNow integration
- static site performance
tags:
- Project
categories:
- Tech
type: Project
aliases:
- /2024/01/15/the-tech-behind-this-site/

---

This site runs on Hugo, deployed to GitHub Pages with Cloudflare CDN. Images are hosted on R2 (`static.philippdubach.com`) with automatic resizing and WebP conversion.

The core challenge was responsive images. Standard markdown `![alt](url)` doesn't support multiple sizes. I built a [Hugo shortcode](https://gist.github.com/philippdubach/167189c7090c6813c5110c467cb5ebe9) that generates `<picture>` elements with breakpoint-specific sources—upload once at full quality, serve optimized versions (320px mobile to 1600px desktop) automatically.

---

## Updates

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
