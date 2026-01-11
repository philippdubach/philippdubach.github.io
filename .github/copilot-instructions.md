# Copilot Instructions

This is a Hugo static site for philippdubach.com, a personal blog covering Quantitative Finance, AI Strategy, and Macroeconomics.

## Tech Stack

- Hugo v0.149.0 static site generator
- Deployed on GitHub Pages
- GoatCounter analytics
- Cloudflare CDN for images (static.philippdubach.com)
- Cloudflare Pages for composer tool

## Code Style

- Use semantic HTML with proper ARIA attributes
- CSS follows BEM-like naming with clear section comments
- Keep JavaScript vanilla, no frameworks
- Prefer CSS solutions over JavaScript where possible

## Content Structure

- Posts in `content/posts/` with format `YYYYMMDD-slug.md`
- Images hosted on static.philippdubach.com via `{{< img >}}` shortcode
- Disclaimers via `{{< disclaimer type="finance|medical|ai|research|gambling" >}}`
- Newsletter signup via `{{< newsletter >}}`

## Key Files

- `layouts/_default/single.html` - Post template
- `layouts/partials/footer.html` - Site footer with social links
- `layouts/partials/related.html` - Related posts
- `static/css/custom.css` - All styling
- `hugo.toml` - Site configuration

## Social Links

- Newsletter: /subscribe/
- GitHub: philippdubach
- Bluesky: philippdubach.com
- Email: me@philippdubach.com
