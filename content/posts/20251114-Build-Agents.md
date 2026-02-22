+++
title = "The Bicycle Needs Riding to be Understood"
seoTitle = "Build Your First LLM Agent: Why Hands-On Learning Matters"
date = 2025-11-14
images = ["https://static.philippdubach.com/ograph/ograph-agents.jpg"]
description = "Build an LLM agent in 50 lines of Python. Why context engineering and emergent behaviors are best understood through hands-on experimentation, not theory."
keywords = ["build LLM agent Python", "context engineering LLM agents", "LLM agent emergent behavior", "LLM agent tutorial beginner", "token management AI agents"]
categories = ["AI"]
type = "Commentary"
draft = false
external_url = "https://fly.io/blog/everyone-write-an-agent/"
aliases = ["/2025/11/14/the-bicycle-needs-riding-to-be-understood/"]
takeaways = [
  "A functioning LLM agent can be built in roughly 50 lines of Python, making the open problems in agent design accessible to individual experimentation in minutes.",
  "In Ptacek's demo, an LLM with ping access autonomously chose multiple Google endpoints without being told to, illustrating both the promise and unpredictability of agent behavior.",
  "Context engineering is not mystical but straightforward programming: managing token budgets, orchestrating sub-agents, and balancing explicit control loops against emergent behavior.",
]
faq = [
  {question = "Should you build an LLM agent from scratch to understand how they work?", answer = "Yes. As Thomas Ptacek argues, you only think you understand how agents work until you build one. The behavior surprises in specific ways, particularly around how models scale effort with complexity before unexpectedly retreating. Context engineering becomes straightforward programming once you experience it firsthand."},
  {question = "How complex is it to build a basic LLM agent?", answer = "Surprisingly simple. Ptacek demonstrates building a functioning agent in roughly 50 lines of Python. The open problems in agent design remain remarkably accessible to individual experimentation, with each iteration taking minutes rather than requiring institutional resources."},
  {question = "What is context engineering in LLM agents?", answer = "Context engineering is managing what information the model sees at each step. This includes orchestrating token budgets, managing sub-agents, and balancing explicit control loops against emergent behavior. It is not mystical but straightforward programming once you start building."},
  {question = "What surprising behaviors do LLM agents exhibit?", answer = "Agents can exhibit autonomous choices without explicit instruction. In Ptacek's example, an LLM with ping access autonomously chose multiple Google endpoints without being told to, crystallizing both the promise and unpredictability of agent systems."},
]
+++
> Some concepts are easy to grasp in the abstract. Boiling water: apply heat and wait. Others you really need to try. You only think you understand how a bicycle works, until you learn to ride one. 

You should write an LLM agent—not because they're revolutionary, but because the bicycle needs riding to be understood. Having built agents myself, Ptacek's central insight resonates: the behavior surprises in specific ways, particularly around how models scale effort with complexity before inexplicably retreating. 

Ptacek walks through building a functioning agent in roughly 50 lines of Python, demonstrating how an LLM with ping access autonomously chose multiple Google endpoints without explicit instruction, a moment that crystallizes both promise and unpredictability. His broader point matches my experience: context engineering isn't mystical but straightforward programming—managing token budgets, orchestrating sub-agents, balancing explicit loops against emergent behavior. The open problems in agent design—titrating nondeterminism, connecting to ground truth, allocating tokens—remain remarkably accessible to individual experimentation, each iteration taking minutes rather than requiring institutional resources.
