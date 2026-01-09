---
title: "Bringing Down the House: The Only Winning Strategy is Not to Play"
date: 2026-01-07
categories:
- Finance
- Tech
type: Essay
images:
- https://static.philippdubach.com/ograph/ograph-post.jpg
description: Statistical analysis of 20,000 crash game rounds reveals if provably fair gambling systems match theoretical RTP claims. Data-driven insights.
keywords:
- crash games analysis
- provably fair gambling
- RTP statistical testing
- gambling mathematics
- house edge verification
math: true
draft: true
---
{{< disclaimer type="gambling" >}} 

Crash games represent a category of online gambling where players place bets on an increasing multiplier that can "crash" at any moment. The fundamental mechanic requires players to cash out before the crash occurs; successful cash-outs yield the bet amount multiplied by the current multiplier, while failure results in total loss of the wager.{{< img src="flight-game.gif" alt="Description" width="80%" >}} The specific game I came across is a variant that employs an aircraft flight metaphor. Let's call it _"Plane Game"_. This is not what intrigued me but that it said "provably fair" on the startup screen, which I assumed to be a typo at first. Which I stand to be corrected: 

>A provably fair gambling system uses cryptography to let players verify that each outcome was generated from fixed inputs, rather than chosen or altered by the operator after a bet is placed. In practice, the casino commits to a hidden “server seed” via a public hash, combines it with a player-controlled “client seed” and a per-bet nonce, and later reveals the server seed so anyone can recompute and confirm the result. So far so good, [see here for more info]().

The stated Return-to-Player (RTP) of that specific game is 97%, implying a 3% [house edge](https://www.investopedia.com/articles/personal-finance/110415/why-does-house-always-win-look-casino-profitability.asp). After watching a few rounds I the perceived probability was anything but that. And if I'm intruged by something it's [the combination of games and statistics](/posts/counting-cards-with-computer-vision/). So I did what any sane person would do and watched another 20,000 rounds. {{< img src="plane_game_strategy_comparison.png" alt="Description" width="80%" >}}
For a crash game with RTP = r (where 0 < r < 1), the crash multiplier M follows a specific probability distribution derived from a uniform random variable U ~ Uniform(0, 1):

$$M = \frac{r}{U}$$

This yields the following distributional properties:

Cumulative Distribution Function (CDF):
$$F(m) = 1 - \frac{r}{m}, \quad m \geq 1$$

Probability Density Function (PDF):
$$f(m) = \frac{r}{m^2}, \quad m \geq 1$$

Survival Function:
$$P(M \geq m) = \frac{r}{m}$$

The survival function is particularly relevant: the probability of the multiplier reaching at least m before crashing equals r/m. For any cash-out target m, the expected value of a unit bet is therefore:

$$E[\text{Profit}] = P(M \geq m) \times m - 1 = \frac{r}{m} \times m - 1 = r - 1 = -0.03$$

This mathematical property makes crash games theoretically "strategy-proof" in expectation i.e. no cash-out timing strategy should yield better long-term results than another. That being said, I set out to explore the following: (1) Test whether observed crash multipliers conform to the theoretical distribution. (2) Detect any exploitable patterns, autocorrelations, or regime changes. (3) Quantify the actual RTP from empirical observations. (4) Conduct formal hypothesis testing with proper significance and power analysis. (5) Provide evidence-based recommendations with uncertainty quantification.



{{< img src="plane_game_main_analysis.png" alt="Description" width="80%" >}}

{{< img src="plane_game_pattern_analysis.png" alt="Description" width="80%" >}}

{{< img src="plane_game_significance_analysis.png" alt="Description" width="80%" >}}
