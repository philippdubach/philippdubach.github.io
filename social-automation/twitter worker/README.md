# Twitter auto-poster

The `twitter-poster` Cloudflare Worker discovers new RSS items, generates and scores candidate text, and queues one OAuth 1.0a-signed Twitter API v2 publication behind a duplicate-safe SQLite Durable Object.

## Runtime behavior

- Runs at `0 */6 * * *` and accepts authenticated manual triggers.
- Uses shared `@cf/openai/gpt-oss-120b` and `@cf/openai/gpt-oss-20b` generation.
- Sends non-dry jobs to `twitter-poster-post-jobs`; failures exhaust into `twitter-poster-post-jobs-dlq`.
- Persists `attempting` before one `POST /2/tweets` request; the side-effecting call has no internal retry wrapper.
- Retries known pre-send failures and 429 responses after 300 seconds.
- Marks network, timeout, 5xx, and response-parse ambiguity as terminal `uncertain`; it never sends those jobs again automatically.
- Keeps the existing `posts:` KV read model and archives DLQ state under `failed:<job-key>`.

## Endpoints

All endpoints except `/health` require `Authorization: Bearer <API_SECRET>`.

| Endpoint | Behavior |
|---|---|
| `GET /health` | Unauthenticated health check |
| `GET /trigger` | Discover and queue new posts; returns HTTP 202 |
| `GET /trigger?dry=true` | Generate/score synchronously with no Queue, KV, DO, or Twitter write |
| `GET /test?url=<url>` | Queue one URL; `dry=true` previews without writes |
| `GET /status` | Read legacy posted state |
| `GET /backfill` | Mark current feed items terminally backfilled without posting |

## Local verification and deployment

Run from `social-automation` with Node 24.19.0:

```bash
nvm use
npm ci --ignore-scripts
npm test --workspace twitter-poster
npm run check --workspace twitter-poster
npm run deploy --workspace twitter-poster
```

Required secrets are `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`, and `API_SECRET`. The Twitter app must have read/write permission. Production Queue, KV, AI, cron, and Durable Object bindings are declared in `wrangler.toml`; do not replace their IDs or names during a routine release.

Before deployment, record the previous Worker version. After deployment, run a dry trigger, inspect Queue/DO/KV observability, and reconcile any DLQ item using [OPERATIONS.md](../../OPERATIONS.md). Do not use a live non-dry test merely as a smoke test.
