# SEO Content Brief: Degoogling Cost Me My YouTube Feed, So I Made My Own

Research date: 2026-08-16

## Keywords & Audiences

### Target Keywords

| # | Keyword | Search Intent | Rationale |
|---|---------|---------------|-----------|
| 1 | self-hosted YouTube subscription feed | Solve a problem / find a tool | Current results feature self-hosted inboxes, alternative clients, and people seeking chronological subscriptions without recommendations. It precisely describes the project. |
| 2 | YouTube subscriptions RSS feed | Informational / solve a problem | Searchers want to turn channel feeds into a combined subscription view or OPML list. The project explains a direct implementation. |
| 3 | YouTube RSS feed without API key | Informational / solve a problem | Avoiding the Data API, quota, OAuth, and a Google project is a central technical benefit. |
| 4 | watch YouTube without Google account | Informational / find a tool | The result set mixes privacy clients, how-to videos, and account-free subscription tools. The post offers a deliberately narrow alternative. |
| 5 | filter YouTube Shorts from RSS | Solve a problem | Recent results show persistent demand for removing Shorts from RSS and subscription feeds. The post documents a two-stage filter. |

### Target Audiences

| # | Audience | Primary Interest |
|---|----------|------------------|
| 1 | Privacy-conscious YouTube viewers | A chronological feed with fewer Google-account and recommendation dependencies. |
| 2 | Self-hosters | A small, low-maintenance service instead of a full alternative frontend or media archive. |
| 3 | RSS users | Combining public channel feeds, stable channel identifiers, and Shorts filtering. |
| 4 | Cloudflare Workers developers | Parallel fetches, timeouts, KV storage, Cache API use, XML parsing, and SSRF protection. |
| 5 | iPhone and iPad viewers | Account-free browsing, privacy-enhanced playback, picture-in-picture, and iOS sound constraints. |

## Phase 1 -- SERP Analysis

### 1. self-hosted YouTube subscription feed

- **Format dominance:** Product/project pages, GitHub repositories, self-hosted app roundups, and forum threads.
- **Site types ranking:** Project sites, app directories, Docker registries, GitHub, and self-hosting publishers.
- **Content freshness:** High. Several prominent projects and roundups appeared in 2026.
- **Common headings/sections:** No account, no algorithm, subscriptions, RSS ingestion, local storage, Docker setup, downloads, and privacy.
- **Gap:** Most tools recreate a large client or download videos. This post explains a smaller edge-hosted feed that preserves normal playback and owns only the subscription list.
- **SERP features:** Project cards, GitHub snippets, videos, and comparison-style results.

### 2. YouTube subscriptions RSS feed

- **Format dominance:** RSS/OPML tools, reader guides, app documentation, and community answers.
- **Site types ranking:** RSS utilities, FreeTube documentation, Reddit, project sites, and reader vendors.
- **Content freshness:** Mixed. The underlying feed pattern is old, but current clients and limitations are frequently updated.
- **Common headings/sections:** Channel IDs, feed URLs, OPML export, importing subscriptions, chronological order, and missing metadata.
- **Gap:** Many pages stop at importing separate feeds. The post explains merging, sorting, caching, handling channel URLs, and rendering a single page.
- **SERP features:** Tool pages, forum answers, and documentation snippets.

### 3. YouTube RSS feed without API key

- **Format dominance:** Tutorials, app/project pages, code repositories, and Q&A.
- **Site types ranking:** Developer blogs, GitHub, alternative-client documentation, and privacy communities.
- **Content freshness:** Moderate to high because scraping behavior, rate limits, and client support change.
- **Common headings/sections:** `feeds/videos.xml`, channel IDs, Atom parsing, API quota avoidance, and feed limitations.
- **Gap:** Few results connect the public feed to SSRF protection, edge caching, per-channel timeouts, and handle-to-ID resolution.
- **SERP features:** Code snippets and direct-answer text.

### 4. watch YouTube without Google account

- **Format dominance:** Alternative-client lists, app landing pages, tutorials, and videos.
- **Site types ranking:** Invidious/FreeTube ecosystems, privacy publishers, app vendors, and YouTube itself.
- **Content freshness:** High, with active alternative clients and changing platform behavior.
- **Common headings/sections:** Privacy, subscriptions, local history, ad blocking, account-free playback, proxying, and device support.
- **Gap:** Results often blur browsing privacy and playback privacy. This post states the boundary: no Google request before play, then an IP address and local identifier can reach Google.
- **SERP features:** Video results, app cards, and comparison pages.

### 5. filter YouTube Shorts from RSS

- **Format dominance:** RSS-reader filters, extensions, community recipes, and short guides.
- **Site types ranking:** Developer blogs, browser-extension stores, RSS communities, and publishers.
- **Content freshness:** Very high in 2026.
- **Common headings/sections:** URL filters, title patterns, subscription filters, reader rules, and limitations.
- **Gap:** Single regex rules are brittle. The post's title check plus redirect test is a useful implementation distinction.
- **SERP features:** Extension listings, how-to snippets, and news about YouTube's Shorts controls.

Representative sources: [FreeTube subscription documentation](https://docs.freetubeapp.io/usage/subscriptions/), [Invidious application documentation](https://docs.invidious.io/applications/), [Privacy Guides on alternative frontends](https://www.privacyguides.org/en/frontends/), [YT Zero's self-hosted RSS approach](https://ca.unraid.net/apps/yt-zero-1ry69q20pcrx1i), [Kaleidoscribe](https://fietkau.software/kaleidoscribe), [YouTube subscription RSS/OPML utility](https://caseybrant.com/ytsubs/), and [a 2026 Shorts RSS-filter guide](https://jarv.org/posts/newsgoat-filters/).

## Phase 2 -- Search Intent Deep-Dive

| Keyword | Searcher's underlying job |
|---------|---------------------------|
| self-hosted YouTube subscription feed | Find or build an owned chronological feed without recommendations. |
| YouTube subscriptions RSS feed | Combine channel uploads in an RSS reader or custom interface. |
| YouTube RSS feed without API key | Fetch recent uploads without OAuth, quotas, or a Google Cloud project. |
| watch YouTube without Google account | Retain viewing and subscription discovery while reducing account-linked tracking. |
| filter YouTube Shorts from RSS | Remove short-form uploads from a channel or merged subscription feed. |

### People Also Ask Questions (10-15)

Search output did not expose a stable PAA module. These questions reflect repeated headings and related-search intent:

1. Does every YouTube channel have an RSS feed?
2. What is the URL for a YouTube channel RSS feed?
3. Can I create a YouTube subscription feed without a Google account?
4. Can I use YouTube RSS without an API key?
5. How do I find a YouTube channel ID from a handle?
6. Can I combine multiple YouTube channel feeds?
7. How do I make YouTube subscriptions chronological?
8. Can I remove YouTube Shorts from an RSS feed?
9. Why do title-only Shorts filters miss videos?
10. Is `youtube-nocookie.com` completely private?
11. Does a YouTube embed load before I press play?
12. Which self-hosted YouTube frontend should I use?
13. How do FreeTube and Invidious handle subscriptions?
14. Can YouTube play picture-in-picture without Premium?
15. How do I cache RSS feeds in a Cloudflare Worker?

## Phase 3 -- Content Structure Analysis

### Recommended H1

Degoogling cost me my YouTube feed, so I made my own

Keep the current human title. It is memorable and accurately signals a first-person project. Use `seoTitle` for the exact technical description.

### Outline Comparison

Ranking pages commonly compare tools or provide install instructions. This article is an architecture note, so it should preserve its narrative sequence. Improve generic headings without adding a roundup:

- “A self-hosted YouTube subscription feed”
- “YouTube RSS feeds without an API key”
- “How to filter YouTube Shorts from RSS”
- Keep “Playback without the tracking,” “Picture-in-picture came for free,” and “Fast and hard to break.” These headings preserve voice after the first three H2s establish the search topic.

No new section is critical. The post already covers the reader's questions about data source, identity, filtering, privacy, playback, storage, caching, and failures.

### Introduction Assessment

- **Search intent:** The first paragraph states the problem and the deliberately narrow replacement.
- **Keyword placement:** Add “self-hosted YouTube subscription feed” naturally in the first 100 words.
- **Hook:** “I rebuilt that screen and nothing else” distinguishes the project from full YouTube clones.

### Conclusion Assessment

- The last section explains parallelism, failure isolation, caching, storage, server rendering, and deployment.
- A generic marketing CTA is unnecessary. The architectural payoff is the conclusion.
- The internal link to the European blog stack is contextually relevant to the hosting choice.

## Phase 4 -- Keyword Optimization

### Primary Keyword

- **Current density:** Strong semantic coverage, but the exact singular phrase “self-hosted YouTube subscription feed” was absent from visible body copy.
- **Recommended density:** One use in the introduction and one H2. Avoid repeating it in every technical section.
- **Placement:** `seoTitle`, description, first paragraph, first H2, keywords, and FAQ semantics.

### LSI / Semantic Keywords (15-20)

- YouTube subscriptions RSS feed — project framing
- YouTube channel RSS feed — API-free section
- YouTube Atom feed — parser explanation
- YouTube feed without API key — H2 and FAQ
- YouTube feed without Google account — FAQ
- chronological YouTube subscriptions — feed behavior
- degoogle YouTube — introduction
- YouTube subscription feed alternative — positioning
- YouTube channel ID — handle resolution
- `feeds/videos.xml` — technical path
- filter YouTube Shorts — filtering section
- privacy-enhanced YouTube embed — playback section
- `youtube-nocookie` — semantic keyword/frontmatter only unless code is shown
- Cloudflare Worker RSS reader — implementation
- Cloudflare KV — storage
- Cloudflare Cache API — performance
- `fast-xml-parser` — Atom parsing
- server-side request forgery — security guard
- picture-in-picture — playback benefit
- self-hosted YouTube frontend — comparison language

### Long-Tail Variations (5-10)

- self-hosted YouTube subscription feed no API key
- YouTube subscriptions RSS feed without Google account
- YouTube channel RSS feed URL videos.xml
- combine YouTube RSS feeds chronologically
- filter YouTube Shorts from RSS feed
- Cloudflare Worker YouTube RSS reader
- YouTube RSS feed handle to channel ID
- privacy-enhanced YouTube embed tracking
- YouTube picture-in-picture without the app
- degoogle YouTube subscription feed

## Phase 5 -- Content Differentiation

The differentiator is restraint. Search results favor full clients, Docker media servers, downloaders, or generic RSS advice. This project owns only the list of subscriptions and the merged feed. It also describes honest privacy boundaries, two-stage Shorts detection, SSRF protection, stable channel-ID resolution, parallel failure isolation, and edge caching. Do not add a generic “best alternatives” section; that would dilute the original project and compete with stronger list pages on their terms.

## Phase 6 -- On-Page SEO Checklist

### Meta / SEO Title (55-60 chars)

- Option 1: My Self-Hosted YouTube Subscription Feed Built With RSS (55)
- Option 2: Build Your Self-Hosted YouTube Subscription Feed With RSS (57)
- Option 3: Self-Hosted YouTube Subscription Feed Without Google APIs (57)

Selected: Option 1. It matches a first-person architecture article rather than promising a full tutorial.

### Meta Description (150-160 chars)

- Option 1: See how I built a self-hosted YouTube subscription feed with public RSS, no API key, Shorts filtering, privacy-enhanced embeds, caching, and timeouts. (150)
- Option 2: See how a self-hosted YouTube subscription feed uses public RSS, no API key, Shorts filtering, privacy-enhanced embeds, caching, and timeouts on Cloudflare. (156)
- Option 3: Rebuild a YouTube subscription feed with public RSS, stable channel IDs, Shorts filtering, privacy-enhanced embeds, Cloudflare caching, and no API key. (151)

Selected: Option 1.

### URL Slug

- Recommended: `/posts/degoogle-youtube-feed/`
- Keep the existing URL. It is short, descriptive, and already published.

### Image Requirements

- Existing images: One desktop feed view and one iPhone picture-in-picture view, plus the social image.
- Alt strategy: Describe visible channels, absence of feed clutter, and the picture-in-picture state. Existing alts already provide useful context.
- Featured image: Keep the actual feed screenshot; it proves the project exists and shows the benefit faster than an illustration.

### Schema Markup Recommendations

- Article schema: Yes. Mark as a Project article with author, dates, description, image, and topical keywords.
- FAQ schema: Keep FAQPage markup for the visible FAQ hub and non-Google consumers. Google normally limits FAQ rich results to authoritative government and health sites, so do not promise a Google rich result.
- HowTo schema: No. The post explains design and behavior but does not provide a complete, ordered deployment procedure.

## Phase 7 -- Content Requirements

- **Target word count:** 800-1,500 words. The current approximately 890 words fit the focused project-note intent.
- **Reading level:** Accessible technical prose with definitions; preserve STE clarity.
- **Tone:** Personal, practical, privacy-conscious, and candid about compromises.
- **Expertise signals present:** First-hand build details, named technologies, failure handling, security validation, privacy boundary, iOS behavior, screenshots, and operational settings.
- **Expertise signals missing:** A repository or live-demo link would strengthen verification if the author later chooses to publish one. It is not required for this pass.
- **Internal linking opportunities:** European hosting stack; Cloudflare infrastructure projects; privacy/self-hosting posts; personal software projects; a future code release. Keep the current natural stack link.
- **External authority sources to reference:** If the post expands, prefer [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/), [Cloudflare KV documentation](https://developers.cloudflare.com/kv/), [FreeTube's RSS explanation](https://docs.freetubeapp.io/usage/subscriptions/), [Invidious documentation](https://docs.invidious.io/), and [Privacy Guides](https://www.privacyguides.org/en/frontends/). No new external link is critical to the current narrative.

## Phase 8 -- Success Metrics

- **Target ranking:** Top ten is realistic for the exact self-hosted/RSS long tails. Broad “watch YouTube without Google” queries are crowded by established app and video results.
- **Competitive analysis:** Narrow project pages and forum answers are the first realistic competitors to outrank. Full alternative-client brands own navigational searches.
- **Content gaps to exploit:** Edge-hosted architecture, clear tracking boundary, handle-to-ID resolution, robust parallel fetching, and a two-stage Shorts filter.
- **E-E-A-T assessment:** Strong first-hand experience and implementation specificity. A public repository would be the clearest future enhancement.

## Optimization Actions Summary

- **RED Critical:** Make the `seoTitle` accurately describe a first-person self-hosted RSS project; write a 150-160-character description; put the primary phrase in the opening; preserve dates and the existing link.
- **YELLOW Important:** Reorder visible Topics around current intent; make H2s descriptive; refine two FAQ questions for API-free and account-free searches.
- **GREEN Nice-to-have:** Add a repository or demo only if the author wants it public; keep screenshot alt text; avoid a generic alternatives roundup.

## Research Log

Discovery searches: “self hosted YouTube subscriptions RSS feed”; “YouTube RSS feed no API key channel uploads”; “degoogle YouTube alternatives Invidious FreeTube RSS subscriptions”; “Cloudflare Worker YouTube RSS feed reader.”

Keyword SERP searches: “YouTube subscriptions RSS feed”; “YouTube RSS feed without API key”; “self hosted YouTube subscriptions”; “watch YouTube subscriptions without Google account”; “filter YouTube Shorts from subscription feed RSS.”

No search-volume, domain-authority, or traffic numbers were invented. Competition and freshness assessments are qualitative observations from the result sets on the research date.
