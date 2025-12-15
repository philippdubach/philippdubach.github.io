---
title: "Building a Real-Time HN Archive: Cloudflare Workers, AI, and 100K Posts"
seoTitle: "Building a Serverless Hacker News Archive"
slug: hn-archiver
images: ['https://static.philippdubach.com/ograph/ograph-hn-technical.jpg']
description: "A deep dive into building a serverless Hacker News archiver using Cloudflare Workers, D1, Workers AI for topic classification, and Vectorize for semantic search. Architecture patterns for real-time data collection at scale."
keywords: ["Cloudflare Workers", "D1 database", "Workers AI", "Vectorize", "serverless architecture", "real-time archiving", "Hacker News API", "TypeScript", "cron jobs", "embeddings", "semantic search", "data engineering"]
draft: false
---

>_This is the technical companion to [The First Two Hours: What 100,000 HN Posts Reveal About Online Attention](/). For the research results, see [The Attention Paradox](/standalone/hn-research/)._

I wanted to study how attention flows on Hacker News, but existing datasets only capture snapshots. To understand temporal patterns, score velocity, and content lifecycle, I needed continuous observation. So I built a real-time archiver.

The system runs entirely on Cloudflare's edge platform: Workers for compute, D1 for storage, Workers AI for classification, and Vectorize for similarity search. After a week of operation, it had collected 98,586 items with 22,457 temporal snapshots, enough data to reveal some surprising patterns about how online attention works.

Here's how it works.

## Architecture Overview

{{< img src="hn_architecture.png" alt="System architecture: HN API to Workers to D1 to AI to Vectorize" width="100%" >}}

Three cron-triggered workers handle the data pipeline:

| Worker | Schedule | Function |
|--------|----------|----------|
| **Discovery** | Every 3 min | Fetches new items from `lastSeen+1` to current `maxitem` |
| **Updates** | Every 10 min | Refreshes recently changed items via `/v0/updates` |
| **Backfill** | Every 2 hours | Revisits stale high-value items, runs AI analysis, generates embeddings |

The HN API is straightforward. `/v0/maxitem` returns the highest item ID, `/v0/updates` returns recently changed items and profiles. Individual items come from `/v0/item/{id}`. Firebase-style, real-time capable, but I opted for polling to stay within rate limits.

{{< img src="hn_cron_timeline.png" alt="Cron execution timeline showing worker frequency over 2 hours" width="100%" >}}

## Discovery: Catching New Content

The discovery worker runs every 3 minutes. It reads the last seen item ID from state, fetches the current max from HN, then iterates through the gap:

```typescript
export async function runDiscovery(env: WorkerEnv): Promise<WorkerResult> {
  const state = await getArchivingState(env.DB);
  const currentMaxId = await fetchMaxItemId();
  
  const startId = state.maxItemIdSeen + 1;
  const endId = Math.min(currentMaxId, startId + BATCH_SIZE - 1);
  
  const items = await fetchItemsBatch(startId, endId);
  const result = await batchUpsertItems(env.DB, items, getCurrentTimestampMs());
  
  await updateMaxItemId(env.DB, endId);
  return result;
}
```

Batch size is capped at 500 items per run. During peak hours, HN generates 50-100 new items per minute, so 3-minute intervals with 500-item batches keeps up comfortably.

The `batchUpsertItems` function is where things get interesting. It's designed for idempotency:

1. Fetch existing items by ID
2. Compare each field to detect actual changes
3. Only write rows that differ
4. Create snapshots based on change magnitude

This means re-running discovery on the same ID range is safe. The function returns `{ processed, changed, snapshots }` counts for monitoring.

## Snapshots: Capturing Score Evolution

Not every update deserves a snapshot. Writing 100K snapshots per day would exhaust D1's row limits quickly. Instead, I use selective triggers:

```typescript
function shouldCreateSnapshot(
  existing: HNItem | null,
  incoming: HNItem,
  reason: string
): boolean {
  if (reason === 'new_item') return true;
  if (reason === 'front_page') return true;
  
  if (existing && incoming.score - existing.score >= 20) {
    return true; // score_spike
  }
  
  // Sample every 4th update
  if (existing && existing.update_count % 4 === 0) {
    return true;
  }
  
  return false;
}
```

The `snapshot_reason` enum captures why each snapshot was created: `score_spike`, `front_page`, `sample`, or `new_item`. This metadata proved essential for the research analysis, letting me filter for specific observation types.

Snapshot schema:

```sql
CREATE TABLE item_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  score INTEGER,
  descendants INTEGER,
  snapshot_reason TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE INDEX idx_snapshots_item_time ON item_snapshots(item_id, created_at);
```

The compound index on `(item_id, created_at)` makes lifecycle queries fast: "Give me all snapshots for item X ordered by time."

## AI Classification Pipeline

{{< img src="hn_ai_pipeline.png" alt="AI pipeline: Raw story to Llama to DistilBERT to BGE to Vectorize" width="100%" >}}

Every story gets three AI treatments:

**Topic Classification** uses `@cf/meta/llama-3.2-1b-instruct` with a structured prompt:

```typescript
const TOPIC_PROMPT = `Classify this Hacker News story into exactly one category.
Categories: artificial-intelligence, programming, web-development, startups, 
science, security, crypto-blockchain, hardware, career, politics, business, 
gaming, other

Title: ${title}
URL: ${url}

Respond with only the category name.`;

const response = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
  prompt: TOPIC_PROMPT,
  max_tokens: 20,
  temperature: 0.1
});
```

Low temperature (0.1) keeps responses consistent. The 13-category taxonomy emerged from initial clustering of HN content types.

**Sentiment Analysis** uses `@cf/huggingface/distilbert-sst-2-int8`:

```typescript
const sentiment = await env.AI.run(
  '@cf/huggingface/distilbert-sst-2-int8',
  { text: title }
);
// Returns: [{ label: "POSITIVE"|"NEGATIVE", score: 0-1 }]
```

**Embeddings** for similarity search use `@cf/baai/bge-base-en-v1.5`:

```typescript
const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
  text: `${title} ${url}`
});
// Returns: { data: [[...768 floats]] }

await env.VECTORIZE.insert([{
  id: itemId.toString(),
  values: embedding.data[0],
  metadata: { topic: item.ai_topic, score: item.score }
}]);
```

The 768-dimensional BGE embeddings go into Cloudflare's Vectorize index for cosine similarity search. Finding related posts becomes a single API call:

```typescript
const similar = await env.VECTORIZE.query(embedding, { topK: 5 });
```

## Budget Constraints

Cloudflare's paid plan includes generous but finite quotas. The system is designed to stay well within them:

{{< img src="hn_budget_limits.png" alt="Budget constraints: Vectorize queries, stored vectors, embeddings per run" width="90%" >}}

```typescript
// src/types.ts
export const BudgetLimits = {
  VECTORIZE_QUERIES_PER_DAY: 1500,
  VECTORIZE_MAX_STORED_VECTORS: 10000,
  EMBEDDING_BATCH_SIZE: 50,
  D1_READS_PER_DAY: 500_000_000
};
```

Usage tracking happens in the `usage_counters` table:

```typescript
async function checkUsageLimits(db: D1Database, key: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const counter = await getUsageCounter(db, `${key}_${today}`);
  return counter < BudgetLimits[key];
}

async function incrementUsageCounter(db: D1Database, key: string, delta: number) {
  await db.prepare(
    `INSERT INTO usage_counters (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = value + ?`
  ).bind(key, delta, delta).run();
}
```

The `/api/usage` endpoint exposes current consumption. Warnings appear at 80% of limits.

## Security Patterns

Several patterns keep the system safe:

**Rate limiting** uses an in-memory map with 100 requests/IP/minute limit:

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || limit.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (limit.count >= 100) return false;
  limit.count++;
  return true;
}
```

**Timing-safe auth comparison** prevents timing attacks on the trigger secret:

```typescript
import { timingSafeEqual } from './utils';

function validateAuth(header: string | null, secret: string): boolean {
  if (!header?.startsWith('Bearer ')) return false;
  const token = header.slice(7);
  return timingSafeEqual(token, secret);
}
```

**Fail-closed auth** returns 503 if `TRIGGER_SECRET` isn't configured, never proceeds with missing credentials:

```typescript
if (!env.TRIGGER_SECRET) {
  return new Response('Auth not configured', { status: 503 });
}
```

**Parameterized SQL everywhere**. No string interpolation, ever:

```typescript
// Good
const items = await db.prepare(
  'SELECT * FROM items WHERE id = ?'
).bind(itemId).all();

// Never
const items = await db.prepare(
  `SELECT * FROM items WHERE id = ${itemId}` // SQL injection risk
).all();
```

## Local Development

The full stack runs locally via Wrangler:

```bash
# Initialize local D1
npx wrangler d1 execute hn-archiver --local --file=schema.sql

# Start dev server
npm run dev  # localhost:8787

# Trigger workers manually
curl -H "Authorization: Bearer $SECRET" localhost:8787/trigger/discovery
```

For testing, Vitest with Miniflare provides mocked D1/AI/Vectorize bindings:

```typescript
describe('batchUpsertItems', () => {
  it('creates snapshots on score spikes', async () => {
    const db = await getMiniflareD1();
    
    // Insert initial item
    await batchUpsertItems(db, [{ id: 1, score: 10, ... }], now);
    
    // Update with 25-point jump
    const result = await batchUpsertItems(db, [{ id: 1, score: 35, ... }], now + 1000);
    
    expect(result.snapshots).toBe(1);
    
    const snapshot = await db.prepare(
      'SELECT * FROM item_snapshots WHERE item_id = 1'
    ).first();
    expect(snapshot.snapshot_reason).toBe('score_spike');
  });
});
```

## What I Learned

Building this system taught me several lessons:

**Idempotency matters for data pipelines.** Cron jobs fail, restart, and overlap. Every write operation needs to handle re-runs gracefully. The upsert pattern with change detection made debugging much simpler.

**Selective snapshots beat exhaustive logging.** I initially tried capturing every score change. D1's row limits forced a better approach. The trigger-based system captures the interesting moments while staying within budget.

**Edge AI is production-ready.** Workers AI handled 50 stories per backfill run without issues. Latency is acceptable (200-500ms per classification), and the models are good enough for research categorization. I wouldn't use them for customer-facing classification without human review, but for analytics they work well.

**Budget awareness should be built in.** Tracking usage counters from day one prevented nasty surprises. The 10K vector limit in Vectorize shaped the retention policy: I only embed high-scoring stories, not every comment.

The full source is at [github.com/philippdubach/hn-archiver](https://github.com/philippdubach/hn-archiver). Analysis code is at [github.com/philippdubach/hn-analyzer](https://github.com/philippdubach/hn-analyzer). PRs welcome.

---

The architecture patterns here, serverless cron workers, idempotent upserts, selective event capture, edge AI classification, transfer directly to enterprise use cases. I've applied similar approaches to client analytics systems in banking, where real-time behavioral data feeds ML models for personalization and next-best-action recommendations. The technical constraints differ (compliance, latency requirements, integration complexity), but the core design principles remain: build for observability, design for failure, and let budget constraints shape architecture decisions early.
