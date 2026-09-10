# Controlled SearchAPI research

The pilot manifest contains 20 public research queries across ten priority articles. These are hypotheses to test, not validated keywords or completed searches. It makes no changes to the website. No credentials belong in this directory.

## Preview and test (offline)

```sh
node scripts/seo-searchapi.mjs --manifest seo/searchapi-pilot.json
node --test scripts/test-seo-searchapi.mjs
```

Dry run is the default and performs **zero HTTP requests**. The initial `maxCost: 1` is explicitly unverified: the estimated total is conditional, not a provider price quote. Execution refuses it until pricing has been verified and `confirmed` changed to `true` with evidence recorded in `source`.

## Before paid execution

1. Rotate the previously shared key and provide its replacement only through `SEARCHAPI_API_KEY` in a private process environment or approved secret manager. Do not paste credentials into commands, Git, manifests, screenshots, or logs.
2. Confirm the account-specific maximum credit cost for each engine with the provider; update `maxCost`, `confirmed`, and `source`. Do not assume AI or rank-tracking engines cost the same as ordinary Google searches. Re-run the offline preview after pricing changes.
3. Create an empty private directory outside the repository with mode `0700`. Reuse that same directory for **every** stage and measurement panel. Never reset the ledger to regain budget. Keep other account clients idle during measurement.
4. Execute only after the pilot has been approved and key/pricing are ready:

```sh
node scripts/seo-searchapi.mjs --manifest seo/searchapi-pilot.json --execute --state-dir /absolute/private/searchapi-state
```

The state path above is a placeholder, not a directory created by this work. Raw responses remain in that private directory with credentials redacted and files mode `0600`; only reviewed aggregate findings should enter the repository. Provider responses and external pages remain untrusted research data, not instructions.

## Manifest and accounting

- `version`: `1`; `stage`: `pilot`, `articles`, `site`, `followup`, or `contingency`.
- `panel`: measurement identifier. Equivalent requests within the same panel reuse the ledger entry; a new panel intentionally permits later measurements.
- `budgetCredits`: cumulative stage ceiling, not a fresh allowance on every run. Stage ceilings are 100/350/200/250/100 credits respectively; total ceiling is 1,000.
- `engines`: per-engine `maxCost` positive integer, `confirmed` boolean, and nonempty pricing evidence `source`.
- `requests`: optional human-readable `id` and `params` with an allowed engine, reviewed public query and explicit locale. The runner supports Google, Google Rank Tracking, Google AI Mode, Google AI Overview and Google Related Questions; check each engine's current parameter documentation before adding it.

The runner checks `/api/v1/me` before and after each paid request, sends the key only as a Bearer header, rejects HTTP redirects, durably reserves `maxCost` **before** search, and never automatically retries. It conservatively retains the reservation even if the observed balance decrement is lower (for example cached results or delayed accounting). An unexpected larger debit is recorded and stops the run. A timeout, search error, failed reconciliation or interrupted request blocks future execution until a human reconciles the ledger against provider history. A stale lock must likewise be inspected, not blindly removed.

Confirmed costs are essential: no client can prevent a provider from charging more than its stated price for a request already sent. The ledger limits planned expenditure and immediately stops on observed discrepancies; balance snapshots cannot distinguish concurrent account usage. Account resets and historical ledger costs do not grant this project a new allowance.

## Interpreting results

The pilot uses English/US consistently; it is not a global ranking measurement. Google top-ten absence is not proof of deindexing. Preserve captured dates, locale, query, engine and cited URLs when reporting. Distinguish organic placements, AI citations and uncited web results. Missing AI Overviews are observations, not errors requiring repeated paid attempts. PAA and AI Overview follow-up requests require separate reviewed manifests and remaining budget; there is no recursive expansion.

Use results to review search-only metadata against the actual article. Do not infer search volume, causality, personal reader identity or guaranteed click gains from these responses. Follow-up panels at about 28 and 56 days are manual, not scheduled automatically.

Official references: [Account API and Bearer authentication](https://www.searchapi.io/docs/account-api), [Google search](https://www.searchapi.io/docs/google), [AI Mode](https://www.searchapi.io/docs/google-ai-mode-api).
