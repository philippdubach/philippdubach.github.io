+++
title = "The Geometry of Who Knows What"
seoTitle = "Information Asymmetry: When Nobody Knows More Than You"
date = 2026-04-13
publishDate = 2026-04-13T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-geometry-who-knows-what.jpg"]
description = "When neither side can define the states of the world, adverse selection fears are misplaced. Zeckhauser's information matrices and constraint arbitrage."
keywords = ["information asymmetry investing", "adverse selection financial markets", "sidecar investing Zeckhauser", "Buffett California Earthquake Authority reinsurance", "winner's curse investing", "Aumann agreeing to disagree", "constraint arbitrage institutional investors", "limits to arbitrage institutional constraints", "Monday morning quarterback risk", "Akerlof lemons problem investing", "complementary skills investing edge", "Summers sidecar objection", "Robb uncommunicable knowledge", "fiduciary duty ambiguity avoidance"]
categories = ["Quantitative Finance"]
type = "Analysis"
draft = false
lastmod = 2026-04-13
takeaways = [
  "Zeckhauser's information matrices distinguish when the other side knows more (danger) from when ignorance is shared (opportunity), and most investors assume the wrong box.",
  "Wall Street rejected Buffett's $1B California earthquake reinsurance not because they feared adverse selection but because their compliance models required probability estimates that didn't exist.",
  "Constraint arbitrage, profiting from the gap between what an asset is worth and what institutions can hold, is a permanent structural feature of UU markets, not a temporary inefficiency.",
  "The sidecar concept (investing alongside skilled operators) relocates the evaluation problem from asset selection to manager selection, which Summers and Robb argue may be equally hard.",
]
faq = [
  {question = "What is sidecar investing in Zeckhauser's framework?", answer = "Sidecar investing means putting your money alongside someone who has complementary skills you lack, such as a real estate developer or biotech venture capitalist. The investor rides in a sidecar pulled by a driver with genuine operational expertise. The more confident you are in the driver's integrity and ability, the more attractive the sidecar investment, since its price reflects the scarcity of access rather than public information."},
  {question = "How does information asymmetry differ in UU versus standard markets?", answer = "In standard markets, the concern is that the other side knows the value of the asset better than you do. Akerlof's lemons problem and Glosten-Milgrom's bid-ask spread model both assume someone has superior information about a defined quantity. In UU (unknown and unknowable) markets, neither side can enumerate the possible states of the world. The fear of adverse selection persists, but it is often unfounded because the ambiguity is shared. The mispricing lives in the gap between assumed and actual information asymmetry."},
  {question = "What is the advantage-versus-selection formula?", answer = "Zeckhauser's framework says your return depends on your absolute advantage (complementary skills), the probability the other side is better informed, and the selection factor (how much their information hurts you). A large absolute advantage, such as a longer time horizon or operational expertise, provides insurance against adverse selection. You don't need to know more than the other side. You need an edge they can't replicate."},
  {question = "Why did Wall Street reject the California Earthquake Authority reinsurance that Buffett accepted?", answer = "Not because they thought the Earthquake Authority had inside information about seismic risk. Because their internal processes required probability estimates, their compliance teams required distributional assumptions, and the honest assessment of 'we have no idea, but the price is very high' did not fit their institutional decision-making forms. The opportunity existed because institutional constraints prevented sophisticated capital from acting on it."},
]
+++

*Investing at the Edge of Knowledge, Part 3 · [Start with Part 1](/posts/three-kinds-of-not-knowing/)*

> "One of these days in your travels, a guy is going to show you a brand-new deck of cards on which the seal is not yet broken. Then this guy is going to offer to bet you that he can make the jack of spades jump out of this brand-new deck of cards and squirt cider in your ear. But, son, you do not accept this bet, because as sure as you stand there, you're going to wind up with an ear full of cider."

Zeckhauser opens his [2006 paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2205821) with this advice from Sky Masterson's father in *Guys and Dolls*. The lesson is as old as markets: if someone offers you a bet where they seem to know something you don't, they probably do. Don't take that bet.

But Zeckhauser's point isn't the lesson. It's the exception. What happens when nobody has the marked deck? When the ambiguity is shared, when neither side can enumerate the states of the world, the Sky Masterson rule stops applying, and the investors who keep following it anyway leave money on the table.

In [Part 1](/posts/three-kinds-of-not-knowing/) I laid out Zeckhauser's taxonomy: risk, uncertainty, and ignorance as three distinct problems. In [Part 2](/posts/ambiguity-by-design/) I examined why investors flee the third box, the mechanism of ambiguity aversion. This piece asks the question that follows: when you're facing someone on the other side of a trade, how do you figure out whether they know something you don't?

## The two matrices

Zeckhauser draws two matrices that I think are the most underappreciated diagrams in the paper.

The first covers investing under uncertainty, where the possible states are known but probabilities are hard. It's a 2x2: Easy or Hard for You to Estimate Value crossed with Easy or Hard for Others. Box A (easy for both) is the standard competitive market: lots of participants, tight spreads, no edge for anyone. Box B (easy for you, hard for others) is where you're the informed party: think a biotech scientist evaluating a drug trial readout. Box C (hard for you, easy for others) is the danger zone, the other side has the marked deck, and the Sky Masterson rule applies in full. Box D (hard for both) is where it gets interesting. Neither side has an information advantage. Both are operating under genuine uncertainty. Buffett's earthquake reinsurance sits here.

The second matrix covers investing under ignorance, where even the possible states are unknown. It's simpler: a 2x1. Unknown to You and Known to Others (Box E) versus Unknown to You and Unknown to Others (Box F). Box E is dangerous. Box F is opportunity.

The point most people miss is about misidentification. Most investors assume they're in Box C or Box E: the other side knows more. This assumption is the legacy of standard information asymmetry models in finance, where [Akerlof's lemons problem (1970)](https://www.sfu.ca/~wainwrig/Econ400/akerlof.pdf) and the Glosten-Milgrom bid-ask spread model (1985) trained a generation to worry about adverse selection. Those worries are justified in Boxes A through C and in Box E. But in Box D and Box F, you're not facing an informed counterparty. You're facing someone equally confused, or someone who has left the market entirely because they can't tolerate the confusion.

[Bazerman and Samuelson (1983)](https://www.cs.princeton.edu/courses/archive/spr09/cos444/papers/BazermanSamuelson83.pdf) showed that even in clean experimental settings, people are terrible at accounting for why the other side is willing to trade. Their winner's curse experiments found that bidders consistently failed to discount for the fact that winning an auction is bad news about your estimate's accuracy. In a UU world, this failure compounds. You can't compute the conditional expectation of the asset's value given that the other side is selling, because neither of you can define the state space over which that expectation would be calculated.

The practical question is always: am I in Box C or Box D? Am I in Box E or Box F? And the answer is almost never available from the data. It's a judgment call, informed by what you know about the seller's constraints, their institutional context, and whether the source of the ambiguity is private or shared.

{{< readnext slug="the-saaspocalypse-paradox" >}}

## Institutional blindness as structural opportunity

The California Earthquake Authority story is Zeckhauser's best illustration, and it deserves the full telling.

In the late 1990s, California needed reinsurance for earthquake risk. The authority offered a **$1 billion** slice at premiums that worked out to roughly five times actuarial value. Wall Street said no. Not because investment banks thought the Earthquake Authority possessed secret seismological knowledge. Nobody has an informational edge over the reinsurer when it comes to tectonic plate movement. The ambiguity was shared: Box F.

Wall Street said no because their internal processes required probability estimates that didn't exist. Compliance teams required distributional assumptions about tail risk that nobody could provide. Risk models required defined scenarios, and "catastrophic earthquake in the next 12 months" didn't fit neatly into any existing framework. The honest assessment, "we have no idea about the probability, but the price is very high," didn't fit the form. Buffett took the entire slice.

This is Zeckhauser's Maxim H: "Do not engage in the heuristic reasoning that just because you do not know the risk, others do." The Wall Street banks weren't outcompeted by someone with better information. They were outcompeted by someone with fewer institutional constraints. Buffett could hold a position that was impossible to model because he answered to shareholders who trusted his judgment, not to compliance officers who required his models.

Generalize this, and you get a structural feature of UU markets that doesn't go away. Fiduciary duty requires estimable risk. Compliance models require defined scenarios. Career risk creates what Zeckhauser calls Monday Morning Quarterback (MMQ) risk: the danger that a bad outcome on a good decision destroys your reputation. Professional investors face a permanent bias toward the risk box (known probabilities) and away from the ignorance box (unknown states). This isn't a market inefficiency waiting to be arbitraged. It's an institutional constant. And it creates a permanent supply of mispriced assets for those without the same constraints.

[Aumann (1976)](https://projecteuclid.org/journals/annals-of-statistics/volume-4/issue-6/Agreeing-to-Disagree/10.1214/aos/1176343654.full) proved that rational agents with common priors who share their posterior beliefs must converge: they cannot "agree to disagree." The theorem is elegant and, in UU markets, irrelevant. Aumann assumes common priors and known state spaces. In Box 3, both assumptions fail. The state space is undefined, so there are no common priors to start from. Disagreement in UU isn't a puzzle to be resolved by more information exchange. It's the default condition. Two equally rational investors can look at the same situation and reach opposite conclusions without either one being wrong, because they're not disagreeing about probabilities. They're disagreeing about what world they're in.

{{< readnext slug="passive-investings-active-problem" >}}

## The advantage-versus-selection formula

Zeckhauser offers a framework for deciding when to invest despite potential adverse selection. Your expected return depends on three things: your absolute advantage (*a*), the probability the other side is better informed (*p*), and the selection factor (*s*), how much their information hurts you. Invest when the combination exceeds the cost of entry.

The formula matters less than the logic behind it. A large absolute advantage provides insurance against adverse selection. Zeckhauser's Maxim E: "A significant absolute advantage offers some protection against potential selection."

What counts as absolute advantage? Complementary skills are the classic answer: the real estate developer who creates value a passive investor cannot, the venture capitalist whose operational expertise and network make the company worth more than the sum of its capital. Their return isn't compensation for bearing risk. It's a share of value they helped create. Sidecar investors, Zeckhauser's term for those who invest alongside skilled operators, earn excess returns because access to these deals is limited and the value creation is real.

But complementary skills aren't the only form of advantage. In the [SaaSpocalypse](/posts/the-saaspocalypse-paradox/), the "absolute advantage" for a buyer at IGV $80 was time horizon. If you could hold for three to five years, tolerate the MMQ risk of further drawdowns, and ignore the career consequences of looking wrong for a few quarters, you had a structural edge over institutional sellers who couldn't do the same. That's not analytical skill. It's constraint arbitrage. And constraint arbitrage is a legitimate form of absolute advantage, because fiduciary requirements and career incentives are structural features that won't disappear next quarter.

[Larry Summers (2006)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2205848) raises the obvious objection to the sidecar concept: "identifying skilled UU managers may be no easier than picking market-beating investments directly." The sidecar doesn't solve the epistemological problem. It relocates it from asset selection to manager selection. How do you know the driver is skilled rather than lucky?

[Richard Robb (2006)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2205858) pushes further. He argues that UU knowledge is "uncommunicable." If a mechanism for generating excess returns could be expressed as a process, someone would have arbitraged it away. Ricardo, on the eve of Waterloo, might have said "British Government bonds offer a high reward for the risk." But what would it look like for that statement to be proven false? The claim is unfalsifiable because it lives in the ignorance box where probability statements don't have clear empirical content. If the sidecar driver can't explain their edge in terms you can evaluate, how do you distinguish skill from survivorship bias?

I think both objections are correct and both miss something. They're correct that sidecar investing doesn't eliminate the evaluation problem. But they miss that the evaluation problem has different difficulty levels depending on context. Evaluating whether a real estate developer can build and lease a building is easier than evaluating whether a macro hedge fund can predict interest rates. Evaluating whether Buffett's insurance math is sound is easier than evaluating whether a biotech startup's drug candidate works. The sidecar concept isn't "trust someone blindly." It's "invest alongside someone whose edge you can partly verify, in situations where your own analytical advantage is zero."

Knowing the geometry of who-knows-what is necessary but not sufficient. You've identified a Box D or Box F opportunity. You've assessed your absolute advantage. You've decided the other side isn't better informed. Now you need to decide how much to bet. In a UU world, the most famous formula for position sizing, the Kelly Criterion, breaks down in the ways you'd expect. That's Part 4 _(coming soon)_.
