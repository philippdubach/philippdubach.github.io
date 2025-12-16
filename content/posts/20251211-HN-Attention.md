---
title: "What 100,000 Hacker News Posts Reveal About Online Attention"
seoTitle: "100K Hacker News Posts: Online Attention Study"
date: 2025-12-19
images: ['https://static.philippdubach.com/ograph/ograph-hn-attention.jpg']
description: "Analysis of 100K Hacker News posts shows extreme attention inequality but no rich-get-richer effect. The first two hours determine everything."
keywords: ["Hacker News", "attention economics", "social media analytics", "content virality", "data science", "power laws", "online communities", "engagement prediction", "computational social science"]
tags: ["Project"]
draft: true
---

I built a system to archive Hacker News in real-time, capturing every story, comment, and score change as it happens. After collecting nearly 100,000 items with 22,000 temporal snapshots during December 2025, the data tells a story that contradicts how most people think about online success.
{{< img src="hn_archiver_overview2.png" alt="Key results: Gini 0.91, Velocity correlation 0.74, Matthew effect -0.04, Viral precision 97.6%" width="100%" >}}
The headline result: a [Gini coefficient](https://en.wikipedia.org/wiki/Gini_coefficient) of 0.91. That means the bottom 80% of posts receive less than 10% of total upvotes. HN's attention economy is more unequal than income distribution in the most unequal countries on Earth.

But here's the paradox. No rich-get-richer (no [Matthew effect](https://en.wikipedia.org/wiki/Matthew_effect)). The correlation between current score and future growth is actually slightly negative (ρ = -0.04). High-scoring posts don't attract more votes because they're already popular. HN's ranking algorithm, with its gravity penalty on rapidly rising content, appears to actively counteract preferential attachment.

So if success doesn't breed success, what does drive this extreme inequality?

Initial conditions. The velocity of engagement in the first two hours correlates 0.74 with final score. That's stronger than almost any predictor I've seen in social media research. Using top-20% early velocity as a viral classifier achieves 97.6% precision. When a post takes off early, it almost always keeps going. When it doesn't, no amount of waiting helps.

This has implications for anyone trying to get attention on HN (or similar platforms):

(1) Timing matters less than you think. Yes, there's a 2-hour offset between peak posting volume (15:00 UTC) and peak average score (13:00 UTC), suggesting US morning posts perform marginally better. Weekend posts score slightly higher on average. But these effects are small compared to the overwhelming importance of initial reception.
(2) Optimization is a one-shot game. You can't iterate your way to the front page. The title, the link, the timing of your post relative to what else is new, these matter in a brief window. After that, the trajectory is set.
(3) Platform design can counteract preferential attachment. HN proves that algorithmic ranking can prevent runaway success without eliminating inequality. The inequality just shifts earlier in the funnel, to who sees new content first.

My analysis goes deeper into attention decay curves (power law with α = 0.56), survival analysis by post category, and circadian patterns across the global community. I've written up the methodology and statistics in [The Attention Paradox: Concentration Without Cumulative Advantage](/standalone/hn-research/), also available as a [full paper (PDF)](https://pdub.click/251211f).
<a href="https://pdub.click/251211f">
{{< img src="hn_paper_teaser.png" alt="Overview of Reasearch Paper Pages" width="80%" >}}</a>
If you are interested in the technical architecture, how to build a real-time archiver on Cloudflare Workers with D1, Workers AI for topic classification, and Vectorize for similarity search, see [Building a Real-Time HN Archive: Cloudflare Workers, AI, and 100K Posts](/standalone/hn-archiver/). The code is open source: [github.com/philippdubach/hn-archiver](https://github.com/philippdubach/hn-archiver) for the archiving system and [github.com/philippdubach/hn-analyzer](https://github.com/philippdubach/hn-analyzer) for the analysis code.

This project sits at the intersection of data engineering and behavioral research. Building production systems that collect, process, and analyze user behavior at scale is one way I bridge technical implementation with strategic questions. The same patterns apply whether you're measuring attention on a social platform or personalizing client experiences in banking: real-time data pipelines, ML classification, and turning behavioral signals into actionable predictions.
