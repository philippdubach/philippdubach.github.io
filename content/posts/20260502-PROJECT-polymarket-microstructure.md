+++
title = "The Anatomy of a Decentralized Prediction Market: Notes from the Polymarket Order Book"
seoTitle = "Polymarket Order-Book Microstructure: Stylized Facts and Measurement"
date = 2026-05-02
publishDate = 2026-05-02T05:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-polymarket-microstructure.jpg"]
card_image = "sf8_depth_decay.png"
description = "A 624 GB tick-level archive of Polymarket's WebSocket feed joined to the on-chain trade record reveals eight cross-sectional stylized facts and a measurement result: the public feed only recovers trade direction 59% of the time."
doi = "10.48550/arXiv.2604.24366"
keywords = ["Polymarket microstructure", "decentralized prediction market order book", "Polymarket WebSocket feed", "CTF Exchange OrderFilled", "longshot spread premium prediction markets", "trade direction inference Polymarket", "Lee-Ready algorithm crypto", "Kyle's lambda Polymarket", "prediction market wash trading", "Polygon CLOB microstructure", "decentralized finance market microstructure", "on-chain trade direction", "30 billion order book events", "Polymarket research replication"]
categories = ["Quantitative Finance"]
type = "Project"
math = true
draft = false
takeaways = [
  "Polymarket's lowest-probability decile carries a 650-900 bps half-spread, an order of magnitude wider than US equities, and looks more like a liquidity-provision constraint than a behavioral longshot bias.",
  "Trade direction inferred from Polymarket's public WebSocket feed agrees with the on-chain OrderFilled record only 59% of the time, barely above the 50% chance baseline and 22 points below Lee-Ready accuracy on Nasdaq.",
  "On the top-100 stratum, the effective half-spread changes sign between feed-inferred and on-chain trade directions in 67% of markets, and Kyle's lambda flips sign in 60%, so any direction-dependent measure must be sourced on-chain.",
  "The pre-registered 600-market panel covers 30.3 billion order-book events across 52 days joined to 255 million on-chain OrderFilled events, with the full pipeline released as a Zenodo replication package.",
]
faq = [
  {question = "What does Polymarket's public WebSocket feed actually expose?", answer = "Two event types: book_snapshot (a complete L2 snapshot of one side of one market on subscription and at irregular intervals) and price_change (a delta with the new resting size at one level). The change_side field marks which side of the book moved, not which side initiated the trade. The feed never identifies the taker, so an inference algorithm working from the feed alone cannot reliably reconstruct the aggressor sign."},
  {question = "Why does trade-direction inference fail on Polymarket?", answer = "Standard practice on equity venues uses Lee-Ready or its variants, which assume the feed exposes enough information to distinguish buyer-initiated from seller-initiated trades. The Polymarket feed does not expose that information: change_side marks which side of the book moved, not which side initiated the trade. Sign agreement between feed-inferred and on-chain trade directions sits at about 59% volume-weighted across the top-100 stratum and four 7-day windows, just above the 50% chance baseline and well short of the about 80% accuracy Lee-Ready achieves on Nasdaq."},
  {question = "How wide are spreads on Polymarket compared to equity markets?", answer = "On Polymarket, the median quoted half-spread on the central price decile is around 200 bps relative to mid. On the lowest-probability decile, the half-spread runs 650-900 bps. On liquid US equities post-decimalization, effective half-spreads sit in the single-digit-basis-point range. Polymarket is roughly an order of magnitude wider, consistent with longer-horizon prediction-market positions and substantially smaller market-maker capital."},
  {question = "Is wash trading a problem on Polymarket?", answer = "Self-counterparty wash share has a median of 0.97% per market across the 600-market panel, with p90 at 4.5%, p99 at 10.6%, and a maximum of 22.2%. This is a lower bound by construction: the detector covers direct self-match and one-step roundtrip patterns, not the multi-counterparty graph patterns that network-based classifiers detect. Cong et al. (2023) document wash shares of 25-70% on unregulated cryptocurrency token exchanges; Polymarket sits well below that range, but the venue-class incentive environment differs."},
  {question = "What is the longshot spread premium?", answer = "Quoted half-spread climbs from about 200 bps in the central [0.4, 0.6] mid-price range to 1,300-1,800 bps full quoted spread (650-900 bps half-spread) on the lowest-probability decile. The pattern is asymmetric: the low-probability side is wider than the high-probability side. The order of magnitude reads less like a behavioral longshot bias and more like a liquidity-provision constraint: low-probability binary contracts have a bounded upside and an asymmetric downside for the maker, so the inventory-risk premium on the wide side is mechanically larger than on a continuous-payoff sportsbook market."},
  {question = "How can microstructure researchers correctly measure Polymarket?", answer = "Source trade direction from on-chain OrderFilled events on the CTF Exchange smart contract, not from the public WebSocket feed. The asset-id fields in OrderFilled (makerAssetId and takerAssetId) identify which side held USDC, which gives the aggressor sign deterministically. The replication package at github.com/philippdubach/polymarket-microstructure performs the off-chain to on-chain join and exposes a small patch set that lets existing measure code accept injected authoritative trades."},
]
+++

<br>

I spent the last two months running a Polymarket order-book collector. The collector runs on a small VM, subscribes to the public WebSocket feed, and writes one Parquet file per UTC hour. By 2026-04-15 the archive had grown to 1,262 hourly files, 30,287,264,368 events, 623.8 GB on disk, covering 52 calendar days and 385,198 distinct market ids. The first version of the [paper](https://arxiv.org/abs/2604.24366) is up on arXiv, the [replication package](https://github.com/philippdubach/polymarket-microstructure) is on GitHub and Zenodo (DOI [10.5281/zenodo.19811426](https://doi.org/10.5281/zenodo.19811426)), and the manuscript is under review at the [Journal of Financial Markets](https://www.sciencedirect.com/journal/journal-of-financial-markets).

This post walks through what's in it.

## Why bother

Prediction markets aggregate dispersed beliefs into a single price that, in equilibrium, behaves like a probability. The empirical literature has historically focused on price-level questions: forecast accuracy, calibration against realised outcomes, the longshot bias, and the extent to which informed and uninformed traders coexist on the same venue. Yet microstructure is what determines the trading cost of holding an informational position, and the wider the cost, the smaller the informational signal that survives to the price. A prediction market with noisy microstructure produces noisier prices than the headline-level aggregation literature implicitly assumes.

The microstructure of prediction markets has remained under-studied. Limit-order-book depth profiles, spread decompositions, and the behaviour of liquidity providers near resolution were largely unobservable on the early venues, which used scoring rules (IEM, Hanson's logarithmic market scoring rule) or sparse parimutuel pools. Polymarket changed this. Since 2021 the venue has run a limit-order-book exchange on Polygon, settling in USDC against an on-chain conditional-token contract. The infrastructure is finally there. What's missing is the data work to actually use it.

## Two contributions

The paper has two empirical contributions, ordered by weight for the literature.

The first is a measurement result. Trade direction inferred from Polymarket's public feed is noise-dominated: about 59% volume-weighted sign agreement with the on-chain ground truth on the top-100 stratum, well below the 80% Lee-Ready achieves on equities. Any Polymarket microstructure result that depends on trade direction has to source it from on-chain `OrderFilled` events.

The second is a set of eight cross-sectional stylized facts on a pre-registered 600-market panel, observed simultaneously over a single 28-day scrape window, with microstructure measures computed on the full event tape and a direct on-chain trade record. None of the eight facts requires the on-chain join, and each is reported on the full panel.

The two are complementary. The stylized facts characterise Polymarket's microstructure on its own terms. The measurement result sets the conditions under which any trade-direction-dependent statement about Polymarket can be trusted.

## The data

The primary input is a continuous tick-level archive of the public WebSocket feed from 2026-02-21 16:00 UTC through 2026-04-15 08:00 UTC. The schema is preserved verbatim from the WebSocket payload; eager Pydantic parsing was a multi-hour operation at this row count, so I parsed JSON only on the events that survived market-id and time-window filters.

Joining to on-chain trades took most of the engineering time. Polymarket's CTF Exchange smart contract logs `OrderFilled` events whose payloads identify both counterparties and the aggressor side. I scraped 255,425,405 fills across a 28-day calibration window (2026-02-28 to 2026-03-27) using batched `eth_getLogs` calls against a Polygon RPC provider, with adaptive chunk sizing that respects provider-specific rate limits. The off-chain feed is keyed on `market_id`, the on-chain record on `makerAssetId` / `takerAssetId`. The bridge between the two is the `(condition_id, yes_token_id, no_token_id)` mapping pulled from the CLOB REST endpoint and cached locally. CLOB REST resolves all 385,198 archive market ids; the Gamma metadata API, which is sometimes used in the literature, indexes only 34,764 markets.

The 600-market panel selection rule (volume metric, random-stratum eligibility threshold, random seed, category scheme) was committed in a [pre-registration document](https://github.com/philippdubach/polymarket-microstructure) before computing the panel. A deterministic build script emits the panel parquet, whose SHA-256 is recorded back into the pre-registration document before any analysis runs. This goes beyond the empirical-microstructure norm; the cost is one document and one hash, the benefit is that a reader can verify no market was added or removed after the analysis ran.

{{< readnext slug="the-absolute-insider-mess-of-prediction-markets" >}}

## Eight stylized facts

### SF1 — Longshot spread premium

Quoted half-spread, binned by per-market mean mid price into ten deciles. Median spread is about 400 bps in the central [0.4, 0.6] range and climbs to 1,300-1,800 bps for markets trading below 0.10. The pattern is asymmetric: the low-probability side is wider than the high-probability side, which echoes the longshot bias documented in the racetrack and parimutuel literature ([Snowberg and Wolfers, 2010](https://www.journals.uchicago.edu/doi/abs/10.1086/655844); [Thaler and Ziemba, 1988](https://www.aeaweb.org/articles?id=10.1257/jep.2.2.161)) and the prediction-market longshot evidence on Iowa Electronic Markets and TradeSports surveyed by [Wolfers and Zitzewitz (2004)](https://www.aeaweb.org/articles?id=10.1257/0895330041371321). The direction is the same; the magnitude is not. The 1,300-1,800 bps full quoted spread on Polymarket's lowest-probability decile (650-900 bps half-spread) is an order of magnitude wider than on a continuous-payoff sportsbook market, which reads less like the classical risk-love or misperception story and more like a liquidity-provision constraint.{{< img src="sf1_longshot.png" alt="SF1 panel: median quoted half-spread (bps) per mid-price decile across the 600-market panel; longshot spread premium climbs to 1,300-1,800 bps below 0.10" width="80%" >}}

### SF2 — Depth concentration

For each market I summarise the L2 depth profile by the ratio $\text{depth}_{L=1} / \text{depth}_{L=10}$, the share of cumulative top-10 depth held at the top-of-book. A value of 1.0 means the entire top-10 depth sits at level 1 (a thin, top-heavy book); 0.1 matches a uniform grid where each level carries equal depth. For the 546 markets with non-null depth, the median ratio is 0.137, close to the uniform-grid benchmark, with $p_{10} = 0.033$ and $p_{90} = 0.428$. The folk view that prediction-market books are concentrated at top-of-book does not hold on Polymarket: depth is generally layered deeper into the book.{{< img src="sf2_depth_profile.png" alt="SF2 panel: histogram of L1/L10 depth-concentration ratio across 546 panel markets; median 0.137, vertical lines mark the uniform-grid benchmark (0.10) and the fully top-of-book limit (1.0)" width="80%" >}}

### SF4 — Maker-wallet diversity

For each market I compute the volume-weighted Herfindahl index (HHI) of maker-address share across on-chain trades. Across 600 markets and 6.4M trades, the median HHI is 0.031 (about 32 effective makers). The distribution is right-skewed: $p_{90} = 0.119$ (about 8 effective makers) and a maximum of 0.40 (roughly 3 effective makers). Maker liquidity is decentralised on most markets in the panel, with a tail of thin or niche markets dominated by one to three wallets. This matters for any narrative that frames Polymarket as a venue dominated by a small number of professional liquidity providers. At least in the top-100 by volume, that's not what the data show.{{< img src="sf4_herfindahl.png" alt="SF4 panel: distribution of per-market maker-address Herfindahl indices across 600 markets; median HHI 0.031 (~32 effective makers), distribution right-skewed" width="80%" >}}

### SF7 — Self-counterparty wash share

A trade is flagged as wash-suspect under a two-tier rule: (a) `maker == taker` (direct self-match), or (b) a flipped pair $(maker_a, taker_a) \leftrightarrow (taker_a, maker_a)$ within 128 blocks (Polygon finality buffer) on the same market. This is an explicit lower bound: the detector covers only direct and immediate-roundtrip self-counterparty patterns, not the extended-graph patterns that network-based classifiers like [Cong et al. (2023)](https://academic.oup.com/rfs/article/35/8/3463/6488024) address on unregulated cryptocurrency token exchanges, where wash shares of 25-70% have been documented.

Across 600 markets and 6.4M trades, the median wash share is 0.97%, with p90 at 4.5%, p99 at 10.6%, and a maximum of 22.2%. The gap between this lower bound and the network-classifier estimates on token exchanges has two components: wash patterns that require multi-counterparty graph analysis to detect (which my detector does not cover), plus a venue-class difference in the underlying wash incentives. The first I can quantify only under a graph-classifier extension; the second is identification, not measurement.{{< img src="sf7_wash.png" alt="SF7 panel: distribution of self-counterparty wash share by market; median 0.97% with right tail to 22.2%, well below the 25-70% range documented on unregulated cryptocurrency token exchanges" width="80%" >}}

### SF8 — Depth decay near resolution

Do markets near resolution carry shallower books? I regress log mean depth at $L=10$ on log seconds-to-close at the panel window midpoint (2026-03-13), restricted to 322 markets with positive seconds-to-close and non-zero summary depth.

The bivariate slope is 0.818 (HC3 SE 0.113, $t = 7.2$, $R^2 = 0.13$). Category fixed effects (Crypto, Sports, Other, Geopolitics) attenuate the slope to 0.550 (HC3 SE 0.143, $t = 3.85$, $R^2 = 0.22$): roughly a third of the bivariate association is category-level confounding. Adding log panel-window volume on top of category attenuates further to 0.305 (HC3 SE 0.104, $t = 2.94$, $R^2 = 0.49$). The 0.31 slope works out to about 6% less mean depth per 10× reduction in seconds-to-close.

The category + log-volume specification is the conservative reading. Volume mediates the depth-time relationship because markets active longer accumulate more makers, and more makers means more depth, so a regression that omits volume attributes the makers-and-time channel to time alone. The 0.305 coefficient is the residual depth decay after that mediation is netted out; the 0.550 within-category slope reported in the abstract is the figure before mediation is netted out, and is the appropriate one to compare to a literature that does not condition on volume.{{< img src="sf8_depth_decay.png" alt="SF8 cross-sectional fit of log mean depth on log seconds-to-close at the panel midpoint; slope 0.818 bivariate, 0.550 with category fixed effects, 0.305 adding log volume" width="80%" >}}

(SF3 covers Polygon block-clock alignment, SF5 the category-conditional spread, and SF6 the archive-ingestion latency. All three are in the paper. SF6 in particular is a property of the collector pipeline rather than of Polymarket; the median per-market p50 ingestion delay is 41.5 ms, which is a sanity check on the collector, not a microstructure result.)

{{< readnext slug="the-absolute-insider-mess-of-prediction-markets" >}}

## The limits of orderbook-only inference

Six standard direction-dependent microstructure measures (effective spread, realized spread, Roll, Abdi-Ranaldo, Kyle's $\lambda$, Amihud) need an aggressor sign for each trade. Empirical practice on equity venues sources that sign from a quote-driven feed via Lee-Ready or its variants. The Polymarket public feed does not expose enough information to do this reliably: the `change_side` field marks which side of the book *moved*, not which side *initiated* the trade.

I infer trades from the feed under a LOOSE rule (every resting-size decrement counts) and match the inferred buckets against on-chain `OrderFilled` events at 5-second and exact-price granularity, over four disjoint 7-day windows.

- Panel mean (109 valid cells of 400, 55 markets): 0.615, market-clustered bootstrap 95% CI [0.579, 0.653]
- Volume-weighted by matched-bucket count (total 125,080): 0.592, bootstrap 95% CI [0.542, 0.659]

A volume-weighted sign-agreement of about 59% sits just above the 50% chance baseline. Even when an inferred bucket matches an on-chain bucket in time and price, the inferred aggressor direction is wrong about two trades in five. The mechanism is the feed itself: `price_change` updates broadcast a post-match snapshot of the resting book without identifying the taker. The `change_side` field marks which side of the book moved, not which side initiated the trade, and using it as a sign proxy produces the about 59% agreement rate.

A noisy sign propagates to every measure that consumes it. On the comparable subset of the top-100 panel:

- **Effective half-spread changes sign on 67% of markets** in the first 7-day window when feed-inferred direction is swapped for on-chain ground truth (50% in a second non-overlapping window).
- **Kyle's $\lambda$ changes sign on 60% of markets** in the first window (43% in the second).

Both windows sit in or below the chance band, well short of the about 80% Lee-Ready accuracy documented on Nasdaq.

The Glosten-Harris spread decomposition makes this concrete. Restricted to the top-100 stratum and run on authoritative on-chain trades, the median effective half-spread on the top-100 panel is essentially zero (-0.0003 prob pp), as are the median transitory component (0.00001) and the median adverse-selection component (0.0). Once sign errors are removed, the dollar-weighted "adverse selection" that orderbook-only inference produces collapses, leaving the typical top-100 market with no detectable systematic spread component on either side.{{< img src="spread_decomposition.png" alt="Glosten-Harris spread decomposition across the top-100 stratum: distribution of transitory component c (left) and adverse-selection component phi (right), both in probability points; once sign errors are removed via on-chain trade direction, the dollar-weighted 'adverse selection' that orderbook-only inference produces collapses" width="80%" >}}

The implication for anyone working on decentralised CLOB venues: the same constraint should bind on any venue where the off-chain matching layer broadcasts a post-match book state without exposing the taker identity (GMX v1, dYdX v3, Loopring's historical CLOB, and similar hybrid architectures). The public feed exposes *what cleared* but not *who initiated*, and any direction-dependent microstructure measure on those venues will need an authoritative on-chain trade source.

## What I'm not doing here

I had a long-ish exchange recently with someone scoping research on the same dataset, which is a useful proxy for what's adjacent but out of scope.

*Spread decomposition with bounded payoffs.* Classical Glosten-Harris / Huang-Stoll on prediction markets is open. Prices are bounded in $(0,1)$, which breaks parts of the standard identification, so there is a real research question to do, not just a re-application.

*Insider episodes and wallet-level patterns around resolution.* Probably the most productive lane I am not working on. The JFM submission draws the privacy line at no deanonymisation, only aggregate wallet measures; where you draw it for your own work is your call.

*Toxic flow.* Some overlap with one of my planned follow-ups.

*Latency arb (intra-venue).* Doesn't really work as a question on Polymarket. The two-clock gap in the WebSocket feed (SF6) is archive-ingestion delay, not trader latency, and without an exchange-side clock you can't separate the two. Cross-venue is the workable framing.

*Cross-venue arb.* Open and product-relevant. Kalshi, PredictIt, sports-book mirrors. The data engineering is probably the harder part.

{{< readnext slug="against-all-odds-the-mathematics-of-provably-fair-casino-games" >}}

## Replication

Everything is reproducible from the public on-chain record and your own WebSocket capture. I'm not redistributing the 624 GB raw archive (it is too large to move around practically), but the panel artifacts and the on-chain scrape pipeline are public:

- Code: [github.com/philippdubach/polymarket-microstructure](https://github.com/philippdubach/polymarket-microstructure)
- Replication package (DOI): [10.5281/zenodo.19811426](https://doi.org/10.5281/zenodo.19811426)
- Paper: [arXiv:2604.24366](https://arxiv.org/abs/2604.24366), under review at the [Journal of Financial Markets](https://www.sciencedirect.com/journal/journal-of-financial-markets)
- Collector: [pmxt-dev/pmxt](https://github.com/pmxt-dev/pmxt) is a good starting point if you want to run your own. The Polymarket WebSocket is a public feed, so once you have a collector running you'll have continuous coverage going forward, which for product work is probably more useful than a static historical slice anyway.

The CTF Exchange V1 → V2 cutover at the end of April 2026 closes my scrape window and opens a venue-evolution comparison. That, plus a per-market depth time series that would let SF8 move from a cross-sectional to a within-market depth-decay regression, plus a cross-venue analysis against Kalshi and sports-book mirrors that would address the price-discovery question this paper leaves open. Those are the obvious next things.
