---
title: "LLM Helped Discover a New Cancer Therapy Pathway"
date: 2025-10-18
images: ['https://static.philippdubach.com/ograph/ograph-post.jpg']
description: "Google releases C2S-Scale 27B, a 27 billion parameter AI model built on Gemma that discovered a novel cancer therapy pathway by identifying drug combinations that can make tumors more 'visible' to the immune system."
keywords: ["C2S-Scale 27B", "Gemma AI model", "cancer immunotherapy", "cold tumors", "hot tumors", "antigen presentation", "silmitasertib", "CK2 inhibitor", "interferon", "single-cell analysis", "virtual drug screening", "Google DeepMind", "Yale University collaboration", "foundation model", "therapeutic discovery"]
external_url: "https://www.biorxiv.org/content/10.1101/2025.04.14.648850v3.full.pdf"
draft: false
---

Google gets a lot of scrutiny for some of their work in other domains; nevertheless, it's fair to appreciate that they continue to put major resources behind using AI to accelerate therapeutic discovery. The [model](https://huggingface.co/vandijklab/C2S-Scale-Gemma-2-27B) and [resources](https://github.com/vandijklab/cell2sentence) are open access and available to the research community. 

>How C2S-Scale 27B works: A major challenge in cancer immunotherapy is that many tumors are "cold" — invisible to the body's immune system. A key strategy to make them "hot" is to force them to display immune-triggering signals through a process called antigen presentation. We gave our new C2S-Scale 27B model a task: Find a drug that acts as a conditional amplifier, one that would boost the immune signal only in a specific "immune-context-positive" environment where low levels of interferon (a key immune-signaling protein) were already present, but inadequate to induce antigen presentation on their own.

From their [press release](https://blog.google/technology/ai/google-gemma-ai-cancer-therapy-discovery/):

>C2S-Scale generated a novel hypothesis about cancer cellular behavior and we have since confirmed its prediction with experimental validation in living cells. This discovery reveals a promising new pathway for developing therapies to fight cancer.

For a 27B model, that's really really neat! And on a more general note, scaling seems to deliver:

>This work raised a critical question: Does a larger model just get better at existing tasks, or can it acquire entirely new capabilities? The true promise of scaling lies in the creation of new ideas, and the discovery of the unknown.

On a more critical note, it would be interesting to see whether this model can perform any better than existing simple linear models for predicting gene expression interactions.

_Original bioRxiv paper linked in this post's title._