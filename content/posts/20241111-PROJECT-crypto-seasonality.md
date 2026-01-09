---
title: Crypto Mean Reversion Trading
date: 2024-11-11
images:
- https://static.philippdubach.com/ograph/ograph-crypto.jpg
description: A crypto mean reversion strategy using PELT algorithm to detect change
  points and auto-execute trades on Kraken following price movements.
keywords:
- crypto mean reversion trading
- cryptocurrency trading strategy
- PELT algorithm
- change point detection
- Kraken API
- market inefficiency
- Bitcoin trading
- Ethereum trading
- automated trading bot
- cryptocurrency seasonality
- efficient market hypothesis
- altcoin trading
- volatility trading
- crypto market patterns
- algorithmic trading
tags:
- Project
categories:
- Finance
type: Project
draft: false
aliases:
- /2024/11/11/crypto-mean-reversion-trading/

---
In late 2021, Lars Kaiser's paper on [seasonality in cryptocurrencies](https://www.sciencedirect.com/science/article/abs/pii/S1544612318304513) inspired me to use my [Kraken API Key](https://docs.kraken.com/api/) to try and make some money. A quick summary of the paper: (1) Kaiser analyzes seasonality patterns across 10 cryptocurrencies (Bitcoin, Ethereum, etc.), examining returns, volatility, trading volume, and spreads (2) Finds no consistent calendar effects in cryptocurrency returns, supporting weak-form market efficiency (3) Observes robust patterns in trading activity - lower volume, volatility, and spreads in January, weekends, and summer months (4) Documents significant impact of January 2018 market sell-off on seasonality patterns (5) Reports a "reverse Monday effect" for Bitcoin (positive Monday returns) and "reverse January effect" (negative January returns) (6) Trading activity patterns suggest crypto markets are dominated by retail rather than institutional investors. 

The paper's main finding: crypto markets appear efficient in terms of returns but show behavioral patterns in trading.

>The efficient-market hypothesis (EMH) is a hypothesis in financial economics that states that asset prices reflect all available information. A direct implication is that it is impossible to "beat the market" consistently on a risk-adjusted basis since market prices should only react to new information.

The EMH has interesting implications for cryptocurrency markets. While major cryptocurrencies like Bitcoin and Ethereum have gained significant institutional adoption and liquidity, they may still be less efficient than traditional markets due to their relative youth and large audience of retail traders (who might not act as rationally as larger, institutional traders). This inefficiency becomes even more pronounced with smaller altcoins, which often have: (1) Lower trading volumes and liquidity (2) Less institutional participation (3) Higher information asymmetries (and/or greater susceptibility to manipulation). These factors create opportunities for exploiting market inefficiencies, particularly in the short term when prices may overreact to news or technical signals before eventually correcting.

Unlike Kaiser's seasonality research, I didn't focus on calendar-based anomalies over longer time horizons. After reviewing further research on cryptocurrency market inefficiencies [[1]](https://www.sciencedirect.com/science/article/abs/pii/S1544612319306415) [[2]](https://academic.oup.com/jfec/article-abstract/18/2/233/5133597) [[3]](https://www.sciencedirect.com/science/article/abs/pii/S1057521921001228) [[4]](https://onlinelibrary.wiley.com/doi/10.1002/isaf.1488), I was intrigued by predictable patterns in returns following large price movements. This led me to develop a classic mean reversion strategy instead (mean reversion suggests that asset prices tend to revert to their long-term average after extreme movements due to market overreactions and subsequent corrections). 
{{< img src="crypto-changepoint-returns.jpg" alt="Scatter plot showing the relationship between return at time of jump (x-axis, ranging from -0.100 to 0.075) and return after jump (y-axis, ranging from -0.06 to 0.10), with red data points and a fitted regression line showing a slight negative correlation, r = -0.2142, p < 0.0" width="80%" >}}
First, I had to find "change points." The PELT algorithm efficiently identifies points in ETH/EUR where the statistical properties of the time series change significantly. These changes could indicate market events, trend reversals, or volatility shifts in the cryptocurrency price.
{{< img src="ETHUSD-pelt-changepoint.png" alt="Structural break detection in financial time series using the PELT (Pruned Exact Linear Time) algorithm with RBF kernel. The analysis identifies 12 significant changepoints during June 15-29, 2021, using a penalty parameter of 35. Vertical dashed lines indicate detected regime changes in the price dynamics." width="80%" >}}
I then implemented an automated mean reversion trading strategy following this logical flow: _Continuous monitoring → Signal detection → Buy execution → Hold period → Sell execution_. The script continuously monitored prices for certain cryptocurrencies on Kraken exchange. It executed buy orders when the price moved more than four standard deviations over a 2-hour period, then automatically sold after exactly 2 hours regardless of price movement. The strategy used fixed position sizes and limit orders to minimize fees. It assumed that large price drops represent temporary market overreactions that will reverse within the holding period.

This little script earned some good change—but then again, it was 2021.

{{< disclaimer type="finance" >}}