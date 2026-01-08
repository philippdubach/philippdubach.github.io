# Bluesky Auto-Poster Worker

Cloudflare Worker that automatically posts new RSS feed items to Bluesky.

## Features

- Monitors RSS feed for new posts
- Generates unique post messages using Workers AI (Llama 3.1)
- Fetches full article text for better LLM context
- Posts to Bluesky with link cards and images
- Tracks posted articles to avoid duplicates
- Runs on a schedule (every 15 minutes by default)

## Architecture

```
RSS Feed --> Worker (scheduled) --> Fetch Article --> Workers AI --> Bluesky
                    |
                    v
               KV Storage (state)
```

## Setup

### 1. Install Dependencies

```bash
cd "bluesky worker"
npm install
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create KV Namespace

```bash
npx wrangler kv namespace create POSTED_STATE
```

Copy the `id` from the output and update `wrangler.toml`.

### 4. Set Secrets

```bash
npx wrangler secret put BLUESKY_HANDLE
npx wrangler secret put BLUESKY_APP_PASSWORD
npx wrangler secret put API_SECRET
```

### 5. Deploy

```bash
npx wrangler deploy
```

## Endpoints

All endpoints (except `/health`) require `Authorization: Bearer <API_SECRET>` header.

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check (no auth required) |
| `GET /trigger` | Manually trigger posting |
| `GET /trigger?dry=true` | Dry run - shows what would be posted |
| `GET /status` | List all posted article IDs |
| `GET /backfill` | Mark all current RSS items as posted |
| `GET /test?url=<url>` | Post a specific URL directly (for testing) |

## Configuration

Edit `wrangler.toml` to customize:

- `RSS_URL` - Your RSS feed URL
- `SITE_NAME` - Your site name
- Cron schedule (default: every 15 minutes)

## How It Works

1. Worker runs on schedule (every 15 minutes by default)
2. Fetches and parses your RSS feed
3. Checks which posts haven't been posted (via KV store)
4. Fetches full article text from each new post URL
5. Uses Workers AI to generate post text based on full article
6. Posts to Bluesky with link card preview
7. Stores post URI in KV to prevent duplicates

## Local Development

```bash
npx wrangler dev
```

Then trigger manually:
```bash
curl -H "Authorization: Bearer YOUR_SECRET" http://localhost:8787/trigger?dry=true
```
