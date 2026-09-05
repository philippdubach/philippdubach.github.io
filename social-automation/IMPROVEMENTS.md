# Social automation improvement log

This began as the May 2026 Worker backlog. The completed foundation is recorded here so future work does not start from stale assumptions.

## Current state — 2026-08-16

Both platform Workers run every six hours as a recovery path and receive deployment-trigger notifications. They parse recent RSS items, fetch the article, generate candidates with `@cf/openai/gpt-oss-120b` and `@cf/openai/gpt-oss-20b`, score them, and enqueue a strict seven-field job. Shared code owns auth, RSS, prompting, generation, scoring, rate limits, job validation, and the SQLite durable delivery gate.

Publication is Queue-backed. `attempting` is persisted before one platform create request. A known pre-send failure or 429 returns to `pending`; an ambiguous request becomes terminal `uncertain` and is never replayed automatically. Exhausted messages move to a platform DLQ and are archived in KV. The two Workers preserve their existing `posts:` read model and authenticated dry/status/backfill interfaces.

The workspace uses Node 24.19.0, exact Wrangler 4.129.0 (updated 2026-09-05), one committed lockfile, Workers observability, Workers-runtime Queue/KV/DO tests, and dry-run packaging for all five Workers.

## Completed foundation

- [x] Extract the shared library used by Bluesky and Twitter.
- [x] Use structured JSON-schema model output.
- [x] Generate candidates with two models and select with deterministic scoring.
- [x] Trigger discovery after deployment; retain the six-hour cron as a safety net.
- [x] Add platform Queues, DLQs, deterministic jobs, and SQLite Durable Object gates.
- [x] Prevent automatic replay after an ambiguous external write.
- [x] Preserve scorer metadata and the legacy `posts:` read model across Queue delivery.
- [x] Add real Workers-runtime tests, including broker retry exhaustion and DLQ transfer.
- [x] Add a reproducible Node/Wrangler workspace, CI validation, and observability sampling.

## Remaining work

- [ ] Add an authenticated reconciliation tool for reviewed `failed`/`uncertain` recovery. It must verify the platform before changing a terminal gate; a generic replay button is unsafe.
- [ ] Add engagement reporting 24 hours after publication. Keep it descriptive until there is enough data for a reliable feedback loop.
- [ ] Evaluate evergreen resharing with a separate versioned job identity and a strict per-platform policy.
- [ ] Add Twitter media support only after confirming current API tier, upload endpoint, and idempotency behavior.
- [ ] Add image alt text and platform-specific image crops.
- [ ] Record per-model failures and candidate selection metrics with structured logs.
- [ ] Add a deterministic text fallback if both Workers AI model calls fail; currently discovery skips the item for a later run.
- [ ] Run a hosted Queue acceptance test for the 300-second delay and `max_concurrency = 1`; the local broker tests compress time and cannot prove concurrency enforcement.

## Non-goals

- Do not replace the Durable Object with KV locks. KV is eventually consistent and cannot protect an external side effect.
- Do not automatically replay `uncertain` jobs. Twitter and Bluesky create APIs do not close the crash boundary with an idempotency key.
- Do not combine model experiments with delivery-state changes. Keep content quality and side-effect safety independently reversible.

Operational resource names, rollout, rollback, and DLQ reconciliation are in [OPERATIONS.md](../OPERATIONS.md).
