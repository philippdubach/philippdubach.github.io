+++
title = "Long Volatility Premium"
aliases = ["/posts/the-long-volatility-premium/"]
seoTitle = "Long Volatility Premium: Can Tail Hedging Improve Returns?"
date = 2026-02-14
lastmod = 2026-08-16
publishDate = 2026-02-14T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-long-volatility-premium3.jpg"]
description = "Can tail hedging improve compound returns? Review 40 years of beta-adjusted long-volatility evidence, plus AQR, Goldman, Universa, puts, trends, and costs."
keywords = ["long volatility premium", "tail risk hedging", "beta-adjusted tail hedging", "volatility risk premium", "put options vs trend following", "long volatility strategy", "tail hedge portfolio", "S&P 500 put options", "portfolio convexity", "option delta gamma vega", "variance tax compounding", "rebalancing premium", "portable alpha", "crisis alpha", "Universa Investments", "risk budget reallocation", "negative carry", "VIX futures contango", "out-of-the-money puts", "managed futures trend following"]
draft = false
categories = ["Quantitative Finance"]
takeaways = [
  "One River's 40-year data show that a beta-adjusted long-volatility overlay improved S&P 500 total returns and reduced drawdowns. Offsetting the put's negative delta, or short-equity exposure, isolates convexity that pays during crashes.",
  "A portfolio allocated 3.3% to Universa and the rest to the S&P 500. It compounded at 12.3% annually over 10 years and beat the index by limiting the variance tax on compound returns.",
  "AQR finds that puts and trend-following complement each other. Puts returned over 42% during the sudden COVID crash. Trend-following excelled during long bear markets such as the dot-com bust.",
  "Several popular tail-risk strategies underperformed a simple cash allocation. Short-dated VIX futures lagged it by 355 basis points. The result shows that implementation matters more than the concept.",
]
faq = [
  {question = "What is the long volatility premium?", answer = "The long volatility premium is a claim about put options. Beta-adjusting a put offsets its embedded short-equity exposure. The claim is that the remaining position earns a positive return over time, unlike raw put buying. Patrick Causley at One River Asset Management documented this result with approximately 40 years of data. A portfolio with a market beta of one plus a long-volatility overlay outperformed the S&P 500. It also produced lower volatility and shallower drawdowns."},
  {question = "How does beta-adjusting change the economics of buying puts?", answer = "Raw put options contain a large short-beta position that loses value when the market rises. Beta measures exposure to broad market moves. Delta measures how an option's value changes with its underlying asset. Beta-adjusting adds enough long equity to offset the put's negative delta. This step isolates convexity, measured by gamma, and sensitivity to implied volatility, measured by vega. The position can still pay sharply during crashes without fighting the equity risk premium in normal markets."},
  {question = "What is the variance tax and how does it relate to tail hedging?", answer = "The variance tax is volatility's drag on compound returns. The compound growth rate is approximately the arithmetic mean minus half the variance: G ≈ μ − ½σ². Here, G is the compound growth rate, μ is arithmetic mean return, and σ² is return variance. Because the penalty is quadratic, reducing drawdown severity can have a nonlinear effect on terminal wealth. A portfolio that falls 50% needs a 100% gain to recover. A costly tail hedge can still increase compound wealth by limiting severe losses."},
  {question = "Should investors use puts or trend-following for tail hedging?", answer = "AQR's research shows that the two approaches complement each other. Put strategies can deliver spectacular returns in sudden crashes such as COVID-19. They are expensive to maintain and have negative long-run expected returns. Trend-following has positive long-run expected returns and performs well during long bear markets such as the dot-com bust. Academic research combined both through portable alpha, which adds the hedge without replacing the core equity exposure. It produced statistically significant alpha of 0.25% per month after controlling for equity factors."},
  {question = "How much should a portfolio allocate to tail hedging?", answer = "Practitioner allocations discussed here generally range from 1% to 5% of portfolio value. The Wall Street Journal reported on a portfolio with 3.3% in Universa Investments and the rest in the S&P 500. It achieved a 12.3% compound annual return over 10 years and beat the index. The optimal size is ultimately psychological rather than mathematical. It must tolerate years of negative carry, the recurring cost of maintaining the hedge, without forcing the investor to abandon it."},
  {question = "Why do some tail-risk hedging strategies underperform cash?", answer = "A CAIA Association study tested several popular tail-risk strategies against cash. Short-dated Cboe Volatility Index (VIX) futures and one-month variance swaps failed to beat that benchmark. They lagged it by 355 and 203 basis points, respectively. One basis point is 0.01 percentage points. A variance swap pays according to the difference between realized variance and a fixed strike. For a long VIX-futures strategy, persistent contango can create negative roll yield. This happens when the strategy replaces expiring contracts with more expensive later-dated contracts. The result shows that implementation matters because many long-VIX approaches face this structural cost."},
]
+++
>Tail hedging earns its keep through what it lets the rest of the portfolio do.

In [The Variance Tax](/posts/the-variance-tax/), I wrote about the ½σ² formula. Compound returns are approximately equal to arithmetic returns minus half the variance, where σ² is return variance. The penalty is quadratic, so large drawdowns destroy wealth in ways that are hard to recover from. A portfolio that falls 50% needs 100% just to break even. That article described the problem; this one tests the long volatility premium: whether tail risk hedging can improve total returns instead of dragging them down.

There is a chart circulating in quantitative finance circles that should not exist. It shows a strategy that buys put options on the S&P 500. A put gives its owner the right to sell the underlying asset at a fixed price. When added to a stock portfolio, this strategy *improves* total returns while reducing volatility and maximum drawdown.

Patrick Causley of One River Asset Management produced the chart. His paper is ["Heretical Thinking: The Long Volatility Premium"](https://one-river.nyc3.cdn.digitaloceanspaces.com/alternatives-white-papers/October2025/OR%20-%20Heretical%20Thinking%20-%20The%20Long%20Volatility%20Premium%20-%20Oct%2025%20-%20Web.pdf). It argues that a properly constructed long-volatility position is a compensated factor: a systematic exposure with a positive expected return. It belongs beside value, momentum, and trend in institutional portfolios.

Conventional wisdom says that buying puts is a losing game. The data support a [volatility risk premium](https://www.cboe.com/insights/posts/white-paper-shows-volatility-risk-premium-facilitated-higher-risk-adjusted-returns-for-put-index/) (VRP). The Cboe Volatility Index (VIX) estimates the S&P 500's expected 30-day volatility from SPX option prices. Realized volatility measures the market movement that later occurs. From 1990 to 2018, VIX averaged 19.3%, compared with realized volatility of 15.1%. The persistent gap was 4.2 percentage points. On average, options cost more than the volatility that later occurs.

The [CBOE S&P 500 PutWrite Index](https://en.wikipedia.org/wiki/CBOE_S&P_500_PutWrite_Index) sells S&P 500 puts systematically against cash collateral. It rose 1,835% from 1986 to 2018, while the Cboe 5% Put Protection Index (PPUT) rose only 708%. [Bondarenko (2019)](https://cdn.cboe.com/resources/education/research_publications/PutWriteCBOE19_v14_by_Prof_Oleg_Bondarenko_as_of_June_14.pdf) found annual returns of **9.54%** for PUT and **9.80%** for the S&P 500. PUT's volatility was 9.95%, compared with 14.93% for the index; its Sharpe ratio was 0.65, compared with 0.33 for put buyers.

That consensus describes raw put returns: option sellers earn the premium, while buyers pay it. It does not describe beta-adjusted long-volatility returns.

{{< img src="chart2-volatility-risk-premium.png" alt="Two panels compare VIX implied volatility with realized S&P 500 volatility from 1990 to 2024. The average spread is 4.2 percentage points. Annual bars mark inversions in 2008 and 2020." width="90%" >}}

## I. Separating beta from convexity

The One River paper separates two partly independent components within a put's raw return. Most allocators combine them and then draw the wrong conclusion about tail hedging.

Three sensitivities drive a put's profit and loss (P&L). Delta measures directional exposure to the underlying asset. Gamma measures how quickly delta changes, which creates convexity as the market moves. Vega measures sensitivity to implied volatility.

Beta measures exposure to broad market movements. A put's negative delta therefore embeds a large short-beta position. The equity risk premium is one of the most reliable premia in equity markets. A raw put position fights that powerful headwind. Puts lose value while the market does not crash, and those losses overwhelm the occasional windfall.

Causley's adjustment is straightforward. He adds enough long equity exposure to offset the put's negative delta and neutralize its short beta. The remaining beta-neutral "long volatility factor" isolates gamma and vega.

The paper adds this factor to an equity portfolio and studies approximately 40 years of history. Its beta-1 portfolio retains a market beta of one. With long volatility, it outperformed the version without it and produced lower volatility with a shallower maximum drawdown.

{{< img src="chart1-growth-of-dollar.png" alt="Growth of one dollar chart from 1986 to 2024 on a logarithmic scale. Beta-1 long volatility plus the S&P 500 outperforms the S&P 500 and PPUT, with markers for the global financial crisis and COVID crashes." width="90%" >}}

The simple implementation used monthly puts from CBOE's PPUT index with strikes 5% below the market. These are 5% out-of-the-money (OTM) puts. Even this version produced a persistent result, which is why I find the paper difficult to dismiss. Better strike selection, dynamic position sizes, and rolls across several maturities would likely improve it. The baseline already makes the case.

## II. Why would a long volatility premium exist?

If markets are efficient, a beta-adjusted long-volatility position should not earn a positive premium. Three mechanisms suggest why it might.

The first mechanism is the rebalancing premium. Negatively correlated assets can create a "rebalancing bonus" when an investor restores their portfolio weights systematically. The geometric return, which includes compounding, can exceed the weighted average of the assets' arithmetic returns. [Recent work in the Investment Analysts Journal](https://www.tandfonline.com/doi/full/10.1080/10293523.2025.2553254) formalizes this effect for tail hedging.

A long-volatility position can rise sharply during crashes and lose modestly during calm markets. Rebalancing it against equities creates a structural tailwind. The investor sells part of the hedge after a crash and buys it back during calm periods. This process earns a return when prices revert toward normal levels.

{{< readnext slug="variance-tax" >}}

The second mechanism is the stock-volatility relationship during crashes. When equities fall sharply, implied volatility can spike exponentially rather than rise in proportion. The hedge therefore pays most when the portfolio needs it. After beta adjustment, this convexity can more than cover the position's continuing cost.

The third mechanism is an imbalance between supply and demand. Equity ownership makes institutional investors structurally short volatility. Structured products can add embedded short-option positions. Risk parity, short-volatility exchange-traded funds (ETFs), and pension de-risking can also sell insurance implicitly.

Behavior limits the supply of long volatility. Jody Deio of Aearon Risk Advisors [explains](https://alphaarchitect.com/the-long-volatility-premium-short-the-market-get-paid/): "People don't have the patience to wear these exposures for any long period of time. You're happy being basically a wasting asset. And a wasting asset is nothing that any investment committee or client meeting wants to deal with." Investors want protection, but few will tolerate supplying it for long periods. That shortage may reward investors who can withstand the psychology.

All three mechanisms connect to the variance tax. The ½σ² drag means that smaller drawdowns have a nonlinear effect on terminal wealth. Even a costly hedge can increase compound wealth by limiting rare and severe left-tail losses.

{{< img src="chart4-volatility-tax.png" alt="A recovery curve shows that a 50% loss requires a 100% gain. Moderate, severe, and catastrophic zones illustrate Spitznagel's volatility-tax argument." width="80%" >}}

## III. What the research actually says

The long-volatility claim conflicts with extensive research on the short-volatility premium. The two findings need not conflict. Short-volatility research measures raw option returns, while the long-volatility claim concerns beta-adjusted exposure.

[Research from Barclays](https://indices.cib.barclays/dms/Public%20marketing/Volatility_Risk_Premium.pdf) found that the VRP has positive equity-market beta and excess alpha. Alpha is return not explained by that beta. A linear regression against S&P 500 returns produced a significant positive intercept of roughly 3.48 percentage points of volatility. The result was independent of equity-market direction. Buying and selling volatility may therefore capture separate premia when a strategy isolates different exposures.

[Goldman Sachs Asset Management's 2025 analysis](https://am.gs.com/en-dk/advisors/insights/article/2026/finding-true-value-tail-risk-hedging) has the clearest framing I have seen. Even an idealized hedge with 99% reliability adds only about **0.8 basis points** to annual standalone returns. One basis point equals 0.01 percentage points. That small standalone return matters less than the risk budget released by the hedge.

[Goldman argues](https://am.gs.com/en-dk/advisors/insights/article/2026/finding-true-value-tail-risk-hedging) that tail-risk hedges reduce severe losses. A portfolio can then hold more equity risk and increase its beta. This "risk budget reallocation" can add substantial value for institutions with fixed drawdown limits. Goldman therefore treats the hedge as an offensive tool that supports more aggressive positions in core assets.

Formula 1 teams use pit stops in a similar way. A stop costs time, but soft tires enable faster laps and a faster overall race.

{{< img src="chart6-portfolio-construction.png" alt="Grid table comparing compound annual growth rate, volatility, maximum drawdown, and Sharpe ratio for five portfolios. The portfolio with 97 percent equity and a 3 percent tail hedge compounds at 12.3 percent a year, beating the S&P 500." width="90%" >}}

Universa's live track record puts numbers on the argument. During Q1 2020, the COVID pandemic triggered a 34% S&P 500 crash. [Universa returned 4,144%](https://finance.yahoo.com/news/mark-spitznagel-univesa-cio-on-risk-mitigation-204157461.html). Spitznagel downplays such headline figures: "any punter can devise a trade that does well in a crash. The key is how you do in a crash relative to the rest of the time."

[The Wall Street Journal reported](https://en.wikipedia.org/wiki/Universa_Investments) on a portfolio that allocated **3.3%** to Universa and the rest to the S&P 500. It compounded at **12.3%** a year for 10 years through February 2018. That result beat the S&P 500 itself. A 3.3% tail position improving total returns over a decade is counterintuitive, but the variance-tax arithmetic explains it.

## IV. Put options vs. trend-following: the tortoise and the hare

[AQR's research on tail hedging](https://www.aqr.com/Insights/Research/White-Papers/Tail-Risk-Hedging-Contrasting-Put-and-Trend-Strategies) appeared in the *Journal of Systematic Investing*. It complicates the picture in a way I find genuinely useful for portfolio construction. The paper compares out-of-the-money puts with multi-asset trend-following. Trend-following takes positions in several asset classes when their prices move persistently in one direction.

Puts are the hare. [AQR reports](https://www.aqr.com/Insights/Research/White-Papers/Tail-Risk-Hedging-Contrasting-Put-and-Trend-Strategies) that put-buying strategies returned more than **42%** in one month during the sudden COVID crash. They are expensive to maintain, however, and their long-term expected return is negative.

Trend-following is the tortoise. It [cannot match the reliable downside protection of index puts](https://www.aqr.com/Insights/Research/Alternative-Thinking/Tail-Hedging-Strategies). Yet it has delivered surprisingly consistent safe-haven returns when investors needed them most. It has also earned positive long-run returns.

{{< img src="chart5-tortoise-vs-hare.png" alt="Bars compare put hedging and trend following across six crises. During COVID, puts gain 42%. During the 31-month dot-com decline, trend following gains 42%." width="90%" >}}

[AQR's follow-up paper](https://www.wealthmanagement.com/equities/hedging-tail-risks-the-tortoise-versus-the-hare) examined the five largest drawdowns in a 60/40 portfolio since 2000. Such a portfolio holds 60% in stocks and 40% in bonds. Option strategies performed better during shorter drawdowns, while trend-following produced its strongest returns during long bear markets. Longer drawdowns arguably damage long-term wealth more because they impair compounding for extended periods. AQR therefore leans toward trend-following as the more practical hedge for most investors.

The strategies still complement each other. [Recent academic work](https://www.tandfonline.com/doi/full/10.1080/10293523.2025.2553254) combined them through portable alpha, which adds the hedge without replacing the core equity allocation. It produced statistically significant alpha of 0.25% per month after controlling for traditional equity factors. Outperformance was strongest during market turmoil. Puts for the fast crash, trend for the slow bleed.

{{< readnext slug="three-kinds-of-not-knowing" >}}

## Where most tail hedges fail, and the benchmark problem

Implementation is where most investors get burned. A [CAIA Association paper](https://www.caia.org/sites/default/files/2013-aiar-q1-comparison.pdf) compared several tail-risk strategies with a deliberately boring benchmark: cash. Against an S&P 500-only portfolio, cash reduced tail risk by 80% and standard deviation by 81%. Its information ratio was 0.67. This ratio measures active return per unit of benchmark-relative risk.

[The CAIA study](https://www.caia.org/sites/default/files/2013-aiar-q1-comparison.pdf) found that several popular strategies failed to beat cash. These included short-dated VIX futures and one-month variance swaps. Their performance drags were 355 and 203 basis points, respectively.

{{< img src="chart7-strategy-efficiency.png" alt="Scatter quadrant chart plotting annual cost in basis points versus crisis return for six tail-risk strategies. Trend following sits in the ideal quadrant with low cost and high crisis return. VIX futures and variance swaps fall in the expensive quadrant, underperforming even a simple cash allocation" width="90%" >}}

That result should make any allocator uncomfortable. A sophisticated hedge that cannot beat Treasury bills charges investors for complexity that destroys value. The implementation matters, and many "obvious" methods are structurally flawed. Long VIX-futures strategies are the most prominent example. Persistent contango can create negative roll yield when they replace expiring contracts with more expensive later-dated contracts.

{{< readnext slug="is-private-equity-just-beta-with-a-lockup" >}}

A [2025 paper in the *Journal of Futures Markets*](https://onlinelibrary.wiley.com/doi/full/10.1002/fut.22602) found that naïve tail hedges outperformed more complex models. This result agrees with earlier research on variance-minimizing hedges.

Model risk offers one explanation. Complex methods require more assumptions about market dynamics. Those assumptions can fail, especially during the tail events that the model is meant to hedge. Model misspecification can then leave the portfolio with more risk than expected.

Machine learning (ML) has the same problem. Adding parameters can improve the in-sample fit but worsen out-of-sample performance when the regime changes. Tail events are precisely when regimes change.

The benchmark can also distort the tail-hedging debate. Analysts often compare stocks plus puts with stocks alone. During a long bull market, the hedged portfolio naturally underperforms and appears wasteful. This comparison is intellectually dishonest because the portfolio with puts has less risk.

The error resembles comparing levered and unlevered equity portfolios. Leverage will appear to "work" when it outperforms during a bull market. A fair test compares portfolios with similar risk. Investors can match risk through a lower equity allocation, more cash, or other risk-reducing positions.

[Bhansali and Davis (2010)](https://www.tandfonline.com/doi/full/10.1080/10293523.2025.2553254) made that comparison. Their offensive tail hedge used the freed risk budget to increase equity exposure. It produced better risk-adjusted performance. In that construction, the hedge enables returns instead of dragging on them.

## What I take away

Most interesting questions in finance concern what a position enables, not the position by itself. Tail hedging is boring in isolation because its value appears elsewhere in the portfolio.

A hedge can help an investor stay invested during drawdowns and hold concentrated positions. After a crash, it can fund rebalancing into cheap assets instead of capitulation, which is where the return comes from. Spitznagel and Goldman agree on this point, even if they agree on little else.

The optimal tail-hedge allocation is a psychological question, not a mathematical one. The implementations discussed here use or suggest 1 to 5% of portfolio value. The hedge offsets part of the equity loss during a severe 30 to 50% drawdown.

The right allocation lets you keep the core portfolio through the worst periods without abandoning the hedge. Negative carry means recurring losses from holding a put overlay. If three years of that carry would make you quit, your correct allocation is zero, not 5%.

Goldman's framing remains the most useful to me: evaluate the hedge through what it enables. A 3% tail allocation that reduces maximum drawdown from 50% to 25% frees enough risk budget to raise equity exposure. The increase can be 10 to 15 percentage points. In most scenarios, the extra equity return over a full market cycle will more than cover the hedge's cost. The hedge creates the conditions for alpha without being the alpha itself.

Implementation depends on your time horizon and the drawdown that keeps you awake. Fast crashes favor puts, while slow bleeds favor trend-following. If you do not know which one is coming, and you do not, blend them.

{{< readnext slug="bet-sizing-at-the-frontier" >}}

Every backtest benefits from hindsight. Options also have material transaction costs and bid-ask spreads that the CBOE benchmark indices do not fully capture.

The behavioral problem may be harder than those direct costs. The position loses money most of the time, yet allocators must defend it before investment committees that review monthly returns.

The turkey metaphor from One River's presentation is apt. Right up to Thanksgiving, a statistician turkey can use perfect p-values to prove that the farmer is benevolent. The model is flawless within the distribution of observed data. Yet the data excludes the event that matters most.

Tail hedging is the strategy of the paranoid turkey. The evidence suggests that this paranoia can protect capital and earn a profit, but only with disciplined implementation. The hedge should provide a foundation for taking more risk, rather than a way to avoid it.

{{< disclaimer type="finance" >}}
