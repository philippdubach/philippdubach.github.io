# Local Migration Report

## Source

- Repository: `philippdubach/philippdubach.github.io`
- Commit: `1f4c38dc0316a87079ec492f9458b2f0ad4ffd97`
- Local input: `/private/tmp/pdd-current-site`
- Imported post files: 88
- Research records: 8
- Preserved aliases: 38

The source clone remained unchanged during this migration.

## Imported data

The migration imported the current content, taxonomy pages, FAQ pages, research data, and neutral static files.
It did not import the old visual theme.

The migration supports these source shortcodes:

- `disclaimer`
- `img`
- `newsletter`
- `readnext`
- `video`

The build stops when Hugo finds an unknown shortcode.

## Excluded systems

The migration did not import these systems:

- Deployment workflows
- Cloudflare Workers
- Social automation
- GoatCounter
- IndexNow
- Production security headers
- Newsletter API requests
- Source repository history

The local build can request article images from `static.philippdubach.com`.

## Route policy

The migration keeps each source post permalink and alias.
The `/writing/` route provides the new editorial archive.
Each article keeps its canonical `/posts/<slug>/` route.
The source suppresses the `/posts/` index, so the migration also suppresses it.

## Verification

Run `npm run check` to create a clean build and run all checks.
The checks compare the source and destination post manifests.
They also check canonical URLs, landmarks, headings, links, image text, feeds, and local side effects.

## Branch re-integration (editorial-redesign)

This branch merges the editorial design into the production repository and restores the systems that the standalone migration excluded:

- GoatCounter analytics in `layouts/_default/baseof.html`, guarded against the development server.
- The Content Security Policy meta tag in `layouts/partials/head.html`, synced with `static/_headers` and `social-automation/security-headers/src/index.js`.
- MathJax 3.2.2 with subresource integrity in `layouts/partials/math.html`, mounted for pages with `math = true`.
- The full structured data graph in `layouts/partials/structured-data.html` with speakable selectors mapped to the editorial markup (`.page-intro`, `.article-body p`, `.faq-list dd`, `.key-takeaways li`, `.article-header h1`).
- FAQ pages that aggregate question and answer pairs from posts through `layouts/partials/faq-posts-by-category.html`, capped at 20 items to match the FAQPage schema.
- A live newsletter form: `layouts/partials/newsletter-form.html` posts to the newsletter API, shows the subscriber count, and records a GoatCounter event. Localhost keeps the preview behavior and sends no request.
- Production configuration: git-based lastmod, full-content RSS with stripped asides, social parameters, and the production title and description.

The migration checks now compare against a pinned git worktree:

```sh
git worktree add --detach /private/tmp/pdd-main-worktree 1f4c38dc
```

Deployment workflows, Cloudflare Worker sources, operations documentation, and SEO briefs were never removed from this repository and require no re-import.
