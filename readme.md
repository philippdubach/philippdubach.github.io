# philippdubach.com

Personal blog on quantitative finance, AI/ML, and technology. Built with Hugo, hosted on GitHub Pages with Cloudflare CDN.

**👉 [philippdubach.com](https://philippdubach.com)**

## Links

- 📰 [RSS Feed](https://philippdubach.com/index.xml)
- 🧭 [Bluesky](https://bsky.app/profile/philippdubach.com)
- 📧 [Newsletter](https://philippdubach.com/newsletter/)

---

## Project Structure

```
├── hugo.toml              # Hugo configuration
├── content/               # Blog posts, pages, projects
│   ├── posts/             # Blog articles (Markdown)
│   ├── projects/          # Project showcase pages
│   └── standalone/        # Standalone pages
├── layouts/               # Hugo templates
│   ├── _default/          # Base templates (single, list, baseof)
│   ├── partials/          # Reusable components (head, header, sidebar, footer)
│   └── shortcodes/        # Custom shortcodes
├── static/                # Static assets (CSS, icons)
├── data/                  # Site data (navigation.yaml)
├── composer/              # Post Composer Tool (Cloudflare Pages)
└── social-automation/     # Cloudflare Workers
    ├── bluesky worker/    # Auto-post to Bluesky from RSS
    ├── twitter worker/    # Auto-post to Twitter/X from RSS
    └── url shortener/     # pdub.click URL shortener
```

---

## Stack

| Component | Technology |
|-----------|------------|
| Static Site Generator | [Hugo](https://gohugo.io/) |
| Hosting | GitHub Pages |
| CDN | Cloudflare |
| Analytics | [GoatCounter](https://goatcounter.com/) |
| Math Rendering | KaTeX (via MathJax CDN) |
| Code Highlighting | Chroma (built-in Hugo) |

---

## Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) v0.120+
- Git

### Local Development

```bash
# Start development server with drafts
hugo server -D

# Build for production
hugo --minify

# Build with verbose output
hugo --minify -v
```

### Content Creation

Posts follow the naming convention: `YYYYMMDD-slug.md`

**Frontmatter fields:**
```yaml
---
title: "Post Title"
date: 2026-01-11
description: "SEO meta description"
keywords: ["keyword1", "keyword2"]
categories: ["Finance", "Technology"]
type: "Article"  # or Commentary, Analysis, Project
draft: false
math: true  # Enable KaTeX for math
---
```

---

## Social Automation

Cloudflare Workers that automatically post new blog content to social platforms.

### Bluesky Worker (`social-automation/bluesky worker/`)

- **Trigger**: Scheduled cron or manual `/trigger` endpoint
- **Features**: Fetches RSS, generates post with Workers AI (Llama 3.1), posts with link card
- **Security**: API key auth, rate limiting, trusted domain validation

### Twitter Worker (`social-automation/twitter worker/`)

- **Trigger**: Scheduled cron or manual `/trigger` endpoint
- **Features**: OAuth 1.0a posting, Workers AI for message generation
- **Security**: API key auth, rate limiting, trusted domain validation

### URL Shortener (`social-automation/url shortener/`)

- **Domain**: [pdub.click](https://pdub.click)
- **Features**: Fast KV-based redirects, D1 analytics, dashboard
- **Security**: HMAC sessions, timing-safe auth, input sanitization

---

## Composer Tool

A markdown post composer with live preview at `composer/index.html`.

**Features:**
- Live markdown preview with KaTeX math support
- YAML frontmatter editor
- AI-powered SEO metadata generation (via Cloudflare Functions)
- Export to clipboard or file

**Deploy:**
```bash
cd composer
npx wrangler pages deploy . --project-name post-composer
```

---

## Security Features

- **Content Security Policy**: Restricts script/style sources
- **Subresource Integrity**: GoatCounter script verified with SRI hash
- **Secure Headers**: X-Content-Type-Options, X-Frame-Options on workers
- **Input Validation**: All user inputs sanitized in workers
- **Rate Limiting**: API endpoints protected against abuse

---

## License

Content © Philipp D. Dubach. Code under MIT.
