+++
title = "Crypto Mean Reversion Trading"
seoTitle = "Crypto Mean Reversion Trading with Change Point Detection"
date = 2024-11-11
images = ["https://static.philippdubach.com/ograph/ograph-crypto.jpg"]
description = "How I built a crypto mean reversion trading bot using PELT change point detection on Kraken, targeting altcoin price overreactions with automated execution."
keywords = ["crypto mean reversion trading", "PELT algorithm", "change point detection", "cryptocurrency market inefficiency", "automated crypto trading bot", "efficient market hypothesis crypto", "statistical arbitrage", "volatility trading strategy", "quantitative trading"]
categories = ["Investing"]
tags = ["Project"]
type = "Project"
draft = false
aliases = ["/2024/11/11/crypto-mean-reversion-trading/"]
takeaways = [
  "The bot bought altcoins on Kraken when prices dropped more than 4 standard deviations over a 2-hour window, then sold automatically after 2 hours, betting on mean reversion",
  "PELT change point detection identified structural breaks in ETH price series, providing signal confirmation for when statistical properties of the time series shifted",
  "Major cryptos like BTC and ETH are becoming more efficient, but smaller altcoins with thin order books and retail-dominated trading still exhibit exploitable mean reversion patterns",
]
faq = [
  {question = "What is mean reversion in cryptocurrency trading?", answer = "Mean reversion is a statistical concept suggesting that asset prices tend to return to their long-term average after extreme movements. In crypto markets, this means that when a coin's price drops sharply due to a temporary overreaction, it often bounces back toward its historical mean. Traders exploit this by buying after significant dips and selling once the price recovers."},
  {question = "How does change point detection work in crypto trading?", answer = "Change point detection identifies moments when the statistical properties of a price time series shift significantly, such as a sudden change in mean, variance, or trend. The PELT (Pruned Exact Linear Time) algorithm is one method that efficiently scans historical price data to find these structural breaks. Traders use detected change points as signals for potential entry or exit positions."},
  {question = "Are cryptocurrency markets efficient enough to prevent mean reversion strategies from working?", answer = "Research shows that major cryptocurrencies like Bitcoin and Ethereum are becoming more efficient over time, but smaller altcoins with lower liquidity and higher volatility still exhibit significant inefficiencies. These inefficiencies are driven by retail trader dominance, information asymmetries, and thin order books, all of which create short-term overreactions that mean reversion strategies can exploit."},
  {question = "What triggers a mean reversion trade in an automated crypto bot?", answer = "A common approach is using standard deviation thresholds. For example, a bot might trigger a buy when the price drops more than four standard deviations from its recent average over a short window such as two hours. The bot then holds the position for a fixed period before selling, betting that the extreme move will partially reverse. Fixed position sizes and limit orders help manage risk and minimize fees."},
]
+++
In late 2021, Lars Kaiser's paper on [seasonality in cryptocurrencies](https://www.sciencedirect.com/science/article/abs/pii/S1544612318304513) inspired me to use my [Kraken API Key](https://docs.kraken.com/api/) to try and make some money. A quick summary of the paper: (1) Kaiser analyzes seasonality patterns across 10 cryptocurrencies (Bitcoin, Ethereum, etc.), examining returns, volatility, trading volume, and spreads (2) Finds no consistent calendar effects in cryptocurrency returns, supporting weak-form market efficiency (3) Observes robust patterns in trading activity - lower volume, volatility, and spreads in January, weekends, and summer months (4) Documents significant impact of January 2018 market sell-off on seasonality patterns (5) Reports a "reverse Monday effect" for Bitcoin (positive Monday returns) and "reverse January effect" (negative January returns) (6) Trading activity patterns suggest crypto markets are dominated by retail rather than institutional investors. 

The paper's main finding: crypto markets appear efficient in terms of returns but show behavioral patterns in trading.

>The efficient-market hypothesis (EMH) is a hypothesis in financial economics that states that asset prices reflect all available information. A direct implication is that it is impossible to "beat the market" consistently on a risk-adjusted basis since market prices should only react to new information.

The EMH has interesting implications for cryptocurrency markets. While major cryptocurrencies like Bitcoin and Ethereum have gained significant institutional adoption and liquidity, they may still be less efficient than traditional markets due to their relative youth and large audience of retail traders (who might not act as rationally as larger, institutional traders). This inefficiency becomes even more pronounced with smaller altcoins, which often have: (1) Lower trading volumes and liquidity (2) Less institutional participation (3) Higher information asymmetries (and/or greater susceptibility to manipulation). These factors create opportunities for exploiting market inefficiencies, particularly in the short term when prices may overreact to news or technical signals before eventually correcting.

{{< readnext slug="the-variance-tax" >}}

Unlike Kaiser's seasonality research, I didn't focus on calendar-based anomalies over longer time horizons. After reviewing further research on cryptocurrency market inefficiencies [[1]](https://www.sciencedirect.com/science/article/abs/pii/S1544612319306415) [[2]](https://academic.oup.com/jfec/article-abstract/18/2/233/5133597) [[3]](https://www.sciencedirect.com/science/article/abs/pii/S1057521921001228) [[4]](https://onlinelibrary.wiley.com/doi/10.1002/isaf.1488), I was intrigued by predictable patterns in returns following large price movements. This led me to develop a classic mean reversion strategy instead (mean reversion suggests that asset prices tend to revert to their long-term average after extreme movements due to market overreactions and subsequent corrections). 
{{< img src="crypto-changepoint-returns.jpg" alt="Scatter plot showing the relationship between return at time of jump (x-axis, ranging from -0.100 to 0.075) and return after jump (y-axis, ranging from -0.06 to 0.10), with red data points and a fitted regression line showing a slight negative correlation, r = -0.2142, p < 0.0" width="80%" >}}
First, I had to find "change points." The PELT algorithm efficiently identifies points in ETH/EUR where the statistical properties of the time series change significantly. These changes could indicate market events, trend reversals, or volatility shifts in the cryptocurrency price.
{{< img src="ETHUSD-pelt-changepoint.png" alt="Structural break detection in financial time series using the PELT (Pruned Exact Linear Time) algorithm with RBF kernel. The analysis identifies 12 significant changepoints during June 15-29, 2021, using a penalty parameter of 35. Vertical dashed lines indicate detected regime changes in the price dynamics." width="80%" >}}
I then implemented an automated mean reversion trading strategy following this logical flow: _Continuous monitoring → Signal detection → Buy execution → Hold period → Sell execution_. The script continuously monitored prices for certain cryptocurrencies on Kraken exchange. It executed buy orders when the price moved more than four standard deviations over a 2-hour period, then automatically sold after exactly 2 hours regardless of price movement. The strategy used fixed position sizes and limit orders to minimize fees. It assumed that large price drops represent temporary market overreactions that will reverse within the holding period.

This little script earned some good change, but then again, it was 2021.

{{< disclaimer type="finance" >}}

