+++
title = "I Tried Kimi K3 Inside Claude Code"
cta_pitch = "I write every few weeks about AI, sovereignty and the economics underneath both. Get the next one."
seoTitle = "Testing Moonshot AI's Kimi K3 Inside Claude Code"
slug = "kimi-k3-inside-claude-code"
date = 2026-07-19
lastmod = 2026-07-19
publishDate = 2026-07-19T10:00:00Z
images = ["https://static.philippdubach.com/kimi-k3-cover1.png"]
card_image = "https://static.philippdubach.com/kimi-k3-cover1.png"
description = "I routed Claude Code through Moonshot AI's Kimi K3, rebuilt a frontend, compared the bill with Claude Opus 4.8 and Fable 5, and sketched what cheap open-weight models could mean for sovereign AI."
keywords = ["Kimi K3", "Moonshot AI", "Claude Code", "OpenRouter", "open-weight models", "AI coding models", "Frontend Arena", "Claude Opus 4.8", "Claude Fable 5", "Qwen 3.8", "Inkling", "sovereign AI", "on-premise AI", "Swiss AI infrastructure"]
categories = ["AI"]
type = "Experiment"
draft = false
unlisted = false
takeaways = [
  "Inside Claude Code, Kimi K3 was good enough that I soon stopped thinking about which model was behind the interface.",
  "The model felt slower than its measured output speed suggests, but it produced a close frontend reconstruction from a detailed prompt and asset pack.",
  "My exported run cost $7.18. The same recorded token mix would have cost about $11.96 on Claude Opus 4.8 and $23.92 on Claude Fable 5 at published list prices.",
  "The larger opportunity may be sovereign AI: open weights hosted on local infrastructure and sold on residency, control and auditability rather than on tokens alone."
]
faq = [
  {question = "Can Kimi K3 be used inside Claude Code?", answer = "Yes. I routed Claude Code through OpenRouter and selected Moonshot AI's Kimi K3 as the underlying model. The Claude Code interface and most of the workflow stayed the same."},
  {question = "Is Kimi K3 better than Claude Opus 4.8?", answer = "Not in my experience. Opus still feels more dependable on difficult coding work. Kimi K3 was closer than I expected, though, and much cheaper for the token mix in this test."},
  {question = "How much did the Kimi K3 test cost?", answer = "The exported activity log contained 115 requests, 13.64 million prompt tokens and 82,307 output tokens. It cost $7.18, helped by 12.95 million prompt-cache hits."},
  {question = "What would the same traffic have cost on Claude?", answer = "Applying Anthropic's published standard input, output and cache-hit prices to the same recorded token mix gives an estimated $11.96 for Claude Opus 4.8 and $23.92 for Claude Fable 5."},
  {question = "Can a company run Kimi K3 on premise?", answer = "In principle, once the weights are released. In practice it is a 2.8-trillion-parameter mixture-of-experts model and Moonshot recommends 64 or more accelerators, so this is data-centre infrastructure, not a server under somebody's desk."}
]
+++

{{< img src="kimi-k3-cover1.png" alt="Claude Code running Moonshot AI's Kimi K3." width="80%" priority="true" >}}

[Kimi K3 is Moonshot's new 2.8-trillion-parameter model](https://www.kimi.com/blog/kimi-k3), with native vision and a one-million-token context window. Moonshot calls it the first open model at this scale and says the weights will be released by July 27. Its own launch post is also unusually candid: it says K3 still trails Fable 5 and GPT-5.6 Sol overall, and that its user experience is not yet at the same level.

While I was writing this, Alibaba [announced Qwen 3.8](https://x.com/Alibaba_Qwen/status/2078759124914098291), another very large model headed for an open-weight release. This is also shortly after Thinking Machines Lab released [Inkling](https://thinkingmachines.ai/news/introducing-inkling/), a 975-billion-parameter US model with 41 billion active parameters and full weights available. Kimi is not a one-off anymore. There is now a queue.

I have burned millions of tokens through Claude Code by now. My config works, the tools are where I expect them to be, and I know rhythm of the harness. 

So I kept Claude Code and using [OpenRouter](https://openrouter.ai/), I routed the requests to Kimi K3.
{{< img src="kimi-in-claude.png" alt="Claude Code configured to use Moonshot AI's Kimi K3 through OpenRouter." width="80%" >}}
## First impression: slow

It felt slow. Very slow, at first.

Which is odd, because the measured numbers say otherwise. [Artificial Analysis](https://artificialanalysis.ai/models/comparisons/kimi-k3-vs-claude-opus-4-8) reports about 62 output tokens per second for Kimi K3 and 57 for Claude Opus 4.8. It also measures a much shorter time to first token for K3.

Maybe the difference was time spent reasoning before useful text appeared. Maybe it was the cadence of the stream. Maybe I have simply used Claude Code for long enough that anything with a different rhythm feels wrong. (_Or maybe it was just because I was going through openrouter._)

Then, somewhere during the first hour, I stopped noticing.

Not because K3 suddenly became faster. It handled files, edits and tool calls well enough that I forgot where the traffic was going.

## A quick frontend test

K3 has been getting attention for frontend work ([ranked #1 on Code Arena](https://arena.ai/leaderboard/code/webdev) right now), so I wanted something visual rather than another coding benchmark. I reused the prompt and assets from [this Lafys build](https://lafys.com/posts/ai-smart-solution-full-website-1783698696773). I assume the reference was made with Fable 5, although I cannot verify that. 

{{< img src="section-1-productivity.png" alt="Reference design on the left and Kimi K3 reconstruction of the Productivity section on the right." width="100%" >}}

{{< img src="section-2-flexibility.png" alt="Reference design on the left and Kimi K3 reconstruction of the Flexibility section on the right." width="100%" >}}

{{< img src="section-3-unify-teams.png" alt="Reference design on the left and Kimi K3 reconstruction of the Unify Teams section on the right." width="100%" >}}

{{< img src="section-4-team-created.png" alt="Reference design on the left and Kimi K3 reconstruction of the Team Created section on the right." width="100%" >}}

_I know his is one run, with very specific instructions and the original assets. Give the model a vaguer prompt and the result may fall apart._

## Cost

The OpenRouter export for this run contains 115 requests, 13.64 million prompt tokens and 82,307 output tokens. Of the prompt tokens, 12.95 million were cache hits. Total cost: $7.18.

Applying Anthropic's published list prices to that exact traffic mix gives about $11.96 for Claude Opus 4.8 and $23.92 for Claude Fable 5. In this run, then, Kimi came out roughly 40% cheaper than Opus and 70% cheaper than Fable.

## Is it an Opus replacement?

No. Not for me.

Opus still feels more dependable when the work gets difficult. It is better at knowing when to stop, better at handling ambiguity, and less likely to make an energetic decision I did not ask for. Moonshot itself lists excessive proactiveness and harness sensitivity among [K3's limitations](https://www.kimi.com/blog/kimi-k3#:~:text=Excessive%20proactiveness.), which matches parts of my experience.

I would not call K3 a Fable 5-class model either.

But below Fable and Opus the air gets thin very quickly. K3 is close enough that many users will not care about the remaining difference, or will care less than they care about the price.

## So where do we go from here?

The takes over the past few days have gone in every direction.

Kimi K3 is the end of the American model moat. Kimi K3 is benchmark theatre. Open weights make closed models obsolete. Open weights are irrelevant if running the thing costs a small data centre. China is deliberately commoditising the layer on which a large part of the US market is now betting. Or there is no master plan and Chinese labs are releasing good models because good models bring developers, usage and prestige.

A less dramatic list (from my notes) would look like this:

- $/token is a bad measure when models use very different numbers of tokens.
- Public benchmarks are easier to optimise for and worse at separating the top models.
- Open weights put a ceiling on API prices even if most users never self-host.
- The model is becoming replaceable; the harness, data and workflow may not be.
- Value moves up into applications and down into chips, power and inference infrastructure.
- Open weights help with control and privacy, but "open" does not mean cheap to run.
- Export controls can slow Chinese labs and, at the same time, give them a reason to build around the US stack.
- The biggest threat is not necessarily that Kimi becomes number one. It is that nobody stays number one for long.

[Epoch AI](https://epoch.ai/data-insights/open-closed-eci-gap) estimates that the best open-weight models trail the closed frontier by only a few months. Exact gaps move with the benchmark, and public evaluations should be read with care, but the direction is hard to miss. The lag is short enough that buyers can wait, switch or split workloads across providers. Personally, I think this can be distilled, yes, I know, into a threat and an opportunity.

## The threat

The threat is not that Kimi K3 is better than every American model. It is not.

The threat is that it may be good enough to make the premium harder to defend.

The large US labs are valued on more than technical competence. The financial case assumes that frontier intelligence stays scarce, that the lead lasts, and that customers keep paying high margins for access. A model can damage that story without taking first place. It only needs to sit close enough to the frontier, at a lower price, and be easy to slot into existing software.

That is a bad combination for pricing power.

Most enterprise software is sticky because switching is awful. Databases, operating systems and core banking platforms accumulate years of dependencies. A language model behind an API is different. The model may be deeply important while still being surprisingly easy to replace. My Claude Code test is the small version of that..

Closed labs still have ways to earn the premium. Reliability matters. Tool use matters. Enterprise controls matter. Being six months ahead can be worth a lot when the task is valuable enough. 

The timing is awkward because the infrastructure bill is enormous. I already wrote about this in [AI Capex Arms Race: Who Blinks First?](https://philippdubach.com/posts/ai-capex-arms-race-who-blinks-first/). The issue there was not whether AI creates value, but how much revenue has to arrive, and how quickly, to support the data centres, GPUs, debt and depreciation already being committed.

If model capability commoditises faster than revenue grows, the damage does not stop at the labs. It runs through hyperscalers, chipmakers, data-centre developers, utilities and the lenders financing the build-out. A cheaper Kimi is good for users and potentially bad for whoever underwrote scarcity.

Then there is the policy problem.

The US controls much of the closed-model frontier and much of the hardware underneath it. That is leverage, but only while the rest of the world remains dependent on the same stack. Restricting chips and APIs may preserve the lead but it can also make a parallel stack more valuable.

I wrote about the other side of this in [Krugman, Fable 5, and Europe in Decline?](https://philippdubach.com/posts/krugman-fable5-europe-decline/). A closed model can be cut off by its provider or by the provider's government. Once open weights have spread, they cannot be switched off in the same way. 

There is another, more mundane risk: we may be overrating the model.

Every launch now comes with a dense page of benchmark wins. Some are real. Some use different harnesses, different budgets or model-specific tuning. Some benchmarks are simply saturated. A model that looks brilliant in a leaderboard can still be unpleasant over a long session.

## The opportunity

At lower prices, more tasks become worth attempting. Agents can take more passes, read more context and handle work that is useful but not important enough to justify Fable pricing. Lower unit costs may not shrink the market at all. 

The more interesting opportunity is separation. The interface, agent and model do not have to come from the same company.

A routine refactor can go to a cheaper model. A difficult architecture decision can go to Opus. Sensitive material can stay on a private deployment. Frontend work can go to whichever model happens to be best at it that month. The durable product may be the router, context layer and validation loop rather than any single model.

This is also where open weights matter beyond price. They let an organisation fine-tune, quantise and deploy a model under its own controls. That does not automatically make the result secure or compliant, but it changes who gets to answer the hard questions about data location, retention, access and continuity.

## Put the model in the basement

Another thing I have been thinking about this for a while: In [How DORA Made Sovereignty a Bank Problem](https://philippdubach.com/posts/dora-critical-cloud-providers-sovereignty/) I argued that data sovereignty had made it's way into operations. Banks now have to think about concentration, exit plans, audit rights and what happens when a critical foreign provider changes the rules.

AI will (_or does_) get the same treatment. Until recently that came with a large capability penalty. The newer releases make the calculation less silly. Kimi K3 is huge and its weights are due shortly. Alibaba is pushing the Qwen family in the same direction. Then there is [Inkling](https://thinkingmachines.ai/news/introducing-inkling/) which matters (_maybe even more_) because it adds a serious US-trained model with full weights available, one-million-token context and a clear focus on customisation.

So let's do a back-of-the-napkin business case: Let's assume a Swiss provider running one 64-GPU cluster in Zurich and selling dedicated or managed K3-class inference to banks, pharmaceutical companies, government bodies and other customers that care about Swiss data residency.

{{< img src="swiss-sovereign-ai-business-case.png" alt="Back-of-the-napkin business case for a Swiss sovereign AI provider, with infrastructure assumptions, capex, monthly operating costs, customer mix, five-year projections and sensitivity cases." width="80%" >}}

The model uses roughly $7 million of initial capex, $370,000 of monthly operating cost, 70% utilisation and subscriptions between CHF 15,000 and CHF 50,000 per month. With those assumptions, one cluster reaches about CHF 7.4 million of annual revenue, CHF 3 million of EBITDA and a three-year payback.

The product would not really be tokens. It would be control: Swiss residency, a defined security perimeter, no training on customer data, audit access, contractual continuity and an exit route if the operator fails. Most companies will not literally put the model in the basement. They may pay somebody local to give them the functional equivalent.

There are reasons this may not work. A 2.8-trillion-parameter model is expensive to serve. One cluster is its own concentration risk. Hardware ages quickly. If utilisation drops, the economics get ugly. If a much smaller model performs nearly as well next year, the expensive rack becomes a monument to last year's benchmark. Even so, I think this market will exist. 

{{< readnext slug="dora-critical-cloud-providers-sovereignty" >}}

## So what?!

I do not think Kimi K3 kills Anthropic. I do not think one frontend reconstruction proves parity. And I would still choose Opus for the hardest coding work today.

But K3 was good enough that I forgot I was using it. It cost materially less. It ran inside the harness I already liked. Soon, its weights should be available to anybody willing to provide the hardware.

The question is no longer whether open models will catch the frontier in some abstract future. It is how much of a lead the closed labs need, how long they can hold it, and which customers will still pay for every extra point once switching becomes routine.