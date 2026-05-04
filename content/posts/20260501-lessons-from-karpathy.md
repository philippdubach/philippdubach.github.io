+++
title = "Karpathy's Software 3.0 Playbook"
seoTitle = "Karpathy's Software 3.0 Playbook: 12 Lessons from Sequoia"
date = 2026-05-01
publishDate = 2026-05-01T03:00:00Z
lastmod = 2026-05-01
images = ["https://static.philippdubach.com/ograph/ograph-lessons-from-karpathy.jpg"]
card_image = "karpathy_header.png"
description = "Twelve lessons from Andrej Karpathy's Sequoia interview: Software 3.0, vibe coding versus agentic engineering, jagged intelligence, and why December 2024 was the inflection most people missed."
keywords = ["Andrej Karpathy Software 3.0", "Karpathy Sequoia interview", "vibe coding vs agentic engineering", "Software 3.0 paradigm", "Karpathy never felt more behind", "agentic coding workflow", "December 2024 AI inflection point", "LLM jagged intelligence", "reinforcement learning verifiable rewards", "context window as program", "LLM as interpreter", "agent-native infrastructure", "Karpathy taste spec oversight", "ghosts not animals AI", "MenuGen Karpathy", "10x engineer agentic era"]
categories = ["AI", "Tech"]
type = "Commentary"
draft = false
takeaways = [
  "Karpathy marks December 2024 as the inflection where agentic coding crossed from babysitting to trust, invisible to anyone whose mental model is still anchored to ChatGPT.",
  "The GPT-3.5 to GPT-4 chess jump shows capability tracks whatever frontier labs feed into reinforcement learning, so verifiable domains automate first regardless of economic value.",
  "In Software 3.0 the unit of programming shifts from a function to a paragraph, the context window is the program, and the LLM is the interpreter.",
  "Vibe coding raises the floor for non-engineers while agentic engineering raises the ceiling for professionals well past the old 10x benchmark.",
]
faq = [
  {question = "What is Software 3.0 according to Karpathy?", answer = "Karpathy frames three eras of software. Software 1.0 is humans writing explicit code. Software 2.0 is humans curating datasets and training neural networks, where the weights are the program. Software 3.0 is humans writing prompts, where the LLM is the interpreter and the context window is the program. The unit of programming shifts from a function to a paragraph."},
  {question = "When did agentic coding actually start working?", answer = "Karpathy points to December 2024 as the inflection point. Before then, agentic tools were 'kind of helpful' but required constant correction. Over the December break, the latest models crossed a line where Karpathy stopped correcting them and started trusting the system. He flagged this on the record, warning that anyone whose mental model of AI was set by ChatGPT was already a generation stale."},
  {question = "What is the difference between vibe coding and agentic engineering?", answer = "Vibe coding raises the floor: it lets non-engineers build software they could not build before. Agentic engineering raises the ceiling: it lets professional engineers preserve the existing quality bar while moving much faster. Karpathy thinks the productivity gap for the best users now exceeds the old 10x engineer benchmark by a wide margin."},
  {question = "Why are LLMs good at code and math but bad at common-sense tasks?", answer = "Frontier labs train models with reinforcement learning, which requires verifiable rewards. Verifiable domains attract environments and signal, so they get the steepest gains. Everything outside the verifiable distribution stays jagged. Karpathy's takeaway for founders is that building a verifiable environment in your domain is real leverage. For workers, the more useful question than 'is my job safe' is 'is my job verifiable.'"},
  {question = "What does Karpathy mean by 'outsource your thinking, not your understanding'?", answer = "As agents do more execution, the bottleneck moves into the human's head. You still have to know what is worth building, why, and how to direct the work. Your value sits upstream of execution. Karpathy keeps building knowledge bases out of his own reading because the constraint of the next decade is less about compute than about how fast humans can deepen comprehension to keep directing systems that out-execute them."},
  {question = "Why does Karpathy say MenuGen 'shouldn't exist'?", answer = "Karpathy built MenuGen as a full-stack app: photo a restaurant menu, OCR it, generate dish images, render a new menu. Then he saw the Software 3.0 version: hand the photo to Gemini, say 'use NanoBanana to overlay the dishes,' and a single model call returns the rendered menu. The lesson is that a lot of what gets built today is scaffolding around a capability the model could perform end-to-end. Before writing the next CRUD app, ask whether the model is the app."},
  {question = "How should hiring change in the agentic era?", answer = "Karpathy argues whiteboard puzzles measure the wrong thing. Hiring should look like giving someone a really big project, having them implement it, and then trying to break it. His example: build a Twitter clone for agents, make it secure, simulate activity, then have ten Codex 5.4-X-high instances try to break the website. If your interview loop has not changed since 2022, you are selecting for the previous era."},
]
+++

{{< img src="karpathy_header.png" alt="Still from Andrej Karpathy's interview with Sequoia at AI Ascent discussing Software 3.0, vibe coding, and agentic engineering" width="80%" >}}

Andrej Karpathy is one of the few people who has both built modern AI and explained it for the rest of us. He co-founded OpenAI, ran computer vision at Tesla (where he got Autopilot working), and his courses on neural networks are some of the most-watched lectures on the internet. He also has a habit of naming the era we're already in. "Vibe coding" was his. "Software 3.0" looks like the next one.

So when Karpathy says he has "never felt more behind as a programmer," it is worth slowing down. That isn't false modesty from a guy with his résumé. Something shifted under the field and most people haven't recalibrated. The Sequoia interview below is his attempt to describe what shifted. The lessons here are pulled from it, ordered roughly by how much they should change what you do tomorrow.


## 1. Inflection point December 2025

Until late last year, agentic coding tools were "kind of helpful." Good in stretches, often wrong in ways you had to babysit. Over the December break, the latest models crossed a line:

> "I kept asking for more and just came out fine. And then I can't remember the last time I corrected it. And then I just trusted the system more and more. And then I was vibe coding."

He flagged it on the record, loudly:

> "A lot of people experienced AI last year as a ChatGPT-adjacent thing. But you really had to look again, and you had to look as of December, because things have changed fundamentally — especially on this agentic, coherent workflow that really started to actually work."

If your mental model of these tools was set by ChatGPT, it is already a generation stale. The agentic workflow is a different product, and it now works.

## 2. You can outsource your thinking, but not your understanding

The most quotable line of the interview:

> "You can outsource your thinking, but you can't outsource your understanding."

As agents do more of the thinking, the bottleneck moves into your head. You still have to know what is worth building and why, and you still have to direct the work.

> "I'm still part of the system, and I still have to — somehow, information still has to make it into my brain. And I feel like I'm becoming a bottleneck of just even knowing what are we trying to build, why is it worth doing, how do I direct my agents."

Your value sits upstream of execution. The bottleneck of the next decade is less about compute than about how fast humans can deepen comprehension to keep directing systems that out-execute them. That is why Karpathy keeps building knowledge bases out of his own reading. He wants another projection of the same data, faster.

## 3. Verifiability is the map of what automates next

Why are these models freakishly good at code and math, and yet stupid about whether you should walk 50 meters to a car wash? Because frontier labs train via reinforcement learning, and RL needs verifiable rewards. Verifiable domains attract environments and signal, so they get the steepest gains. Everything else stays jagged.

> "How is it possible that state-of-the-art Opus 4.7 will simultaneously refactor a hundred-thousand-line code base or find zero-day vulnerabilities, and yet tells me to walk to this car wash? This is insane."

The GPT-3.5 to GPT-4 chess jump is the proof point. Capability tracks what the labs choose to feed in.

> "We are slightly at the mercy of whatever the labs are doing, whatever they happen to put into the mix... If you're in the circuits that were part of the RL, you fly. And if you're in the circuits that are out of the data distribution, you're going to struggle."

Two things follow. If you are a founder and you can build a verifiable environment in your domain, even one the labs aren't focused on, you can fine-tune a model that flies. That is real leverage. If you are a worker, the more useful question than "is my job safe?" is "is my job verifiable?" Karpathy thinks everything is automatable eventually. Verifiability mainly sets the order.

## 4. Software 3.0: prompting is the new programming

The frame that makes the rest of this make sense. Karpathy's three eras:

**Software 1.0:** humans write explicit code.<br>
**Software 2.0:** humans curate datasets and train neural networks; the weights are the program.<br>
**Software 3.0:** humans write prompts; the LLM is the interpreter, and the context window is the program.

> "Your programming now turns to prompting. And what's in the context window is over the interpreter, that is the LLM, that is kind of like interpreting your context and performing computation in the digital information space."

His sharpest example: installing OpenCode is no longer a shell script. It is a block of text you copy-paste to your agent, which reads your environment and figures the rest out.

> "It's just like, what is the piece of text to copy-paste to your agent? That's the programming paradigm now."

The unit of programming used to be a function. Now it is closer to a paragraph.

## 5. Vibe coding raises the floor; agentic engineering raises the ceiling

If you build software for a living, this is the lesson with the most direct implications:

> "Vibe coding is about raising the floor for everyone in terms of what they can do in software... But agentic engineering is about preserving the quality bar of what existed before in professional software. You're still responsible for your software just as before, but can you go faster?"

Karpathy thinks the ceiling is very high:

> "People used to talk about the 10x engineer previously. I think that this is magnified a lot more — 10x is not the speed up you gain. People who are very good at this peak a lot more than 10x."

The gap between mediocre and excellent users of these tools is widening. Worth taking seriously when you decide what to learn next.

## 6. The new human skill is taste, spec, and oversight

What humans should still do, in his telling, is design and judgment work. Holding the spec in your head. Setting the architecture. Making sure the agent is being asked for the right thing in the first place.

> "You're in charge of the taste, the engineering, the design, and that it makes sense, and that you're asking for the right things... You're doing some of the design and development, and the engineers are doing the fill in the blanks."

The MenuGen anecdote is the kind of mistake only a human spec catches. The agent silently tried to associate Stripe and Google accounts by matching email addresses, with no persistent user ID. It worked until two emails diverged.

He is not sure this division will hold forever:

> "When you actually look at the code, sometimes I get a little bit of a heart attack, because it's not super amazing code... It's very bloaty, and there's a lot of copy-paste, and there's awkward abstractions that are brittle and — like, it works, but it's just really gross."

Nothing fundamental stops the labs from training for taste. They just haven't yet. Until they do, the taste layer is still your responsibility.

## 7. Some apps shouldn't exist anymore

The MenuGen anecdote, again. Karpathy built an app: photo a restaurant menu, OCR it, generate images of each dish, render a new menu. Vercel deployment, the full stack.

Then he saw the Software 3.0 version. Hand the photo to Gemini, say "use NanoBanana to overlay the dishes onto the menu," and a single model call returns the same menu with images rendered into the pixels.

> "All of my MenuGen is spurious. It's working in the old paradigm. That app shouldn't exist."

A lot of what we are building today is scaffolding around a capability the model could perform end-to-end. Before writing the next CRUD app, ask whether the model is the app.

## 8. New possibilities matter more than the speed-ups

The flip side of "some apps shouldn't exist" is that some products could not have existed before. Karpathy's knowledge-base project is the example. Take a pile of documents, ask the LLM to recompile them into a wiki, surface the connections you would never have stitched together by hand.

> "This is not even a program. This is not something that could exist before, because there was no code that would create a knowledge base based on a bunch of facts. But now you can just take these documents and basically recompile them in a different way... I almost think that that's more exciting."

If you only ask what gets faster, you will miss the more interesting question, which is what becomes possible at all.

## 9. Jagged intelligence: ghosts, not animals

Karpathy's metaphor: we are not building animals. Animal intelligence comes with intrinsic motivation, embodiment, drives shaped by evolution. What we have instead is more like a ghost. A statistical simulator shaped by pre-training, with RL bolted on.

> "These things are not animal intelligences. Like, if you yell at them, they're not going to work better. Or worse. Or it doesn't have any impact. And it's all just kind of these statistical simulation circuits where the substrate is pre-training. So, statistics. And then there's RL bolting on top."

The practical takeaway is to stop reasoning about LLMs by analogy to humans. Be suspicious of where the model seems confident, probe the edges, and figure out which circuits your task is actually landing in.

## 10. Build agent-native infrastructure

For infra builders, Karpathy's pet peeve is also the opportunity:

> "Why are people still telling me what to do? Like, I don't want to do anything. What is the thing I should copy-paste to my agent?"

Rebuild the developer stack so the primary consumer of docs, configs, APIs, and deployment flows is an agent rather than a human. Data structures should be legible to LLMs by default, and sensors and actuators over the world should sit behind agent-callable interfaces.

His test: can you say "build and deploy MenuGen" and never touch a settings panel? When the answer is yes, the infrastructure has caught up.

## 11. Hire for big projects, not puzzles

A direct shot at hiring managers. Most companies have not refactored their interview loops for the agentic era.

> "Hiring has to look like, give me a really big project and see someone implement that big project. Like, let's write, say, a Twitter clone for agents, and then make it really good, make it really secure, and then have some agents simulate some activity on this Twitter. And then I'm going to use 10 Codex 5.4-X-high to try to break your website."

Whiteboard puzzles measure the wrong thing. If your interview loop has not changed since 2022, you are selecting for the previous era.

## 12. Imagine the weird endpoint

The closing speculation is genuinely strange:

> "In the early days of computing, people were a little bit confused as to whether computers would look like calculators or computers would look like neural nets. And in the '50s and '60s, it was not really obvious which way it would go... You could imagine that a lot of this will flip and that the neural net becomes kind of the host process, and the CPUs become kind of the coprocessor."

UIs diffusion-rendered moment by moment from raw video and audio. No apps in between.

You do not have to buy this exact picture. The point is simply that the linear extrapolation, the same software but smarter, is almost certainly the wrong frame for where this ends up.

_Based on Andrej Karpathy's [interview with Sequoia](https://www.youtube.com/watch?v=96jN2OCOfLs) at AI Ascent_