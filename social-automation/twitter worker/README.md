# Twitter Auto-Poster Worker

Cloudflare Worker that automatically posts new RSS feed items to Twitter using the free tier API (1,500 tweets/month).

## Features

- Monitors RSS feed for new posts
- Generates unique tweet messages using Workers AI (Llama 3.1)
- Fetches full article text for better LLM context
- Posts to Twitter via API v2 with OAuth 1.0a
- Tracks posted articles to avoid duplicates
- Runs on a schedule (every 15 minutes by default)

## Architecture

```
RSS Feed --> Worker (scheduled) --> Fetch Article --> Workers AI --> Twitter
                    |
                    v
               KV Storage (state)
```

## Setup

### 1. Install Dependencies

```bash
cd "twitter worker"
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

### 4. Configure Twitter App

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create or select your app
3. Enable **User authentication settings**
4. Set **App permissions** to **Read and Write**
5. Set a callback URL (e.g., `https://your-worker.workers.dev/callback`)
6. Generate Access Token and Secret with Read/Write permissions

### 5. Set Secrets

```bash
npx wrangler secret put TWITTER_API_KEY
npx wrangler secret put TWITTER_API_SECRET
npx wrangler secret put TWITTER_ACCESS_TOKEN
npx wrangler secret put TWITTER_ACCESS_TOKEN_SECRET
npx wrangler secret put API_SECRET
```

### 6. Deploy

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

## Twitter Free Tier Limits

- **1,500 tweets per month** (50/day average)
- **280 characters per tweet** (URLs shortened via t.co)
- **No media uploads** on free tier
- **OAuth 1.0a User Context** required

## How It Works

1. Worker runs on schedule (every 15 minutes by default)
2. Fetches and parses your RSS feed
3. Checks which posts haven't been tweeted (via KV store)
4. Fetches full article text from each new post URL
5. Uses Workers AI to generate tweet text based on full article
6. Posts to Twitter via API v2
7. Stores tweet ID in KV to prevent duplicates

## Local Development

```bash
npx wrangler dev
```

Then trigger manually:
```bash
curl -H "Authorization: Bearer YOUR_SECRET" http://localhost:8787/trigger?dry=true
```
