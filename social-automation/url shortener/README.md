# pdub.click URL Shortener

A lightweight, fast, and SEO-optimized URL shortener built on Cloudflare's edge infrastructure. Designed as a YOURLS replacement with modern architecture and zero server maintenance.

## Features

- ⚡ **Ultra-fast redirects** — KV storage at 300+ edge locations (<10ms globally)
- 📊 **Full analytics** — Every click tracked with country, device, browser, referrer, OS
- 🔐 **Secure** — API key authentication + password-protected dashboard with timing-safe comparisons
- 🔍 **SEO-optimized** — 301 permanent redirects preserve full link equity
- 💰 **Cost-effective** — Free tier handles ~100k redirects/day
- 🎨 **Clean dashboard** — Minimalist UI for link management and analytics
- 🔗 **API-first** — Full REST API for blog/newsletter integration
- 🛡️ **Privacy-focused** — IP addresses are hashed with daily rotation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Cloudflare Edge                       │
│                                                         │
│  ┌─────────────┐    ┌─────────┐    ┌──────────────┐   │
│  │   Worker    │───▶│   KV    │    │     D1       │   │
│  │ (Redirects) │    │ (URLs)  │    │ (Analytics)  │   │
│  │ (API)       │    └─────────┘    └──────────────┘   │
│  │ (Dashboard) │                                       │
│  └─────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## Live URLs

| URL | Purpose |
|-----|---------|
| `https://pdub.click/admin` | Dashboard (password protected) |
| `https://pdub.click/api/*` | REST API (API key required) |
| `https://pdub.click/{code}` | Short URL redirect |
| `https://pdub.click/health` | Health check endpoint |

---

# Project Structure

```
├── src/
│   ├── index.ts           # Worker entry point & routing
│   ├── types.ts           # TypeScript type definitions & constants
│   ├── utils.ts           # Utility functions (validation, hashing, etc.)
│   ├── auth.ts            # Authentication (API key + sessions with HMAC)
│   ├── dashboard-html.ts  # Embedded dashboard SPA
│   ├── db/
│   │   └── schema.sql     # D1 database schema with optimized indexes
│   └── handlers/
│       ├── redirect.ts    # Short URL redirect handler
│       └── api.ts         # REST API endpoints
├── wrangler.toml          # Cloudflare Worker config
├── package.json           # Project dependencies & scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Key Components

### Entry Point ([src/index.ts](src/index.ts))
Main router handling all incoming requests:
- Static files (favicon, robots.txt)
- Health check endpoints
- Auth endpoints (login/logout/check)
- API routes
- Dashboard
- Short URL redirects

### Authentication ([src/auth.ts](src/auth.ts))
Secure authentication with:
- **API Key verification** - Timing-safe comparison prevents timing attacks
- **Session tokens** - HMAC-based with 24-hour expiry
- **Session format** - `timestamp:hmac` for secure validation

### Types ([src/types.ts](src/types.ts))
Comprehensive type definitions:
- Environment bindings (KV, D1, secrets)
- Database row types for type-safe queries
- API request/response types
- Application constants

### Utilities ([src/utils.ts](src/utils.ts))
Helper functions:
- Short code generation (URL-safe characters, no confusing chars)
- IP hashing with daily salt rotation for privacy
- User-agent parsing
- Input validation and sanitization
- Pagination validation

### API Handler ([src/handlers/api.ts](src/handlers/api.ts))
RESTful API with:
- CRUD operations for links
- Link and global statistics
- Input validation on all endpoints
- Proper error handling

### Redirect Handler ([src/handlers/redirect.ts](src/handlers/redirect.ts))
Optimized redirect logic:
- Fast KV lookup
- Link active status check
- Non-blocking click analytics via `ctx.waitUntil`
- 301 redirects for SEO

---

# API Documentation

## Authentication

All API endpoints require authentication via one of:

| Method | Header | Use Case |
|--------|--------|----------|
| API Key | `X-API-Key: your-api-key` | Programmatic access (scripts, integrations) |
| Session Cookie | Set automatically after dashboard login | Dashboard UI |

### API Key Usage

```bash
curl -H "X-API-Key: your-api-key" https://pdub.click/api/links
```

---

## Endpoints Overview

### Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/links` | Create a new short link |
| `GET` | `/api/links` | List all links (paginated) |
| `GET` | `/api/links/{code}` | Get a specific link |
| `PUT` | `/api/links/{code}` | Update a link |
| `DELETE` | `/api/links/{code}` | Delete a link |
| `GET` | `/api/links/{code}/stats` | Get detailed statistics |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Global statistics across all links |

---

## Create Link

Create a new short URL.

```http
POST /api/links
Content-Type: application/json
X-API-Key: your-api-key
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | The destination URL (must be valid HTTP/HTTPS) |
| `customCode` | string | ❌ | Custom short code (1-50 alphanumeric, hyphens, underscores) |
| `title` | string | ❌ | Human-readable title for dashboard |

### Example Request

```bash
curl -X POST https://pdub.click/api/links \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"url": "https://philippdubach.com/blog/my-article", "customCode": "article", "title": "Blog Post"}'
```

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "shortCode": "article",
    "shortUrl": "https://pdub.click/article",
    "longUrl": "https://philippdubach.com/blog/my-article",
    "title": "Blog Post",
    "createdAt": "2026-01-11T10:30:00.000Z"
  }
}
```

### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| `400` | Invalid URL provided | URL is malformed or not HTTP/HTTPS |
| `400` | Invalid short code format | Custom code contains invalid characters |
| `400` | This short code is reserved | Code conflicts with system paths (api, admin, etc.) |
| `409` | This short code is already in use | Custom code already exists |

---

## List Links

Retrieve all links with pagination and optional search.

```http
GET /api/links
X-API-Key: your-api-key
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `50` | Results per page (max 100) |
| `search` | string | — | Search in code, URL, or title |

### Example Request

```bash
curl "https://pdub.click/api/links?page=1&limit=20&search=blog" \
  -H "X-API-Key: your-api-key"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "links": [
      {
        "shortCode": "article",
        "longUrl": "https://philippdubach.com/blog/my-article",
        "title": "Blog Post",
        "createdAt": "2026-01-11T10:30:00.000Z",
        "totalClicks": 142,
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

## Get Link

Retrieve a specific link by its short code.

```http
GET /api/links/{code}
X-API-Key: your-api-key
```

### Example Request

```bash
curl https://pdub.click/api/links/article \
  -H "X-API-Key: your-api-key"
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "shortCode": "article",
    "shortUrl": "https://pdub.click/article",
    "longUrl": "https://philippdubach.com/blog/my-article",
    "title": "Blog Post",
    "createdAt": "2026-01-11T10:30:00.000Z",
    "totalClicks": 142
  }
}
```

---

## Update Link

Update an existing link's destination URL, title, or active status.

```http
PUT /api/links/{code}
Content-Type: application/json
X-API-Key: your-api-key
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ❌ | New destination URL |
| `title` | string | ❌ | New title |
| `isActive` | boolean | ❌ | Enable/disable the link |

### Example Request

```bash
curl -X PUT https://pdub.click/api/links/article \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"url": "https://philippdubach.com/blog/updated-article", "title": "Updated Title"}'
```

---

## Delete Link

Permanently delete a short link and its associated click history.

```http
DELETE /api/links/{code}
X-API-Key: your-api-key
```

### Example Request

```bash
curl -X DELETE https://pdub.click/api/links/article \
  -H "X-API-Key: your-api-key"
```

---

## Get Link Statistics

Retrieve detailed analytics for a specific link.

```http
GET /api/links/{code}/stats
X-API-Key: your-api-key
```

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `days` | integer | `30` | `365` | Number of days for time-series data |

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "shortCode": "article",
    "longUrl": "https://philippdubach.com/blog/my-article",
    "title": "Blog Post",
    "totalClicks": 142,
    "uniqueVisitors": 98,
    "clicksByCountry": { "US": 45, "DE": 23, "GB": 18 },
    "clicksByDevice": { "desktop": 89, "mobile": 48, "tablet": 5 },
    "clicksByBrowser": { "Chrome": 72, "Safari": 38, "Firefox": 20 },
    "clicksOverTime": [
      { "date": "2026-01-01", "count": 12 },
      { "date": "2026-01-02", "count": 8 }
    ],
    "recentClicks": [
      {
        "clickedAt": "2026-01-11T10:45:00.000Z",
        "country": "US",
        "city": "San Francisco",
        "deviceType": "desktop",
        "browser": "Chrome",
        "os": "macOS"
      }
    ]
  }
}
```

---

## Global Statistics

Retrieve aggregate statistics across all links.

```http
GET /api/stats
X-API-Key: your-api-key
```

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `days` | integer | `30` | `365` | Number of days for time-series data |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created (new link) |
| `400` | Bad Request (invalid input) |
| `401` | Unauthorized (missing/invalid API key) |
| `404` | Not Found (link doesn't exist) |
| `409` | Conflict (short code already exists) |
| `500` | Internal Server Error |

---

# Integration Examples

## JavaScript / Node.js

```javascript
const PDUB_API = 'https://pdub.click/api';
const API_KEY = process.env.PDUB_API_KEY;

async function createShortLink(url, customCode = null, title = null) {
  const response = await fetch(`${PDUB_API}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ url, customCode, title })
  });
  
  const result = await response.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

// Usage
const link = await createShortLink(
  'https://philippdubach.com/blog/post',
  'jan-post',
  'January Blog Post'
);
console.log(link.shortUrl); // https://pdub.click/jan-post
```

## Python

```python
import requests
import os

PDUB_API = 'https://pdub.click/api'
API_KEY = os.environ['PDUB_API_KEY']

def create_short_link(url, custom_code=None, title=None):
    response = requests.post(
        f'{PDUB_API}/links',
        headers={'X-API-Key': API_KEY},
        json={
            'url': url,
            'customCode': custom_code,
            'title': title
        }
    )
    data = response.json()
    if not data['success']:
        raise Exception(data['error'])
    return data['data']

# Usage
link = create_short_link(
    'https://philippdubach.com/newsletter',
    custom_code='news',
    title='Newsletter Signup'
)
print(link['shortUrl'])  # https://pdub.click/news
```

## cURL

```bash
# Create link
curl -X POST https://pdub.click/api/links \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PDUB_API_KEY" \
  -d '{"url": "https://example.com", "customCode": "example"}'

# Get link stats
curl https://pdub.click/api/links/example/stats \
  -H "X-API-Key: $PDUB_API_KEY"

# Delete link
curl -X DELETE https://pdub.click/api/links/example \
  -H "X-API-Key: $PDUB_API_KEY"
```

---

# Self-Hosting Guide

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
npm install
```

### 2. Create Cloudflare Resources

```bash
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create "URLS"

# Create D1 database
npx wrangler d1 create pdub-analytics
```

### 3. Configure wrangler.toml

Update with your resource IDs:

```toml
[[kv_namespaces]]
binding = "URLS"
id = "your-kv-namespace-id"

[[d1_databases]]
binding = "DB"
database_name = "pdub-analytics"
database_id = "your-d1-database-id"

[vars]
DASHBOARD_ORIGIN = "https://your-domain.com"
```

### 4. Set Secrets

```bash
# Generate and set API key (32 bytes hex)
openssl rand -hex 32 | npx wrangler secret put API_KEY

# Set admin password
npx wrangler secret put ADMIN_PASSWORD
# Enter a strong password when prompted
```

### 5. Run Migrations

```bash
npx wrangler d1 execute pdub-analytics --remote --file=./src/db/schema.sql
```

### 6. Deploy

```bash
npm run deploy
```

### 7. Add Custom Domain

1. Go to Cloudflare Dashboard → Workers & Pages → your worker
2. Settings → Domains & Routes → Add Custom Domain
3. Enter your domain (must be on Cloudflare DNS)

---

# Development

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local development server |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run db:migrate` | Run migrations on local D1 |
| `npm run db:migrate:prod` | Run migrations on production D1 |
| `npm run typecheck` | Run TypeScript type checking |

## Local Development

```bash
# Start dev server
npm run dev

# The worker will be available at http://localhost:8787
```

---

# Security Features

## Authentication
- **Timing-safe comparisons** for API keys and session tokens
- **HMAC-based session tokens** with timestamp for expiry validation
- **24-hour session validity** with automatic expiration

## Input Validation
- All short codes validated against strict regex pattern
- URL validation ensures only HTTP/HTTPS protocols
- Input sanitization removes control characters
- Length limits on all text fields

## Privacy
- IP addresses are hashed with SHA-256
- Daily salt rotation prevents long-term tracking
- User agents limited in stored length
- No PII stored in analytics

## Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` on dashboard
- `Referrer-Policy: strict-origin-when-cross-origin`
- CORS properly configured

---

# SEO Considerations

This shortener uses **301 permanent redirects** which:

- ✅ Pass full link equity (PageRank) to destination URLs
- ✅ Signal to search engines the destination is canonical
- ✅ Prevent short URLs from appearing in search results
- ✅ Preserve SEO value of backlinks through redirects

The `robots.txt` explicitly disallows crawling of short URLs.

---

# Cost Estimation

| Tier | Links | Redirects/Month | Est. Cost |
|------|-------|-----------------|-----------|
| Free | <1,000 | <100,000 | **$0** |
| Light | <10,000 | <3M | **~$5/mo** |
| Medium | <100,000 | <15M | **~$8/mo** |

Costs based on Cloudflare Workers Paid plan ($5/mo base) + KV/D1 usage.

---

# Changelog

## v1.1.0 (2026-01-11)
### Security
- Added timing-safe string comparison for API keys and sessions
- Improved session token generation with proper HMAC
- Added input sanitization for all text inputs
- Added security headers to responses

### Performance
- Added composite database indexes for common queries
- Centralized application constants
- Improved pagination validation

### Reliability  
- Added link active status check on redirect
- Improved error handling consistency
- Delete operation now removes associated clicks
- Added database constraints for data integrity

### Code Quality
- Added proper TypeScript types for database rows
- Removed unused code and duplicate constants
- Updated dependencies and package.json scripts

---

# License

MIT
