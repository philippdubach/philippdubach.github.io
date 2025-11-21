---
title: "AI Models as Standalone P&Ls"
date: 2025-11-09
images: ['https://static.philippdubach.com/ograph/ograph-aipnl.jpg']
external_url: "https://www.theregister.com/2025/10/29/microsoft_earnings_q1_26_openai_loss/"
description: "A closer look at OpenAI's suspected $11.5 billion quarterly losses and Anthropic CEO Dario Amodei's framework for treating each AI model as an independent profitable business unit, examining whether this accounting approach resolves the profitability paradox facing AI companies."
keywords: ["AI model profitability", "OpenAI losses", "Dario Amodei", "Anthropic CEO", "AI business models", "model training costs", "AI scaling laws", "open-source AI competition", "AI revenue models", "machine learning economics", "AI investment returns", "model deployment costs", "AGI development", "AI company valuation", "artificial intelligence P&L"]
draft: false
---

> Microsoft reported earnings for the quarter ended Sept. [...] buried in its financial filings were a couple of passages suggesting that OpenAI suffered a net loss of $11.5 billion or more during the quarter.

For every dollar of revenue, they're allegedly spending roughly $5 to deliver the product. What initially sounds like a joke about "making it up on volume" points to a more fundamental problem facing OpenAI and its competitors. AI companies are locked into continuously releasing more powerful (and expensive) models. If they stop, [open-source alternatives will catch up](https://arxiv.org/abs/2311.16989) and offer equivalent capabilities at substantially lower costs. This creates an uncomfortable dynamic. If your current model requires spending more than you earn just to fund the next generation, the path to profitability becomes unclear—perhaps impossible.

Anthropic CEO Dario Amodei (everybody's favorite AI CEO) recently offered a different perspective in a [conversation with Stripe co-founder John Collison](https://youtu.be/GcqQ1ebBqkc?si=sEDGAVBuZsjtLpZS&t=1016). He argues that treating each model as an independent business unit reveals a different picture than conventional accounting suggests.

>Let's say in 2023, you train a model that costs $100 million, and then you deploy it in 2024 and it makes $200 million of revenue.

So far, this looks profitable, a solid 2x return on the training investment. But here's where it gets complicated.

>Meanwhile, because of the scaling laws, in 2024, you also train a model that costs $1 billion. If you look in a conventional way at the profit and loss of the company you've lost $100 million the first year, you've lost $800 million the second year, and you've lost $8 billion in the third year, so it looks like it's getting worse and worse.

The pattern continues:
>In 2025, you get $2 billion of revenue from that $1 billion model trained the previous year.
 
Again, viewed in isolation, this model returned 2x its training cost. 
>And you spend $10 billion to train the model for the following year.

The losses appear to accelerate dramatically, from $100 million to $800 million to $8 billion.

This is where Amodei's reframing becomes interesting. 
>If you consider each model to be a company, the model that was trained in 2023 was profitable. You paid $100 million and then it made $200 million of revenue." 

He also acknowledges there are inference costs (the actual computing expenses of running the model for users) but suggests these don't fundamentally change the picture in his simplified example. His core argument:

>If every model was a company, the model in this example is actually profitable. What's going on is that at the same time as you're reaping the benefits from one company, you're founding another company that's much more expensive and requires much more upfront R&D investment.

This is essentially an argument that AI companies are building a portfolio of profitable products, but the accounting makes it look terrible because each successive "product" costs 10x more than the last to develop. The losses stem from overlapping these profitable cycles while exponentially increasing investment scale. But this framework only works if two critical assumptions hold: (1) Each model consistently returns roughly 2x its training cost in revenue, and (2) The improvements from spending 10x more justify that investment—meaning customers will pay enough more for the better model to maintain that 2x return.

Amodei outlines two ways this resolves: 
>So the way that it's going to shake out is this will keep going up until the numbers go very large and the models can't get larger, and, you know, then it'll be a large, very profitable business.

In this first scenario, scaling hits physical or practical limits. You've maxed out available compute, data, or capability improvements. Training costs plateau because you literally can't build a meaningfully larger model. At that point, companies stop needing exponentially larger investments and begin harvesting profits from their final-generation models. The second scenario is less optimistic: 
>Or at some point the models will stop getting better, right? The march to AGI will be halted for some reason.

If the improvements stop delivering proportional returns before reaching natural limits, companies face what Amodei calls overhang.

>And then perhaps there'll be some overhang, so there'll be a one-time, 'Oh man, we spent a lot of money and we didn't get anything for it,' and then the business returns to whatever scale it was at.

What Amodei's framework doesn't directly address is the open-source problem. If training Model C costs $10 billion but open-source alternatives [reach comparable performance six months later](https://synaptic.com/resources/open-source-ai-2024), that 2x return window might not materialize. The entire argument depends on maintaining a significant capability lead that customers will pay premium prices for. There's also the question of whether the 2x return assumption holds as models become more expensive. The jump from $100 million to $1 billion to $10 billion in training costs assumes that customers will consistently value the improvements enough to double revenue.