---
title: Introduction to Multi-Armed Bandits
date: 2025-10-25
images:
- https://static.philippdubach.com/ograph/ograph-mab.jpg
external_url: https://arxiv.org/abs/1904.07272
categories:
- AI
type: Review
draft: true
aliases:
- /2025/10/25/introduction-to-multi-armed-bandits/

---
This 2019 textbook by Slivkins remains one of the best introductions to multi-armed bandits—a deceptively simple framework for algorithms making decisions under uncertainty. The book's structure is pedagogical and comprehensive: four chapters on IID rewards, three on adversarial scenarios, one on contextual bandits, and three on economic applications including learning in repeated games and exploration under incentive constraints.

The framework is elegantly simple: you have K possible actions (arms) and T rounds, choosing an arm each round to maximize total reward. But I've learned that implementation reveals complexities the textbook can't fully capture.

I've deployed bandits in production for content selection, optimizing for clicks. They converge on optimal mixes far faster than manual A/B tests ever could—especially valuable when new arms arrive constantly (sometimes several times a day across hundreds of thousands of scenarios). The catch? Any changes to context force the bandits back toward exploration, hurting performance temporarily. And when you need to run experiments around the bandit-managed content, independence assumptions break down completely.

The most critical insight I've gained: bandits are feedback loops that couple things together in ways that can be difficult to tease apart. You face a choice—treat all traffic as a single universe (breaking experiment independence) or isolate bandits per cohort (making small cohorts take forever to converge). Both approaches put real limits on iteration speed.

The scale question matters too. Despite theoretically powerful techniques, the statistical benefits often don't justify the added complexity unless you're operating at very large scale with relatively simple optimization goals. I've had to think hard about when the real advantage—a slightly more optimal mix of people in experiment than manual approaches—actually moves the needle.

One particularly striking lesson: a system I built to maximize clicks became stupidly good at surfacing inappropriate content because it got clicks. We eventually had to layer an ML model for arm selection with bandits picking between filtered options, then add more safeties for certain content categories.

But when bandits fit the use case, the value extends beyond optimization. You gain the ability to accurately estimate improvement from other features—quantifying that spacing improvements delivered 10x more value than the Really Big Feature expected to dominate.

The book's chapters on "bandits with knapsacks" and "bandits and agents" work as standalone surveys, and the appendix provides solid background on concentration and KL-divergence. Six years later, it's still the introduction I'd recommend—just with the caveat that production deployment requires understanding when not to use them: when you care about information gained in experiments, when cohorts are too small to converge quickly, or when you can't tolerate the state management complexity.

As I've come to think of it: bandits work brilliantly until you need to reason about what they're doing. Then you wish they didn't work quite so well.

