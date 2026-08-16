# Bluesky auto-poster

The `social-poster` Cloudflare Worker discovers new RSS items, generates and scores candidate text, and queues Bluesky publication behind a duplicate-safe SQLite Durable Object.

## Runtime behavior

- Runs at `0 */6 * * *` and accepts authenticated manual triggers.
- Uses shared `@cf/openai/gpt-oss-120b` and `@cf/openai/gpt-oss-20b` generation.
- Sends non-dry jobs to `social-poster-post-jobs`; failures exhaust into `social-poster-post-jobs-dlq`.
- Persists `attempting` before one Bluesky create-record request.
- Retries known pre-send failures and 429 responses after 300 seconds.
- Marks network, timeout, 5xx, and response-parse ambiguity as terminal `uncertain`; it never sends those jobs again automatically.
- Keeps the existing `posts:` KV read model and archives DLQ state under `failed:<job-key>`.
- Attaches a Bluesky link-card embed when trusted article metadata is available.

## Endpoints

All endpoints except `/health` require `Authorization: Bearer <API_SECRET>`.

| Endpoint | Behavior |
|---|---|
| `GET /health` | Unauthenticated health check |
| `GET /trigger` | Discover and queue new posts; returns HTTP 202 |
| `GET /trigger?dry=true` | Generate/score synchronously with no Queue, KV, DO, or Bluesky write |
| `GET /test?url=<url>` | Queue one URL; `dry=true` previews without writes |
| `GET /status` | Read legacy posted state |
| `GET /backfill` | Mark current feed items terminally backfilled without posting |

## Local verification and deployment

Run from `social-automation` with Node 24.19.0:

```bash
nvm use
npm ci --ignore-scripts
npm test --workspace social-poster-worker
npm run check --workspace social-poster-worker
npm run deploy --workspace social-poster-worker
```

Required secrets are `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`, and `API_SECRET`. The production Queue, KV, AI, cron, and Durable Object bindings are declared in `wrangler.toml`; do not replace their IDs or names during a routine release.

Before deployment, record the previous Worker version. After deployment, run a dry trigger, inspect Queue/DO/KV observability, and reconcile any DLQ item using [OPERATIONS.md](../../OPERATIONS.md). Do not use a live non-dry test merely as a smoke test.
