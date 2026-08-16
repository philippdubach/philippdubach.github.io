+++
title = "Put the Model in the Basement"
cta_pitch = "I write every few weeks about AI, sovereignty and the economics underneath both. Get the next one."
seoTitle = "Swiss Sovereign AI: A Business Case for Local K3-Class Inference"
slug = "put-the-model-in-the-basement"
date = 2026-08-15
lastmod = 2026-08-15
publishDate = 2026-08-15T03:00:00Z
images = ["https://static.philippdubach.com/mode-basement-cover-image.png"]
card_image = "https://static.philippdubach.com/mode-basement-cover-image.png"
description = "Could Swiss providers sell local K3-class inference to banks and governments? The answer depends on whether customers pay for control, residency and continuity."
keywords = ["sovereign AI", "Swiss AI infrastructure", "Swiss data residency", "local AI inference", "on-premise AI", "K3-class inference", "open-weight models", "AI infrastructure", "AI economics", "private AI deployment", "DORA", "AI sovereignty", "GPU cluster", "Swiss cloud", "model hosting", "data residency"]
categories = ["AI"]
type = "Analysis"
draft = false
unlisted = false
takeaways = [
  "A 64-GPU K3-class cluster needs data-centre equipment. It cannot run on a server under a desk.",
  "The Zurich case uses $7 million of initial cost, $370,000 each month, and 70% use.",
  "At those values, one cluster makes about CHF 7.4 million a year, has about CHF 3 million of EBITDA, and repays its cost in three years.",
  "The provider sells Swiss residency, audit access, and continuity. The case can fail if use falls, hardware ages, or one cluster has a problem."
]
faq = [
  {question = "What does 'put the model in the basement' mean?", answer = "It means using a local supplier instead of running the hardware yourself. The supplier gives customers local data residency, control, audit access, and continuity."},
  {question = "Who might buy Swiss sovereign AI inference?", answer = "The case serves banks, pharmaceutical companies, government bodies, and other customers that need Swiss data residency."},
  {question = "What does the business case assume?", answer = "It assumes one 64-GPU cluster in Zurich. It uses $7 million of initial cost, $370,000 each month, 70% use, and subscriptions from CHF 15,000 to CHF 50,000 each month."},
  {question = "What can make the case fail?", answer = "A 2.8-trillion-parameter model costs a lot to serve. One cluster creates concentration risk, hardware ages fast, and smaller models may soon work almost as well."}
]
+++

{{< img src="mode-basement-cover-image.png" alt="A secure local AI server room in a Swiss alpine building. One black server rack stands behind glass beside a window with mountain light." width="100%" priority="true" >}}

This article follows [I Tried Kimi K3 Inside Claude Code](https://philippdubach.com/posts/kimi-k3-inside-claude-code/). That test asked if Kimi K3 could work inside a familiar coding setup. Here, I ask what changes when a Swiss provider runs a K3-class model for customers that need local control.

Banks already treat data sovereignty as an operating issue. In [How DORA Made Sovereignty a Bank Problem](https://philippdubach.com/posts/dora-critical-cloud-providers-sovereignty/), I argued that banks must plan for concentration, exit, audit rights, and rule changes by critical foreign providers.

AI gets the same treatment. Recent open-weight releases make local use more realistic. [Kimi K3](https://www.kimi.com/blog/kimi-k3) is huge. Alibaba is moving the Qwen family in the same direction. [Inkling](https://thinkingmachines.ai/news/introducing-inkling/) may matter more. It is a US-trained model with full weights, a one-million-token context, and a focus on customisation.

## A Swiss provider: the case

Assume a Swiss provider operates one 64-GPU cluster in Zurich. It sells dedicated or managed K3-class inference to banks, pharmaceutical companies, government bodies, and other customers that need Swiss data residency.

This case assumes $7 million in initial costs, monthly costs of $370,000, and average use of 70%. Subscriptions cost CHF 15,000 to CHF 50,000 each month. With these values, one cluster makes about CHF 7.4 million a year. Its EBITDA is about CHF 3 million. The payback period is three years.

{{< img src="swiss-sovereign-ai-business-case.png" alt="Business case for a Swiss sovereign AI provider. It shows equipment, initial cost, monthly costs, customer mix, five-year results, and sensitivity cases." width="100%" >}}

## The product is control

The provider sells control as well as tokens. It offers Swiss residency and a defined security boundary. It does not train on customer data. It gives customers audit access, continuity terms, and an exit route if it fails.

Most companies will not put a model in a basement. Some will pay local providers to get the same control.

{{< readnext slug="kimi-k3-inside-claude-code" >}}

## What can make the case fail

A 2.8-trillion-parameter model costs a lot to serve. One cluster creates a concentration risk. Hardware ages fast. If use falls, the case loses money. A smaller model may work almost as well next year. Then the hardware loses value before the operator recovers its cost. I still think this market will exist.
