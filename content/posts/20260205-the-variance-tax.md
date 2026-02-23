+++
title = "Variance Tax"
aliases = ["/posts/the-variance-tax/"]
seoTitle = "The Variance Tax: How Volatility Drag Erodes Compound Returns"
date = 2026-02-06
publishDate = 2026-02-06T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-variance-tax.jpg"]
description = "Variance drain is the hidden cost of volatility: why a portfolio averaging +10% can lose money. The ½σ² formula explains the gap between paper and real returns."
keywords = ["variance drain", "volatility drag", "geometric vs arithmetic returns", "leveraged ETF decay", "Kelly criterion"]
categories = ["Quantitative Finance"]
type = "Essay"
math = true
draft = false
takeaways = [
  "Variance drain equals ½σ²: doubling volatility quadruples the cost to compound returns",
  "The Kelly criterion (L* = (μ-r)/σ²) falls directly out of the variance drain formula, giving the leverage that maximizes compound growth",
  "Half-Kelly sizing sacrifices ~25% of theoretical growth but dramatically reduces drawdown risk from estimation error",
  "Same 10% arithmetic return at 50% vol loses more than half your money over 30 years; at 0% vol it reaches $1,745",
]
faq = [
  {question = "What is variance drain (volatility drag)?", answer = "Variance drain is the gap between an investment's arithmetic mean return and its compound (geometric) growth rate. It equals approximately ½σ², where σ is the volatility of returns. Higher volatility means a larger gap between the average return you see reported and the actual wealth you accumulate."},
  {question = "How does leverage amplify volatility drag?", answer = "Leverage L scales arithmetic return linearly (Lμ) but scales variance drain quadratically (½L²σ²). Doubling leverage quadruples the drag. This is why leveraged ETFs can underperform their target multiple over time, especially in volatile markets."},
  {question = "What is the Kelly criterion and how does it relate to variance drain?", answer = "The Kelly criterion gives the leverage ratio that maximizes compound growth: L* = (μ − r) / σ². It falls directly out of the variance drain formula — it is the point where the marginal return from additional leverage exactly equals the marginal cost of additional variance drain."},
  {question = "Why do practitioners use half-Kelly?", answer = "Full Kelly assumes perfect knowledge of expected return (μ) and volatility (σ). In practice, both are estimated with error. Half-Kelly — sizing at L*/2 — sacrifices about 25% of theoretical growth but dramatically reduces the risk of overleveraging due to estimation error."},
  {question = "Is volatility drag a real force or a mathematical artifact?", answer = "It is a mathematical relationship, not a physical force — the geometric mean is always less than or equal to the arithmetic mean (AM-GM inequality). But the P&L consequences are entirely real: two portfolios with the same average return but different volatilities will produce different terminal wealth."},
]
+++

Let's say your portfolio returned +60% in 2024, then fell 40% in 2025. That's an annualized average return of +10%. Actual return after two years: minus 4% (i.e $100 * 1.6 * 0.6 = $96).

That 14-point gap is what we call the variance tax aka [variance drain](https://www.bogleheads.org/wiki/Variance_drain) or volatility drag and it's one of the least intuitive forces in investing.

Take any series of returns with arithmetic mean μ and volatility σ. The compound growth rate, the one that actually determines your wealth, is approximately:

$$G ≈ μ − ½σ²$$

This comes from a [second-order Taylor expansion](https://en.wikipedia.org/wiki/Taylor%27s_theorem#Example) of ln(1+r). Take expectations, and the mean log return equals the arithmetic mean minus half the variance. Everything else drops out. Half the variance. That is the tax. The same correction term appears when you solve [geometric Brownian motion](https://en.wikipedia.org/wiki/Geometric_Brownian_motion) via [Itô's lemma](https://en.wikipedia.org/wiki/It%C3%B4%27s_lemma) (the drift of log(S) is μ − σ²/2, not μ) so whether you come at it from discrete compounding or continuous-time stochastic calculus, you land in the same place. And because it is quadratic, doubling volatility does not double the cost. It quadruples it. And what we learned during covid, if anything at all, is that we generally [have a hard time to mentally abstract exponential growth](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0242839) rates.{{< img src="variance_drain_by_vol.png" alt="Chart showing the variance tax as a quadratic curve ½σ², with labeled data points for Bonds (5% vol, 0.1% drain), S&P 500 (16%, 1.3%), Nasdaq (22%, 2.4%), Emerging Markets (25%, 3.1%), 2x Leveraged S&P (32%, 5.1%), 3x Leveraged S&P (48%, 11.5%), and Bitcoin (60%, 18%)" width="80%" >}} Treasury bonds at 5% vol pay about 0.1% per year in variance drain. Barely noticeable. The S&P 500 at 16% vol pays 1.3%. A 3x leveraged ETF at 48% vol pays 11.5%. [Jacquier, Kane, and Marcus (2003)](https://people.bu.edu/jacquier/papers/geom.faj0312.pdf) studied S&P 500 returns from 1926 to 2001: arithmetic mean 12.49%, geometric mean 10.51%. The gap is 1.98 percentage points. The formula predicts ½ × 0.203² = 2.06%. {{< img src="variance_table.png" alt="Table showing variance drain by asset class: US Bonds (5% vol, 0.1% drain), S&P 500 (16% vol, 1.3% drain), Nasdaq (22% vol, 2.4% drain), Emerging Markets (25% vol, 3.1% drain), 2x Leveraged S&P (32% vol, 5.1% drain), 3x Leveraged S&P (48% vol, 11.5% drain)" width="80%" >}} Looking at the last row, we see that tripling leverage triples the arithmetic return but delivers nearly the same compound return as 2x. The linear gain gets eaten by the quadratic penalty. {{< img src="compound_wealth_growth.png" alt="Line chart showing $100 invested at 10% arithmetic return over 30 years at four volatility levels: 0% vol reaches $1,745, 15% vol reaches $1,280, 30% vol reaches $498, and 50% vol loses most of the original investment" width="80%" >}} Same 10% arithmetic return, different volatility. After 30 years, the zero-volatility path reaches $1,745. At 15% vol, $1,280. At 30%, $498. At 50% vol you have lost more than half your money despite averaging +10% per year. 

Now apply leverage. If you lever an asset by factor L, the arithmetic return scales linearly (Lμ) but the variance drain scales quadratically (½L²σ²). The compound return becomes:

$$G(L) ≈ r + L(μ − r) − ½L²σ²$$

Take the derivative, set to zero. The leverage that maximizes compound wealth:

$$L^{\ast} = (μ − r) / σ²$$

{{< readnext slug="the-long-volatility-premium" >}}

For the S&P 500 with roughly 7% excess return and 16% vol, L* comes out to about 2.7x.
{{< img src="leverage_curve.png" alt="The leverage curve for S&P 500 parameters showing compound return peaking at Kelly optimal leverage L*=2.7x, with labeled points at 1x, 2x, and 3x leverage. Returns decline beyond the Kelly optimum and eventually turn negative" width="80%" >}} This is the [Kelly criterion](https://en.wikipedia.org/wiki/Kelly_criterion) (_which you might know from utility theory or gambling heuristics but in fact, as we see here, it falls straight out of the variance tax formula._) Beyond Kelly, every dollar of additional leverage costs more in variance drain than it earns in expected return. The curve bends over and eventually goes negative. In practice, most practitioners use "half-Kelly" — sizing positions at L*/2 — because the formula assumes you know μ and σ precisely, and you don't. Estimation error in either parameter can push you past the peak and onto the losing side of the curve. Half-Kelly sacrifices roughly 25% of the theoretical growth rate but dramatically reduces drawdown risk.
{{< img src="UPRO_factsheet.png" alt="Extract of ProShares UltraPro S&P 500 Factsheet Total Return" width="80%" >}}You can see this play out in practice. [ProShares UPRO](https://www.proshares.com/our-etfs/leveraged-and-inverse/upro), the 3x S&P 500 ETF, has returned roughly 28% annualized over the past decade during one of the strongest bull markets in history. The S&P 500 compounded at about 10% over the same period. Linear 3x leverage would imply roughly 30%. Variance drain accounts for the gap, and that was in a favorable environment. In 2022, when the S&P fell about 19%, UPRO dropped 70%. The effect is even starker in higher-volatility underlyings: [ProShares TQQQ](https://www.proshares.com/our-etfs/leveraged-and-inverse/tqqq), the 3x Nasdaq-100 ETF, sat roughly flat from its 2021 highs through early 2025 while the unlevered QQQ had long since recovered — a textbook case of variance drain overwhelming the leverage premium in a choppy market. 

The same half-sigma-squared shows up across finance. It is why stock prices follow [log-normal distributions](https://en.wikipedia.org/wiki/Log-normal_distribution), not normal ones. Why put options cost more than equidistant calls. Why the [Black-Scholes](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) d₁ and d₂ terms carry a ½σ²t adjustment. Why a $100 stock's true geometric midpoint between $150 up and $50 down is not $100 but $86.60, because ln(150/100) = ln(100/66.67). Wherever returns compound and volatility is nonzero, the variance tax is being collected.
