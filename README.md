# philippdubach.com

This repository contains the Hugo source for philippdubach.com.
It combines the current articles, projects, and research records with a custom reading-focused design.

## Production

Forgejo at `code.philippdubach.com` is the source of truth.
A Forgejo webhook builds and releases the site on the production host.
A push to GitHub builds the GitHub Pages warm standby through `.github/workflows/hugo.yml`, purges the Cloudflare cache, and notifies the social Workers; a successful Pages build starts IndexNow.
Deployments run only from `main`.

See `OPERATIONS.md` for the production runbook, `HUGO_UPGRADE.md` for the Hugo upgrade procedure, and `social-automation/` for the Cloudflare Worker sources.

## Features

- A sparse serif interface with a 720 px reading column.
- A stable desktop rail and a compact mobile menu.
- Responsive layouts from 320 px to large desktop screens.
- Light, dark, saved, and system theme modes.
- Writing filters that support URLs such as `/writing/?topic=ai`.
- Article contents, scroll tracking, link previews, figures, and callouts.
- Projects, research records, feeds, structured data, and discovery files.
- GoatCounter analytics, MathJax rendering, and a Content Security Policy synced with the security-headers Worker.
- A live newsletter form that keeps a safe preview mode on localhost.
- Accessible landmarks, focus styles, and 44 px control targets.

## Requirements

- Hugo Extended 0.165.0.
- Node.js 22 or later.

The project has no third-party Node package dependency.

## Start the site

Run the development server:

```sh
npm run dev
```

Open `http://localhost:1313/`.

Hugo watches source files and refreshes the preview after each change.

## Build and test

Create a production-style local build:

```sh
npm run build
```

Run all build and migration checks:

```sh
npm run check
```

Inspect Hugo template metrics:

```sh
hugo --gc --minify --panicOnWarning --templateMetrics --templateMetricsHints
```

Generated files go to `public/`.
Git ignores this directory.

## Project structure

```text
assets/
  css/                 Site styles
  js/                  Navigation, theme, filters, and article behavior
content/
  posts/               Articles and project posts
  faq/                 Topic FAQ pages
  writing/             Writing archive section
  projects/            Project archive section
data/
  research.yaml        Publication and research records
layouts/
  _default/            Base list, page, feed, and discovery templates
  partials/            Navigation and reusable page components
  shortcodes/           Editorial and migrated-content shortcodes
scripts/               Build, layout, and migration checks
static/                 Files copied directly to the generated site
hugo.toml               Site, output, taxonomy, and local service settings
```

## Public routes

- `/` is the identity page.
- `/writing/` lists non-project posts in chronological order.
- `/posts/<slug>/` is the canonical article route.
- `/projects/` lists posts whose front matter uses `type = "Project"`.
- `/research/` renders records from `data/research.yaml`.
- `/about/` contains the full biography and research profile links.
- `/subscribe/` contains the local newsletter preview.
- `/faq/`, `/categories/`, and `/tags/` expose supporting indexes.

Existing aliases remain available for inbound links.
The generated `/posts/` index stays suppressed to match the source site.

## Content model

Posts use the migrated Hugo front matter as their canonical source.
The templates derive archive data without a mass front matter rewrite.

Common fields include:

- `title` for the visible article title.
- `seoTitle` for an optional search title.
- `description` for summaries and metadata.
- `date`, `publishDate`, and `lastmod` for publication history.
- `categories`, `tags`, and `keywords` for classification.
- `type = "Project"` for project selection.
- `aliases` for preserved inbound routes.
- `images` and `card_image` for social and archive images.
- `math = true` for pages that require mathematical rendering.
- `takeaways` and `faq` for structured editorial sections.

Research records use the existing schema in `data/research.yaml`.
Do not rename its fields without updating the research template and checks.

## Shortcodes

The site supports these editorial shortcodes:

```go-html-template
{{</* callout title="Note" */>}}
Markdown content.
{{</* /callout */>}}

{{</* figure src="figure.png" alt="Required description" caption="Optional caption" */>}}

{{</* preview-link href="/research/" title="Research" text="Publication record" icon="note" */>}}Research{{</* /preview-link */>}}
```

The `figure` shortcode requires an article leaf bundle and nonempty alternative text.
Preview links use local metadata and make no preview request.

Compatibility shortcodes preserve migrated content:

- `disclaimer`
- `img`
- `newsletter`
- `readnext`
- `video`

An unsupported shortcode must stop the Hugo build.
Do not remove or replace content silently.

## Images and external requests

Article images can remain on `static.philippdubach.com`.
The templates preserve the existing responsive image transformations.

The local site makes no analytics, automation, webhook, or newsletter request.
It loads no remote font.

## Newsletter preview

The newsletter form validates the email address in the browser.
It then displays `Preview only — no subscription was created`.

The form makes no API request in preview mode.
The production endpoint remains in `hugo.toml` for a later deployment phase.

## Discovery output

The local build generates these discovery formats:

- RSS.
- JSON Feed.
- Posts API JSON.
- Markdown page variants.
- Sitemap and robots files.
- `llms.txt` and `llms-full.txt`.
- An API catalog.
- Open Graph and JSON-LD metadata.

Cloudflare content negotiation and production headers remain outside this repository.

## Verification

`npm run check` performs four steps:

1. Hugo builds with garbage collection, minification, and warning failure.
2. The build check validates pages, links, headings, landmarks, feeds, and metadata.
3. The layout check validates stable geometry at six viewport widths.
4. The migration check compares the imported post and route manifests.

The responsive widths are 320, 390, 768, 1024, 1440, and 1800 px.

Run the full check before each repository update.
Run template metrics after a template or shortcode change.

## Migration record

The content came from `philippdubach/philippdubach.github.io` at commit `1f4c38dc0316a87079ec492f9458b2f0ad4ffd97`.
The migration imported 88 posts, 17 projects, 8 research records, and 38 aliases.

See [MIGRATION.md](MIGRATION.md) for the migration scope and exclusions.

## Deployment

Deployment, DNS, analytics, Cloudflare services, and newsletter delivery are not configured here.
Treat this repository as the standalone source for a future deployment phase.
