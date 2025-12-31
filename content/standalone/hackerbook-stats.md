---
title: "HackerBook Static Analysis"
seoTitle: "HackerBook Static Analysis"
slug: hackerbook-stats
images: ['https://static.philippdubach.com/ograph/ograph-hn-science.jpg']
description: "Static analysis of the HackerBook 22GB SQLite export: power-law score distributions, attention inequality, and circadian posting patterns."
keywords: ["Hacker News dataset", "attention inequality", "power law distribution", "Gini coefficient", "circadian rhythms", "social news analytics", "HackerBook", "computational social science"]
draft: false
---

I've been working on an empirical study of attention dynamics on Hacker News; analyzing decay curves, preferential attachment, survival, and early-engagement prediction using ~300k items and 72k temporal snapshots collected in December 2025. 

{{< img src="hn_paper_overview.png" alt="Overview of the SSRN preprint" width="80%" >}}
<p style="text-align: center; font-style: italic;">
  Preprint  
  <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5910263" target="_blank" rel="noopener noreferrer">
    available on SSRN</a></p>

Today I saw [this Show HN](https://news.ycombinator.com/item?id=46435308): 22GB of Hacker News in SQLite, served via WASM shards. Downloaded the [HackerBook](https://github.com/DOSAYGO-STUDIO/HackerBook) export and ran a subset of my paper's analytics on it.

_Caveat: HackerBook is a single static snapshot (no time-series data). Therefore I could not analyze lifecycle analysis, early-velocity prediction, or decay fitting. What can be computed: distributional statistics, inequality metrics, circadian patterns._

{{< img src="hackerbook_stats_table2.png" alt="Summary statistics" width="80%" >}}
<br>
<br>
**Score distribution (CCDF + power-law fit)**
{{< img src="score_power_law_hackerbook2.png" alt="Score distribution (CCDF) with power-law fit on HackerBook shard sample" width="80%" >}}

**Attention inequality (Lorenz curve + Gini)**
{{< img src="attention_inequality_hackerbook2.png" alt="Lorenz curve of story scores (attention inequality) with sample Gini" width="80%" >}}

**Circadian patterns (volume vs mean score, UTC)**
{{< img src="circadian_patterns_hackerbook2.png" alt="Circadian patterns on Hacker News (UTC): posting volume vs mean score" width="80%" >}}

**Score vs direct comments (proxy)**
{{< img src="score_vs_direct_comments_hackerbook2.png" alt="Score vs direct comments (proxy from reply edges), log-log scatter" width="80%" >}}

**Direct comments distribution (CCDF, proxy)**
{{< img src="direct_comments_ccdf_hackerbook2.png" alt="Direct comments distribution (proxy) shown as CCDF" width="80%" >}}

**Mean score vs direct comments (binned, proxy)**
{{< img src="mean_score_vs_direct_comments_binned_hackerbook2.png" alt="Mean score vs direct comments (proxy), binned in log-spaced buckets" width="80%" >}}

_Sources:_
[Paper (SSRN)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5910263) · [hn-archiver repo](https://github.com/philippdubach/hn-archiver) · [HackerBook repo](https://github.com/DOSAYGO-STUDIO/HackerBook)
