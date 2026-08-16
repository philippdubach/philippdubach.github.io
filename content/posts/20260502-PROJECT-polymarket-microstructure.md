+++
title = "The Anatomy of a Decentralized Prediction Market: Notes from the Polymarket Order Book"
seoTitle = "Polymarket Microstructure: 30 Billion Order-Book Events"
date = 2026-05-02
lastmod = 2026-08-16
publishDate = 2026-05-02T05:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-polymarket-microstructure.jpg"]
card_image = "sf8_depth_decay.png"
description = "Explore Polymarket microstructure using 30.3 billion order-book events: spreads, depth, wash trading, and a key trade-direction error for researchers."
doi = "10.48550/arXiv.2604.24366"
keywords = ["Polymarket microstructure", "Polymarket order book data", "Polymarket WebSocket feed", "prediction market liquidity", "Polymarket wash trading", "decentralized prediction market order book", "Polymarket CLOB", "on-chain trade direction", "CTF Exchange OrderFilled", "prediction market bid-ask spread", "longshot spread premium", "Lee-Ready trade classification", "Kyle's lambda", "order-book depth", "Polygon prediction market", "trade-direction inference", "Polymarket dataset", "prediction market research"]
categories = ["Quantitative Finance"]
type = "Project"
math = true
draft = false
takeaways = [
  "The quoted half-spread measures half the gap between the best buy and sell prices. In Polymarket's lowest-probability decile, it reaches 650-900 basis points. That is an order of magnitude wider than US equities. This spread suggests a constraint on liquidity provision rather than a behavioral longshot bias.",
  "Trade direction inferred from Polymarket's public WebSocket feed agrees with the on-chain OrderFilled record only 59% of the time. This is barely above the 50% chance baseline and 22 percentage points below Lee-Ready accuracy on Nasdaq.",
  "Among the 100 highest-volume markets, replacing feed-inferred direction with on-chain direction changes the effective half-spread's sign in 67% of markets. Kyle's lambda, a price-impact estimator, changes sign in 60%. Researchers must therefore source any direction-dependent measure on-chain.",
  "The archive covers 30.3 billion order-book events across 52 days. The panel uses a 28-day window. Its on-chain source scrape contains 255,425,405 fills, of which 6.4M trades are in the 600 selected markets. The full pipeline is available in a Zenodo replication package.",
]
faq = [
  {question = "How does Polymarket's public order-book WebSocket feed work?", answer = "An order book lists resting buy and sell orders by price. Level 2 (L2) data show the aggregate size at each price. Polymarket exposes two event types. book_snapshot gives a complete L2 snapshot of one market side at subscription and at irregular intervals. price_change gives the new resting size at one level. change_side identifies the side that moved, not the side that initiated the trade. The feed never identifies the taker. An algorithm that uses only the feed therefore cannot identify whether a buyer or seller initiated the trade reliably."},
  {question = "Why does trade-direction inference fail on Polymarket?", answer = "Equity researchers often use Lee-Ready or a variant to distinguish buyer-initiated from seller-initiated trades. These methods assume that the feed contains enough information. Polymarket's feed does not. change_side identifies the side that moved, not the side that initiated the trade. Across the 100 highest-volume markets and four 7-day windows, volume-weighted sign agreement is about 59%. This is just above the 50% chance baseline. It is well below the approximately 80% Lee-Ready accuracy on Nasdaq."},
  {question = "How wide are spreads on Polymarket compared with equity markets?", answer = "A quoted spread is the gap between the best buy and sell prices. The mid-price is their average. One basis point is 0.01 percentage point. The quoted half-spread is half the quoted spread relative to the mid-price. On Polymarket's central price decile, it is around 200 basis points. It reaches 650-900 basis points in the lowest-probability decile. The effective half-spread measures a trade's execution cost relative to the mid-price. On liquid US equities after decimalization, it is in the single-digit basis-point range. Polymarket is roughly an order of magnitude wider. This is consistent with longer prediction-market holding periods and substantially less market-maker capital."},
  {question = "Is wash trading a problem on Polymarket?", answer = "This study flags direct self-matches and one-step round trips as wash-suspect trades. Across the 600-market panel, the median self-counterparty wash share is 0.97% per market. The 90th percentile is 4.5%, the 99th is 10.6%, and the maximum is 22.2%. These results are lower bounds. The detector does not cover multi-counterparty graph patterns. Cong et al. (2023) report 25-70% wash shares on unregulated cryptocurrency token exchanges. Polymarket is well below that range, although the venue-class incentives differ."},
  {question = "Why are Polymarket spreads wider for longshots?", answer = "The longshot spread premium is the extra spread charged on low-probability contracts. The mid-price is the average of the best buy and sell prices. One basis point is 0.01 percentage point. The quoted half-spread is about 200 basis points in the central [0.4, 0.6] mid-price range. The full quoted spread reaches 1,300-1,800 basis points in the lowest-probability decile. Its half-spread is 650-900 basis points. The low-probability side is wider than the high-probability side. This magnitude looks less like a behavioral longshot bias and more like a liquidity-provision constraint. Low-probability binary contracts give market makers bounded upside and asymmetric downside. Market makers therefore charge a larger inventory-risk premium than on a continuous-payoff sportsbook market."},
  {question = "How can microstructure researchers correctly measure Polymarket?", answer = "Researchers should source trade direction from on-chain OrderFilled events on the Conditional Token Framework (CTF) Exchange smart contract. They should not infer it from the public WebSocket feed. In OrderFilled, makerAssetId and takerAssetId show which side held US Dollar Coin (USDC). This shows directly whether a buyer or seller initiated the trade. The replication package at github.com/philippdubach/polymarket-microstructure joins off-chain and on-chain records. It also provides patches that let existing measurement code accept those on-chain records as the trade-direction source."},
]
+++

<br>

I spent two months collecting Polymarket order-book data to study its market microstructure. An order book lists resting buy and sell orders by price. My collector runs on a small virtual machine (VM) and subscribes to Polymarket's WebSocket feed. It writes one file in the columnar Parquet format per Coordinated Universal Time (UTC) hour.

By 2026-04-15, the archive contained 1,262 hourly files and 30,287,264,368 events. It occupied 623.8 GB and covered 52 calendar days and 385,198 distinct market ids. As of May 2, 2026, the first version of the [paper](https://arxiv.org/abs/2604.24366) is on arXiv. The [replication package](https://github.com/philippdubach/polymarket-microstructure) is on GitHub and Zenodo. Its DOI is [10.5281/zenodo.19811426](https://doi.org/10.5281/zenodo.19811426). The manuscript is under review at the [Journal of Financial Markets](https://www.sciencedirect.com/journal/journal-of-financial-markets).

## Why Polymarket microstructure matters

A prediction market lets participants trade contracts whose payoff depends on an event's outcome. It aggregates dispersed beliefs into one price. In equilibrium, that price behaves like a probability, a number between zero and one that represents likelihood.

The empirical literature has focused on forecast accuracy, longshot bias, and the coexistence of informed and uninformed traders. Longshot bias occurs when traders overpay for low-probability outcomes. The literature also studies calibration, which tests whether stated probabilities match realised outcome frequencies. Market microstructure describes how orders become trades. It determines the cost of holding an informational position. As trading costs rise, less of a small informational signal survives into the price. Noisy microstructure therefore produces noisier prices than the headline aggregation literature implicitly assumes.

Prediction-market microstructure remains under-studied. Liquidity is the ability to trade without causing a large price change. Market making means posting buy and sell orders to provide that liquidity. Early venues, including the Iowa Electronic Markets, made these features largely unobservable. Other designs used Hanson's logarithmic market-scoring rule or sparse parimutuel pools.

Polymarket changed this. Since 2021, it has operated a limit-order-book exchange on Polygon. Trades settle in US Dollar Coin (USDC) against an on-chain conditional-token contract. The infrastructure is finally there. What's missing is the data work to actually use it.

## Two Polymarket microstructure findings

The paper has two empirical contributions, ordered by weight for the literature.

The first contribution is a measurement result. In the top-100 stratum, the 100 highest-volume markets, volume-weighted agreement between feed and on-chain direction is about 59%. This is near chance and below the approximately 80% accuracy that the Lee-Ready trade classifier achieves on equities. Any Polymarket result that depends on trade direction must use on-chain `OrderFilled` events.

The second contribution consists of eight cross-sectional stylized facts from a pre-registered 600-market panel. I observed the panel simultaneously during one 28-day scrape window. I calculated the measures from the full event tape and a direct on-chain trade record. None of the eight facts requires the on-chain join. Each is reported for the pre-registered panel, subject to measure-specific eligibility filters. SF2 uses 546 markets, and SF8 uses 322.

The stylized facts describe Polymarket's microstructure on its own terms. The measurement result defines when a trade-direction-dependent claim about Polymarket is credible.

## Polymarket order-book and on-chain data

The primary input is a continuous tick-level archive of the public WebSocket feed. It runs from 2026-02-21 16:00 UTC through 2026-04-15 08:00 UTC. I preserved the WebSocket payload schema verbatim. Eager Pydantic parsing was a multi-hour operation at this row count. I therefore parsed JavaScript Object Notation (JSON) only after the market-id and time-window filters.

The on-chain join took most of the engineering time. Polymarket's Conditional Token Framework (CTF) Exchange smart contract logs `OrderFilled` events. Their payloads identify both counterparties and show whether the buyer or seller initiated the trade.

I scraped 255,425,405 fills during a 28-day calibration window from 2026-02-28 to 2026-03-27. I used batched `eth_getLogs` calls through a Polygon remote procedure call provider. Adaptive chunk sizes respected each provider's rate limits.

The off-chain feed uses `market_id`; the on-chain record uses `makerAssetId` / `takerAssetId`. The `(condition_id, yes_token_id, no_token_id)` mapping connects them. I retrieved it through the central limit order book (CLOB) Representational State Transfer (REST) application programming interface (API). I cached the mapping locally. CLOB REST resolves all 385,198 archive market ids. The Gamma metadata API, sometimes used in the literature, indexes only 34,764 markets.

I committed the 600-market selection rule in a [pre-registration document](https://github.com/philippdubach/polymarket-microstructure) before calculating the panel. The rule fixes the volume metric, random-stratum eligibility threshold, random seed, and category scheme. A deterministic build script creates the panel Parquet file. Before analysis, I recorded its SHA-256 hash, a cryptographic file fingerprint, in the pre-registration document.

This goes beyond the empirical-microstructure norm. The cost is one document and one hash. The benefit is a check that no market entered or left after the analysis ran.

{{< readnext slug="is-private-equity-just-beta-with-a-lockup" >}}

## Eight stylized facts

### SF1 — Longshot spread premium

A quoted spread is the gap between the best buy and sell prices. The mid-price is their average. The half-spread is half that gap. A basis point (bps) is one hundredth of a percentage point.

I bin the full quoted spread by each market's mean mid-price into ten deciles. The median full spread is about 400 bps in the central [0.4, 0.6] range. It rises to 1,300-1,800 bps for markets trading below 0.10. The corresponding half-spreads are about 200 bps and 650-900 bps.

The pattern is asymmetric: the low-probability side is wider than the high-probability side. This echoes the racetrack and parimutuel longshot bias in [Snowberg and Wolfers (2010)](https://www.journals.uchicago.edu/doi/abs/10.1086/655844) and [Thaler and Ziemba (1988)](https://www.aeaweb.org/articles?id=10.1257/jep.2.2.161). It also echoes the prediction-market evidence that [Wolfers and Zitzewitz (2004)](https://www.aeaweb.org/articles?id=10.1257/0895330041371321) survey for Iowa Electronic Markets and TradeSports.

The direction is the same; the magnitude is not. The lowest-probability decile has a 1,300-1,800 bps full quoted spread. Its 650-900 bps half-spread is an order of magnitude wider than on a continuous-payoff sportsbook market. That scale looks less like risk-love or misperception and more like a constraint on liquidity provision.

{{< img src="sf1_longshot.png" alt="Chart of median full quoted spread by mid-price decile. The spread rises to 1,300-1,800 basis points below a 0.10 mid-price." width="80%" >}}

### SF2 — Depth concentration

Level 2 (L2) data show resting size at several prices. For each market, I summarize its depth with $\text{depth}_{L=1} / \text{depth}_{L=10}$. This ratio is the share of cumulative top-10 depth held at the best price.

A value of 1.0 means that all top-10 depth sits at level 1, which gives a thin, top-heavy book. A value of 0.1 represents a uniform grid with equal depth at each level. Among 546 markets with non-null depth, the median is 0.137, near the uniform benchmark. The 10th percentile is $p_{10} = 0.033$, and the 90th percentile is $p_{90} = 0.428$.

The folk view says prediction-market depth concentrates at the best price. Polymarket does not fit that view; depth generally extends further into the book.

{{< img src="sf2_depth_profile.png" alt="Histogram of the share of top-ten depth held at the best price across 546 markets. The median is 0.137. Reference lines mark 0.10 and 1.0." width="80%" >}}

### SF4 — Maker-wallet diversity

For each market, I calculate the volume-weighted Herfindahl index (HHI) of maker-address shares across on-chain trades. HHI measures concentration. A higher value means that fewer maker wallets provide the volume.

Across 600 markets and 6.4M trades, the median HHI is 0.031, or about 32 effective makers. The distribution is right-skewed. Its $p_{90} = 0.119$, or about 8 effective makers. The maximum is 0.40, or roughly 3 effective makers.

Most panel markets therefore have decentralised maker liquidity. A tail of thin or niche markets remains dominated by one to three wallets. This matters for claims that a few professional liquidity providers dominate Polymarket. At least in the top-100 by volume, that's not what the data show.

{{< img src="sf4_herfindahl.png" alt="Histogram of maker-address concentration across 600 markets. The median Herfindahl index is 0.031, or about 32 effective makers, and the distribution is right-skewed." width="80%" >}}

### SF7 — Self-counterparty wash share

I flag `maker == taker` as a wash-suspect direct self-match. I also flag a flipped pair, $(maker_a, taker_a) \leftrightarrow (taker_a, maker_a)$, in the same market within 128 blocks. That interval is the Polygon finality buffer.

The result is an explicit lower bound. The detector covers direct self-matches and immediate round trips. It does not cover extended graph patterns. Network classifiers such as [Cong et al. (2023)](https://academic.oup.com/rfs/article/35/8/3463/6488024) address those patterns on unregulated cryptocurrency token exchanges. That study documents wash shares of 25-70%.

Across 600 markets and 6.4M trades, the median wash share is 0.97%. The 90th percentile is 4.5%, the 99th percentile is 10.6%, and the maximum is 22.2%.

Two factors separate this lower bound from network-classifier estimates on token exchanges. First, some wash patterns require multi-counterparty graph analysis, which my detector does not perform. Second, the venues create different incentives to wash trade. I can quantify the first factor only by extending the graph classifier. The second is an identification problem, not a measurement problem.

{{< img src="sf7_wash.png" alt="Histogram of self-counterparty wash share across 600 markets. The median is 0.97%, and the right tail reaches 22.2%." width="80%" >}}

### SF8 — Depth decay near resolution

Do markets near resolution carry shallower books? I regress log mean depth at $L=10$ on log seconds-to-close at the panel midpoint. This cross-sectional regression compares different markets at one time. The midpoint is 2026-03-13. I restrict the sample to 322 markets with positive seconds-to-close and non-zero summary depth.

A bivariate regression uses one explanatory variable. Its slope is 0.818. The heteroskedasticity-consistent standard error (HC3 SE) is 0.113, with $t = 7.2$ and $R^2 = 0.13$. HC3 allows error variance to differ across observations. The $t$-statistic measures the coefficient relative to its standard error. $R^2$ measures the share of variation explained by the model.

Category fixed effects control for average differences among Crypto, Sports, Other, and Geopolitics. They reduce the slope to 0.550. The HC3 SE is 0.143, with $t = 3.85$ and $R^2 = 0.22$. Category-level confounding therefore explains roughly one third of the bivariate association.

Adding log panel-window volume reduces the slope to 0.305. Its HC3 SE is 0.104, with $t = 2.94$ and $R^2 = 0.49$. The rounded 0.31 slope implies about 6% less mean depth for each 10× reduction in seconds-to-close.

The category-plus-log-volume specification gives the conservative reading. Volume mediates the relationship between depth and time. Markets that remain active longer accumulate more makers, and more makers mean more depth. A regression without volume assigns this maker-and-time channel to time alone.

The 0.305 coefficient is residual depth decay after removing that mediation. The abstract reports the 0.550 within-category slope before removing mediation. That slope is appropriate for comparison with literature that does not condition on volume.

{{< img src="sf8_depth_decay.png" alt="Regression plot of log mean depth against log seconds-to-close on March 13, 2026. The estimated slopes are 0.818, 0.550 with category controls, and 0.305 after adding log volume." width="80%" >}}

The paper also reports three other stylized facts. SF3 covers Polygon block-clock alignment, SF5 covers category-conditional spread, and SF6 covers archive-ingestion latency. SF6 measures the collector pipeline, not Polymarket. The median of the per-market median (p50) ingestion delays is 41.5 milliseconds. That is a collector sanity check, not a microstructure result.

{{< readnext slug="the-absolute-insider-mess-of-prediction-markets" >}}

## Why Polymarket order-book data cannot infer trade direction

Six standard microstructure measures depend on trade direction. They are effective spread, realized spread, Roll, Abdi-Ranaldo, Kyle's $\lambda$, and Amihud. Kyle's $\lambda$ estimates price impact from signed trade flow. Each measure needs an aggressor sign. The aggressor is the order that executes against a resting order. Its sign identifies whether a buyer or seller initiated the trade.

Equity researchers commonly infer this sign from a quote-driven feed with Lee-Ready or a variant. Polymarket's public feed lacks the required information. The `change_side` field shows which order-book side *moved*, not which side *initiated* the trade.

I infer trades from the feed under a LOOSE rule: every resting-size decrement counts. I match inferred buckets to on-chain `OrderFilled` events by exact price and 5-second intervals. The test uses four disjoint 7-day windows.

- Panel mean: 0.615 across 109 valid market-window cells from 400 possible cells and 55 markets. The market-clustered bootstrap 95% confidence interval (CI) is [0.579, 0.653].
- Volume-weighted by 125,080 matched buckets: 0.592. The bootstrap 95% CI is [0.542, 0.659].

Volume-weighted sign agreement is about 59%, just above the 50% chance baseline. Even after a time-and-price match, the inferred direction is wrong for about two trades in five.

The feed itself causes the problem. A `price_change` update broadcasts the resting book after a match but does not identify the taker. `change_side` shows which side moved, not which side initiated the trade. Using it as a sign proxy produces the roughly 59% agreement rate.

A noisy sign contaminates every measure that uses it. On the comparable subset of the top-100 panel:

- **Effective half-spread changes sign on 67% of markets** in the first 7-day window after replacing feed inference with on-chain ground truth. It changes sign on 50% in a second non-overlapping window.
- **Kyle's $\lambda$ changes sign on 60% of markets** in the first window and 43% in the second.

Across both windows, feed-inferred trade direction remains near chance and well below the approximately 80% Lee-Ready accuracy documented on Nasdaq.

The Glosten-Harris spread decomposition makes this concrete. Adverse selection is the cost of trading against a better-informed counterparty. I restrict the decomposition to the top-100 stratum and use authoritative on-chain trades.

The median effective half-spread is essentially zero at -0.0003 in the paper's probability-point units. The median transitory and adverse-selection components are 0.00001 and 0.0 in the same units. After removing sign errors, the dollar-weighted "adverse selection" from order-book-only inference collapses. The typical top-100 market has no detectable systematic spread component on either side.

{{< img src="spread_decomposition.png" alt="Histograms of the Glosten-Harris transitory and adverse-selection components for the 100 highest-volume markets. Both distributions center near zero after using on-chain trade direction." width="80%" >}}

The same constraint should affect other decentralised CLOB venues with similar feeds. Their off-chain matching layer broadcasts a post-match book state without identifying the taker. Examples include GMX v1, dYdX v3, Loopring's historical CLOB, and similar hybrid architectures. The public feed shows *what cleared* but not *who initiated*. Direction-dependent measures on these venues therefore need an authoritative on-chain trade source.

## What I'm not doing here

I recently had a long-ish exchange with someone scoping research on the same dataset. It was a useful map of what's adjacent but out of scope.

*Spread decomposition with bounded payoffs.* Classical Glosten-Harris / Huang-Stoll remains open for prediction markets. Prices are bounded in $(0,1)$, which breaks parts of the standard identification. This is a real research question, not just a re-application.

*Insider episodes and wallet-level patterns around resolution.* Probably the most productive lane I am not working on. The Journal of Financial Markets submission uses only aggregate wallet measures and does not deanonymize users. Where you draw that line in your work is your call.

*Toxic flow.* Some overlap with one of my planned follow-ups.

*Latency arbitrage within one venue.* Doesn't really work as a question on Polymarket. The two-clock gap in the WebSocket feed is SF6's archive-ingestion delay, not trader latency. Without an exchange-side clock, you can't separate the two. Cross-venue is the workable framing.

*Cross-venue arbitrage.* Open and product-relevant. Kalshi, PredictIt, sports-book mirrors. The data engineering is probably the harder part.

{{< readnext slug="against-all-odds-the-mathematics-of-provably-fair-casino-games" >}}

## Polymarket order-book data and replication

Everything is reproducible from the public on-chain record and your own WebSocket capture. I am not redistributing the rounded 624 GB raw archive. It is too large to move around practically. The panel artifacts and on-chain scrape pipeline are public:

- Code: [github.com/philippdubach/polymarket-microstructure](https://github.com/philippdubach/polymarket-microstructure)
- Replication package (DOI): [10.5281/zenodo.19811426](https://doi.org/10.5281/zenodo.19811426)
- Paper: [arXiv:2604.24366](https://arxiv.org/abs/2604.24366), under review at the [Journal of Financial Markets](https://www.sciencedirect.com/journal/journal-of-financial-markets) as of May 2, 2026.
- Collector: [pmxt-dev/pmxt](https://github.com/pmxt-dev/pmxt) is a good starting point for your own capture. Polymarket's WebSocket is public. A running collector gives continuous coverage, which is probably more useful for product work than a static historical slice.

The CTF Exchange V1 → V2 cutover at the end of April 2026 closes my scrape window. It also opens a venue-evolution comparison. A per-market depth time series would move SF8 from a cross-sectional regression to a within-market depth-decay regression. A cross-venue analysis against Kalshi and sports-book mirrors would address the price-discovery question that this paper leaves open. Those are the obvious next things.
