# Post Composer

A secure, performant markdown editor with live preview for philippdubach.com blog posts, deployed on Cloudflare Pages.

## Features

### Editor
- **Live Preview** - Real-time rendering matching blog styling
- **Syntax Highlighting** - Color-coded markdown in the editor (headings, code, links, etc.)
- **Focus Mode** - Distraction-free writing with centered editor
- **Shortcode Support** - Hugo shortcodes for images, tables, newsletter signup, and disclaimers
- **Math Rendering** - KaTeX support for LaTeX equations
- **Auto-save** - Drafts saved to localStorage automatically
- **Export** - Download as `.md` file or copy to clipboard

### Frontmatter Management
- **YAML Parsing** - Paste complete Hugo posts and frontmatter is auto-parsed
- **Collapsible Sections** - Essential, SEO, and Advanced field groups
- **Field Validation** - Visual badges showing field completion

### AI-Powered SEO
- **Generate SEO Metadata** - Claude-powered title, description, and keyword generation
- **SEO Guidelines** - Optimized for search (50-60 char titles, 120-160 char descriptions)

## Architecture

\`\`\`
composer/
├── index.html              # Single-page application (HTML/CSS/JS)
├── functions/
│   └── generate-seo.js     # Cloudflare Pages Function (Auto SEO endpoint)
├── robots.txt              # Disallow all crawlers (private tool)
├── package.json            # Project metadata and scripts
└── README.md               # This file
\`\`\`

## Security

- **XSS Prevention** - User input sanitized via \`textContent\` and \`sanitizeText()\`
- **CORS Restriction** - API restricted to allowed origins only
- **Input Validation** - Content length limits (50-50,000 chars)
- **API Key Protection** - Anthropic key stored as Cloudflare Pages secret
- **No Indexing** - \`robots.txt\` and meta tag prevent search indexing

## Performance

- **DOM Caching** - All frequently-accessed elements cached on load
- **requestAnimationFrame** - Syntax highlighting uses rAF for smooth updates
- **Debounced Preview** - 100ms debounce prevents excessive re-renders
- **CDN Assets** - External libraries loaded from jsDelivr CDN

## Reliability

- **localStorage Fallback** - Graceful degradation if storage unavailable
- **Error Handling** - Try-catch blocks with console warnings
- **Proper Initialization** - DOM cache initialized before any operations

## Configuration

### Environment Variables (Cloudflare Pages)

| Variable | Description |
|----------|-------------|
| \`ANTHROPIC_API_KEY\` | API key for Claude SEO generation |

Set via Cloudflare Dashboard or CLI:
\`\`\`bash
npx wrangler pages secret put ANTHROPIC_API_KEY
\`\`\`

### Allowed CORS Origins

The SEO function accepts requests from:
- \`https://post-composer.pages.dev\` (production)
- \`http://localhost:8788\` (local development)
- \`http://127.0.0.1:8788\` (local development)

## Development

### Local Development

\`\`\`bash
cd composer
npx wrangler pages dev . --port 8788
\`\`\`

Open http://localhost:8788

### Deploy to Production

\`\`\`bash
cd composer
npx wrangler pages deploy . --project-name post-composer
\`\`\`

## Shortcodes

\`\`\`markdown
# Image (uses static.philippdubach.com)
{{< img src="path/to/image.jpg" alt="Description" width="80%" >}}

# Embedded Table/HTML
{{< table src="table.html" height="600px" >}}

# Newsletter signup form
{{< newsletter >}}

# Disclaimer (types: finance, medical, general, ai, research, gambling)
{{< disclaimer type="finance" >}}
\`\`\`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Cmd/Ctrl + S\` | Download markdown file |
| \`Cmd/Ctrl + E\` | Copy markdown to clipboard |
| \`Escape\` | Exit focus mode |

## Export Formats

Downloaded files follow Hugo naming convention:
\`\`\`
YYYYMMDD-slug-from-title.md
\`\`\`

## Dependencies (CDN)

| Library | Version | Purpose |
|---------|---------|---------|
| KaTeX | 0.16.9 | Math equation rendering |
| Highlight.js | 11.9.0 | Code syntax highlighting |
| Marked.js | latest | Markdown parsing |
| js-yaml | 4.1.0 | YAML frontmatter parsing |

## Browser Support

Modern browsers with ES6+ support (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)

## Related

- **Main Site**: [philippdubach.com](https://philippdubach.com) (Hugo on GitHub Pages)
- **Static Assets**: [static.philippdubach.com](https://static.philippdubach.com) (Cloudflare R2)
- **Composer**: [post-composer.pages.dev](https://post-composer.pages.dev) (This project)
