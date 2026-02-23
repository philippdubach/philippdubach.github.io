+++
title = "The Model Said So"
seoTitle = "LLMs in Finance: Why Explainable AI Remains Out of Reach"
date = 2025-05-28
images = ["https://static.philippdubach.com/ograph/ograph-post.jpg"]
description = "LLMs excel at parsing market sentiment and writing reports, but finance demands audit trails and explainable decisions that black box models cannot provide."
keywords = ["LLMs in finance", "explainable AI", "financial regulation", "AI audit trails", "black box AI compliance"]
categories = ["AI"]
type = "Commentary"
external_url = "https://arxiv.org/abs/2505.24650"
aliases = ["/2025/05/28/the-model-said-so/"]
takeaways = [
  "LLMs with billions of parameters cannot produce the audit trails, bias detection, or explainable decisions that financial regulators require for every consumer-facing outcome.",
  "The same complexity that makes LLMs effective at parsing market sentiment makes them regulatory nightmares in a sector where 'the model said so' is not an acceptable answer.",
  "Hybrid approaches pairing LLMs with deterministic rule-based systems are emerging, but the fundamental tension between model power and regulatory transparency remains unresolved.",
]
faq = [
  {question = "Why are LLMs considered a regulatory problem in finance?", answer = "LLMs contain billions of parameters that make their decision-making process opaque. Financial regulators require institutions to explain every decision, especially in areas like credit scoring, fraud detection, and trading. Because no one can fully trace how an LLM arrives at a specific output, these models conflict with mandatory audit trail and explainability requirements."},
  {question = "What does \"the model said so\" mean in the context of financial AI?", answer = "\"The model said so\" refers to the inability to provide a deeper explanation for an AI-driven decision beyond pointing to the model's output. In most industries this may be acceptable, but in finance, regulators and examiners demand transparent reasoning for every decision that affects consumers or markets."},
  {question = "Can financial institutions use LLMs and still meet compliance requirements?", answer = "It remains difficult. The same complexity that makes LLMs effective at parsing market sentiment or generating investment reports makes them nearly impossible to explain to regulators. Some institutions are exploring hybrid approaches that pair LLMs with deterministic rule-based systems, but the fundamental tension between model power and regulatory transparency has not been resolved."},
  {question = "What specific compliance requirements do LLMs struggle to meet in finance?", answer = "LLMs struggle with three core requirements: audit trails that trace how a specific decision was reached, bias detection to prove the model does not discriminate against protected groups, and explainable decision-making that regulators can independently verify and understand."},
]
+++
LLMs make your life easier until they don't.

> Their intrinsic complexity and lack of transparency pose significant challenges, especially in the highly regulated financial sector

{{< readnext slug="the-most-expensive-assumption-in-ai" >}}

Unlike other industries where "the model said so" might suffice, finance demands audit trails, bias detection,
and explainable decision-making—requirements that sit uncomfortably with neural networks containing billions of parameters.
The research highlights a fundamental tension that's about to reshape fintech:
the same complexity that makes LLMs powerful at parsing market sentiment or generating investment reports also makes them regulatory nightmares
in a sector where you need to explain every decision to examiners.
