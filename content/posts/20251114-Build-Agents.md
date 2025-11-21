---
title: "The Bicycle Needs Riding to be Understood"
date: 2025-11-14
images: ['https://static.philippdubach.com/ograph/ograph-agents.jpg']
external_url: "https://fly.io/blog/everyone-write-an-agent/"
description: "We explore why developers should build LLM agents through hands-on experimentation, examining how these AI systems exhibit surprising autonomous behaviors and discussing practical programming challenges like token management and balancing deterministic versus emergent behaviors."
keywords: ["LLM agent development", "AI agent experimentation", "context engineering", "token management", "autonomous AI behavior", "emergent behavior", "Python agent programming", "sub-agents orchestration", "nondeterminism in AI", "agent design patterns", "LLM programming challenges", "hands-on AI development", "Thomas Ptacek", "bicycle metaphor programming", "AI behavior unpredictability"]
draft: false
---
> Some concepts are easy to grasp in the abstract. Boiling water: apply heat and wait. Others you really need to try. You only think you understand how a bicycle works, until you learn to ride one. 

You should write an LLM agent—not because they're revolutionary, but because the bicycle needs riding to be understood. Having built agents myself, Ptacek's central insight resonates: the behavior surprises in specific ways, particularly around how models scale effort with complexity before inexplicably retreating. 

Ptacek walks through building a functioning agent in roughly 50 lines of Python, demonstrating how an LLM with ping access autonomously chose multiple Google endpoints without explicit instruction, a moment that crystallizes both promise and unpredictability. His broader point matches my experience: context engineering isn't mystical but straightforward programming—managing token budgets, orchestrating sub-agents, balancing explicit loops against emergent behavior. The open problems in agent design—titrating nondeterminism, connecting to ground truth, allocating tokens—remain remarkably accessible to individual experimentation, each iteration taking minutes rather than requiring institutional resources. 

_Blog by Thomas Ptacek linked in this post's title._