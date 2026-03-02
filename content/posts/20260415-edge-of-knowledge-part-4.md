+++
title = "Bet Sizing at the Frontier"
seoTitle = "Kelly Criterion Limits: Why Optimal Bet Sizing Fails Under Ignorance"
date = 2026-04-15
lastmod = 2026-04-15
publishDate = 2026-04-15T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-bet-sizing-frontier.jpg"]
description = "The Kelly Criterion assumes you know your probability of winning. In a UU world, you don't, and heuristics like Zeckhauser's Maxim B replace false precision."
keywords = ["Kelly Criterion limitations uncertainty", "Kelly Samuelson debate position sizing", "bet sizing unknown unknowable", "Zeckhauser Maxim B invest more advantage", "Ed Thorp Kelly Criterion investing", "Berlekamp Kelly criterion Renaissance Medallion", "geometric mean maximization investing", "position sizing under ignorance", "Buffett concentration vs diversification", "variance drag geometric arithmetic returns", "Kelly formula inputs unknown", "portfolio sizing heuristics", "Shannon information theory investing", "Samuelson one syllable words Kelly"]
categories = ["Quantitative Finance"]
type = "Analysis"
draft = true
takeaways = [
  "Kelly's formula (f = (bp - q) / b) maximizes geometric growth rate but requires knowing your probability of winning, an input that is undefined in Zeckhauser's ignorance box.",
  "Samuelson's 1979 critique (written entirely in one-syllable words) showed Kelly only maximizes expected utility for log-utility investors, meaning it systematically overbets for anyone more risk-averse.",
  "Renaissance's Medallion Fund returned roughly 66% annually before fees from 1988 to 2021, applying Kelly-based position sizing to thousands of short-duration trades where probabilities were estimable.",
  "Zeckhauser's Maxim B replaces formula-based precision with a judgment-based heuristic: bet proportionally to your edge, and if nothing looks foolish after the fact, you were too cautious.",
]
faq = [
  {question = "What is the Kelly Criterion and why does it matter for investing?", answer = "Developed by J.L. Kelly at Bell Labs in 1956, the Kelly Criterion is a formula for optimal bet sizing that maximizes the long-run geometric growth rate of wealth. For a binary bet, it says to invest f = (bp - q) / b of your capital, where p is the probability of winning, q is the probability of losing, and b is the odds. Given sufficient time, a Kelly bettor will almost certainly end up wealthier than anyone using a different strategy. The catch: it requires knowing p and b precisely."},
  {question = "What was Samuelson's objection to the Kelly Criterion?", answer = "Paul Samuelson argued in a famous 1979 paper (written entirely in one-syllable words) that the Kelly Criterion only maximizes expected utility for investors with logarithmic utility functions. Log utility implies you'd accept an even-money bet to double or halve your wealth, which most people wouldn't. For more risk-averse investors, Kelly overbets. The dispute is whether position sizing is a mathematical optimization problem with one answer (Kelly) or a preference problem with many answers (Samuelson)."},
  {question = "Why does the Kelly Criterion fail in unknown and unknowable situations?", answer = "Both Kelly and Samuelson assume you know your probability of winning (p) and the payoff ratio (b). In UU situations, you know neither. The parameters themselves are objects of ignorance. This is not a fixable data problem where better research could estimate p more precisely. It is a category problem: the state space over which p would be defined is itself undefined. Kelly gives no answer when its inputs are unavailable."},
  {question = "What does Zeckhauser recommend for position sizing under ignorance?", answer = "Zeckhauser's Maxim B: 'The greater is your expected return, the larger your advantage, the greater the percentage of your capital you should put at risk.' This sounds obvious but is actually radical because it replaces formula-based precision with judgment-based heuristics. He also offers a diagnostic: 'If in an unknowable world none of your investments looks foolish after the fact, you are staying too far away from the unknowable.'"},
]
+++

*Investing at the Edge of Knowledge, Part 4 · [Start with Part 1](/posts/three-kinds-of-not-knowing/)*

> "He who acts in N plays to make his mean log of wealth as big as it can be made will, with odds that go to one as N soars, beat me who acts to meet my own tastes for risk."

That's Paul Samuelson, writing in one-syllable words. The title of his [1979 paper](https://www.sciencedirect.com/science/article/abs/pii/0378426679900232): "Why We Should Not Make Mean Log of Wealth Big Though Years to Act Are Long." Published in the *Journal of Banking & Finance*, a journal not typically known for its prose style. The playfulness of the writing masks the seriousness of the dispute underneath: a disagreement about the foundations of position sizing that remains unresolved half a century later.

In [Part 3](/posts/the-geometry-of-who-knows-what/) I described how to assess whether the other side of a trade knows something you don't. But even if you're confident you're in Box D or Box F (shared uncertainty or shared ignorance, where neither side has an information edge), you still need to decide how much capital to commit. And in a UU world, the most famous formula for answering that question stops working.

## What Kelly actually says

[J.L. Kelly Jr. (1956)](https://www.princeton.edu/~wbialek/rome/refs/kelly_56.pdf) was a physicist at Bell Labs, not a finance researcher. His paper, "A New Interpretation of Information Rate," was about communication channels, not portfolios. The insight was a connection between Shannon's information theory and gambling: the maximum exponential growth rate of a gambler's capital equals the rate of information transmission over a noisy channel.

The formula itself is simple. For a binary bet with probability *p* of winning and odds of *b* to 1, the optimal fraction of your bankroll to wager is *f = (bp - q) / b*, where *q = 1 - p*. If you have a 60% chance of winning an even-money bet, Kelly says invest 20% of your capital. The appeal is a mathematical proof: given sufficient repetitions, a Kelly bettor will, with probability approaching one, end up wealthier than anyone using any other fixed-fraction strategy. It maximizes the geometric growth rate of the portfolio, which is the growth rate that actually compounds over time.

Ed Thorp was the first to take this seriously as an investment principle. He used it to beat blackjack (documented in *Beat the Dealer*, 1962), then applied it to warrant pricing and convertible arbitrage through his hedge fund, Princeton Newport Partners, which returned roughly 15% annually with minimal drawdowns over two decades. Elwyn Berlekamp, Kelly's research assistant at Bell Labs, later became the key figure who restructured Renaissance Technologies' Medallion Fund in 1989, applying Kelly-based position sizing to thousands of short-duration trades. Medallion returned roughly **66%** annually before fees from 1988 through 2021. Bill Gross used Kelly-adjacent thinking at PIMCO. The framework has serious practitioners with serious track records.

## What Samuelson actually objected to

Samuelson's critique is often misunderstood as "Kelly doesn't work." That's not what he said. What he said is more precise and more interesting.

Kelly maximizes the expected logarithm of wealth. This is only optimal if your utility function is logarithmic. Log utility means you are exactly indifferent between the status quo and an even-money bet that would either double or halve your total wealth. Most people would not take that bet. If you are more risk-averse than log utility implies (and most human beings are), Kelly systematically overbets, exposing you to drawdowns that are mathematically acceptable but psychologically devastating. If you are less risk-averse (say, risk-neutral), Kelly underbets: a risk-neutral investor should go all-in on every positive expected value opportunity.

The deeper point: Kelly treats position sizing as a mathematical optimization problem with a unique solution. Samuelson insists it is a preference problem with as many valid solutions as there are utility functions. Both are correct within their own frameworks. The dispute is about which framework applies. And because the answer depends on the investor's risk preferences, which are not observable from the outside and may not even be stable over time, the dispute is in principle unresolvable.

Practitioners tend to resolve it pragmatically. Most Kelly users bet "half Kelly" or "quarter Kelly," sacrificing some expected growth for lower variance. This works in practice, but it concedes Samuelson's point: the "optimal" fraction depends on your tolerance for pain, not just on the mathematics of compound growth. The formula provides a ceiling, not a prescription.

{{< readnext slug="variance-tax" >}}

## Why the debate is beside the point in UU

Here is where both Kelly and Samuelson run into the same wall.

Kelly requires *p* (the probability of winning) and *b* (the payoff ratio). Samuelson's alternative utility-maximization frameworks require the same inputs, or richer ones: full probability distributions over outcomes. Every formal system for position sizing assumes you can parameterize your uncertainty. In the ignorance box, as defined in [Part 1](/posts/three-kinds-of-not-knowing/), you can't. The parameters themselves are objects of ignorance. *p* is not an imprecise estimate waiting for better data. It is undefined, because the state space over which *p* would be calculated hasn't been enumerated.

Zeckhauser makes five observations about money management in UU that are worth listing because each one breaks a standard assumption:

First, most UU investments are illiquid for unknown periods. You can't rebalance, which means sequential portfolio optimization models don't apply. Second, markets charge enormous premiums to cash out illiquid assets, so your exit price is not your mark-to-market. Third, even toy models of optimal sequential investment assume the hard problems away: known probabilities, known time horizons, known liquidity. Fourth, smart people disagree about position sizing even on problems with known probabilities, which suggests the disagreement will be worse, not better, when probabilities are unknown. Fifth, when truly unknowable events occur (the 1987 crash, the 1997 Asian crisis, the 2020 pandemic), unforeseen money-management problems emerge that no model anticipated.

The conclusion is not "do nothing." The conclusion is that formula-based precision is unavailable and pretending otherwise is dangerous. Plugging estimated probabilities into Kelly when the estimates are themselves wild guesses doesn't give you a rigorous answer with a known error bar. It gives you false precision, which is worse than an honest admission of ignorance because it generates unwarranted confidence in the position size.

{{< readnext slug="the-saaspocalypse-paradox" >}}

## Diversification versus concentration

Standard portfolio theory says: diversify. Spread capital across uncorrelated assets to minimize idiosyncratic risk. In the risk box (Box 1 from Part 1), where expected returns and covariance matrices are estimable, this is correct. The marginal expected return on each position is similar, and diversification is free insurance.

In the ignorance box, this logic inverts. If you've identified one or two opportunities in Zeckhauser's Box D or Box F, the quadrants from [Part 3](/posts/the-geometry-of-who-knows-what/) where neither side has an information edge, and you have a genuine advantage from complementary skills, constraint arbitrage, or structural access, spreading capital evenly across a dozen positions dilutes the few bets where your advantage is real. Zeckhauser makes this point sharply: investors routinely allocate almost the same percentage to an investment where they expect a 30% return as to one where they expect 10%. Consider the [SaaSpocalypse](/posts/the-saaspocalypse-paradox/): the IGV at $80 with an RSI of 18 and 17% sector earnings growth was, on the framework, a Box F opportunity with a large absolute advantage for anyone with a multi-year time horizon. The Maxim B response would be to concentrate, not diversify. Most institutional investors did the opposite.

Buffett's practice reflects this. Berkshire Hathaway's top five holdings routinely exceed 70% of its equity portfolio. This is Kelly-adjacent thinking: bet big when your edge is big. But it operates without the false precision of computing a Kelly fraction, because Buffett doesn't pretend to know his probability of winning to two decimal places. He knows the price is low relative to his assessment of value. He knows his time horizon exceeds the market's. He knows the business is durable. He doesn't know, in a formal sense, the probability distribution of outcomes, and he doesn't pretend to.

Zeckhauser uses a bridge analogy that I think captures this well. A bridge player makes hundreds of decisions in a single session, balancing expected gains and losses on every hand. But no serious bridge player computes Kelly fractions mid-hand. They develop judgment over thousands of hands about when to bid aggressively and when to pass. The judgment is trained by feedback, but the individual decision is not a calculation. It's pattern recognition combined with temperament, a sense of when the odds are tilted enough to justify the risk.

This is where Maxim B does its work: "The greater is your expected return, the larger your advantage, the greater the percentage of your capital you should put at risk." It sounds obvious. Read it again. In a world where position sizing formulas require inputs you don't have, Maxim B is the honest replacement: a heuristic that says "bet proportionally to your edge," without pretending to quantify the edge precisely. Combine it with Zeckhauser's diagnostic, and you get the closest thing to a position sizing framework that works in UU: "If in an unknowable world none of your investments looks foolish after the fact, you are staying too far away from the unknowable."

I find that diagnostic unsettling in the right way. It says that some of your bets should look bad. Not because you were wrong, but because the honest price of participation in UU markets is a portfolio that occasionally embarrasses you. If every position is defensible in hindsight, you've been too cautious. You've been optimizing for looking smart rather than for capturing the returns that only come to those willing to look foolish.

The first four parts of this series have addressed what you can know, what you can't, how to assess what others know, and how much to bet. The final question is different, and less comfortable: when you profit from ignorance, from others' institutional inability to act in UU situations, who exactly are you profiting from? That's [Part 5](/posts/the-moral-philosophy-of-investing-in-ignorance/).
