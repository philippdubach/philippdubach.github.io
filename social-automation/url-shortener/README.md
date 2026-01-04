# YOURLS URL Shortener Proxy

A Cloudflare Worker that proxies requests to your YOURLS URL shortening API with server-side authentication.

## Why?

YOURLS API requires authentication (username/password or signature token). Exposing credentials in client-side JavaScript is a security risk. This worker handles authentication server-side, allowing browsers to create short URLs without accessing your credentials.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your YOURLS signature

Get your signature token from your YOURLS install's Tools page, then set it as a secret:

```bash
wrangler secret put YOURLS_SIGNATURE
# Paste your signature token when prompted
```

### 3. Deploy

**Option A: Deploy as standalone worker**

```bash
npm run deploy
```

This deploys to `yourls-shortener-proxy.<your-account>.workers.dev`

**Option B: Route through your domain**

Add route configuration in `wrangler.toml`:

```toml
routes = [
  { pattern = "pdub.click/shorten*", zone_name = "pdub.click" }
]
```

Then deploy:

```bash
npm run deploy
```

## Usage

### Create/Get Short URL

```
GET /shorten?url=https://example.com/long/url/path
```

Response:
```json
{
  "status": "success",
  "shorturl": "https://pdub.click/abc123",
  "url": "https://example.com/long/url/path",
  "title": "Page Title",
  "isNew": true
}
```

### Health Check

```
GET /health
```

## Client-Side Usage

```javascript
fetch('https://your-worker.workers.dev/shorten?url=' + encodeURIComponent(pageUrl))
  .then(r => r.json())
  .then(data => {
    if (data.shorturl) {
      navigator.clipboard.writeText(data.shorturl);
    }
  });
```

## Configuration

Environment variables in `wrangler.toml`:

| Variable | Description | Default |
|----------|-------------|---------|
| `YOURLS_API_URL` | Your YOURLS API endpoint | `https://pdub.click/yourls-api.php` |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | See wrangler.toml |

Secrets (set via `wrangler secret put`):

| Secret | Description |
|--------|-------------|
| `YOURLS_SIGNATURE` | Your YOURLS API signature token (required) |

## Security

- Credentials are stored as Cloudflare Worker secrets (encrypted at rest)
- CORS restricts which origins can call the API
- Only the `/shorten` endpoint is exposed
- No logging of sensitive data
