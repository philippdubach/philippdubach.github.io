+++
title = "Krugman, Fable 5, and Europe in Decline?"
seoTitle = "US AI Export Controls, Fable 5, and Europe's Real Decline"
slug = "krugman-fable5-europe-decline"
date = 2026-06-22
lastmod = 2026-06-22
publishDate = 2026-06-21T03:00:00Z
images = ["https://static.philippdubach.com/cover-fable5-europe-decline1.png"]
card_image = "https://static.philippdubach.com/cover-fable5-europe-decline1.png"
description = "US export controls switched off Anthropic's Fable 5 for every non-American. Europe's real decline isn't productivity; it's losing access to frontier AI."
keywords = ["US AI export controls", "AI kill switch Europe", "European tech sovereignty", "is Europe in economic decline", "Anthropic Fable 5 Mythos 5", "AI Diffusion Rule", "weaponized interdependence", "frontier model export controls", "AI model weights export control", "ASML EUV lithography", "Draghi report", "Cloud and AI Development Act", "Chips Act 2.0", "AI compute gap Europe", "US CLOUD Act data sovereignty", "Paul Krugman Europe productivity", "sovereign AI Europe"]
categories = ["AI", "Macro"]
type = "Analysis"
draft = false
unlisted = false
takeaways = [
  "On May 21, 2026, Paul Krugman called Europe's decline mostly a measurement artifact, with one exception he flagged as 'now very real': being cut off from strategic technology.",
  "A June 12, 2026 US export-control directive forced Anthropic to suspend Fable 5 and Mythos 5 for all foreign nationals worldwide, and it stayed off through June 21.",
  "Europe owns ~100% of EUV lithography through ASML but depends on the US for GPUs, a Synopsys-Cadence design-software duopoly above 90%, ~70% of its cloud market, and the closed-model frontier.",
  "Europe's measured share of global AI compute is 4.8%, against the United States' 74.5%.",
]
faq = [
  {question = "Did the US shut off AI access for Europe?", answer = "Effectively yes. On June 12, 2026, a US export-control directive forced Anthropic to suspend its Fable 5 and Mythos 5 models for all foreign nationals, which in practice meant a global shutoff. As of June 21 access hadn't been restored, the first clear use of an AI 'kill switch.'"},
  {question = "Why did Anthropic suspend Fable 5 and Mythos 5?", answer = "A US government export-control order required it, citing national security after a claimed jailbreak. Anthropic disputed the basis, calling the flagged flaw a 'narrow, non-universal jailbreak' available from other models, but complied because it couldn't screen users by nationality in real time."},
  {question = "What is the AI Diffusion Rule and why was it rescinded?", answer = "A January 2025 US rule that sorted the world into three tiers for AI-compute access and split the EU into two of them. It was rescinded in May 2025 because, in the government's words, it 'downgraded' allies to second-tier status, confirming that allied access was a discretionary privilege."},
  {question = "Is Europe in economic decline compared to the US?", answer = "On living standards, mostly no. Paul Krugman shows the productivity 'decline' is largely a price-index artifact and the median gap is roughly stable. The real decline is strategic: Europe consumes frontier technology it neither builds nor controls, and can now be cut off from it."},
  {question = "What is the EU tech sovereignty package?", answer = "A June 2026 set of EU proposals, including Chips Act 2.0 and the Cloud and AI Development Act, meant to cut Europe's dependence on US and Asian chips, cloud, and AI. Its launch line, 'we want to be sure nobody has a kill switch,' concedes the dependence it is trying to fix."},
  {question = "Why does ASML matter for European tech sovereignty?", answer = "ASML is the only maker of EUV lithography, the machines required to build leading-edge chips, making it Europe's strongest chokepoint. But Europe still depends on the US for GPUs, design software, cloud, and frontier models, so one node doesn't add up to autonomy."},
  {question = "What is weaponized interdependence?", answer = "A concept from Henry Farrell and Abraham Newman: when an economy runs through a few hubs, whoever controls a hub can cut off everyone downstream, the 'chokepoint effect.' The US-controlled AI stack of chips, cloud, and models is a textbook case."},
  {question = "Do open-weight models like DeepSeek bypass US export controls?", answer = "Partly. Open weights leak and trail the closed frontier by only months, so the models themselves are hard to embargo. But the binding dependence is the cloud, APIs, and chips underneath, which can't be downloaded, so the chokepoint still holds."},
]
+++

{{< img src="cover-fable5-europe-decline1.png" alt="A flat editorial illustration of a wall light switch flipped down to OFF, with the word OFF in red beside it, encircled by the twelve stars of the European Union flag dimmed to grey — Europe's access to frontier AI switched off." width="80%" priority="true" >}}

On May 21, [Paul Krugman](https://paulkrugman.substack.com/p/challenging-the-narrative-of-european-478) wrapped up a long argument that the European continent isn't really in economic decline. With one exception: Europe, he writes, "can't be sure that it will always have access to new technologies developed and produced in the other superpowers," and "the risk of being cut off from strategically important technologies, once minimal, is now very real." Twenty-two days later a US directive switched off a frontier AI model for every non-American (well technically - currently - also every American).

His argument ([Noah Smith](https://www.noahpinion.blog/p/yes-europeans-are-poorer-than-americans) and the Garicano brothers on the other side) turns on a paradox: Since 2000, US measured productivity grew much faster than Europe's at constant prices, yet relative output per hour at current-price PPP barely moved, from about 86% of the US level to about 87%. Krugman reads the flat current-price line as closer to reality and the [diverging constant-price line](https://paulkrugman.substack.com/p/modeling-the-us-europe-paradox-very) as a price-index shadow of concentrated, fast-deflating US tech. His critics read the divergence as real, captured as profit and equity instead of passed through to consumers.

{{< img src="fable5-europe-decline-productivity-paradox1.png" alt="Line chart of euro-area output per hour as a percentage of the US, 2000 to 2024. The constant-prices line falls from about 104% to about 87%; the current-prices (PPP) line stays roughly flat near 86 to 87%. The two converge near 87%." width="80%" >}}

On the question, whether the typical European is getting poorer, I'm mostly with Krugman. The median gap is roughly stable, his California-versus-rest-of-US comparison is hard to argue with, and constant-price productivity is a lousy proxy for how people actually live. For the most part, Europe is a fine place to live and isn't falling apart.

{{< readnext slug="europes-24-trillion-payment-breakup-is-really-a-bet-on-infrastructure-arbitrage" >}}

## Technology you don't own

>the big benefits of IT come from applying it, rather than creating it

and Europe applies it well. True. There's an assumption buried inside "apply, don't create," and it's that access stays frictionless and apolitical: the model, the GPUs under it, and the cloud it runs on will all be there at the world price. That assumption died on June 12. [Henry Farrell and Abraham Newman](https://www.foreignaffairs.com/united-states/weaponized-world-economy-farrell-newman) have a name for what replaced it, weaponized interdependence. They call it the chokepoint effect: when an economy runs through a few hubs, whoever owns a hub can shut off everyone downstream.

## Lithography

Lithography is [ASML](https://www.asml.com/en/investors), roughly 100% of EUV, the machines nobody builds a leading-edge chip without, €32.7bn in 2025 sales. That's Europe's one real card. Fabrication is [TSMC](https://www.trendforce.com/), around 70% of the foundry market, in Taiwan. The accelerators are [Nvidia](https://hai.stanford.edu/ai-index/2026-ai-index-report), 80 to 90% of AI-chip revenue and well over half the world's AI compute, locked behind CUDA. The design software is [Synopsys and Cadence](https://www.semianalysis.com/), a US near-duopoly above 90%, with Siemens EDA the only European player at about 13% and even that built on US tech. The cloud is AWS, Microsoft and Google, about [70% of the EU market](https://www.srgresearch.com/), sitting under US legal jurisdiction. And the model frontier is US labs almost top to bottom, with Mistral the one European name that shows up and [DeepSeek](https://www.deepseek.com/) proving China can stand up a parallel stack under sanctions.

{{< img src="fable5-europe-decline-ai-stack-chokepoints1.png" alt="Horizontal bar chart, 'Europe owns one rung of the AI stack.' EUV lithography is 100% European-controlled through ASML; leading-edge fabrication (70%), AI accelerators/GPUs (85%), chip-design software/EDA (90%), hyperscale cloud (70%) and frontier models (70%) are US-controlled." width="80%" >}}

The map is lopsided. Europe owns the single hardest chokepoint in the chain and buys everything else. In share of global GPU-cluster performance the US holds [74.5%, China 14.1%, the EU 4.8%](https://epoch.ai/data-insights/ai-supercomputers-performance-share-by-country). And even the ASML card is partly held in Washington, through US content inside the machines and the [Foreign Direct Product Rule](https://www.federalregister.gov/agencies/industry-and-security-bureau), which reaches foreign-made goods built with US technology.

{{< readnext slug="when-ai-labs-become-defense-contractors" >}}

## At Washington's discretion

The usual objection is that governments threaten this stuff but rarely do it to allies. Lately they've been doing it. In January 2025 the US issued the [AI Diffusion Rule](https://www.federalregister.gov/documents/2025/01/15/2025-00636/framework-for-artificial-intelligence-diffusion), which sorted the whole world into tiers for compute access and split the EU down the middle: ten members in the license-free top tier, seventeen in a capped second tier. In May the administration [rescinded the rule](https://www.bis.gov/press-release/department-commerce-announces-rescission-biden-era-artificial-intelligence-diffusion-rule-strengthens) and said, in writing, that it "would have undermined U.S. diplomatic relations with dozens of countries by downgrading them to second-tier status." Treating allied compute access as a tiered privilege was judged too costly diplomatically.

What is worse than a bad rule for a (dependent) ally? No rule at all. It's discretion. Deal-by-deal grants to the Gulf states. A [15% cut of Nvidia's China revenue](https://www.npr.org/2025/08/11/nx-s1-5498689/trump-nvidia-h20-chip-sales-china) paid to the US government in exchange for export licenses, which one lawmaker said tells China and US allies alike that "American national security principles are negotiable for the right fee." And then Fable 5. The [June 12 directive](https://www.anthropic.com/news/fable-mythos-access) told Anthropic to cut off the models for "any foreign national, whether inside or outside the United States," and since the company [can't check passports in real time](https://support.claude.com/en/articles/14328960-identity-verification-on-claude), the real-world result was a global shutoff. Anthropic disagreed with the basis, saying the flagged vulnerability was "a narrow, non-universal jailbreak" you can get from other models, and warned the standard "would essentially halt all new model deployments." Legal analysts at [Lawfare](https://www.lawfaremedia.org/article/a-kill-switch-for-frontier-ai) and [Tech Policy Press](https://www.techpolicy.press/did-the-us-government-just-set-an-ai-export-precedent-by-blocking-mythos/) noted a real shift: export powers built for physical goods get stretched over a live API, one enforcement decision at a time, until the decisions start working like a rule.

## Tail risk

Krugman's average-welfare case and the security case answer different questions, the mean versus the tail. Dependence is cheap and harmless almost all the time. It's a catastrophe in the bad state of the world. Nobody prices flood insurance off the average year.

Which is why the good objections don't actually sink the point. Open weights leak: [DeepSeek-R1](https://www.deepseek.com/) matched a top US model at about one twenty-seventh of the inference cost, and [Epoch finds](https://epoch.ai/data-insights/open-closed-eci-gap) open models trail the closed frontier by maybe four months. Granted. But the dependence that binds isn't the downloadable file, it's the cloud, the API, the update cycle, and the chips underneath, and none of those are fungible. ASML gives Europe real leverage back: a US that cut Europe off would invite a Dutch response that chokes the whole leading-edge chain, US fabs included. Also true, and it lowers the odds of a cutoff. It does nothing about how bad one would be, and the whole point is how bad, not how likely. China's parallel stack shows decoupling is survivable. It also shows it's expensive, and probably a step behind.

## Scorecard

The giveaway is that Europe's own institutions already buy the argument, under gentler names. Mario Draghi's [competitiveness report](https://commission.europa.eu/topics/eu-competitiveness/draghi-report_en) called the dependence an existential challenge, warned of "slow agony," asked for something like €800bn a year, and, more striking than any of that, concluded "it is too late for the EU to try and develop systematic challengers to the major US cloud providers." The [EU Chips Act](https://www.eca.europa.eu/en/publications/SR-2025-12) waves a €43bn headline around, of which only about €3.3bn is fresh EU money, against the US CHIPS Act's $52.7bn. The European Court of Auditors called the bloc's 20%-by-2030 chip-share target "very unlikely" and put the realistic number closer to 11.7%. Europe's reflex is to regulate from strength and then quietly back off when the [AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) starts to cost something.

{{< img src="fable5-europe-decline-chip-funding-gap1.png" alt="Bar chart, 'Europe's chip answer is mostly headline.' The US CHIPS Act is $52.7bn; the EU Chips Act is a €43bn headline, of which only €3.3bn is fresh EU money." width="80%" >}}

The [June 2026 tech-sovereignty package](https://www.cnbc.com/2026/06/03/europe-tech-sovereignty-us-tech-reliance.html) shipped with a line from the Commission's own digital chief: "we want to be sure nobody has a kill switch." Former French prime minister Édouard Philippe put it more plainly after Fable 5: infrastructure whose models and compute you don't control "is an infrastructure that others can unplug." A week later, with [G7 leaders meeting at Evian and VivaTech opening in Paris](https://www.euronews.com/my-europe/2026/06/17/ai-takes-centre-stage-at-g7-as-western-fears-over-us-kill-switch-get-real), the dependency had stopped being a white-paper abstraction.

{{< readnext slug="dora-critical-cloud-providers-sovereignty" >}}

## Footnote

Krugman moved the worry from productivity to geopolitics and treated that as filing it away. It was the opposite. The thing European policymakers should actually fear isn't the GDP-per-hour line he correctly takes apart. It's being a revocable second-tier customer in somebody else's licensing regime.
