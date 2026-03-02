+++
title = "The Moral Philosophy of Investing in Ignorance"
seoTitle = "Ethics of UU Investing: Who Profits When Markets Can't Model Risk?"
date = 2026-04-22
publishDate = 2026-04-22T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-moral-philosophy-investing-ignorance.jpg"]
description = "Constraint arbitrage, the sidecar problem, and who bears the distributional cost of investing under ignorance. The final installment of Edge of Knowledge."
keywords = ["ethics of investing under ignorance", "constraint arbitrage fairness", "Zeckhauser blame aversion investing", "institutional investor career risk", "Monday morning quarterback MMQ risk", "sidecar investing ethics Gazprom", "Munger Zeckhauser bridge quote", "UU investing distributional consequences", "Ricardo Waterloo investment unknown", "fiduciary duty ambiguity penalty", "market efficiency ignorance box", "pension fund UU constraints", "Buffett California earthquake authority ethics", "complementary skills vs power investing"]
categories = ["Quantitative Finance"]
type = "Analysis"
draft = true
lastmod = 2026-04-22
takeaways = [
  "Most alpha in UU situations is constraint arbitrage: profiting from the gap between institutional rationality (right for the manager's career) and market rationality (right price for the asset).",
  "Returns from UU mispricing flow disproportionately to wealthy individuals and family offices because institutional governance requires probability estimates the ignorance box can't produce.",
  "Zeckhauser's sidecar concept is ethically clean when the driver has capability (a developer building a property) but murkier when the complementary asset is political power rather than skill.",
  "Munger's compliment ('think the way Zeckhauser plays bridge') captures the series thesis: the best investors reason about what they don't know, not what they do.",
]
faq = [
  {question = "Is it ethical to profit from others' institutional constraints in UU situations?", answer = "The question has no clean answer. In the risk and uncertainty boxes, profit comes from being right: you estimated better. In the ignorance box, profit often comes from willingness to act when others can't, due to fiduciary requirements, career risk, or compliance models that require probability estimates. The sellers weren't wrong about the asset. They were unable to hold it. Whether profiting from that gap is legitimate depends on whether you view it as constraint arbitrage (providing liquidity to a market that needs it) or as exploiting structural advantages that accrue mainly to the already-wealthy."},
  {question = "What is the distributional problem with UU investing?", answer = "The people who can profit from UU mispricing tend to be those who can afford career risk, illiquidity, and blame: wealthy individuals, family offices, and unconstrained investors like Buffett. The people who cannot participate are pension funds, endowments, and retail investors in diversified vehicles, precisely because their governance structures require estimable risk. The epistemological structure of markets has equity implications: the returns from ignorance flow disproportionately to those who already have the most."},
  {question = "What did Charlie Munger mean by 'think the way Zeckhauser plays bridge'?", answer = "In his 1995 Harvard Law School speech on the psychology of human misjudgment, Munger argued that the right way to think about probabilistic decisions is the way Zeckhauser plays bridge: making hundreds of decisions under uncertainty, balancing expected gains and losses, and accepting that good decisions sometimes lead to bad outcomes. The compliment is precise because bridge rewards reasoning about what you don't know, not just what you do."},
  {question = "What is the difference between capability and power as complementary assets in sidecar investing?", answer = "Zeckhauser's sidecar concept works cleanly when the driver has genuine capability: a real estate developer who creates value, a venture capitalist with operational expertise. The profit is a share of value creation. It becomes ethically murkier when the complementary asset is power rather than skill, as in Zeckhauser's Gazprom example where the edge comes from access to political elites rather than from analytical or operational superiority."},
]
+++

*Investing at the Edge of Knowledge, Part 5 · [Start with Part 1](/posts/three-kinds-of-not-knowing/)*

> "If in an unknowable world none of your bridges fall down, you are building them too strong."

Zeckhauser's version of this line refers to investments, not bridges, but the structural point is the same. A philosophy of investing that expects some failures is also a philosophy that accepts some losses will be borne by the people on the other side of the trade. Over four installments I've laid out a framework for thinking about what you can know ([Part 1](/posts/three-kinds-of-not-knowing/)), why investors flee what they can't ([Part 2](/posts/ambiguity-by-design/)), how to assess what others know ([Part 3](/posts/the-geometry-of-who-knows-what/)), and how much to bet ([Part 4](/posts/bet-sizing-at-the-frontier/)). This final piece asks the question the framework doesn't answer: when you profit from ignorance, is that a legitimate source of returns?

Zeckhauser opens his [2006 paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2205821) with a warning that is usually read as practical advice: "Do not read on if blame aversion is a prime concern." I think there's an ethical question underneath the practical one.

## Three sources of profit

In the risk box, profit comes from superior calculation. Both sides had the same information. You ran the numbers better. This is the cleanest form of trading profit. The losing side made a computational error that was, in principle, avoidable.

In the uncertainty box, profit comes from superior estimation. You had a better model, better priors, or more data. The other side could have done the same analysis but didn't. This is still relatively clean, though the boundary between "better estimation" and "inside information" requires constant policing, which is what securities regulation exists to do.

In the ignorance box, the source of profit shifts. The other side didn't sell because they thought the price was fair. They sold because they couldn't model the asset and their constraints forced a decision. The fund manager who sold the IGV at $80 during the [SaaSpocalypse](/posts/the-saaspocalypse-paradox/) wasn't wrong about the disruption risk from AI. They were unable to hold a position that couldn't be defended to their risk committee, their clients, or their compliance team. The profit for the buyer comes from the gap between institutional rationality (the right decision for the manager's career) and market rationality (the right price for the asset).

The distinction matters. Most alpha in UU situations is some form of constraint arbitrage: profiting from the gap between what an asset is worth and what institutions are able to pay for it. Time horizon arbitrage, where you can hold for five years and they can't. Liquidity arbitrage, where you can accept illiquidity and they can't. Career-risk arbitrage, where you can tolerate looking wrong and they can't. All three produce genuine returns, and in none of them did the counterparty make an error. They made a rational decision given their constraints, and you profited from having different constraints.

One way to frame this is positive: the constraint-arbitrage investor is providing liquidity to a market that needs it. They're buying when others are forced to sell, which improves price discovery and reduces the magnitude of mispricings. In this framing, the profit is compensation for bearing ambiguity that others can't.

Another way to frame it is uncomfortable: the returns from ignorance flow to those who can afford to bear it, and that set of people is not random.

{{< readnext slug="the-saaspocalypse-paradox" >}}

## The sidecar problem, revisited

I discussed the sidecar concept in [Part 3](/posts/the-geometry-of-who-knows-what/) as an information problem: how do you know the driver is skilled? Here I want to revisit it as an ethical problem: what kind of edge is the driver using?

Zeckhauser's sidecar works cleanly when the driver has genuine capability. A real estate developer who can build and lease a building is creating value. A venture capitalist with operational expertise and a network of technical talent is creating value. The sidecar investor earns a share of that value creation. The profit comes from complementary skills combined with capital, and this is hard to object to on ethical grounds.

It gets murkier when the complementary asset is power rather than skill. Zeckhauser discusses a hypothetical Gazprom investment: "If you could comfortably determine that the Russian elite was investing on its own volition, and that foreigners would not be discriminated against..." The edge in that scenario isn't analytical. It's access to a political structure. The sidecar investor is riding alongside someone who can influence outcomes, not someone who can predict them. The distinction between capability and power as complementary assets is one the paper gestures at but doesn't fully resolve.

[Robb (2006)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2205858) put his finger on a related problem. UU knowledge is "uncommunicable." If a mechanism for generating excess returns could be expressed as a process, someone would have arbitraged it away. But if the driver can't articulate their edge, the sidecar investor can't distinguish between genuine insight, survivorship bias, and proximity to power. This isn't just an epistemological difficulty. It's an ethical one: you're making a bet on someone whose advantage you can't evaluate, which means you're implicitly trusting that the advantage is legitimate.

[Summers (2006)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2205848) observed that identifying skilled UU managers may be no easier than picking investments directly. I suspect this is too generous. In many cases, identifying whether a sidecar driver has skill, power, or luck is harder than evaluating the underlying asset, because the asset at least has observable characteristics. The driver's edge, by definition, doesn't.

{{< readnext slug="passive-investings-active-problem" >}}

## Blame, accountability, and the collective action problem

The Monday Morning Quarterback problem runs through Zeckhauser's entire paper. Investors avoid Box F not because the expected value is negative but because a bad outcome will be judged harshly in retrospect. I've discussed this as a mechanism for mispricing (Parts [2](/posts/ambiguity-by-design/) and [3](/posts/the-geometry-of-who-knows-what/)). Here I want to name the distributional consequence.

If we want institutional investors to make UU bets, which would improve price discovery and reduce the mispricing that currently rewards unconstrained investors, we need governance structures that tolerate good decisions with bad outcomes. The current structure doesn't. A pension fund CIO who buys the IGV at $80 and watches it fall to $70 will face questions that no amount of "the expected value was positive" can answer. The governance framework is built for the risk box, where decisions can be evaluated against a defined probability model. In the ignorance box, there is no model to evaluate against, which means there is no institutional language for "this was a good bet that happened to lose."

The result is a collective action problem with distributional consequences. The returns from UU mispricing accrue disproportionately to wealthy individuals, family offices, and unconstrained investors like Buffett, precisely the people who can afford career risk, illiquidity, and blame. Pension funds, endowments, and retail investors in diversified vehicles are structurally excluded, not by regulation or by choice, but by governance frameworks that require the kind of probability estimates the ignorance box doesn't produce.

I'm not sure this is a solvable problem. The fiduciary duty to beneficiaries is real, and "we invested in something we couldn't model because the price seemed low" is not, and should not be, an acceptable fiduciary justification. But it's worth naming the consequence: the epistemological structure of markets has equity implications. The returns from acting under ignorance flow to those who already have the most capacity to bear it. This is not a conspiracy. It's a structural feature that emerges naturally from the interaction of ambiguity aversion, institutional constraints, and governance design.

---

Zeckhauser closes his paper by returning to David Ricardo at Waterloo. Ricardo wasn't a military analyst. He didn't have inside information about Wellington's strategy. He just understood the structure of the situation: thin competition (most investors had fled), an eager seller (the British government needed capital), asymmetric payoffs (bounded downside, enormous upside), and a kind of not-knowing that was the same for everyone. He bought British government bonds on the eve of the battle and made a fortune.

The honest answer to "what's your thesis?" in a UU investment is: "I don't have one in the way you mean. I have a set of second-order inferences about what other people don't know, what constraints they face, and why the price might be wrong even though I can't tell you what the right price is." That's not a pitch deck. It's a worldview. Most investment committees would reject it, which is, of course, part of why it works.

Charlie Munger, in his 1995 [Harvard Law School speech](https://jamesclear.com/great-speeches/psychology-of-human-misjudgment-by-charlie-munger) on the psychology of human misjudgment, offered a compliment that I think is the best summary of everything this series has tried to say: "The right way to think is the way Zeckhauser plays bridge." The compliment is precise. Bridge is a game of acting under uncertainty with imperfect information, where the quality of the decision is independent of the outcome, and where the best players are distinguished not by what they know but by how they reason about what they don't know.

That might be the best definition of investing at the edge of knowledge I can offer.
