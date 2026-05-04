---
title: "Tech"
description: "Engineering projects, software infrastructure, and technical deep dives — from Hugo static sites and Cloudflare Workers to computer vision and ML tutorials."
featured: "counting-cards-with-computer-vision"
wikidata: "Q11016"
---

Tech here means hands-on engineering: building working systems, breaking them, writing about what shipped and what didn't. Not opinion pieces about the industry, not vendor reviews. Code that runs, with the tradeoffs documented.

Project work covers computer vision (a [card counter trained on OpenCV](/posts/counting-cards-with-computer-vision/) and an [audit of F3ED, the NeurIPS 2024 tennis-shot detector](/posts/f3ed-cant-call-an-ace-fixing-a-neurips-2024-tennis-model/)), applied machine learning ([visualizing PyTorch gradients](/posts/visualizing-gradients-with-pytorch/), [modeling postprandial glucose response with XGBoost](/posts/modeling-glycemic-response-with-xgboost/)), and health-data engineering (a [Python library for the Dexcom CGM](/posts/i-built-a-cgm-data-reader/)).

The site itself is a working case study. The blog runs on Hugo, deploys to GitHub Pages on push, sits behind Cloudflare. Four separate Cloudflare Workers handle the parts a static site can't: a security-headers Worker emits CSP and HSTS plus an Accept-aware content-negotiation layer that returns `index.md` to crawlers sending `Accept: text/markdown`; two AI Workers running Llama 4 Scout 17B auto-post to Bluesky and Twitter every 15 minutes, deduplicating via KV; a GoatCounter proxy serves the "most read" data in the footer.

Posts in this section show the engineering decisions, not the cleaned-up summaries. When a deploy broke, what broke. When a model underperformed, by how much.
