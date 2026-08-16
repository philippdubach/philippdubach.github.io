+++
title = "I Tried Kimi K3 Inside Claude Code"
cta_pitch = "I write every few weeks about AI, sovereignty and the economics underneath both. Get the next one."
seoTitle = "Testing Moonshot AI's Kimi K3 Inside Claude Code"
slug = "kimi-k3-inside-claude-code"
date = 2026-07-19
lastmod = 2026-08-16
publishDate = 2026-07-19T10:00:00Z
images = ["https://static.philippdubach.com/kimi-k3-cover1.png"]
card_image = "https://static.philippdubach.com/kimi-k3-cover1.png"
description = "I routed Claude Code through Moonshot AI's Kimi K3 and rebuilt a frontend for $7.18. I then estimated the same recorded token mix at Claude list prices and examined sovereign AI."
keywords = ["Kimi K3", "Moonshot AI", "Claude Code", "OpenRouter", "open-weight models", "AI coding models", "Frontend Arena", "Claude Opus 4.8", "Claude Fable 5", "Qwen 3.8", "Inkling", "sovereign AI", "on-premise AI", "Swiss AI infrastructure"]
categories = ["AI"]
type = "Experiment"
draft = false
unlisted = false
takeaways = [
  "Claude Code kept the familiar agent interface while Kimi K3 handled the requests. The model was good enough that I stopped noticing the switch.",
  "Kimi felt slower than third-party speed measurements suggested. Even so, it produced a close frontend reconstruction from a detailed prompt and the original assets.",
  "My Kimi activity cost $7.18. At published list prices, the same recorded token mix would cost about $11.96 on Opus 4.8 and $23.92 on Fable 5. These are estimates, not observed Claude bills.",
  "Open weights let operators run and modify a model. Local hosting could support sovereign AI through data residency, operational control, and auditability."
]
faq = [
  {question = "Can Kimi K3 be used inside Claude Code?", answer = "Yes. Claude Code is an agent interface for coding tasks. I used OpenRouter, a request-routing service, to send its requests to Moonshot AI's Kimi K3. The interface and most of my workflow stayed the same."},
  {question = "Is Kimi K3 better than Claude Opus 4.8?", answer = "Not in my single-run experience. Opus still felt more dependable on difficult coding work. Kimi K3 was closer than I expected and cheaper for the recorded token mix."},
  {question = "How much did the Kimi K3 activity cost?", answer = "The exported activity log contained 115 requests and 13.64 million prompt tokens, which carry instructions and context. It also contained 82,307 output tokens, which carry model responses. The activity cost $7.18. Reuse of 12.95 million cached prompt tokens helped reduce that cost."},
  {question = "What would the same traffic have cost on Claude?", answer = "I applied Anthropic's published input, output, and cache-hit prices to the recorded token mix. This calculation gives about $11.96 for Claude Opus 4.8 and $23.92 for Claude Fable 5. These are fixed-mix estimates, not bills from separate Claude runs."},
  {question = "Can a company run Kimi K3 on premises?", answer = "In principle, a company could run it after Moonshot releases the model weights. As of July 19, 2026, Moonshot said release would occur by July 27. K3 has 2.8 trillion parameters, the values learned during training. Its mixture-of-experts design activates only part of the model for each token. Moonshot recommended at least 64 accelerators. This is data-centre infrastructure, not a server under somebody's desk."}
]
+++

{{< img src="kimi-k3-cover1.png" alt="Claude Code running Moonshot AI's Kimi K3." width="80%" priority="true" >}}

[Kimi K3 is Moonshot's new 2.8-trillion-parameter mixture-of-experts model](https://www.kimi.com/blog/kimi-k3). Its parameters are values learned during training. Because K3 uses several specialised components, only part of the model handles each token. It also accepts images and up to one million tokens of context in a request.

Together, those learned parameters form the model weights. Open weights are available for others to download and run. This is narrower than open source, which usually also provides training code and data.

Moonshot described K3 as the first model at this scale announced for an open-weight release. On July 19, 2026, those weights were not yet available. Moonshot said it would release them by July 27. Its launch post was unusually candid about the remaining gap. K3 still trailed Fable 5 and GPT-5.6 Sol overall, and its user experience was weaker.

As I wrote this article, Alibaba [announced Qwen 3.8](https://x.com/Alibaba_Qwen/status/2078759124914098291), another large model intended for open-weight release. Thinking Machines Lab had also released [Inkling](https://thinkingmachines.ai/news/introducing-inkling/), a US model with full weights available. Inkling has 975 billion total parameters and activates 41 billion for each token. Kimi is not a one-off anymore. There is now a queue.

I have burned millions of tokens through Claude Code by now. It is the agent harness that connects a model to files, tools, and coding tasks. My configuration works, the tools are where I expect them, and I know the rhythm of the harness.

I kept Claude Code and changed only the model behind it. [OpenRouter](https://openrouter.ai/), a request-routing service, sent the requests to Kimi K3.
{{< img src="kimi-in-claude.png" alt="Claude Code configured to use Moonshot AI's Kimi K3 through OpenRouter." width="80%" >}}
## First impression: slow

It felt slow. Very slow, at first. That was odd because third-party measurements pointed the other way. [Artificial Analysis](https://artificialanalysis.ai/models/comparisons/kimi-k3-vs-claude-opus-4-8) reported speed in output tokens, the small units of a model's response. Around July 19, 2026, it measured about 62 per second for Kimi K3 and 57 for Claude Opus 4.8. K3 also began its responses sooner.

Maybe the difference was time spent reasoning before useful text appeared. Maybe it was the cadence of the stream. Maybe I have used Claude Code long enough that any different rhythm feels wrong. (_Or maybe routing through OpenRouter was the cause._)

Then, somewhere during the first hour, I stopped noticing. K3 had not suddenly become faster. It handled files, edits, and tool calls well enough that I forgot where the traffic was going.

## A quick frontend test

K3 was getting attention for frontend work when I tested it. [It ranked first on Code Arena](https://arena.ai/leaderboard/code/webdev) around July 19, 2026. Code Arena is a public leaderboard for generated web interfaces. I wanted a visual test rather than another coding benchmark. A benchmark is a standard task used to compare models.

I reused the detailed prompt and original assets from [this Lafys build](https://lafys.com/posts/ai-smart-solution-full-website-1783698696773). I assume the reference used Fable 5, although I cannot verify that.

{{< img src="section-1-productivity.png" alt="Reference design on the left and Kimi K3 reconstruction of the Productivity section on the right." width="100%" >}}

{{< img src="section-2-flexibility.png" alt="Reference design on the left and Kimi K3 reconstruction of the Flexibility section on the right." width="100%" >}}

{{< img src="section-3-unify-teams.png" alt="Reference design on the left and Kimi K3 reconstruction of the Unify Teams section on the right." width="100%" >}}

{{< img src="section-4-team-created.png" alt="Reference design on the left and Kimi K3 reconstruction of the Team Created section on the right." width="100%" >}}

_I know this is one run, with very specific instructions and the original assets. Give the model a vaguer prompt and the result may fall apart. I did not run a control trial or calculate an objective similarity score._

## Cost

The OpenRouter export covered 115 requests. It logged 13.64 million prompt tokens carrying instructions and context, plus 82,307 output tokens carrying model responses. Of those prompt tokens, 12.95 million were cache hits, which reuse earlier input at a lower price. Nearly 95% of the prompt tokens were cached. Total cost: $7.18.

I then applied Anthropic's published list prices to that recorded traffic mix. The calculation gives about $11.96 for Claude Opus 4.8 and $23.92 for Claude Fable 5. These are estimates, not bills from separate Claude runs. The other models might generate different token volumes or cache patterns.

Under this fixed-mix assumption, Kimi was roughly 40% cheaper than Opus and 70% cheaper than Fable.

## Is it an Opus replacement?

No. Not for me.

Opus still feels more dependable when the work gets difficult. It is better at knowing when to stop and at handling ambiguity. It is also less likely to make an energetic decision I did not ask for.

Moonshot listed excessive proactiveness and sensitivity to the surrounding software among [K3's limitations](https://www.kimi.com/blog/kimi-k3#:~:text=Excessive%20proactiveness.). That matches parts of my experience.

I would not call K3 a Fable 5-class model either.

But below Fable and Opus the air gets thin very quickly. K3 is close enough that many users may not care about the remaining difference. Others may care less about that gap than the price.

## So where do we go from here?

In the days before July 19, 2026, the takes went in every direction.

Kimi K3 is the end of the American model moat. Kimi K3 is benchmark theatre. Open weights make closed models obsolete. Open weights are irrelevant if running the thing costs a small data centre. China is deliberately commoditising the layer on which a large part of the US market is now betting. Or there is no master plan and Chinese labs are releasing good models because good models bring developers, usage and prestige.

A less dramatic list from my notes looks like this:

- $/token is a poor comparison when models use very different numbers of tokens.
- Public benchmarks are easier to optimise for and may not separate the best models well.
- Open weights put a ceiling on API prices even if most users never self-host.
- The model is becoming replaceable; the harness, data and workflow may not be.
- Value may move up into applications and down into chips, power and the systems that serve model responses.
- Open weights help with control and privacy, but "open" does not mean cheap to run.
- Export controls can slow Chinese labs and, at the same time, give them a reason to build around the US stack.
- The biggest threat is not necessarily that Kimi becomes number one. It is that nobody stays number one for long.

As of July 19, 2026, [Epoch AI](https://epoch.ai/data-insights/open-closed-eci-gap) estimated that the best open-weight models trailed the most capable closed models by only a few months. The exact gap depends on the benchmark, so public evaluations require care. Still, a short lag lets buyers wait, switch, or split workloads across providers. Personally, I think this can be distilled, yes, I know, into a threat and an opportunity.

## The threat

The threat is not that Kimi K3 is better than every American model. It is not.

The threat is that K3 may be good enough to make the premium harder to defend.

The large US labs are valued on more than technical competence. Their financial case assumes that frontier intelligence remains scarce and that the lead lasts. It also assumes that customers keep paying high margins for access.

A model can damage that story without taking first place. It only needs to remain close enough to the frontier at a lower price. Existing software must also accept it easily.

That is a bad combination for pricing power: a seller's ability to maintain high prices. It also weakens the model moat, the durable advantage that protects those prices.

Most enterprise software is sticky because switching is awful. Databases, operating systems, and core banking platforms accumulate years of dependencies. A language model behind an application programming interface (API) is different. The API already lets software exchange requests and responses with another system. The model may be important while remaining surprisingly easy to replace. My Claude Code test is the small version of that.

Closed labs still have ways to earn the premium. Reliability, tool use, and enterprise controls matter. Being six months ahead can be worth a lot when the task is valuable enough.

The timing is awkward because the infrastructure bill is enormous. I examined it in [AI Capex Arms Race: Who Blinks First?](https://philippdubach.com/posts/ai-capex-arms-race-who-blinks-first/). Capital expenditure (capex) buys long-lived assets such as data centres and graphics processing units (GPUs). Depreciation spreads an asset's cost across its useful life. The unresolved issue is how much revenue must arrive, and how quickly, to support these assets and their debt.

If model capability commoditises faster than revenue grows, the damage does not stop at the labs. It reaches large cloud providers, chipmakers, data-centre developers, utilities, and their lenders. A cheaper Kimi is good for users and potentially bad for whoever underwrote scarcity.

The same substitutability also weakens export-control leverage.

The US controls much of the closed-model frontier and the hardware underneath it. That creates leverage while other countries depend on the same stack. Restricting chips and APIs may preserve the lead, but it can also make a parallel stack more valuable.

I examined the other side in [Krugman, Fable 5, and Europe in Decline?](https://philippdubach.com/posts/krugman-fable5-europe-decline/). A provider or its government can cut off a closed model. Once operators have distributed open weights, nobody can switch them off in the same way. K3's promised weights were not yet available on July 19, 2026.

There is another, more mundane risk: we may be overrating the model.

Every launch now comes with a dense page of benchmark wins. Some use different harnesses, budgets, or settings chosen for one model. Others are saturated, so top scores cluster too closely to distinguish models. A model that looks brilliant on a leaderboard can still be unpleasant over a long session.

## The opportunity

At lower prices, more tasks become worth attempting. Agents combine models and tools to complete those tasks. They can take more passes, read more context, and handle work that does not justify Fable pricing. Lower unit costs may not shrink the market at all.

What interests me more is separation. The interface, agent, and model do not have to come from the same company.

A routine refactor can go to a cheaper model. A difficult architecture decision can go to Opus. Sensitive material can stay on a private deployment. Frontend work can go to whichever model happens to be best at it that month.

The durable product may be the surrounding workflow rather than any single model. Its router selects a model, while its context layer supplies the right information. A validation loop checks the result and sends corrections when needed.

Open weights also matter beyond price. An organisation can fine-tune them for a specific task or quantise them to reduce hardware needs. It can then run the model on premises, under its own controls.

Private deployment changes who answers the hard operational questions. Data residency covers where processing and storage occur; retention covers how long data remain stored. Continuity asks whether the service survives supplier or network failures. Local control does not automatically make a deployment secure or compliant.

## So what?!

I do not think Kimi K3 kills Anthropic. I do not think one frontend reconstruction proves parity. On July 19, 2026, I would still choose Opus for the hardest coding work.

But K3 was good enough that I forgot I was using it. It cost materially less. It ran inside the harness I already liked. Moonshot said the weights would be available by July 27 to anyone willing to provide the hardware.

Closed labs now need a lead that is large enough to matter and durable enough to defend. They also need customers who will keep paying for each extra gain as switching becomes routine.

For the operational version of this argument, read [Put the Model in the Basement](https://philippdubach.com/posts/put-the-model-in-the-basement/). It tests a Swiss business case built around data residency, control and continuity.
