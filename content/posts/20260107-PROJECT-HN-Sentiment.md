+++
title = "65% of Hacker News Posts Have Negative Sentiment, and They Outperform"
seoTitle = "Hacker News Sentiment Analysis: 65% Negative, 27% More Engagement"
date = 2026-01-07
images = ["https://static.philippdubach.com/ograph/ograph-hn-sentiment.jpg"]
description = "Analysis of 32,000 HN posts reveals 65% negative sentiment correlates with 27% higher engagement. Six-model comparison, power-law distributions, full data."
keywords = ["Hacker News sentiment analysis", "negativity bias engagement", "BERT RoBERTa sentiment comparison", "social media attention inequality", "tech community negativity research"]
categories = ["AI"]
type = "Project"
draft = false
aliases = ["/standalone/hn-sentiment/", "/standalone/hackerbook-stats/"]
takeaways = [
  "Across 32,000 Hacker News posts, nearly 65% register as negative sentiment, a pattern that holds across six different models including DistilBERT, RoBERTa, and Llama 3.1 8B",
  "Negative posts average 35.6 points versus 28 overall, a 27% engagement premium for negativity, though most HN negativity is substantive critique rather than toxicity",
  "Score distribution follows a power law with high Gini coefficients, meaning a small fraction of posts capture most attention while the majority get almost none",
]
faq = [
  {question = "What percentage of Hacker News posts have negative sentiment?", answer = "Analysis of 32,000 Hacker News posts found that nearly 65% register as negative. This pattern persists across six different sentiment models including DistilBERT, BERT Multi, RoBERTa, Llama 3.1 8B, Mistral 3.1 24B, and Gemma 3 12B, suggesting it reflects genuine community behavior rather than classifier bias."},
  {question = "Do negative posts get more engagement on Hacker News?", answer = "Yes, negative posts average 35.6 points compared to the overall average of 28 points, representing a 27% performance premium for negativity. This aligns with broader research on negativity bias in social media, where negative content consistently generates higher engagement."},
  {question = "How do BERT and RoBERTa compare for sentiment analysis?", answer = "Both produce similar negative-skewed distributions when applied to Hacker News data. The negative pattern holds across all six models tested, suggesting the finding is robust to model choice. DistilBERT was used for production due to its efficiency in Cloudflare-based pipelines."},
  {question = "What is attention inequality in social media?", answer = "Attention inequality measures how unevenly engagement is distributed across content. On Hacker News, score distribution follows a power-law with high Gini coefficients, meaning a small number of posts receive disproportionate attention while most receive minimal engagement. This mirrors patterns found on Twitter where Gini coefficients exceed 0.9."},
]
+++
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

{{< readnext slug="social-media-success-prediction-bert-models-for-post-titles" >}}

**Circadian patterns (volume vs mean score, UTC)**
{{< img src="circadian_patterns_hackerbook2.png" alt="Circadian patterns on Hacker News (UTC): posting volume vs mean score" width="80%" >}}

**Score vs direct comments (proxy)**
{{< img src="score_vs_direct_comments_hackerbook2.png" alt="Score vs direct comments (proxy from reply edges), log-log scatter" width="80%" >}}

**Direct comments distribution (CCDF, proxy)**
{{< img src="direct_comments_ccdf_hackerbook2.png" alt="Direct comments distribution (proxy) shown as CCDF" width="80%" >}}

**Mean score vs direct comments (binned, proxy)**
{{< img src="mean_score_vs_direct_comments_binned_hackerbook2.png" alt="Mean score vs direct comments (proxy), binned in log-spaced buckets" width="80%" >}}
