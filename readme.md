# philippdubach.com

Personal blog on quantitative finance, AI/ML, and technology.

**👉 [philippdubach.com](https://philippdubach.com)**

| | |
|---|---|
| RSS | [philippdubach.com/index.xml](https://philippdubach.com/index.xml) |
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
| **Math** | MathJax 3.2.2 |
| **Code Highlighting** | Chroma (Hugo built-in) |
| **Social Automation** | Cloudflare Workers + Workers AI |
| **Composer Tool** | Cloudflare Pages |
| **URL Shortener** | Cloudflare Workers + KV + D1 |

---

## Project Structure

```
├── hugo.toml                 # Site configuration
├── content/
│   ├── posts/                # Blog articles (YYYYMMDD-slug.md)
│   ├── projects/             # Project showcase
│   └── standalone/           # Landing pages
├── layouts/
│   ├── _default/             # Base templates
│   ├── partials/             # Components (head, header, sidebar, footer, related)
│   └── shortcodes/           # img, disclaimer, newsletter, etc.
├── static/css/custom.css     # All styling
├── data/navigation.yaml      # Nav menu config
├── composer/                 # Post Composer (Cloudflare Pages)
└── social-automation/
    ├── bluesky worker/       # Auto-post to Bluesky
    ├── twitter worker/       # Auto-post to Twitter/X
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
+++
```

### Custom Shortcodes

| Shortcode | Usage |
|-----------|-------|
| `{{< img >}}` | Images from static.philippdubach.com CDN |
| `{{< disclaimer type="finance" >}}` | Contextual disclaimers (finance, medical, ai, research, gambling) |
| `{{< newsletter >}}` | Newsletter signup form |

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
- YAML frontmatter editor
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
- Three-column layout on desktop (sidebar, content, sidebar)
- Responsive mobile design with collapsible navigation
- Related posts section with centered heading
- Latest/Most Read sidebar sections

### Typography & Spacing
- Post spacing: 3.75rem gap between articles
- Consistent footer margins across devices
- Professional category/tag styling

### Disclaimers
Context-aware disclaimers that:
- Display on individual post pages
- Hidden on homepage/list views
- Types: finance, medical, ai, research, gambling

---

## Security

| Feature | Implementation |
|---------|----------------|
| CSP | Strict Content-Security-Policy headers |
| SRI | GoatCounter script verified with hash |
| Headers | X-Content-Type-Options, X-Frame-Options |
| Input Validation | All worker inputs sanitized |
| Rate Limiting | API endpoints protected |
| Auth | API key + HMAC sessions on workers |

---

## Changelog

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
