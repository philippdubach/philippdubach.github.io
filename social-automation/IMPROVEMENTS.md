# Social automation worker improvements

Backlog of improvements to the bluesky + twitter workers, captured 2026-05-04. Pick items off this list when ready to implement.

## Current state

Both workers are ~95% identical: scheduled cron runs every 15 min, fetches RSS, picks up new posts from the last 7 days, generates a ≤250-char post via `@cf/meta/llama-4-scout-17b-16e-instruct`, posts it, marks the article in KV. Auth-gated `/trigger`, `/test`, `/backfill`, `/status` endpoints. Sliding-window rate limit. Banned-word list (~85 AI-slop words) baked into the system prompt. Bluesky attaches OG image as embed; Twitter posts text + URL only.

The structural cost: `llm.js` is byte-identical between the two workers, `index.js` is near-identical, and any voice tweak has to be applied twice.

## Cloudflare Workers AI lineup that matters here (May 2026)

- `@cf/meta/llama-4-scout-17b-16e-instruct` — current. 17B/16-experts MoE. Fast, decent voice control.
- `@cf/openai/gpt-oss-120b` — new. OpenAI open-weights, "production, general purpose, high reasoning." Likely strongest available for nuanced voice and irony detection.
- `@cf/openai/gpt-oss-20b` — same family, lower-latency tier. Probably the right cost/quality tradeoff.
- `@cf/zhipu/glm-4.7-flash` — 131K context, fast multilingual, function calling, multi-turn tool calling. Cheap and fast.
- `@cf/qwen/qwen3-30b` — reasoning-focused, good for "find the most surprising number" angle.
- JSON mode — works on most of the above; would replace the regex post-processing in `llm.js`.
- Function calling — Hermes 2 Pro and the newer models support tool use. Could let the model call `lookup_takeaway()` or `lookup_quote()` to ground a post in actual article content.

Pricing: $0.011 per 1,000 Neurons, 10K free/day. Per-generation cost is well under a cent — model choice should be driven by quality, not cost.

---

## Recommended starter PR (highest leverage, ~3-4h)

Ship #1 + #2 + #3 + #4 in a single sweep. Cuts maintenance in half, raises post quality measurably, removes 95% of cron wake-ups.

- [ ] **1. Extract a shared library.** `social-automation/shared/` with `llm.js`, `rss.js`, `state.js`, `auth.js`, `rate-limit.js`. Both workers `import` from it. Without this, every prompt tweak is two PRs, and they will eventually drift. The voice prompt is identical today; it shouldn't have to stay that way by accident.

- [ ] **2. Replace string parsing with JSON mode.** Change the LLM call to request `{"post": string, "angle": "surprise"|"tension"|"opinion"|"question"|"framing", "char_count": number}`. Kills most of the regex post-processing in `llm.js` and gives you structured logging — you can then see "we lean too heavy on 'surprise' angle, let's diversify."

- [ ] **3. Best-of-N candidate generation.** Generate 3 candidates per article, score each (banned-word check, length distance from 240 chars, lexical overlap with the last 5 posts in KV), pick the winner. ~3x neurons but still under the free tier for the current post tempo. Quality rises because the banned-word list works as a filter, not just a hint.

- [ ] **4. Webhook trigger from Hugo build.** Replace the 15-min cron with a `repository_dispatch` step at the end of `.github/workflows/hugo.yml` that POSTs to `/trigger` with `API_SECRET`. Posts go up within seconds of publish; cron drops to 1x/day as a safety net.

## Quick-win alternative (if avoiding refactor)

- [ ] **5. A/B model comparison.** Try `@cf/openai/gpt-oss-20b` alongside Llama 4 Scout for a week in dry-run mode, log both outputs. Pick the winner by manual eyeball + heuristic (length variance, banned-word hits, distinct-from-recent score). Ten-line change in `llm.js`. Prior: gpt-oss-20b will produce more varied, less template-y posts.

---

## Mid-leverage (worth doing, less urgent)

- [ ] **6. Thread support for posts with rich `takeaways` frontmatter.** When a post has 4+ takeaways, post a thread instead of a single post: hook → 3-4 takeaway posts → URL. Frontmatter is already structured for this; just needs adapter logic. Engagement on threads consistently beats single posts on both platforms.

- [ ] **7. Engagement feedback loop.** Both APIs expose `like_count`/`repost_count` on posted items. Read engagement 24h after posting, store in KV, surface in `/status` as "best-performing post styles." Don't auto-tune the model on it (data's too sparse), but make the data legible.

- [ ] **8. Evergreen reshare.** Second cron at ~09:00 UTC Tuesday picks a post >6 months old, regenerates a fresh post message (different angle than the original), and reshares. Solves the "blog publishes 1 post and then dead air for two weeks" problem.

- [ ] **9. Retry queue via Cloudflare Queues.** Today, if Bluesky API fails, the article isn't marked posted, so the next cron retries — but only within the 7-day window. Outside that, lost forever. A queue with exponential backoff fixes it.

- [ ] **10. Twitter media upload.** The Twitter worker doesn't attach OG images. Twitter v2 supports media via `POST /2/tweets` with `media.media_ids`. Image cards drive ~2x the engagement of text-only posts. ~1h of work.

---

## Low-leverage / experimental

- [ ] **11. Function calling for fact-grounded posts.** Let the model call `get_takeaway(index)` or `get_first_number_in_article()`. Reduces hallucination. For 250-char posts the article excerpt already in context handles this, so the win is small.

- [ ] **12. Vision model for image alt text.** Both platforms accept alt text on image embeds (accessibility win). `@cf/llava-1.5-7b-hf` can caption.

- [ ] **13. Per-platform image variants.** Square crops for Twitter, 1:1.91 for Bluesky link cards. Cloudflare Image Resizing already in use for the Hugo image shortcode.

- [ ] **14. Tests.** `security-headers/` has 32 tests, these workers have zero. Golden-file tests on prompt regressions (mock `env.AI`, assert structure) would catch "we changed the prompt and now everything is 380 chars" regressions.

- [ ] **15. Fallback model.** Single point of failure today. Fall back to a deterministic template `"Wrote about ${title}. ${first_takeaway}"` if Workers AI returns no response.

---

## Sources

- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)
- [Function Calling](https://developers.cloudflare.com/workers-ai/features/function-calling/)
- [JSON mode changelog (Feb 2025)](https://developers.cloudflare.com/changelog/2025-02-25-json-mode/)
