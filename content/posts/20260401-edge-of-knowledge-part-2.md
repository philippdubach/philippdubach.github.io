+++
title = "Ambiguity by Design"
seoTitle = "Ambiguity Aversion: Why Unknown Probabilities Create Mispricing"
date = 2026-04-01
lastmod = 2026-04-01
publishDate = 2026-04-01T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-ambiguity-by-design.jpg"]
description = "Ellsberg proved people flee unknown odds. Zeckhauser showed their flight creates mispricing. Part 2 on ambiguity aversion, comparative ignorance, and investing."
keywords = ["ambiguity aversion investing", "Ellsberg paradox finance", "Zeckhauser unknown unknowable", "comparative ignorance Fox Tversky", "Knightian uncertainty mispricing", "ambiguity aversion vs risk aversion", "Gilboa Schmeidler maxmin expected utility", "Bewley inertia uncertainty", "betrayal aversion Bohnet Zeckhauser", "SaaSpocalypse IGV sell-off ambiguity", "unknown probability investing opportunity", "UU mispricing mechanism", "career risk ambiguity aversion", "institutional constraints uncertainty"]
categories = ["Quantitative Finance"]
type = "Analysis"
draft = true
takeaways = [
  "Ellsberg's 1961 experiment proved people prefer a known 50/50 bet over unknown odds they can take either side of, fleeing the feeling of not-knowing rather than any real informational disadvantage.",
  "Fox and Tversky (1995) found ambiguity aversion intensifies when subjects compare their knowledge to someone who appears more informed, a condition permanently active in financial markets.",
  "The IGV's $2 trillion sell-off was ambiguity aversion amplified by career risk, compliance constraints, and fiduciary duty, not a response to information about fundamentals.",
  "Zeckhauser argues your discomfort facing an ambiguous asset tells you nothing about the asset but everything about the competitive field, because other buyers already left.",
]
faq = [
  {question = "What is the difference between risk aversion and ambiguity aversion?", answer = "Risk aversion is the preference for a certain outcome over an uncertain one with the same expected value, where probabilities are known. Ambiguity aversion is the preference for known probabilities over unknown ones, even when neither option is objectively better. Ellsberg demonstrated this in 1961: people prefer a known 50/50 bet over an unknown-probability bet they can take either side of, revealing aversion to the feeling of not-knowing rather than to any actual informational disadvantage."},
  {question = "How does ambiguity aversion create mispricing in financial markets?", answer = "When deeply ambiguous events occur, ambiguity-averse investors exit positions even when operating results remain strong. Institutional constraints amplify this: fiduciary duties, compliance rules, and career risk force sophisticated capital out of positions that cannot be modeled with known probabilities. Competition thins, prices overshoot fundamentals, and a mispricing window opens for investors who can tolerate ambiguity."},
  {question = "Is ambiguity aversion rational or irrational?", answer = "Both, depending on context. Gilboa and Schmeidler (1989) showed that evaluating bets by worst-case probability is formally rational, and Bewley (2002) proved that inertia under genuine uncertainty is defensible. But in Ellsberg's original experiment, subjects preferred known 50/50 odds over unknown odds they could bet on either side of, revealing aversion to a feeling rather than to an informational asymmetry. Ambiguity aversion is a rational default that gets systematically overweighted in specific situations."},
  {question = "What is the comparative ignorance hypothesis?", answer = "Fox and Tversky (1995) showed that ambiguity aversion intensifies when people can compare themselves to someone who appears more knowledgeable. In financial markets, there is always someone who acts more confident, meaning the comparative ignorance effect is permanently activated, amplifying the flight from ambiguous assets beyond what the underlying uncertainty warrants."},
]
+++

*Investing at the Edge of Knowledge, Part 2 · [Start with Part 1](/posts/three-kinds-of-not-knowing/)*

Ellsberg's urn experiment is one of the cleanest results in decision theory. [Daniel Ellsberg (1961)](https://academic.oup.com/qje/article-abstract/75/4/643/1913802) put two urns in front of subjects. Urn A: 50 red balls, 50 black. Urn B: 100 balls, red and black, ratio unknown. Pay $100 if you draw the right color. Most people chose Urn A, the known 50/50 bet. Fine so far. But here's the problem: they chose Urn A regardless of which color they were betting on. Bet on red? Prefer Urn A. Bet on black? Still prefer Urn A. This is incoherent. If you think Urn B has fewer red balls (making you avoid it for a red bet), you should prefer it for a black bet. The subjects weren't estimating probabilities at all. They were fleeing the *feeling* of not knowing the probability. Ellsberg proved that people make systematically different choices when probabilities are unknown versus known, even when the unknown probabilities carry no actual informational disadvantage.

[Richard Zeckhauser's](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2205821) contribution was to ask: what happens to prices when an entire market makes this choice simultaneously?

## The experimental evidence

Ellsberg's result spawned a body of work that, six decades later, has only strengthened the original finding.

[Fox and Tversky (1995)](https://academic.oup.com/qje/article-abstract/110/3/585/1859203) added a twist that matters enormously for financial markets. Their "comparative ignorance hypothesis" showed that ambiguity aversion intensifies when people can compare themselves to someone who appears more knowledgeable. In a non-comparative setting, where subjects evaluated an ambiguous bet in isolation, ambiguity aversion largely disappeared. But the moment subjects could compare their knowledge to someone else's, the aversion came roaring back.

This matters for finance. In markets, there is always someone who appears more confident. Every sell-side note, every CNBC segment, every hedge fund manager interviewed at Davos projects certainty that you don't feel. The comparative ignorance effect is permanently activated in financial markets. You don't just feel uncertain. You feel uncertain relative to someone who seems to know, and the gap between their apparent confidence and your honest confusion is what drives the exit decision.

Zeckhauser's own experimental evidence in the 2006 paper extends this further. He ran lottery choice experiments comparing willingness to bet on standard probabilistic gambles versus events with unknown and unknowable (UU) outcomes. People refused to distinguish between small probabilities of UU events even when the expected value difference was large. The feeling of not-knowing overwhelmed the arithmetic of expected value. Separately, he documented that individuals explicitly warned about overconfidence are still surprised **35%** of the time on quantities where they should be surprised only **2%** of the time. We simultaneously know less than we think (overconfidence) and refuse to act on what we do know when probabilities are ambiguous (ambiguity aversion). These two biases coexist. They don't cancel out.

{{< readnext slug="long-volatility-premium" >}}

## Is ambiguity aversion rational?

This turns out to be a harder question than it looks, and the answer matters for how you think about the mispricing mechanism.

The case for "yes, it's rational" is surprisingly strong. [Gilboa and Schmeidler (1989)](https://www.sciencedirect.com/science/article/abs/pii/0304406889900189) proved that a decision maker who evaluates bets by the worst-case probability in their set of plausible priors is behaving in a way that satisfies all the standard axioms of rational choice except one: the Sure-Thing Principle that Ellsberg's experiment violates. Their maxmin expected utility model says: if you don't know the probability, evaluate the bet as if the probability is the worst one consistent with your information. This is formally coherent. It's also roughly what a good risk manager does when facing an uncertain tail risk. [Bewley (2002)](https://link.springer.com/article/10.1007/s102030200006), as I discussed in [Part 1](/posts/three-kinds-of-not-knowing/), showed that dropping the completeness axiom produces a framework where inertia, refusing to act, is the rational response when you cannot rank the alternatives. If you can't tell which bet is better, sticking with the status quo isn't lazy. It's defensible.

The case for "no, it's a bias" rests on the Ellsberg experiment itself. The subjects preferred a known 50% chance over an unknown chance that they could bet on either side of. There is no informational disadvantage. The probability they're fleeing might be 50%, might be 30%, might be 70%, but since they can bet on either color, the expected value is the same regardless. The aversion is to the experience of not-knowing, not to any actual asymmetry in the bet. That looks more like a bug than a feature.

I think the answer is "it depends," and the distinction matters. Ambiguity aversion is rational when there might be a better-informed party on the other side of the trade. If you're buying a stock and you suspect the seller knows something you don't, demanding a discount for your ignorance is not a bias. It's adverse selection protection. But ambiguity aversion is irrational when you can establish that nobody knows more than you do. When the ambiguity is universal, when the entire market is confused because the state space itself is new, the discount demanded by ambiguity-averse investors is a pricing error, not a risk premium.

This is where I land: ambiguity aversion is a sensible default that gets systematically overweighted in specific situations. The skill is the distinction. And the distinction is judgment, not math.

{{< readnext slug="the-saaspocalypse-paradox" >}}

## Discomfort as information

Zeckhauser's most counterintuitive move in the paper is turning ambiguity aversion from a problem into a signal. His Speculation 1 states it directly: "UUU investments drive off speculators, which creates the potential for an attractive low price."

The logic is recursive. Your discomfort when facing an ambiguous situation tells you something, but not about the asset. It tells you about the competitive field. If you're uncomfortable, most other potential buyers have already left. The very thing that makes you want to sell, the feeling of not-knowing, is the same thing that has thinned the competition and compressed the price. David Ricardo buying British government bonds on the eve of Waterloo was uncomfortable. Warren Buffett writing earthquake reinsurance for the California Earthquake Authority at roughly five times actuarial value was comfortable only because he had done this inference before: the discomfort of everyone else was the opportunity itself.

Zeckhauser's Maxim G puts it memorably: "Discounting for ambiguity is a natural tendency that should be overcome, just as should be overeating." Both ambiguity aversion and overeating are evolved heuristics that served us well in ancestral environments and poorly in modern ones. In a small tribal group where the unknown reliably correlated with danger, fleeing ambiguity kept you alive. In a financial market where ambiguity-averse institutional capital mechanically exits positions it can't model, the same instinct creates a systematic transfer of wealth from the ambiguity-averse to the ambiguity-tolerant.

[Bohnet and Zeckhauser (2004)](https://scholar.harvard.edu/files/iris_bohnet/files/trust_risk_and_betrayal.pdf) identified a related mechanism they called "betrayal aversion." People demand stronger odds when a betraying human rather than indifferent nature determines the outcome. In markets, this manifests as an extra discount demanded when the ambiguity involves a counterparty who might be exploiting your ignorance. The mere possibility that someone on the other side knows more amplifies the ambiguity premium beyond what the uncertainty alone would justify.

Now apply all of this to the SaaSpocalypse. I [wrote about the details](/posts/the-saaspocalypse-paradox/) elsewhere, but the relevant point here is the mechanism. When Anthropic released the Claude Cowork plugins in late January, institutional investors didn't sit down and estimate the probability that AI would replace CRM. They faced something worse: they couldn't define what "replacing CRM" would even mean. The state space was undefined, as I argued in [Part 1](/posts/three-kinds-of-not-knowing/). And when the state space is undefined, the entire institutional machinery for processing uncertainty breaks down simultaneously.

Fiduciary duty requires estimable risk. Compliance models require defined scenarios. Portfolio managers face career risk: losing money on a position you can't explain is a firing offense; missing a rally in something you sold is merely embarrassing. The institutional constraints compound the ambiguity aversion. Each layer of oversight demands a model, and the model requires defined states, and the states don't exist yet. The rational response for any individual institutional actor was to sell. The collective result was an IGV drawdown of **32%** while sector earnings grew **17%**, an RSI of **18**, and **$2 trillion** in evaporated market cap.

The sellers weren't acting on information. They were acting on ambiguity aversion, amplified by comparative ignorance (everyone else seemed to be selling too), amplified by career risk (nobody gets fired for selling software before the AI disruption), amplified by betrayal aversion (maybe the AI insiders knew something the market didn't). Stack these amplifiers on top of Ellsberg's basic finding, and you get a price that reflects the intensity of collective discomfort rather than any assessment of fundamentals.

Zeckhauser describes the investor's challenge with a bridge analogy: you have to make peace with good decisions that lead to bad outcomes. Buying the IGV at $80 with an 18 RSI and 17% earnings growth is, on the framework, a good decision. If it drops to $70 first, that doesn't make it a bad decision. But making that distinction under ambiguity is not an analytical skill. It's a temperamental one. It requires accepting that "I don't know" is not disqualifying and that the discomfort you feel is shared, priced in, and possibly overpriced. That's harder than any calculation.

Knowing that ambiguity aversion creates mispricing is the easy part. The hard part is what comes next: when you're facing someone on the other side of a trade in a UU world, how do you figure out whether they know something you don't, or whether they're just less uncomfortable than you are? That's the domain of sidecar investing and strategic inference. That's [Part 3](/posts/the-geometry-of-who-knows-what/).
