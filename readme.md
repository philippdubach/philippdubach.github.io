# philippdubach.com

Personal blog and portfolio site built with Hugo, featuring articles on quantitative finance, AI, and technology.

**👉 [philippdubach.com](https://philippdubach.com)**

## About

A personal linkblog and project showcase started in 2024 to collect interesting articles, papers, and share weekend projects. Each post includes links, commentary, and analysis on topics spanning macroeconomics, quantitative finance, and AI infrastructure.

## Tech Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/) (v0.128.0+)
- **Hosting**: GitHub Pages with automatic deployment
- **Analytics**: [GoatCounter](https://goatcounter.com/) (privacy-friendly, GDPR compliant)
- **CDN**: Cloudflare for static assets (`static.philippdubach.com`)
- **URL Shortener**: Self-hosted YOURLS via Cloudflare Workers proxy (`pdub.click`)
- **Search Engine Indexing**: IndexNow protocol integration
- **Social Automation**: Cloudflare Workers with Workers AI for automated [Bluesky](https://bsky.app/profile/philippdubach.com) posting

## Project Structure

```
├── archetypes/              # Hugo content templates
├── content/                 # Markdown content files
│   ├── posts/               # Blog posts and articles
│   ├── projects/            # Project index
│   ├── standalone/          # Long-form research articles
│   ├── about.md             # About page
│   ├── newsletter.md        # Newsletter subscription
│   └── research.md          # Research publications
├── data/
│   └── navigation.yaml      # Site navigation configuration
├── layouts/                 # Hugo templates
│   ├── _default/            # Base templates (baseof, single, list, rss)
│   ├── partials/            # Reusable template components
│   ├── projects/            # Project-specific templates
│   └── shortcodes/          # Custom shortcodes (img, table)
├── static/
│   ├── css/custom.css       # Site styles with syntax highlighting
│   └── icons/               # Favicons and app icons
├── social-automation/       # Cloudflare Worker for social posting
│   └── worker/              # Worker source code
│       ├── src/             # JavaScript modules
│       └── wrangler.toml    # Worker configuration
├── .github/workflows/       # CI/CD workflows
│   ├── hugo.yml             # Build and deploy to GitHub Pages
│   ├── indexnow.yml         # Search engine URL submission
│   └── claude.yml           # Claude AI code assistant
└── hugo.toml                # Hugo configuration
```

## Features

- **Responsive Design**: Mobile-first with scaled typography
- **Accessibility**: Skip links, ARIA labels, proper heading structure
- **Performance**: 
  - CSS inlined in head (no external stylesheet request)
  - Responsive images via Cloudflare Image Resizing
  - Lazy loading for images and lightbox overlays
  - Preconnect hints for external resources
- **SEO**: 
  - Open Graph and Twitter Card meta tags
  - JSON-LD structured data (Article, BreadcrumbList)
  - Sitemap and RSS feed generation
  - IndexNow for rapid search engine indexing
- **Security**:
  - Content Security Policy headers
  - No cookies or tracking scripts (GoatCounter is privacy-focused)
  - External links use `rel="noopener"`
  - Sandboxed iframes for embedded content
- **Math Support**: MathJax 3 with LaTeX syntax (enabled per-page)
- **Code Highlighting**: Chroma with GitHub-style theme
- **Social Automation**: AI-generated Bluesky posts for new articles

## Local Development

```bash
# Install Hugo (macOS)
brew install hugo

# Clone the repository
git clone https://github.com/philippdubach/philippdubach.github.io.git
cd philippdubach.github.io

# Start development server
hugo server -D

# Build for production
hugo --minify
```

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to `main`:

1. Hugo builds the site with `--minify`
2. IndexNow key file is generated
3. Site is deployed to GitHub Pages
4. IndexNow workflow submits updated URLs to search engines

### Social Automation

The social automation worker monitors the RSS feed and posts to Bluesky:

```bash
cd social-automation/worker
npm install
npx wrangler login
npx wrangler deploy
```

Required secrets (set via `wrangler secret put`):
- `BLUESKY_HANDLE` - Your Bluesky handle
- `BLUESKY_APP_PASSWORD` - App password from Bluesky settings
- `API_SECRET` - Secret for manual trigger endpoint

## Configuration

Key settings in `hugo.toml`:

| Setting | Description |
|---------|-------------|
| `params.math` | Enable MathJax globally (default: false) |
| `params.default_image` | Fallback Open Graph image |
| `pagination.pagerSize` | Posts per page (default: 10) |
| `markup.goldmark.renderer.unsafe` | Allow raw HTML in markdown |

## Content Frontmatter

```yaml
---
title: "Post Title"
date: 2024-01-15
description: "SEO description"
seoTitle: "Shorter SEO title (optional)"
math: true  # Enable MathJax for this page
tags: ["Project"]  # Use "Project" tag for projects
keywords: ["keyword1", "keyword2"]
images: ["https://static.philippdubach.com/ograph/image.jpg"]
external_url: "https://example.com"  # Original source link
robots: "noindex, nofollow"  # Optional: custom robots directive
---
```

## License

Content © Philipp D. Dubach. Code is available under MIT License.

## Contact

- Website: [philippdubach.com](https://philippdubach.com)
- Email: info@philippdubach.com
- GitHub: [@philippdubach](https://github.com/philippdubach)
