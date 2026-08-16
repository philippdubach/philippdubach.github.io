# Cloudflare automation

This workspace contains the five production Workers and their shared social-delivery library.

| Directory / package | Deployed Worker | Purpose |
|---|---|---|
| `security-headers` | `security-headers` | Headers, redirects, cache variants, and Markdown negotiation |
| `goatcounter-worker` | `weekly-top-goatcounter-api` | Most-read footer data |
| `build-trigger` | `build-trigger` | Scheduled GitHub workflow dispatch |
| `bluesky worker` / `social-poster-worker` | `social-poster` | Bluesky discovery and queued delivery |
| `twitter worker` / `twitter-poster` | `twitter-poster` | Twitter discovery and queued delivery |
| `shared` / `@social/shared` | not deployed alone | Auth, RSS, generation, scoring, jobs, and durable gate |

## Toolchain

Use Node 24.19.0 and the exact root Wrangler 4.123.0 pin. The root lockfile is the only lockfile.

```bash
cd social-automation
nvm use
npm ci --ignore-scripts
npm test
npm run check
```

`npm test` validates the toolchain and runs the Node and Workers-runtime suites. `npm run check` packages all five Workers with `wrangler deploy --dry-run`; it never deploys.

Deploy one Worker at a time only after the complete test and dry-run commands pass:

```bash
npm run deploy --workspace social-poster-worker
npm run deploy --workspace twitter-poster
npm run deploy --workspace goatcounter-worker
npx --no-install wrangler deploy --config security-headers/wrangler.toml
npx --no-install wrangler deploy --config build-trigger/wrangler.toml
```

Record `wrangler versions list` before each deployment and keep its prior version ID available for `wrangler rollback`.

## Social delivery

Both platform Workers run every six hours and are also notified after site deployment. Discovery, article extraction, dual-model generation (`@cf/openai/gpt-oss-120b` and `@cf/openai/gpt-oss-20b`), scoring, and dry previews remain synchronous. Non-dry publication is asynchronous:

```text
RSS / manual trigger
        |
        v
validated PostJob --> platform Queue --> SQLite PostGate --> platform API
                              |                 |
                              |                 +--> published / failed / uncertain
                              v
                         platform DLQ --> failed:<job-key> KV archive
```

Manual non-dry `/trigger` and `/test` calls return HTTP 202. A deterministic job key and the durable gate prevent concurrent duplicate publication. Ambiguous external writes become terminal `uncertain` and are never sent again automatically.

Queue names and the reconciliation procedure are documented in [OPERATIONS.md](../OPERATIONS.md). Platform-specific secrets and endpoint details remain in each Worker README and protected Cloudflare configuration.
