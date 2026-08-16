# philippdubach.com

Quantitative Finance, Machine Learning, and Complex Systems.

**👉 [philippdubach.com](https://philippdubach.com)**

| | |
|---|---|
| RSS | [philippdubach.com/index.xml](https://philippdubach.com/index.xml) |
| JSON Feed | [philippdubach.com/feed.json](https://philippdubach.com/feed.json) |
| Newsletter | [philippdubach.com/subscribe](https://philippdubach.com/subscribe/) |
| Bluesky | [@philippdubach.com](https://bsky.app/profile/philippdubach.com) |
| GitHub | [philippdubach](https://github.com/philippdubach) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Site Generator** | Hugo v0.165.0 Extended |
| **Hosting** | Hetzner (primary), GitHub Pages (warm standby) |
| **CDN** | Cloudflare |
| **Images** | Cloudflare R2 (`static.philippdubach.com`) |
| **Analytics** | GoatCounter (privacy-first, no cookies) |
| **Security Headers** | Cloudflare Worker (HSTS, CSP, COEP, COOP) |
| **Math** | MathJax 3.2.2 (SRI-verified) |
| **Code Highlighting** | Chroma (Hugo built-in) |
| **Social Automation** | Cloudflare Workers AI + Queues + Durable Objects |

---

## Project Structure

```
├── hugo.toml                 # Site configuration
├── content/
│   ├── posts/                # Blog articles (YYYYMMDD-slug.md)
│   ├── faq/                  # Category FAQ pages (aggregated from post frontmatter)
│   ├── categories/           # Category landing pages
│   ├── projects/             # Project showcase
│   └── standalone/           # Landing pages
├── layouts/
│   ├── _default/             # Base templates + feed formats (JSON Feed, Posts API, llms.txt)
│   ├── partials/             # Components (head, header, sidebar, footer, related)
│   └── shortcodes/           # img, disclaimer, newsletter, readnext
├── static/css/custom.css     # All styling (inlined at build time)
├── data/
│   ├── navigation.yaml       # Nav menu config
│   └── research.yaml         # Research publications (SSRN papers, DOIs)
└── social-automation/
    ├── shared/               # Shared discovery, generation, scoring, and delivery gate
    ├── bluesky worker/       # Auto-post to Bluesky
    ├── twitter worker/       # Auto-post to Twitter/X
    ├── goatcounter-worker/   # "Most Read" posts API proxy
    ├── security-headers/     # HTTP security headers Worker
    └── build-trigger/        # Scheduled publication build trigger
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
takeaways = [             # Key Takeaways box (GEO)
  "Data-first takeaway with specific numbers",
  "Second takeaway, no em dashes",
]
+++
```

### Custom Shortcodes

| Shortcode | Usage |
|-----------|-------|
| `{{< img >}}` | Images from static.philippdubach.com CDN |
| `{{< disclaimer type="finance" >}}` | Contextual disclaimers (finance, medical, ai, research, gambling) |
| `{{< newsletter >}}` | Newsletter signup form |
| `{{< readnext slug="post-slug" >}}` | Inline "Related" link to another post |

---

## Social Automation

Cloudflare Workers discover new articles, generate social copy, and deliver it through a Queue-backed side-effect gate. Deployment notifications provide prompt discovery; a six-hour cron remains as the recovery path.

### Architecture

```text
RSS / manual trigger → Workers AI → Queue → Durable Object gate → Social platform
                                      └────→ DLQ + KV archive on exhaustion
```

### Bluesky Worker

| | |
|---|---|
| URL | `social-poster.philippd.workers.dev` |
| Trigger | Deployment notification, six-hour cron, or `POST /trigger` |
| Models | `@cf/openai/gpt-oss-120b` and `@cf/openai/gpt-oss-20b` |
| Delivery | Queue + SQLite Durable Object gate + DLQ |
| Features | RSS parsing, candidate scoring, link card embedding |

### Twitter Worker

| | |
|---|---|
| URL | `twitter-poster.philippd.workers.dev` |
| Trigger | Deployment notification, six-hour cron, or `POST /trigger` |
| Models | `@cf/openai/gpt-oss-120b` and `@cf/openai/gpt-oss-20b` |
| Delivery | Queue + SQLite Durable Object gate + DLQ |
| Auth | OAuth 1.0a |

### AI Post Generation

The Workers generate candidates with two models, validate the structured output, and select a candidate with deterministic scoring. The style constraints include:

- Neutral, factual tone (no clickbait)
- Max 200 characters
- No emojis or hashtags
- Varied sentence structure
- Extensive banned word list (AI slop words filtered)

Non-dry manual routes return HTTP 202 after enqueue. Dry routes remain synchronous and do not mutate Queue, KV, Durable Object, or social-platform state. Ambiguous external writes become terminal `uncertain` and are not replayed automatically.

Validate and deploy from the workspace root with Node 24.19.0 and the committed Wrangler 4.123.0 lock:

```bash
cd social-automation
nvm use
npm ci --ignore-scripts
npm test
npm run check
npm run deploy --workspace social-poster-worker
npm run deploy --workspace twitter-poster
```

Queue names, individual Worker release commands, rollback steps, and DLQ reconciliation are in [OPERATIONS.md](OPERATIONS.md).

---

## UI/UX Features

### Layout
- Tabbed homepage with Articles/Projects tabs, year dividers, and thumbnail images
- Responsive mobile design with collapsible navigation
- Related posts section with centered heading
- "Most Read" footer section powered by live GoatCounter data

### Typography & Spacing
- Post spacing: 3.75rem gap between articles
- Consistent footer margins across devices
- Professional category/tag styling

### Disclaimers
Context-aware disclaimers that:
- Display on individual post pages
- Hidden on homepage/list views
- Types: finance, medical, ai, research, gambling

### Machine-Readable Outputs
- `/index.xml` — RSS 2.0 with XSLT stylesheet
- `/feed.json` — JSON Feed 1.1
- `/api/posts.json` — Posts API for programmatic access
- `/llms.txt`, `/llms-full.txt` — AI/LLM crawler discovery
- `/sitemap.xml` — Dynamic sitemap with git-based lastmod
- `/.well-known/api-catalog` — RFC 9264 Linkset enumerating the above (RFC 9727)
- `/index.md`, `/posts/<slug>/index.md`, `/categories/<term>/index.md` — Markdown variant of every page; also returned by content negotiation when `Accept: text/markdown` is sent to the HTML URL
- `Link:` response header on every page advertises the catalog, sitemap, feeds, and per-page markdown alternate (RFC 8288)

---

## Security

| Feature | Implementation |
|---------|----------------|
| Security Headers | Cloudflare Worker injecting HSTS, CSP, COEP, COOP, Permissions-Policy |
| CSP | Strict Content-Security-Policy with `frame-ancestors` (synced across Worker, head.html, _headers) |
| SRI | GoatCounter and MathJax verified with integrity hashes |
| CI Hardening | SHA-pinned GitHub Actions, Hugo binary checksum verification |
| Headers | X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| Input Validation | All worker inputs sanitized |
| Rate Limiting | API endpoints protected |
| Auth | API key + HMAC sessions on workers |

---

## Changelog

### August 2026
- Upgraded Hugo from v0.161.1 to v0.165.0; canonicalized RSS discovery at `/index.xml` while retaining permanent redirects from legacy `/feed/` paths; refreshed the local diff harness for the paired toolchain versions
- Upgraded the primary host to Forgejo 15.0.6 and the current Debian kernel after a successful isolated PostgreSQL and repository restore drill; preserved paired recovery backups and exact rollback artifacts
- Standardized all five Workers on Node 24.19.0, Wrangler 4.123.0, one committed lockfile, compatibility date `2026-08-16`, structured observability, and dry-run packaging in CI
- Moved Bluesky and Twitter publication behind platform Queues, DLQs, and SQLite Durable Object gates; ambiguous external writes are terminal and require reviewed reconciliation instead of automatic replay
- Documented the Forgejo/Hetzner primary deployment, GitHub Pages standby, backup gate, Worker release process, and incident rollback in `OPERATIONS.md`

### May 2026
- Upgraded Hugo from v0.157.0 to v0.161.1; byte-identical output, zero deprecation warnings; added a local diff harness (`scripts/upgrade-diff.sh`) for validating future upgrades against two binaries
- Pruned 8 of 9 dead/harmful post-render regex passes in `single.markdown.md`; the math-delimiter regex was corrupting Wikipedia URLs like `Universal_Serial_Bus_\(USB\)` into `_$USB$_`. Replaced an 8-call entity-decode chain with `strings.ReplacePairs`. Fixed double-quote entity decode (`&ldquo;`/`&rdquo;` were mapping to `'` instead of `"`)
- Redesigned articles + projects indexes: hero dropped, featured row is the masthead (red overline + rule), hairline divider, filter chips, year markers; quiet `page-label` H1 for SEO/a11y. Featured card image now requests landscape source matching the CSS aspect-ratio
- Refactored markdown variants to output-format-aware sibling shortcodes (`img.markdown.md`, `disclaimer.markdown.md`, `newsletter.markdown.md`, `readnext.markdown.md`); HTML pollution no longer enters the markdown stream. Added YAML preamble for AI/RAG ingestion; dropped the `eq .Section "posts"` gate so `/about/`, `/research/`, `/subscribe/` ship markdown content too
- Hardened bluesky and twitter workers from a parallel perf/reliability/security audit: fixed Bluesky 300-char overflow (LLM cap reserves URL+separator budget), merged duplicate article fetches, added cron concurrency lock via 60s KV sentinel, gated OG image fetch behind a trusted-domain SSRF check; sanitized GoatCounter titles at the Worker boundary
- Template hardening: `readnext` shortcode emits `warnf` on bad slug; FAQ aggregation extracted to a cached partial (one scan per category, was running twice per faq/* page); homepage and projects `ItemList` JSON-LD capped at 20 entries; `posts.json` prefers `.Description` over `.Summary` to skip ~86 markdown renders per build
- Extracted `posts-sorted-by-date.html` partial cached via `partialCached` with no variant — site-invariant scan runs once per build instead of per-post-page
- Decommissioned the post composer (`post-composer.pages.dev`) and URL shortener (`pdub.click`); deleted source, KV namespaces, and D1 database via wrangler
- Accessibility: sidebar wordmark `aria-label` now starts with the visible text per WCAG 2.5.3; newsletter card meta darkened to hit 7.0:1 contrast on the pink tint (was 3.91:1, below AA)
- Bumped wrangler to 4.87.0 in remaining workers (bluesky, twitter, goatcounter)

### April 2026
- Shipped agent-readiness improvements: RFC 8288 `Link` headers on every response advertising machine-readable resources (api-catalog, sitemap, RSS, JSON Feed, llms.txt, per-page `.md` alternate)
- Added `/.well-known/api-catalog` (RFC 9264 Linkset / RFC 9727) enumerating discoverable endpoints
- Added markdown content negotiation: `Accept: text/markdown` returns a markdown variant of any post, section, or homepage with `Content-Type: text/markdown`, `Vary: Accept`, and `x-markdown-tokens`
- Refactored security-headers Worker into focused modules with a 58-test suite, using the Cache API with variant-aware keys to keep HTML and Markdown isolated under the same URL
- Declared `Content-Signal: search=yes, ai-input=yes, ai-train=yes` in robots.txt per draft-romm-aipref-contentsignals
- Hugo now emits `Markdown` output for `home`, `section`, and `term` (post-level was already in place)

### March 2026
- Upgraded Hugo from v0.128.0 to v0.157.0, fixed deprecated `.Site.AllPages` and `.Site.Data` APIs

### February 2026
- Unified all 73 posts to TOML frontmatter (converted 70 from YAML)
- Added Key Takeaways (GEO) to all 73 posts for AI search citation
- Streamlined post layout: unified left-bordered asides (3px), consistent vertical spacing rhythm, image breathing room
- Redesigned homepage with tabbed Articles/Projects layout and thumbnail images via Cloudflare Image Resizing
- Deployed security headers Cloudflare Worker (HSTS, CSP, COEP, COOP, Permissions-Policy)
- Added JSON Feed 1.1, Posts API, and llms.txt/llms-full.txt output formats
- Built GoatCounter "Most Read" API worker for live footer data
- Added FAQ section with per-category pages and FAQPage structured data
- Added `readnext` shortcode for inline related post links
- Styled RSS feed with XSLT, stripped lightbox overlays from feed content
- Automated Cloudflare cache purge in GitHub Actions deployment
- Added dynamic research page with structured data
- SHA-pinned all GitHub Actions, added Hugo binary checksum verification

### January 2026
- Upgraded social automation AI model to Llama 3.3 70B (from 3.1 8B)
- Fixed mobile footer spacing consistency
- Increased homepage post spacing to 3.75rem
- Fixed disclaimer visibility (post pages only)
- Centered related posts heading
- Created Copilot instructions file

### November 2025
- Social automation workers deployed
- GoatCounter analytics integration

---

## License

Content © Philipp D. Dubach. Code under MIT.
