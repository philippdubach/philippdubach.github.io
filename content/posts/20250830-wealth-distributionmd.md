---
title: Agent-based Systems for Modeling Wealth Distribution
seoTitle: "How Wealth Distribution Models Prove Inequality Is Built In"
date: 2025-08-30
images:
- https://static.philippdubach.com/ograph/ograph-distribution.jpg
description: "Agent-based modeling shows how random market transactions naturally produce extreme wealth concentration, and why even a small wealth tax changes everything."
keywords:
- wealth distribution model
- agent-based wealth simulation
- wealth tax effect on inequality
- Pareto distribution wealth
- affine wealth model
external_url: https://arxiv.org/abs/1604.02370
categories:
- Economics
type: Commentary
draft: false
aliases:
- /2025/08/30/agent-based-systems-for-modeling-wealth-distribution/

faq:
- question: Why do random transactions lead to wealth concentration?
  answer: The Affine Wealth Model shows that even when agents start with equal wealth and trade randomly, a Pareto distribution emerges naturally. Without any structural advantages or unfair rules, the mathematics of repeated random exchanges causes wealth to pile up among a small number of agents while most end up near the bottom. This happens because small random advantages compound over time, just as they do in real economies.
- question: How does a wealth tax affect inequality in agent-based simulations?
  answer: In simulations of the Affine Wealth Model, introducing even a modest wealth tax of 1% to 5% dramatically changes the outcome. The distribution shifts from extreme concentration to a more stable, even spread where the wealthiest agents hold at most 3-4 times their initial amount. The redistribution mechanism prevents runaway accumulation and produces a steady-state equilibrium.
- question: What is the Affine Wealth Model?
  answer: The Affine Wealth Model is a stochastic, agent-based, binary-transaction Asset-Exchange Model for wealth distribution. It was designed to allow for agents with negative wealth, reflecting real-world conditions where roughly 10% of the U.S. population holds negative net worth due to mortgages and student loans. The model has been empirically validated against 27 years of U.S. wealth data with an average error of less than 0.16%.
- question: Can simple economic models accurately predict real-world wealth distribution?
  answer: Yes. Agent-based models with relatively few parameters have demonstrated remarkable accuracy in matching empirical wealth data across developed countries. The Affine Wealth Model reproduces both the Pareto distribution observed in the top 10% of the population and the exponential distribution seen in the lower 90%, validating the principle that a few structural rules can generate the full complexity of real wealth distributions.
---
A question [Gary Stevenson](https://www.youtube.com/garyseconomics), the self-proclaimed [best trader in the world](https://on.ft.com/4n7z5jD), has been asking for some time is [if a wealth tax can fix Britain's economy](https://uclrethinkingeconomics.com/2025/06/25/gary-stevenson-can-a-wealth-tax-fix-britains-economy/).
> [...] he believed the continued parlous state of the economy would halt any interest rate hikes. The reason? Because when ordinary people receive money, they spend it, stimulating the economy, while the wealthy tend to save it. But our economic model promotes the concentration of wealth among a select few at the expense of everybody else's living standards.

*Owen Jones on Gary Stevenson for [The Guardian](https://www.theguardian.com/commentisfree/2022/jan/13/super-rich-spend-2m-on-whisky-wealth-tax-pandemic)*

Something I generally find very useful and appealing is visualizing systems, models and complexities. Any wealth distribution model is by nature a complex system, and agent-based simulation is one of the best ways to make that complexity visible. The [Affine Wealth Model](https://arxiv.org/abs/1604.02370)
> a stochastic, agent-based, binary-transaction Asset-Exchange Model (AEM) for wealth distribution that allows for agents with negative wealth

elegantly demonstrates how random transactions inevitably lead to Pareto distributions without intervention. In this [Jupyter Notebook Fabio Manganiello](https://notebooks.manganiello.tech/fabio/wealth-inequality.ipynb) provides great visualizations of the wealth model. He shows how wealth distributes in an open market where a set of agents trades without any mechanisms in place to prevent a situation of extreme inequality.
{{< img src="wealth-dist-0-tp5-tax.gif" alt="Animation of two side-by-side histogram charts showing wealth distribution. Left chart titled Wealth Distribution (wealth tax: 0%) Right chart titled Wealth Distribution (wealth tax: 5%)" width="80%" >}}
It can be seen in the left graph that with no tax wealth quickly stashes up in the pockets of a very small group of agents, while most of the other agents end up piling up in the lowest bucket. As we introduce a wealth tax of 25%, then 5% (right graph) and 1% we can see how the distribution becomes more even and therefore more desirable from the perspective of wealth equality, and also very stable over time, with the agents in the highest buckets quickly having at most 3-4x of their initial amount.

As with any model, the paper as well as the simulation have it's [limitations](https://notebooks.manganiello.tech/fabio/wealth-inequality.ipynb#Limitations), but again my interest is more in the way a few lines of code can visualize a economic relationships elegantly. It would be interesting to further investigate: (1) How sensitive are these equilibrium distributions to the transaction constraint (max_exchanged_share)? Does allowing larger transfers accelerate concentration or fundamentally alter the [steady-state Gini coefficient](https://en.wikipedia.org/wiki/Gini_coefficient)? (2) The above wealth tax implementation taxes the sender - but what happens if we model progressive taxation on received amounts above median wealth instead? Does the locus of taxation matter for distributional outcomes?
