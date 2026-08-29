# Production operations

This is the non-secret runbook for `philippdubach.com`. It records the state verified on 2026-08-16. Credentials, backup repository details, protected configuration values, and host addresses stay outside the repository.

## Service map

| Component | Role | Verified version / state |
|---|---|---|
| Hetzner, Debian 13 | Primary production host | Static site and self-hosted services |
| Forgejo | Source of truth and Git endpoint | 15.0.6 LTS, loopback behind Caddy |
| Hugo Extended | Production site builder | 0.165.0 |
| Caddy | TLS and reverse proxy | 2.11.4 |
| PostgreSQL | Forgejo and Listmonk data | 17.11 |
| Listmonk | Newsletter | 6.1.0 |
| GoatCounter | Privacy-preserving analytics | 2.7.0 |
| Restic | Encrypted off-host backups | 0.18.0 |
| Cloudflare | DNS, CDN, Workers, Queues, R2 | External edge services |
| GitHub Pages | Warm standby | Built by the pinned GitHub Actions workflow |

## Legacy administrative-host decommission

A former, non-production administrative host is powered off and scheduled for deletion. It is not an origin or dependency for the site, Forgejo, Listmonk, GoatCounter, backups, or direct production administration. Do not add it to deployment, recovery, or troubleshooting paths. A separate endpoint historically ran on that host; its retirement is tracked outside this repository.

Application services bind to loopback. Caddy is the public HTTP boundary. The production site is an immutable Hugo release under `/var/lib/site-build/public-*`; `/var/www/site/current` points atomically to the active release.

## Source and deployment

Forgejo is authoritative. The local `origin` has separate GitHub and Forgejo push URLs, so verify both before release:

```bash
git remote --verbose
git push origin main
```

A Forgejo webhook starts the primary `site-build.service`. `site-build.timer` is a roughly 12-hour recovery path. The build updates `/var/www/site/current` only after Hugo succeeds. The GitHub push builds the Pages standby, purges Cloudflare cache, and invokes social trigger notifications. A successful Pages workflow starts IndexNow. The `build-trigger` Worker also dispatches the Hugo workflow for scheduled publication checks.

Release checks:

1. Match the pushed commit on GitHub and Forgejo.
2. Require the Forgejo webhook build to succeed and the active release symlink to change to the intended timestamp.
3. Require the GitHub Pages workflow and follow-on IndexNow workflow to succeed.
4. Check the public canonical page, `/index.xml`, `/feed.json`, `/api/posts.json`, `/sitemap.xml`, `/llms.txt`, and the Markdown variant of one article.
5. A green GitHub workflow is not proof that the primary Hetzner build or Cloudflare purge succeeded; verify the public domain.

For a site rollback, resolve one exact known-good `/var/lib/site-build/public-<timestamp>` directory, validate it, and atomically repoint `/var/www/site/current`. Never use an unresolved glob or remove release directories during an incident.

## Backups and maintenance gate

- `pg-backup.timer` creates compressed PostgreSQL dumps.
- `restic-backup.timer` creates daily encrypted snapshots.
- `restic-check.timer` performs a weekly repository check.

Before a Forgejo, PostgreSQL, or host upgrade:

1. Restore the latest PostgreSQL dump into a separate PostgreSQL 17 cluster with TCP disabled and a private Unix socket.
2. Restore representative Forgejo repository/state files and run `git fsck` on a bare repository.
3. Stop the temporary cluster and remove only its validated temporary directory.
4. Drain Forgejo queues, stop Forgejo, then run fresh `pg-backup.service` and `restic-backup.service` as a paired recovery point.
5. Preserve the exact old binary/package and verify signatures or checksums for both upgrade and rollback artifacts.
6. Upgrade, run Forgejo health/doctor checks and a disposable Hugo build, then reboot only after pre-reboot checks pass.

The 2026-08-16 drill replayed a complete dump in an isolated cluster and restored a representative repository successfully. It validates maintenance rollback, not full-host disaster recovery. A full drill must also exercise every repository/attachment, application login, clone/push, newsletter delivery, and DNS failover.

## Worker toolchain

The only supported release toolchain is Node 24.19.0 with the repository-pinned Wrangler 4.127.1:

```bash
cd social-automation
nvm use
npm ci --ignore-scripts
npm test
npm run check
```

The root lockfile is authoritative. Do not deploy with a globally installed Wrangler or Node 25.

| Worker | Purpose | Observability sample |
|---|---|---:|
| `security-headers` | Security headers, cache variants, redirects, Markdown negotiation | 0.01 |
| `weekly-top-goatcounter-api` | Most-read footer API | 0.05 |
| `build-trigger` | Scheduled GitHub workflow dispatch | 1.00 |
| `social-poster` | Bluesky discovery and queued delivery | 1.00 |
| `twitter-poster` | Twitter discovery and queued delivery | 1.00 |

All repository configs target compatibility date `2026-08-16`. Deploy Workers separately and record the previous version before each change:

```bash
npx --no-install wrangler versions list --config security-headers/wrangler.toml
npx --no-install wrangler deploy --config security-headers/wrangler.toml
npx --no-install wrangler rollback <previous-version-id> --config security-headers/wrangler.toml
```

For the security Worker, validate HTML and `Accept: text/markdown` variants, `Vary: Accept`, CSP/HSTS, permanent RSS redirects, 410/redirect rules, and cache behavior. Purge Cloudflare cache after the final validated version. Deploy GoatCounter and build-trigger separately; observe one safe scheduled build-trigger execution.

The security Worker also serves the intentionally public IndexNow verification
file from its `INDEXNOW_KEY` secret binding. Keep that binding equal to the
GitHub Actions `INDEXNOW_KEY` secret before deploying or rotating the key:

```bash
npx --no-install wrangler secret put INDEXNOW_KEY --config security-headers/wrangler.toml
curl --fail "https://philippdubach.com/<key>.txt"
```

On Hetzner, `/etc/site-build/indexnow-key` must remain owned by
`root:site-build` with mode `0640`. The build runs as `site-build`, so verify
the service account can read the rotated file before the next deployment:

```bash
sudo chown root:site-build /etc/site-build/indexnow-key
sudo chmod 0640 /etc/site-build/indexnow-key
sudo -u site-build test -r /etc/site-build/indexnow-key
```

The IndexNow workflow now verifies the apex key response before submitting any
URLs, so a missing or mismatched binding fails before the external API call.

## Browser analytics

GoatCounter is the site's browser analytics path. Hugo serves a fingerprinted,
self-hosted copy of `count.js`, which sends page views to
`https://stats.philippdubach.com/count`. Cloudflare Web Analytics/RUM is
redundant, so its currently active automatic JavaScript injection should be
disabled.

This is an account-level Cloudflare Web Analytics setting, not a Hugo or Worker
setting. In the Cloudflare dashboard, open **Web Analytics**, select the site
for `philippdubach.com`, choose **Manage site**, and set automatic setup to
**Disable**. The equivalent API operation requires an API token with Account
Settings Write permission:

```bash
curl --fail --silent --show-error \
  "https://api.cloudflare.com/client/v4/accounts/<account-id>/rum/site_info/list" \
  --header "Authorization: Bearer <api-token>"

curl --fail --silent --show-error \
  --request PUT \
  "https://api.cloudflare.com/client/v4/accounts/<account-id>/rum/site_info/<site-id>" \
  --header "Authorization: Bearer <api-token>" \
  --header "Content-Type: application/json" \
  --data '{"auto_install":true,"enabled":false,"zone_tag":"<zone-id>"}'
```

Resolve the site ID from the list response and preserve the matching zone ID;
never place the token or identifiers in the repository. Verify from a non-EU
vantage point, because the `lite` mode can suppress injection only for EU/EEA
visitors. Once the deployed HTML no longer contains or requests
`static.cloudflareinsights.com/beacon.min.js`, remove
`https://static.cloudflareinsights.com` from `script-src` and
`https://cloudflareinsights.com` from `connect-src` in all three CSP copies:
the Hugo meta policy, `static/_headers`, and the security Worker. Keep both
`'self'` and the explicit `https://stats.philippdubach.com` allowance in
`connect-src`; GoatCounter depends on the latter.

## Social Queues

Resources:

| Platform | Main Queue | Dead-letter Queue |
|---|---|---|
| Bluesky | `social-poster-post-jobs` | `social-poster-post-jobs-dlq` |
| Twitter | `twitter-poster-post-jobs` | `twitter-poster-post-jobs-dlq` |

Create them once, before the first social Worker deployment:

```bash
cd social-automation
npx --no-install wrangler queues create social-poster-post-jobs
npx --no-install wrangler queues create social-poster-post-jobs-dlq
npx --no-install wrangler queues create twitter-poster-post-jobs
npx --no-install wrangler queues create twitter-poster-post-jobs-dlq
```

Each job key is `v1:<platform>:<article-id>`. A SQLite Durable Object is the side-effect gate. Its states are:

- `pending`: eligible for a claim;
- `attempting`: persisted before the external create request;
- `published` or `backfilled`: successful terminal states;
- `failed`: known invalid/auth terminal state;
- `uncertain`: the request may have reached the platform; never replay automatically.

The main Queue uses one-message batches, one consumer, three retries, and a 300-second retry delay. A known pre-send failure or 429 returns to `pending`. Network errors, timeouts, 5xx responses, and response-parse failures become `uncertain`; later deliveries consume retries without another platform request. The DLQ consumer writes `failed:<job-key>` in the existing KV namespace before acknowledging.

Non-dry `/trigger` and `/test` return HTTP 202 after enqueue. `dry=true` remains synchronous and writes no Queue, KV, Durable Object, or platform state. The six-hour cron is a recovery path; deployment webhooks provide prompt discovery.

### DLQ reconciliation

Never requeue an `uncertain` job merely because the platform response was missing.

1. Preserve the `failed:<job-key>` record and record the Worker version and Queue message ID.
2. Inspect the target platform independently for the canonical article URL and expected account.
3. If the post exists, repair only the legacy `posts:` read model through a reviewed administrative change; keep the durable gate terminal.
4. If the post is proven absent, use a reviewed reconciliation change that explicitly moves the gate or creates a new versioned job key. Do not delete Durable Object state or enqueue the same key blindly.
5. For `failed`, correct the authentication or payload cause first, then use the same reviewed reconciliation path.

There is intentionally no generic replay endpoint. Twitter and Bluesky create APIs cannot provide exactly-once delivery across a process crash, so preventing duplicate public posts takes priority over automatic recovery from ambiguity.

## Incident checklist

1. Stop mutation: pause the affected deployment or Queue consumer; do not purge evidence.
2. Capture exact versions, service states, Queue/KV job keys, and public symptoms without copying secrets.
3. Prefer the smallest rollback: Worker version rollback, previous immutable site release, verified Hugo package, or paired Forgejo data/binary restore.
4. Re-run health checks and verify public behavior from outside the host.
5. Record the cause and add a regression test before resuming automation.
