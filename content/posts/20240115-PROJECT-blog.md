---
title: The Tech behind this Site
date: 2024-01-15
images:
- https://static.philippdubach.com/ograph/ograph-projects.jpg
description: Technical guide to implementing responsive images in Hugo using Cloudflare's
  CDN and custom shortcodes for optimized WebP delivery.
keywords:
- Hugo static site
- responsive images
- Cloudflare image CDN
- Hugo shortcode
- WebP optimization
- image resizing
- R2 bucket
- static site generation
- markdown syntax
- picture element
- image transformations
- mobile optimization
- web performance
tags:
- Project
aliases:
- /2024/01/15/the-tech-behind-this-site/

---
Similar to how Simon Willison describes his difficulties managing images for his [approach to running a link blog](https://simonwillison.net/2024/Dec/22/link-blog/) I found it hard to remain true to pure markdown syntax but have images embedded in a responsive way on this site.

My current pipeline is as follows: I host my all my images in a R2 bucket and serve them from ```static.philippdubach.com```. I use Cloudflares's image resizing CDN do I never have to worry about serving images in appropriate size or format. I basically just upload them with the highes possible quality and Cloudflare takes care of the rest.

Since the site runs on Hugo, I needed a solution that would work within this static site generation workflow. Pure markdown syntax like ```![alt](url)``` is clean and portable, but it doesn't give me the responsive image capabilities I was looking for.

The solution I settled on was creating a [Hugo shortcode](https://gist.github.com/philippdubach/167189c7090c6813c5110c467cb5ebe9) that leverages Cloudflare's image transformations while maintaining a simple, markdown-like syntax. 
The shortcode generates a ```<picture>``` element with multiple ```<source>``` tags, each targeting different screen sizes and serving WebP format. Here's how it works: instead of writing standard markdown image syntax, I use ```{{ img src="image.jpg" alt="Description" }}``` in my posts. Behind the scenes, the shortcode constructs URLs for different breakpoints. This means I upload one high-quality image, but users receive perfectly sized versions - a 320px wide WebP for mobile users, a 1600px version for desktop, and everything in between. The shortcode defaults to displaying images at 80% width and centered, but I can override this with a width parameter when needed. It's a nice compromise between the simplicity of markdown and the power of modern responsive image techniques. The syntax remains clean and the performance benefits are substantial - especially important since images are often the heaviest assets on any webpage.

_(May 2025) Update:_
Completed migration to a fully custom Hugo build. Originally started with a fork of [hugo-blog-awesome](https://github.com/hugo-sid/hugo-blog-awesome), but I've since rebuilt it from scratch.

_(June 2025) Update:_
Added LaTeX math rendering using [MathJax 3](https://github.com/mathjax/MathJax-src). Created a [minimal partial template](https://gist.github.com/philippdubach/42ef6e05f5c44b76ef3f66f27a17c41e) that only loads the MathJax library on pages that actually contain LaTeX expressions.

_(June 2025) Update II:_
Enhanced SEO capabilities with comprehensive metadata support. Built custom [Open Graph integration](https://gist.github.com/philippdubach/39838f8e9e1b9fb085947a6b92062e0a) that automatically generates social media previews, plus added per-post keyword management.

_(November 2025) Update:_
Added new [shortcode to embedd html tables](https://gist.github.com/philippdubach/b703005536d6030c87e17d21cb0d430b) as well as updated my [image shortcode](https://gist.github.com/philippdubach/167189c7090c6813c5110c467cb5ebe9) to add lightbox support on images.

_(December 2025) Update:_
Completed a full security, stability, and performance audit. Fixed SEO issues: resolved multiple H1 tags per page by changing sidebar title from `<h1>` to `<div>`, added `seoTitle` frontmatter support for pages with long titles, and added meta descriptions to archive pages. Hardened Content Security Policy with `frame-ancestors` directive. Added preconnect hints for external domains (gc.zgo.at, static.philippdubach.com). Removed unused legacy meta partials.

_(December 2025) Update II:_
Added one-click short link sharing via [YOURLS](https://yourls.org/) integration. Click the ∞ symbol next to read time to generate a pdub.click short URL and copy it to clipboard. Uses JSONP for cross-origin compatibility with minimal inline JavaScript (~500 bytes).

_(December 2025) Update III:_
[Integrated email newsletter subscription](/2025/12/24/building-a-no-tracking-newsletter-from-markdown-to-distribution/) using a Cloudflare Workers API backed by Workers KV (plus R2 for hosting the newsletter HTML). The subscribe form submits to a serverless endpoint that validates emails, stores subscribers, and applies rate limiting + basic spam protection. The worker also triggers a welcome email via Resend.

_(December 2025) Update IV:_
Added syntax-highlighted code blocks with line numbers using Hugo's built-in Chroma highlighter. Configured `lineNumbersInTable = true` for a clean two-column layout—line numbers in a gray sidebar, code content in the main area with horizontal scroll for long lines. GitHub-inspired color theme with proper styling for keywords, strings, comments, and functions.