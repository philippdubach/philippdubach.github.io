+++
title = "Do Not Disturb My Circles"
seoTitle = "AI for Science Lost to Chatbots: The $690B Misallocation"
date = 2026-04-13
lastmod = 2026-04-15
publishDate = 2026-04-13T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-do-not-disturb-my-circles.jpg"]
description = "AlphaFold cost under $1M to train. OpenAI spends $2.3B on inference. The chatbot era consumed the talent and compute that could have cured diseases."
keywords = ["AI for science vs chatbots", "Demis Hassabis AlphaFold Gemini", "AlphaFold training cost", "AI compute scientific research funding", "Bell Labs monopoly research decline", "AI chatbot misallocation", "AI opportunity cost", "AI brain drain academia", "scientific AI funding gap", "AI capital allocation 2026", "DeepMind scientific AI", "AI infrastructure spending science", "Hassabis cure cancer quote", "chatbot era capital misallocation", "AI for science underfunded", "fundamental research AI funding", "AI resource allocation science commercial"]
categories = ["AI"]
type = "Commentary"
draft = false
takeaways = [
  "AlphaFold 2 trained on 128 TPUs for 11 days at an estimated cost under $1 million, less than what OpenAI spends on inference in a single day of its $2.3 billion annual bill",
  "Big Tech spends 75x more on AI than the entire US federal science budget: $250 billion on chatbot infrastructure versus $3.3 billion on AI for scientific research",
  "Bell Labs produced 10 Nobel Prizes under AT&T's monopoly protection and one after the breakup introduced commercial pressure, the same dynamic Hassabis warned about",
  "Hassabis told The Guardian he would have 'left AI in the lab for longer, done more things like AlphaFold, maybe cured cancer,' then ChatGPT forced him into the commercial race",
]
faq = [
  {question = "What did Demis Hassabis say about keeping AI in the lab longer?", answer = "In an August 2025 Guardian interview, Hassabis said: 'If I'd had my way, we would have left it in the lab for longer and done more things like AlphaFold, maybe cured cancer or something like that.' He described his original vision as a CERN-like collaboration among the world's best scientists, approaching AGI carefully over decades while deploying narrow AI tools like AlphaFold for immediate benefit."},
  {question = "How much did AlphaFold cost to train compared to commercial AI models?", answer = "AlphaFold 2 trained on 128 Google TPUv3 chips for approximately 11 days. At cloud pricing of roughly $32 per hour per TPU, the estimated cost is under $1 million. By comparison, GPT-4's training cost an estimated $78 million, Gemini Ultra roughly $191 million, and OpenAI's Orion exceeded $500 million. OpenAI's inference spending alone reached $2.3 billion in 2024."},
  {question = "How much does Big Tech spend on AI compared to government science funding?", answer = "The ratio is roughly 75 to 1. Big Tech spent over $250 billion on AI infrastructure in 2024-2025, while total US federal AI R&D spending is approximately $3.3 billion per year. The Big 4 hyperscalers have guided to $610-665 billion in capital expenditure for 2026 alone."},
  {question = "What happened to Bell Labs after AT&T's monopoly ended?", answer = "Bell Labs produced 10 Nobel Prizes and 5 Turing Awards while funded by AT&T's regulated telephone monopoly. After the 1984 breakup introduced commercial competition, the research workforce dropped from roughly 1,300 to 500 by 2002, and only one post-divestiture employee won a Nobel Prize. Bell Labs was eventually absorbed by Nokia in 2016."},
  {question = "Is AI for science underfunded compared to commercial AI?", answer = "By a wide margin. AlphaFold, which has been used by over 3 million scientists and predicted the structures of 200 million proteins, cost under $1 million to train. The entire DOE Genesis Mission for AI-driven science received $320 million in its first round, less than Meta spends on AI infrastructure in a single week. Yet the chatbot market absorbs the vast majority of AI talent, compute, and capital."},
]
+++

> If I'd had my way, we would have left it in the lab for longer and done more things like AlphaFold, maybe cured cancer or something like that.

That's [Demis Hassabis](https://en.wikipedia.org/wiki/Demis_Hassabis) (I cannot recomend watching 
[The Thinking Game](https://www.youtube.com/watch?v=d95J8yzvjbQ) enough and or read 
[The Infinity Machine](https://www.penguinrandomhouse.com/books/752231/the-infinity-machine-by-sebastian-mallaby/)), the CEO of Google DeepMind and a Nobel Prize winner, describing the future he didn't get.

He wanted a CERN for artificial intelligence. A decade or two of careful, methodical work. The world's best scientists collaborating on each step toward general intelligence, understanding what they built before building the next thing. In the meantime, AI for science, narrow tools like AlphaFold, would ship real benefits: cures, new materials, maybe a crack at fusion. Not chatbots. He didn't get that future. None of us did. Instead we got a commercial arms race, a $690 billion annual infrastructure buildout, and the greatest concentration of technical talent in human history pointed at making autocomplete better. 

This is a story about capital misallocation. But it's also a very old story.

## Geometry in the sand

In 214 BC, the Roman general Marcellus brought a fleet to Syracuse. Standing between Rome and the richest city in Sicily was one man: [Archimedes](https://en.wikipedia.org/wiki/Archimedes), the greatest scientist of the ancient world, a mathematician whose work on the lever, the screw, and the principles of buoyancy would outlast every empire he lived under.

Archimedes did not want to build weapons. [Plutarch](https://en.wikipedia.org/wiki/Parallel_Lives), writing in the *Life of Marcellus*, says Archimedes designed and contrived his machines "not as matters of any importance, but as mere amusements in geometry." He regarded the whole business as ignoble, beneath the dignity of pure mathematics. But his patron King Hiero II needed defenses, and Archimedes was the only man who could provide them. So he built them. Catapults that could sink a ship at range. The [Claw of Archimedes](https://en.wikipedia.org/wiki/Claw_of_Archimedes), an iron grappling device that could lift a Roman galley out of the water and drop it. Possibly parabolic mirrors that focused sunlight to set ships on fire, though historians still debate that one.

The machines worked. Plutarch writes that the Romans became so terrified that "whenever they saw a bit of rope or a stick of timber projecting over the wall, they cried 'Archimedes is training some engine upon us,' and turned their backs and fled." They held off Rome for two years.

Then Syracuse fell anyway. In 212 BC, Roman soldiers breached the walls during a festival. A soldier found Archimedes drawing geometric figures in the sand. According to the tradition passed down through [Valerius Maximus](https://en.wikipedia.org/wiki/Valerius_Maximus) and others, his last words were *"Noli turbare circulos meos"*: do not disturb my circles.

Marcellus had ordered Archimedes taken alive. The order didn't matter. The soldier killed him. The geometry died with him. The war machines, the things Archimedes considered beneath his real work, survived in military engineering textbooks for centuries. His mathematical treatises survived only by accident, through a single Byzantine manuscript [scraped and overwritten with prayer texts](https://en.wikipedia.org/wiki/Archimedes_Palimpsest) in the 13th century.

I thought about this when I watched Demis Hassabis in a [recent interview with Cleo Abram](https://www.youtube.com/watch?v=C0gErQtnNFE).

## The conscription

He had been building learning systems at DeepMind for years. The work was pointed at science. AlphaFold was the first proof that AI could crack fundamental problems in biology. Move 37, AlphaGo's famous creative play against Lee Sedol in 2016, was the proof that AI systems could discover things no human had considered.

Then ChatGPT happened. Google went code red. Hassabis, the man who wanted to solve protein folding and maybe crack fusion, became the man who runs all of Google's AI, including the consumer products he'd never wanted to focus on.

He's candid about what was lost:

> My ideal was to approach the latter stages of building AGI using the scientific method, very carefully, very precisely, very thoughtfully, in a CERN-like way. That might take a decade, even two decades longer. But I think that would make sense given the enormity of what we're dealing with.

And about the irony:

> Language was a lot easier than we were all expecting. Even those of us who were obviously optimists about the whole technology. We thought maybe there would be one or two or three more breakthroughs needed. But it turned out transformers and some reinforcement learning on top was enough.

The ease of the advance was the thing that derailed the deeper work. Language models turned out to be good enough for consumer products, and consumer products generate revenue, and revenue attracts competition, and competition creates the arms race that now consumes everything. DeepMind had "fairly equivalent systems" to ChatGPT at the time, Hassabis says. They chose not to release them. That choice was taken from him.

{{< readnext slug="peter-thiels-physics-department" >}}

## What a dollar buys

The resource allocation case is simple enough to state in one line, though the implications are not.

[AlphaFold 2](https://www.nature.com/articles/s41586-021-03819-2) trained on 128 Google TPUv3 chips for approximately 11 days. At [Google Cloud's public pricing](https://cloud.google.com/tpu/pricing) of roughly $32 per hour per TPU, the estimated training cost is somewhere under **$1 million**. It predicted the three-dimensional structures of 200 million proteins. Over 3 million scientists now use it. A pharma executive told Hassabis that "almost every drug developed from now on will have probably used AlphaFold in its process."

Now the other side of the ledger. [GPT-4's training cost](https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models/) an estimated **$78 million**. [Gemini Ultra ran to roughly **$191 million**](https://fortune.com/2024/04/18/google-gemini-cost-191-million-to-train-stanford-university-report-estimates/). OpenAI's Orion [exceeded **$500 million**](https://fortune.com/2025/02/25/what-happened-gpt-5-openai-orion-pivot-scaling-pre-training-llm-agi-reasoning/) for a single training run, and the model was so disappointing they downgraded it from GPT-5 to GPT-4.5. OpenAI's inference spending alone, just the cost of running the models after training, [hit **$2.3 billion in 2024**](https://aibusiness.com/language-models/ai-model-scaling-isn-t-over-it-s-entering-a-new-era). That is 15 times what they spent training GPT-4.5.

AlphaFold cost less to train than OpenAI spends on inference in a single day.

Zoom out further. The Big 4 hyperscalers, Amazon, Alphabet, Meta, Microsoft, are guiding to [**$610-665 billion**](https://www.goldmansachs.com/insights/articles/why-ai-companies-may-invest-more-than-500-billion-in-2026) in capital expenditure for 2026. [Goldman Sachs projects](https://www.goldmansachs.com/insights/articles/why-ai-companies-may-invest-more-than-500-billion-in-2026) cumulative 2025-2027 spending at $1.15 trillion. As I noted in [Peter Thiel's Physics Department](/posts/peter-thiels-physics-department/), Big Tech spends **75 times** more on AI than the entire US federal science budget: $250 billion versus $3.3 billion per year. The DOE Genesis Mission, the flagship US government program for AI-driven scientific discovery, [received **$320 million** in its first round](https://www.energy.gov/science/articles/doe-announces-genesis-mission-advance-ai-science). That is less than Meta spends on AI infrastructure in a single week.

The infrastructure being built is not for protein folding. It is not for materials science or fusion plasma control or genomics. It is for chatbots, image generators, and coding assistants. [Sequoia's David Cahn calculated](https://sequoiacap.com/article/ais-600b-question/) the AI ecosystem needs **$600 billion in annual revenue** to justify current infrastructure spending. It generates perhaps $80-120 billion. And nearly all of that revenue comes from commercial applications: subscriptions, API access, enterprise contracts for systems that summarize emails and draft marketing copy.

The bottleneck for AI for science was never money. AlphaFold proved that. It was always about who works on what, and the chatbot economy answered that question for an entire generation of researchers.

{{< readnext slug="ai-capex-arms-race-who-blinks-first" >}}

## What the circles produced

When Hassabis's teams were allowed to focus on science, when the circles were left undisturbed, this is what happened.

In The Thinking Game there's a moment that captures it perfectly. The original plan for AlphaFold was conventional: build a server, let scientists submit protein sequences one at a time, email back the predicted structures. Standard approach, used by the whole field for 40 years. Then Hassabis started doing arithmetic on his phone in the middle of the meeting. Two hundred million known proteins. One fold every ten seconds. How many TPUs do we have? He looked up and said something like, "[Why don't we just fold everything?](https://youtu.be/d95J8yzvjbQ?si=1VVejCeVhn_1_3m6&t=4495)"

It would be, he realized, actually less work than building the server.

So they folded everything. AlphaFold predicted the structures of **200 million proteins** and put them in a [free database](https://alphafold.ebi.ac.uk/). The nuclear pore complex, one of the largest and most important proteins in the body, a donut-shaped gateway that controls nutrient flow in and out of the cell nucleus, was [solved within months](https://www.science.org/doi/10.1126/science.abm9326) of AlphaFold's release. Researchers working on neglected diseases, malaria, Chagas, leishmaniasis, diseases that affect hundreds of millions of people but attract little pharma funding, now get protein structures for free. Plant scientists working on climate-resilient crops can skip years of crystallography and go straight to the biology.

[Isomorphic Labs](https://www.isomorphiclabs.com/), the DeepMind spinoff, is running 18-19 drug programs across cardiovascular disease, cancer, and immunology. [IsoDDE, its drug design engine](/posts/ai-can-now-design-drugs-in-seconds-we-still-cant-tell-you-if-they-work./), hits 50% on the hardest protein-ligand benchmarks versus 23% for AlphaFold 3. [AlphaGenome](https://deepmind.google/discover/blog/alphagenome-predicts-the-effects-of-dna-variation-on-gene-regulation/) is decoding the 98% of the human genome that doesn't code for proteins, the part where most disease-causing mutations hide. Jennifer Doudna, the CRISPR pioneer, asked Hassabis directly about combining AlphaGenome with CRISPR to identify and fix the exact genetic changes causing disease. His answer: "Still not probably good enough yet. But you can imagine a future version."

[AlphaEvolve](/posts/the-last-architecture-designed-by-hand/) found a 23% speedup inside Gemini's own architecture, recovering 0.7% of Google's total compute. DeepMind's fusion work [controlled plasma autonomously](https://deepmind.google/blog/bringing-ai-to-the-next-generation-of-fusion-energy/) in a real tokamak. [GNoME](https://deepmind.google/discover/blog/millions-of-new-materials-discovered-with-deep-learning/) identified 2.2 million new crystal structures, equivalent to roughly 800 years of prior human discovery in materials science.

All of this on a fraction of the compute that powers the chatbot economy. I keep coming back to this: the entire portfolio of DeepMind's scientific work, the Nobel Prize, the drug programs, the materials, the fusion experiments, consumed less compute than a single frontier chatbot burns through in inference costs per quarter.

## The case for the war machines

I want to present the counterargument honestly, because it's not trivial.

The commercial race funded a compute buildout that wouldn't exist without chatbot demand. $690 billion in 2026 capex built data centers that can, in principle, be repurposed for scientific workloads. The talent pipeline expanded: a generation of ML engineers entered the field because consumer AI products made it exciting and lucrative. Millions of users stress-tested these models in ways internal testing never could, revealing failure modes and edge cases that improve the underlying systems. Hassabis himself acknowledges this. In the HUGE* interview he listed the benefits: "lightning speed" progress, democratized access to cutting-edge AI "perhaps only 3 to 6 months behind what is actually in the labs," and societal normalization that prepares people for bigger changes ahead.

And there's the funding argument. Google's $132 billion in net income funds DeepMind. Gemini's commercial revenue helps justify the research budget. Without the chatbot economy, would Alphabet spend billions on AI research at all?

The strongest version of this argument goes: you can't have the cathedral without the wool merchants. Bell Labs needed AT&T's monopoly revenue. The Apollo program needed Cold War spending. Scientific breakthroughs don't fund themselves. The commercial race, ugly as it is, is the mechanism that makes the science possible.

## Why the steelman breaks

I've thought about this for a while, and I think it's wrong.

Start with the compute argument. The infrastructure being built is overwhelmingly inference infrastructure: data centers optimized for running chatbot queries at scale, not for training scientific models. AlphaFold trains on 128 TPUs. It doesn't need a $75 billion annual capex program. The buildout serves commercial demand. Calling it a foundation for scientific AI is like calling a shopping mall a foundation for particle physics because they both use electricity.

The talent argument has the same problem. The pipeline filled, but it filled with the wrong skills and pointed in the wrong direction. [Stanford HAI's 2025 AI Index](https://hai.stanford.edu/ai-index/2025-ai-index-report/research-and-development) found that **70%** of AI PhDs took private sector jobs in 2023, up from roughly 20% two decades ago. [Bruce Schneier wrote in *Nature*](https://www.nature.com/articles/d41586-026-00474-3) that the exodus threatens "innovation driven by curiosity rather than profit." The ML engineers entering the field are optimizing RLHF, fine-tuning chat models, building prompt engineering toolchains, and competing on Chatbot Arena leaderboards. These are not the skills that fold proteins or control plasma. The talent that cracks drug discovery needs computational chemistry, molecular dynamics, quantum mechanics. The talent attracted by the chatbot boom is, for the most part, not that talent.

The stress-testing argument is real but narrow. Millions of users proved that language models can summarize documents and brainstorm ideas. That tells you nothing about whether they can predict which genetic mutations cause disease. The applications share a model architecture but almost nothing else.

And the funding argument, the one that seems hardest to dismiss, actually argues the opposite of what its proponents think. The best historical parallel is [Bell Labs](https://en.wikipedia.org/wiki/Bell_Labs). Founded in 1925 as the research arm of AT&T's regulated telephone monopoly, Bell Labs produced the [transistor](https://en.wikipedia.org/wiki/Transistor), the [laser](https://en.wikipedia.org/wiki/Laser), [Unix](https://en.wikipedia.org/wiki/Unix), the [C programming language](https://en.wikipedia.org/wiki/C_(programming_language)), [information theory](https://en.wikipedia.org/wiki/Information_theory), and the discovery of [cosmic microwave background radiation](https://en.wikipedia.org/wiki/Cosmic_microwave_background). Ten Nobel Prizes. Five Turing Awards. [Brian Potter in *Construction Physics*](https://www.construction-physics.com/p/what-would-it-take-to-recreate-bell) calls the conditions "unrepeatable": a vertically integrated monopoly that could afford to fund research with no immediate commercial return.

Then AT&T was broken up in 1984. Commercial competition arrived. What happened next is instructive: the research workforce [dropped from roughly 1,300 to 500 by 2002](https://en.wikipedia.org/wiki/Bell_Labs). Only one post-divestiture employee won a Nobel Prize. Bell Labs was passed from AT&T to Lucent to Alcatel to Nokia, each owner less interested in fundamental research than the last. By 2008, [four physicists remained](https://pmc.ncbi.nlm.nih.gov/articles/PMC8792522/) in basic research. By 2016, what had been the most productive research institution in human history was a division of a Finnish telecom company.

The irony is precise: the people who argue that commercial pressure funds great science are citing a lab that produced its greatest work under monopoly protection *from* commercial pressure, and died the moment that protection was removed.

{{< readnext slug="ai-models-are-the-new-rebar" >}}

Hassabis's vision, the CERN model, is the Bell Labs model. Let fundamental research breathe. Shield it from quarterly earnings. Fund it with patient capital. He had that at DeepMind, funded by Google's search advertising monopoly, insulated from product deadlines, free to spend six years building AlphaGo before it produced a single dollar of revenue. Then the commercial race consumed the insulation.

The funding was already there. What he lost was the institutional focus.

## The circles

Archimedes held off Rome for two years. Then the soldier came. The war machines didn't save Syracuse. They bought time, and that time ran out.

I don't think the chatbot era saved AI for science. I think it ate the oxygen. The talent went to RLHF optimization. The compute went to inference farms. The institutional attention went to quarterly product launches. Hassabis is now simultaneously building the war machines and drawing the circles: running Gemini and funding Isomorphic, shipping chatbots and folding proteins. That he manages both is remarkable. But it's a compromise, and the compromise has a cost measured in drug programs that don't exist, diseases that aren't being studied, materials that haven't been found.

The question is not whether chatbots are useful. They are. I use them constantly. The question is whether future historians will look at 2023-2026 and see a period when the most capable scientific tool in human history was mostly pointed at drafting emails and generating stock photos, and wonder what we were thinking. The way we look at that Roman soldier: someone who destroyed something more valuable than he could understand.

In the interview, Hassabis is asked what he would want said at his funeral. His answer was immediate:

>I would hope that they would say that my life was of benefit and service to humanity.

The circles are still there, drawn in the sand between product launches.