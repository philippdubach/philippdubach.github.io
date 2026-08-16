# Hugo upgrade plan: 0.157.0 → 0.161.1

Backlog of improvements tied to the Hugo upgrade window 0.157 → 0.161, plus stale-code cleanup that should ride alongside. Captured 2026-05-04 from a parallel changelog research + codebase audit.

## Anchors

- Current pin: **v0.157.0** (Feb 2026, set in `.github/workflows/hugo.yml:41,47`)
- Latest stable: **v0.161.1** (Apr 2026)
- 4 minor releases, ~2 months of development
- Headline feature: **`css.Build`** (0.158-0.161) — native CSS bundler/transformer/minifier in Hugo Pipes
- Everything else: bug fixes, security patches, deprecation warnings, filename-identifier scheme

---

## 1. Real wins — changelog matches a current pain point

- [ ] **A. `css.Build` could replace the inlined-CSS pipeline.** `head.html:85-86` uses `{{ readFile "static/css/custom.css" | safeCSS }}` to inline ~1000 lines into `<style>` on every page. At 240+ pages, that's 240 disk reads. `css.Build` (Hugo 0.158+) is a proper asset pipeline: bundling, source maps, minification, content-hashed filenames. From 0.160 it supports `@import 'hugo:vars'` for injecting Hugo config values into CSS. You can still inline via `{{ (resources.Get "css/custom.css" | css.Build).Content | safeCSS }}` if you want to keep the no-external-request CSP win. Caveat: dev-iteration model changes; spike before committing.

- [ ] **B. `strings.ReplacePairs` (0.158) collapses the entity-decode chain.** `index.llmsfulltxt.txt:25-33` has six chained `replace` calls decoding HTML entities (`&rsquo;`, `&lsquo;`, `&ldquo;`, etc.). One `strings.ReplacePairs` call replaces them all. ~5 min change.

- [ ] **C. RenderShortcodes context leak fix (0.160.1).** `single.markdown.md:76` wraps body in `.RenderShortcodes`; a pipeline of regex strips at lines 78-96 cleans up "context markers" and indentation artifacts. 0.160.1 fixed two RenderShortcodes bugs (#12457 indented-shortcode context leak, #14732 stray context markers). After upgrade, probably can delete one or two of the defensive regex passes. Test against the live `index.md` output before deleting.

- [ ] **D. Goldmark passthrough panic in headings (0.160.1).** No current posts have math in `##` headings, but this is a free correctness gain. No work required beyond the upgrade itself.

- [ ] **E. Security patches.**
    - 0.158 → Go 1.26.1, patches CVE-2026-27142 in `text/template`
    - 0.159.2 → XSS sanitization for `javascript:` / `data:` URLs in markdown links/images
    No current content uses these schemes. Defense-in-depth, free with upgrade.

---

## 2. Adjacent stale code — audit flagged, not blocked by version

These aren't tied to the 0.157→0.161 window but the upgrade is a natural time to fix them since you're already touching templates.

- [ ] **`newScratch` year-tracking** (`index.html:48`, `projects/list.html:28`): can be plain `$prevYear := 0` / `$prevYear = ...`. Hugo has supported mutable `$var` inside range since v0.48. ~6-line cleanup × 2 templates.

- [ ] **Card image regex on `.RawContent`** (audit §1): the `findRESubmatch` pattern scanning `{{< img src="..." >}}` is duplicated in `index.html:74`, `projects/list.html:49`, plus two more places for GitHub URL extraction (`single.html:51`, `projects/list.html:104,120`, `structured-data.html:307`). Move to `partials/extract-card-image.html` and `partials/extract-repo-url.html`. ~30 lines deduplicated.

- [ ] **`unlisted` filter duplicated 11+ times** (audit §5): `where ... ".Params.unlisted" "ne" true` in nearly every collection query (`index.html:21`, `projects/list.html:20`, `rss.xml:7`, `index.jsonfeed.json:1`, `index.postsapi.json:1`, `index.llmstxt.txt:2`, `index.llmsfulltxt.txt:2`, `partials/related.html:5`, `partials/post-number.html:7`, `partials/structured-data.html:66`, `_default/list.html:11`). Either a `partials/site-pages.html` helper or a `cascade` rule on the section index that defaults `unlisted = false`.

- [ ] **`post-number.html` 240-iteration scan per render** (audit §7): sorts the entire posts collection on every post render. Use `partialCached "post-number.html" . .RelPermalink` so each page gets one cache entry. At 240 posts this is the single biggest build-time win available.

- [ ] **FAQ aggregation duplicated** between `layouts/faq/single.html:15-31` and `partials/structured-data.html:506-521`. Extract to a partial returning a slice; both consumers iterate the result.

---

## 3. Breaking changes / things to verify on upgrade

- **Node ≥ 22** if you use PostCSS/Babel/Tailwind via Hugo (0.161.0). Not used here — CSS is hand-written. GitHub Actions runner already has Node 22.
- **Page-resource auto-fallback removed** across roles/versions (0.161.0). Not used here.
- **Tailwind standalone removed** (0.161.0). Not used here.
- **Default render-hook URL sanitization** (0.159.2): markdown links with `javascript:` / `data:` schemes now stripped. No current content uses these.

## 4. Deprecation warnings to silence

Won't break in 0.161.1 but emit warnings. Rename to skip the cycle:

- [ ] `languageCode = "en"` → `locale = "en"` (0.158)
- [ ] `:filename` permalink token → `:contentbasename` (0.159) — verify if present in `[permalinks]`
- [ ] Test/doc keys: `excludeFiles` / `includeFiles` → `files` (0.159) — only matters if used in shortcode docs

Run `0.161.1` locally first; the deprecation warnings will tell you which actually apply.

---

## Recommended order

1. [ ] **Bump CI.** `HUGO_VERSION` + the `.deb` checksum in `.github/workflows/hugo.yml:41,47`. Run a full build locally first against 0.161.1, capture any deprecation warnings.
2. [ ] **Drop redundant regex passes** in `single.markdown.md:76-96` after verifying the 0.160.1 RenderShortcodes fix obsoleted them. One pass at a time, diff against live `index.md` output.
3. [ ] **Replace entity-decode chain** in `llms-full.txt:25-33` with `strings.ReplacePairs`.
4. [ ] **`partialCached` on `post-number.html`** — biggest perf win, isolated change.
5. [ ] **Spike `css.Build`** as an experiment branch. Prove out the dev-iteration story before adopting.
6. [ ] **Stale-code cleanup** (newScratch, card-image regex, unlisted filter, FAQ aggregation) — bundle into a single "template hygiene" PR.

Items 1-4 are ~1-2 hours and the responsible baseline before adding more features. Item 5 is the only one with material payoff and material risk; doesn't have to happen now. Item 6 is overdue cleanup that rides well alongside 5.

---

## Deferred maintenance assessment — 2026-08-16

This is a saved decision log for a later maintenance pass. It supersedes the historical version anchors above, but does not authorise a blind bulk upgrade.

1. **Hugo: upgrade 0.161.1 → 0.165.0 Extended in a dedicated change.** The newer releases add template and URL hardening, fix a build-performance regression affecting larger sites, and fix macOS `hugo server` static-file and atomic-save issues. Update the CI version and verified `.deb` checksum together; first run a local production build and `scripts/upgrade-diff.sh`, then inspect HTML, RSS, JSON Feed, Posts API, LLM text outputs, Markdown variants, sitemap and robots output. Do not combine this with template refactors.

2. **Forgejo: take the 15.x LTS patch first.** The public instance reported 15.0.2 during the audit; 15.0.5 was the current 15.x patch. Back up and test the patch upgrade in the normal server-maintenance window. Keep a 16.x major upgrade separate until its migration impact has been assessed.

3. **Workers: establish a reproducible toolchain before changing runtime behaviour.** Bluesky, Twitter and GoatCounter declare `wrangler: ^4.87.0`, while their local locks resolve 4.94.0; audit findings identified Wrangler 4.115.0 as current. Standardise the Worker manifests, committed lockfiles and a supported Node policy (use an active LTS release, not Node 25), then test each Worker before deployment. Refresh compatibility dates one Worker at a time, starting with the security-headers Worker at `2024-12-01`; retain its explicit Cache API `Accept`-variant logic unless a staged test proves a replacement safe.

4. **Workers: pursue operational features as separate design work.** Enable structured observability with deliberate sampling on the Workers that lack it. For social delivery, evaluate Queues plus a dead-letter queue and idempotent delivery state; it would reduce lost posts after upstream failures, but requires a design for at-least-once delivery. Do not enable declarative Worker caching blindly, because the current cache key distinguishes HTML from Markdown.

5. **Deployment and discovery: reconcile the primary path.** Forgejo and the self-hosted Hetzner site are documented as the source of truth and primary deployment, but this repository only contains GitHub Pages workflows. Record the real Forgejo webhook/build/deploy path and its owner outside this repository, and decide whether IndexNow should follow the primary deployment instead of only the Pages workflow. The IndexNow action can then be reviewed separately for its v3 update.

6. **Self-hosted maintenance: create an access-controlled inventory before version upgrades.** Capture actual versions, ownership, backup/restore checks and maintenance windows for Forgejo, Caddy, Listmonk, self-hosted GoatCounter, Postgres, restic, the deploy hook, Cloudflare and Resend. Do not infer deployed versions from this repository or site prose.

### Sources for the deferred assessment

- [Hugo releases](https://github.com/gohugoio/hugo/releases)
- [Forgejo releases](https://forgejo.org/releases/)
- [Wrangler releases](https://www.npmjs.com/package/wrangler?activeTab=versions)
- [Cloudflare compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
- [Cloudflare Workers observability](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)

## Sources

- [Hugo releases on GitHub](https://github.com/gohugoio/hugo/releases)
- [v0.158.0](https://github.com/gohugoio/hugo/releases/tag/v0.158.0)
- [v0.159.0](https://github.com/gohugoio/hugo/releases/tag/v0.159.0)
- [v0.159.2](https://github.com/gohugoio/hugo/releases/tag/v0.159.2)
- [v0.160.0](https://github.com/gohugoio/hugo/releases/tag/v0.160.0)
- [v0.160.1](https://github.com/gohugoio/hugo/releases/tag/v0.160.1)
- [v0.161.0](https://github.com/gohugoio/hugo/releases/tag/v0.161.0)
- [v0.161.1](https://github.com/gohugoio/hugo/releases/tag/v0.161.1)
- [Bryce Wray on Hugo's new CSS powers (0.158)](https://www.brycewray.com/posts/2026/04/hugos-new-css-powers/)
