# Social Poster - Cloudflare Worker

Automated social media posting for your Hugo blog using Cloudflare Workers.

## Features

- Monitors RSS feed for new posts
- Generates unique post messages using Workers AI (Llama 3.1)
- Posts to Bluesky automatically
- Tracks posted articles to avoid duplicates
- Runs on a schedule (every 15 minutes by default)

## Architecture

```
RSS Feed --> Worker (scheduled) --> Workers AI --> Bluesky
                    |
                    v
               KV Storage (state)
```

## Setup

### 1. Install Wrangler

```bash
cd social-automation/worker
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

Copy the `id` from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "POSTED_STATE"
id = "your-namespace-id-here"
```

### 4. Set Secrets

Store your Bluesky credentials securely:

```bash
# Set your Bluesky handle (e.g., "yourname.bsky.social" or custom domain)
npx wrangler secret put BLUESKY_HANDLE

# Set your app password (get one from https://bsky.app/settings/app-passwords)
npx wrangler secret put BLUESKY_APP_PASSWORD
```

### 5. Deploy

```bash
npx wrangler deploy
```

## Configuration

Edit `wrangler.toml` to customize:

```toml
[vars]
RSS_URL = "https://yoursite.com/posts/index.xml"
SITE_NAME = "yoursite.com"

[triggers]
crons = ["*/15 * * * *"]  # Every 15 minutes
```

## Usage

### Manual Trigger

After deployment, you can trigger the worker manually:

```bash
# Dry run (no actual posting)
curl "https://social-poster.YOUR_SUBDOMAIN.workers.dev/trigger?dry=true"

# Actual posting
curl "https://social-poster.YOUR_SUBDOMAIN.workers.dev/trigger"
```

### View Status

```bash
curl "https://social-poster.YOUR_SUBDOMAIN.workers.dev/status"
```

### Local Development

```bash
npx wrangler dev
```

Then visit `http://localhost:8787/trigger?dry=true`

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (no auth required) |
| `/trigger` | GET | Trigger posting (add `?dry=true` for dry run) |
| `/status` | GET | Show count of posted articles |

## Cost

- **Workers**: Free tier includes 100,000 requests/day
- **Workers AI**: Free tier includes 10,000 neurons/day (plenty for this use case)
- **KV Storage**: Free tier includes 100,000 reads/day, 1,000 writes/day

## Troubleshooting

### Check Logs

```bash
npx wrangler tail
```

### Common Issues

1. **Auth errors**: Make sure your app password is correct (not your main password)
2. **KV errors**: Ensure the namespace ID is correctly set in wrangler.toml
3. **AI errors**: Workers AI binding is automatic, no additional setup needed

## Adding More Platforms

The worker is designed to be extensible. To add Twitter/X:

1. Create `src/twitter.js` with posting logic
2. Add secrets for Twitter API credentials
3. Update `src/index.js` to call the Twitter posting function
