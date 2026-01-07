# Post Composer

A local markdown editor with live preview that matches your blog's styling.

## Features

- **Live Preview**: Real-time rendering as you type
- **Hugo Shortcodes**: Support for `{{< img >}}`, `{{< table >}}`, `{{< newsletter >}}`, and `{{< disclaimer >}}`
- **Math Support**: KaTeX rendering for LaTeX math (enable "Math" checkbox)
- **Syntax Highlighting**: Code blocks with GitHub-style highlighting
- **Frontmatter Editor**: Visual fields for title, date, external URL, draft status
- **Auto-save**: Drafts are saved to localStorage automatically
- **Export**: Download as `.md` file or copy to clipboard

## Shortcodes

```markdown
# Image
{{< img src="path/to/image.jpg" alt="Description" width="80%" >}}

# Embedded Table/HTML
{{< table src="table.html" height="600px" >}}

# Newsletter signup
{{< newsletter >}}

# Disclaimer (types: finance, medical, general, ai, research, gambling)
{{< disclaimer type="finance" >}}
```

## Keyboard Shortcuts

- `Cmd/Ctrl + S`: Download markdown file
- `Cmd/Ctrl + E`: Copy markdown to clipboard

## Local Development

```bash
cd composer
npx wrangler pages dev . --port 8788
```

Then open http://localhost:8788

## Deploy to Cloudflare Pages

```bash
cd composer
npx wrangler pages deploy . --project-name post-composer
```

This creates a private preview URL. The page is not linked to your main site.

## Notes

- Images use `https://static.philippdubach.com/` as the base URL
- Tables embed from `https://static.philippdubach.com/html/`
- The preview matches your blog's styling from `custom.css`
