---
title: "Agent-based Systems for Modeling Wealth Distribution"
date: 2025-08-30
images: ['https://static.philippdubach.com/ograph/ograph-post.jpg']
description: "We explore agent-based modeling of wealth distribution using the Affine Wealth Model, demonstrating how random transactions lead to Pareto distributions and how wealth taxes can potentially create more equitable outcomes through interactive visualizations."
keywords: ["agent-based systems", "wealth distribution", "Affine Wealth Model", "Pareto distribution", "wealth tax", "economic modeling", "Gary Stevenson", "Asset-Exchange Model", "wealth inequality", "stochastic modeling", "binary-transaction model", "Gini coefficient", "economic simulation", "wealth concentration", "progressive taxation"] 
external_url: "https://arxiv.org/abs/1604.02370"
draft: false
---

A question [Gary Stevenson](https://www.youtube.com/garyseconomics), the self-proclaimed [best trader in the world](https://on.ft.com/4n7z5jD), has been asking for some time is [if a wealth tax can fix Britain's economy](https://uclrethinkingeconomics.com/2025/06/25/gary-stevenson-can-a-wealth-tax-fix-britains-economy/).
> [...] he believed the continued parlous state of the economy would halt any interest rate hikes. The reason? Because when ordinary people receive money, they spend it, stimulating the economy, while the wealthy tend to save it. But our economic model promotes the concentration of wealth among a select few at the expense of everybody else's living standards.

*Owen Jones on Gary Stevenson for [The Guardian](https://www.theguardian.com/commentisfree/2022/jan/13/super-rich-spend-2m-on-whisky-wealth-tax-pandemic)*

Something I generally find very useful and appealing is visualizing systems, models and complexities. Wealth distribution definitely classifies as such a complex system. The [Affine Wealth Model](https://arxiv.org/abs/1604.02370)
> a stochastic, agent-based, binary-transaction Asset-Exchange Model (AEM) for wealth distribution that allows for agents with negative wealth

elegantly demonstrates how random transactions inevitably lead to Pareto distributions without intervention. In this [Jupyter Notebook Fabio Manganiello](https://notebooks.manganiello.tech/fabio/wealth-inequality.ipynb) provides great visualizations of the wealth model. He shows how wealth distributes in an open market where a set of agents trades without any mechanisms in place to prevent a situation of extreme inequality.
{{< img src="wealth-dist-0-tp5-tax.gif" alt="Animation of two side-by-side histogram charts showing wealth distribution. Left chart titled Wealth Distribution (wealth tax: 0%) Right chart titled Wealth Distribution (wealth tax: 5%)" width="80%" >}}
It can be seen in the left graph that with no tax wealth quickly stashes up in the pockets of a very small group of agents, while most of the other agents end up piling up in the lowest bucket. As we introduce a wealth tax of 25%, then 5% (right graph) and 1% we can see how the distribution becomes more even and therefore more desirable from the perspective of wealth equality, and also very stable over time, with the agents in the highest buckets quickly having at most 3-4x of their initial amount.

As with any model, the paper as well as the simulation have it's [limitations](https://notebooks.manganiello.tech/fabio/wealth-inequality.ipynb#Limitations), but again my interest is more in the way a few lines of code can visualize a economic relationships elegantly. It would be interesting to further investigate: (1) How sensitive are these equilibrium distributions to the transaction constraint (max_exchanged_share)? Does allowing larger transfers accelerate concentration or fundamentally alter the [steady-state Gini coefficient](https://en.wikipedia.org/wiki/Gini_coefficient)? (2) The above wealth tax implementation taxes the sender - but what happens if we model progressive taxation on received amounts above median wealth instead? Does the locus of taxation matter for distributional outcomes?