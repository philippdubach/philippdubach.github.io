---
title: 65% of Hacker News Posts Have Negative Sentiment, and They Outperform
date: 2026-01-07
images:
- https://static.philippdubach.com/ograph/ograph-hn-sentiment.jpg
description: Analysis of 32,000 HN posts and 340K comments reveals negativity bias correlates with higher engagement. Data, methodology, and full paper available.
keywords:
- Hacker News sentiment analysis
- attention dynamics research
- HN engagement data
- NLP sentiment classification
- social news ranking
- content virality
- DistilBERT BERT RoBERTa
- LLM sentiment scoring
- tech community behavior
- computational social science
categories:
- AI
type: Project
draft: false
aliases:
- /standalone/hn-sentiment/
- /standalone/hackerbook-stats/
---
Posts with negative sentiment average 35.6 points on [Hacker News](https://news.ycombinator.com). The overall average is 28 points. That's a 27% performance premium for negativity. {{< img src="hn-sentiment.png" alt="Distribution of sentiment scores across 32,000 Hacker News posts" width="80%" >}} This finding comes from an empirical study I've been running on HN attention dynamics, covering decay curves, preferential attachment, survival probability, and early-engagement prediction. The preprint is [available on SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5910263). I already had a gut feeling. Across 32,000 posts and 340,000 comments, nearly 65% register as negative. This might be a feature of my classifier being miscalibrated toward negativity; yet the pattern holds across six different models. {{< img src="sentiment_models_comparison_6models.png" alt="Sentiment distribution comparison across DistilBERT, BERT Multi, RoBERTa, Llama 3.1 8B, Mistral 3.1 24B, and Gemma 3 12B" width="80%" >}} I tested three transformer-based classifiers (DistilBERT, BERT Multi, RoBERTa) and three LLMs (Llama 3.1 8B, Mistral 3.1 24B, Gemma 3 12B). The distributions vary, but the negative skew persists across all of them (inverted scale for 2-6). The results I use in my dashboard are from DistilBERT because it runs efficiently in my Cloudflare-based pipeline.

What counts as "negative" here? Criticism of technology, skepticism toward announcements, complaints about industry practices, frustration with APIs. The usual. It's worth noting that technical critique reads differently than personal attacks; most HN negativity is substantive rather than toxic. But, does negativity cause engagement, or does controversial content attract both negative framing and attention? Probably some of both. 

-----

Related to this, I also saw [this Show HN](https://news.ycombinator.com/item?id=46435308): 22GB of Hacker News in SQLite, served via WASM shards. Downloaded the [HackerBook](https://github.com/DOSAYGO-STUDIO/HackerBook) export and ran a subset of my paper's analytics on it.

_Caveat: HackerBook is a single static snapshot (no time-series data). Therefore I could not analyze lifecycle analysis, early-velocity prediction, or decay fitting. What can be computed: distributional statistics, inequality metrics, circadian patterns._

{{< img src="hackerbook_stats_table2.png" alt="Summary statistics" width="80%" >}}

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