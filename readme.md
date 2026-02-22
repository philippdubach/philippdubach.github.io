# philippdubach.com

Personal blog on quantitative finance, AI/ML, and technology.

**👉 [philippdubach.com](https://philippdubach.com)**

| | |
|---|---|
| RSS | [philippdubach.com/feed/](https://philippdubach.com/feed/) |
| JSON Feed | [philippdubach.com/feed.json](https://philippdubach.com/feed.json) |
| Newsletter | [philippdubach.com/subscribe](https://philippdubach.com/subscribe/) |
| Bluesky | [@philippdubach.com](https://bsky.app/profile/philippdubach.com) |
| GitHub | [philippdubach](https://github.com/philippdubach) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Site Generator** | Hugo v0.128.0 Extended |
| **Hosting** | GitHub Pages |
| **CDN** | Cloudflare |
| **Images** | Cloudflare R2 (`static.philippdubach.com`) |
| **Analytics** | GoatCounter (privacy-first, no cookies) |
| **Security Headers** | Cloudflare Worker (HSTS, CSP, COEP, COOP) |
| **Math** | MathJax 3.2.2 (SRI-verified) |
| **Code Highlighting** | Chroma (Hugo built-in) |
| **Social Automation** | Cloudflare Workers + Workers AI (Llama 3.3 70B) |
| **Composer Tool** | Cloudflare Pages |
| **URL Shortener** | Cloudflare Workers + KV + D1 |

---

## Project Structure

```
├── hugo.toml                 # Site configuration
├── content/
│   ├── posts/                # Blog articles (YYYYMMDD-slug.md)
│   ├── faq/                  # Category FAQ pages (aggregated from post frontmatter)
│   ├── categories/           # Category landing pages
│   ├── projects/             # Project showcase
│   └── standalone/           # Landing pages
├── layouts/
│   ├── _default/             # Base templates + feed formats (JSON Feed, Posts API, llms.txt)
│   ├── partials/             # Components (head, header, sidebar, footer, related)
│   └── shortcodes/           # img, disclaimer, newsletter, readnext
├── static/css/custom.css     # All styling (inlined at build time)
├── data/
│   ├── navigation.yaml       # Nav menu config
│   └── research.yaml         # Research publications (SSRN papers, DOIs)
├── composer/                 # Post Composer (Cloudflare Pages)
└── social-automation/
    ├── bluesky worker/       # Auto-post to Bluesky
    ├── twitter worker/       # Auto-post to Twitter/X
    ├── goatcounter-worker/   # "Most Read" posts API proxy
    ├── security-headers/     # HTTP security headers Worker
    └── url shortener/        # pdub.click
```

---

## Local Development

```bash
hugo server -D          # Dev server with drafts
hugo --minify            # Production build
```

### Post Frontmatter

```toml
+++
title = "Post Title"
date = 2026-01-11
description = "SEO description (150-160 chars)"
keywords = ["keyword1", "keyword2"]
categories = ["Finance", "Technology"]
type = "Article"          # Article | Commentary | Analysis | Project
draft = false
math = true               # Enable MathJax
takeaways = [             # Key Takeaways box (GEO)
  "Data-first takeaway with specific numbers",
  "Second takeaway, no em dashes",
]
+++
```

### Custom Shortcodes

| Shortcode | Usage |
|-----------|-------|
| `{{< img >}}` | Images from static.philippdubach.com CDN |
| `{{< disclaimer type="finance" >}}` | Contextual disclaimers (finance, medical, ai, research, gambling) |
| `{{< newsletter >}}` | Newsletter signup form |
| `{{< readnext slug="post-slug" >}}` | Inline "Related" link to another post |

---

## Social Automation

Cloudflare Workers automatically generate and post social content when new articles are published.

### Architecture

```
RSS Feed → Worker (cron/manual) → Workers AI → Social Platform
```

### Bluesky Worker

| | |
|---|---|
| URL | `social-poster.philippd.workers.dev` |
| Trigger | Cron schedule or `POST /trigger` |
| AI Model | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| Features | RSS parsing, AI post generation, link card embedding |

### Twitter Worker

| | |
|---|---|
| URL | `twitter-poster.philippd.workers.dev` |
| Trigger | Cron schedule or `POST /trigger` |
| AI Model | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| Auth | OAuth 1.0a |

### AI Post Generation

The workers use Llama 3.3 70B to generate social posts with specific style constraints:
- Neutral, factual tone (no clickbait)
- Max 200 characters
- No emojis or hashtags
- Varied sentence structure
- Extensive banned word list (AI slop words filtered)

### URL Shortener

| | |
|---|---|
| Domain | [pdub.click](https://pdub.click) |
| Storage | KV for redirects, D1 for analytics |
| Features | Dashboard, click tracking, HMAC auth |

**Deploy workers:**
```bash
cd social-automation/bluesky\ worker && npx wrangler deploy
cd social-automation/twitter\ worker && npx wrangler deploy
cd social-automation/url\ shortener && npx wrangler deploy
cd social-automation/goatcounter-worker && npx wrangler deploy
cd social-automation/security-headers && npx wrangler deploy
```

---

## Composer Tool

Markdown editor for writing blog posts with live preview.

| | |
|---|---|
| URL | [post-composer.pages.dev](https://post-composer.pages.dev) |
| AI Backend | Cloudflare Functions + Claude API |

### Features

- Live preview matching blog CSS
- TOML frontmatter editor
- AI-powered SEO metadata generation
- Hugo shortcode rendering
- KaTeX math support
- Auto-closing brackets `[ ( {`
- Syntax highlighting (CodeMirror)
- Focus mode
- Auto-save to localStorage
- Export as `.md` file or clipboard

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + S` | Download .md file |
| `Cmd/Ctrl + E` | Copy to clipboard |
| `Escape` | Exit focus mode |

**Deploy:**
```bash
cd composer && npx wrangler pages deploy . --project-name post-composer
```

---

## UI/UX Features

### Layout
- Tabbed homepage with Articles/Projects tabs, year dividers, and thumbnail images
- Responsive mobile design with collapsible navigation
- Related posts section with centered heading
- "Most Read" footer section powered by live GoatCounter data

### Typography & Spacing
- Post spacing: 3.75rem gap between articles
- Consistent footer margins across devices
- Professional category/tag styling

### Disclaimers
Context-aware disclaimers that:
- Display on individual post pages
- Hidden on homepage/list views
- Types: finance, medical, ai, research, gambling

### Machine-Readable Outputs
- `/feed/index.xml` — RSS 2.0 with XSLT stylesheet
- `/feed.json` — JSON Feed 1.1
- `/api/posts.json` — Posts API for programmatic access
- `/llms.txt` — AI/LLM crawler discovery
- `/sitemap.xml` — Dynamic sitemap with git-based lastmod

---

## Security

| Feature | Implementation |
|---------|----------------|
| Security Headers | Cloudflare Worker injecting HSTS, CSP, COEP, COOP, Permissions-Policy |
| CSP | Strict Content-Security-Policy with `frame-ancestors` (synced across Worker, head.html, _headers) |
| SRI | GoatCounter and MathJax verified with integrity hashes |
| CI Hardening | SHA-pinned GitHub Actions, Hugo binary checksum verification |
| Headers | X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| Input Validation | All worker inputs sanitized |
| Rate Limiting | API endpoints protected |
| Auth | API key + HMAC sessions on workers |

---

## Changelog

### February 2026
- Unified all 73 posts to TOML frontmatter (converted 70 from YAML)
- Added Key Takeaways (GEO) to all 73 posts for AI search citation
- Streamlined post layout: unified left-bordered asides (3px), consistent vertical spacing rhythm, image breathing room
- Redesigned homepage with tabbed Articles/Projects layout and thumbnail images via Cloudflare Image Resizing
- Deployed security headers Cloudflare Worker (HSTS, CSP, COEP, COOP, Permissions-Policy)
- Added JSON Feed 1.1, Posts API, and llms.txt/llms-full.txt output formats
- Built GoatCounter "Most Read" API worker for live footer data
- Added FAQ section with per-category pages and FAQPage structured data
- Added `readnext` shortcode for inline related post links
- Styled RSS feed with XSLT, stripped lightbox overlays from feed content
- Automated Cloudflare cache purge in GitHub Actions deployment
- Added dynamic research page with structured data
- SHA-pinned all GitHub Actions, added Hugo binary checksum verification

### January 2026
- Upgraded social automation AI model to Llama 3.3 70B (from 3.1 8B)
- Added auto-closing brackets to composer
- Updated composer footer with social links
- Fixed mobile footer spacing consistency
- Increased homepage post spacing to 3.75rem
- Fixed disclaimer visibility (post pages only)
- Centered related posts heading
- Created Copilot instructions file

### December 2025
- Deployed composer to Cloudflare Pages
- Added AI SEO generation to composer
- Implemented focus mode in editor

### November 2025
- Social automation workers deployed
- URL shortener (pdub.click) launched
- GoatCounter analytics integration

---

## License

Content © Philipp D. Dubach. Code under MIT.
