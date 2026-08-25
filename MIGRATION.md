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
