---
title: "It Just Ain\u2019t So"
date: 2025-06-15
images:
- https://static.philippdubach.com/ograph/ograph-gaussian.jpg
seoTitle: "Why Stock Returns Aren't Normally Distributed"
description: "Are stock returns normally distributed? Formal normality tests reject this assumption for most equity indices, with major implications for risk management."
keywords:
- normal distribution stock returns
- fat tails finance
- are stock returns normally distributed
- portfolio optimization fat tails
- normality tests financial data
external_url: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5283255
categories:
- Finance
type: Commentary
aliases:
- /2025/06/15/it-just-aint-so/

faq:
- question: Are stock returns normally distributed?
  answer: No. Empirical testing using formal statistical tests like Shapiro-Wilk, D'Agostino's K-squared, and Anderson-Darling consistently rejects the normal distribution hypothesis for equity index returns. Stock returns exhibit fat tails and higher kurtosis than a normal distribution predicts, meaning extreme price movements occur far more frequently than standard models expect.
- question: Why do financial models still assume normal distributions if returns aren't normal?
  answer: The normal distribution assumption persists because it simplifies mathematical analysis considerably. Models like Black-Scholes and Modern Portfolio Theory were built on this assumption because it allows for closed-form solutions. Additionally, the Central Limit Theorem is often invoked to argue that aggregated returns converge to normality, but empirical evidence from large datasets suggests this convergence is much weaker than commonly believed.
- question: What are fat tails in finance and why should investors care?
  answer: Fat tails describe a probability distribution where extreme outcomes occur more frequently than a normal distribution would predict. In financial markets, this means large crashes and rallies happen more often than standard risk models anticipate. Investors should care because portfolios built on normal distribution assumptions systematically underestimate downside risk, potentially leading to catastrophic losses during market stress events.
- question: What alternatives exist to mean-variance portfolio optimization?
  answer: Alternatives include Monte Carlo simulation combined with Conditional Value-at-Risk (CVaR) optimization, which explicitly accounts for the shape of the left tail rather than relying solely on variance as a risk measure. Other approaches include regime-switching models that account for different market environments, and heavy-tailed distribution models such as Student-t or stable distributions that better capture observed return characteristics.
---
> It ain't what you don't know that gets you into trouble. It's what you know for sure that just ain't so.

This (not actually) Mark Twain quote from [The Big Short](https://en.wikipedia.org/wiki/The_Big_Short_(film)) captures the sentiment of realizing that some foundational assumptions might be empirically wrong. 

A recent article by [Anton Vorobets](https://antonvorobets.substack.com) that I came across in [Justina Lee](https://www.bloomberg.com/authors/AQ0Te4IePFE/justina-lee)'s Quant Newsletter presents compelling evidence that challenges one of the field's fundamental statistical assumptions, that asset returns follow normal distributions. Using 26 years of data from 10 US equity indices, he ran formal normality tests (Shapiro-Wilk, D'Agostino's K², Anderson-Darling) and found that the normal distribution hypothesis gets rejected in most cases. The supposed "Aggregational Gaussianity" that academics invoke through Central Limit Theorem arguments? It's mostly wishful thinking enabled by small sample sizes. As Vorobets observes:

> Finance and economics academia is unfortunately driven by several convenient myths, i.e., claims that are taken for granted and spread among university academics despite their poor empirical support.

The article highlights significant practical consequences for portfolio management and risk assessment. Portfolio optimization based on normal distribution assumptions ignores fat left tails—exactly the kind of extreme downside events that can wipe out portfolios. This misspecification can lead to inadequate risk management and suboptimal asset allocation decisions. Vorobets suggests [alternative approaches, including Monte Carlo simulations combined with Conditional Value-at-Risk (CVaR) optimization](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4034316), which better accommodate the complex distributional properties observed in financial data. While computationally more demanding, these methods offer improved alignment with empirical reality.

Reading this piece gave me a few ideas for extensions I might want to explore in an upcoming personal project:
(1) While Vorobets focuses on US equity indices, similar analysis across fixed income, commodities, currencies, and alternative assets would provide a more comprehensive view of distributional properties across financial markets. Each asset class exhibits distinct market microstructure characteristics that may influence distributional behavior.
(2) Global Market Coverage: Extending the geographic scope to include developed, emerging, and frontier markets would illuminate whether the documented deviations from normality represent universal phenomena or are specific to US market structures. Cross-regional analysis could reveal important insights about market development, regulatory frameworks, and institutional differences.
(3) Building upon Vorobets' foundation, there are opportunities to incorporate multivariate normality testing, regime-dependent analysis, and time-varying parameter models. Additionally, investigating the power and robustness of different statistical tests across various market conditions would strengthen the methodological contribution.
(4) Examining different time horizons, market regimes (pre- and post-financial crisis, COVID period), and potentially higher-frequency data could provide deeper insights into when and why distributional assumptions break down.
