# Post Composer

Markdown editor with live preview for philippdubach.com blog posts. Deployed on Cloudflare Pages.

## Features

- Live preview matching blog styling
- Syntax highlighting in editor
- Focus mode for distraction-free writing
- Hugo shortcode support (images, tables, newsletter, disclaimers)
- KaTeX math rendering
- Auto-closing brackets
- AI-powered SEO metadata generation
- Auto-save to localStorage
- Export as .md file or copy to clipboard

## Development

```bash
cd composer
npx wrangler pages dev . --port 8788
```

## Deploy

```bash
cd composer
npx wrangler pages deploy . --project-name post-composer
```

## Environment Variables

Set via Cloudflare Dashboard or CLI:

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY
```

## Keyboard Shortcuts

- `Cmd/Ctrl + S` - Download markdown file
- `Cmd/Ctrl + E` - Copy to clipboard
- `Escape` - Exit focus mode
