+++
title = "MCP vs A2A: How AI's Protocol War Ends"
seoTitle = "MCP vs A2A: The Agentic AI Protocol War Explained"
date = 2026-03-15
lastmod = 2026-03-15
publishDate = 2026-03-15T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-agentic-ai-standards-war1.jpg"]
description = "MCP leads with 97M monthly SDK downloads and 10,000+ servers. A2A fills a different layer. Analysis of the agentic AI standards war with historical parallels."
keywords = ["MCP vs A2A", "MCP protocol", "A2A protocol", "model context protocol", "agent to agent protocol", "agentic AI standards", "agentic AI protocols", "AI agent interoperability", "Agentic AI Foundation", "enterprise AI architecture", "AI protocol war", "MCP adoption", "MCP security", "multi-agent systems", "agent orchestration", "agentic AI market", "AI agent standards", "MCP server ecosystem"]
categories = ["AI", "Tech"]
type = "Analysis"
draft = true
takeaways = [
  "MCP reached 10,000+ servers and 97 million monthly SDK downloads before A2A launched, compounding a five-month head start into a structural ecosystem lead.",
  "OpenAI adopting MCP in March 2025 mirrors the iMac's USB-only bet in 1998: one player so central to the ecosystem that their adoption made the standard inescapable.",
  "The agentic AI market is $7-8 billion in 2025, with analyst projections ranging from $50 billion to $199 billion by 2034 at 40-50% annual growth.",
  "53% of MCP servers still rely on static credentials rather than OAuth, and a critical npm package vulnerability (CVE-2025-6514) exposed 437,000+ installations to shell injection.",
]
faq = [
  {question = "What is the difference between MCP and A2A?", answer = "MCP connects AI agents to tools and data sources (agent-to-tool). A2A connects agents to each other for multi-agent collaboration (agent-to-agent). They operate at different architectural layers and are complementary, not competing."},
  {question = "Do I need both MCP and A2A?", answer = "For most enterprise deployments, start with MCP for tool integration, then layer A2A when you need multi-agent coordination across organizational boundaries. AWS, Microsoft, Salesforce, SAP, and IBM already support both protocols."},
  {question = "Who governs MCP and A2A?", answer = "MCP is governed by the Agentic AI Foundation (AAIF) under the Linux Foundation, with 146 member organizations including Anthropic, OpenAI, and Block. A2A has its own Linux Foundation governance body with 150+ partner organizations."},
  {question = "Is MCP secure for enterprise use?", answer = "MCP security is still maturing. Astrix Security found 53% of MCP servers rely on static credentials rather than OAuth. Enterprise deployments should audit server authentication and review dependencies carefully before production use."},
  {question = "Will MCP or A2A win the protocol war?", answer = "MCP holds a commanding ecosystem lead with 10,000+ servers and 97M monthly downloads. But A2A fills a different architectural layer (agent-to-agent vs. agent-to-tool), making coexistence more likely than winner-takes-all."},
]
+++

On March 26, 2025, [Sam Altman posted three sentences](https://x.com/sama/status/1904957253456941061) that made the AI industry blink: "people love MCP and we are excited to add support across our products." MCP is Anthropic's Model Context Protocol. OpenAI is Anthropic's most direct competitor. Altman was endorsing a rival's standard.

That post may be the most significant event in enterprise AI infrastructure this year. When your main competitor adopts your protocol, the war is close to over.

I've been watching this play out since [Anthropic launched MCP in November 2024](https://www.anthropic.com/news/model-context-protocol), and I want to work through what's actually happening: who controls what, what "interoperability" means in practice, and whether any of this follows patterns we've seen before. It does. Quite closely.

## What MCP actually is and why the numbers matter

MCP is a client-server protocol, licensed MIT, built on JSON-RPC 2.0. The mental model is simple: an AI agent (the host) connects through a client to MCP servers that expose tools, data sources, and context. Instead of building a bespoke integration every time Claude or GPT needs to talk to Salesforce, GitHub, or your internal database, you build one MCP server. Any compatible host can then use it.

The problem it solves, which explains why it spread so fast, is that without a standard like this, integration complexity grows quadratically. Every new AI model times every new tool equals a new custom integration. MCP makes it linear. That's the whole pitch, and it works.

By December 2025, [Anthropic's own count](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation) put the public MCP server ecosystem at **10,000+** active servers and **97 million** monthly SDK downloads across the Python and TypeScript SDKs. [GitHub's 2025 Octoverse report](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) flagged MCP as a standout, hitting **37,000 stars** in eight months. The unofficial registry mcp.so lists over 18,000 servers. Official SDKs now cover ten languages, including Python, TypeScript, Java, C#, Go, Kotlin, Rust, and Swift.

The companies building MCP integrations read like an attendance sheet for enterprise software: Microsoft, Salesforce, Cloudflare, GitHub, Stripe, Atlassian, Figma, Snowflake, Databricks, New Relic. At [Cloudflare's MCP Demo Day in May 2025](https://blog.cloudflare.com/mcp-demo-day/), Asana, PayPal, Sentry, and Webflow all shipped remote servers in a single afternoon. Gartner predicts 75% of API gateway vendors will have MCP features by 2026.

OpenAI's adoption went beyond Altman's post. MCP support rolled out across their Agents SDK (March 2025), [Responses API (May 2025)](https://openai.com/index/new-tools-and-features-in-the-responses-api/), [Realtime API (August 2025)](https://openai.com/index/introducing-gpt-realtime/), and [ChatGPT Developer Mode (September 2025)](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt-beta). The two companies later [co-authored the MCP Apps Extension](http://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/). You don't see that often between direct competitors.

One performance claim circulates in blog posts and marketing materials: that organizations implementing MCP report "40–60% faster agent deployment times." I have not found a primary source for this. No survey, no case study, no named company. I'd treat it as marketing content until someone produces the underlying data.

## Google's A2A fills a different layer

[Google launched A2A, the Agent-to-Agent protocol, at Cloud Next on April 9, 2025](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/), five months after MCP. The framing matters: Google didn't position A2A as a replacement. They called it a complement. I think that's honest, but it takes a minute to see why.

MCP connects an agent to tools; A2A connects agents to each other. That's not a cosmetic distinction. The two protocols produce genuinely different behavior.

When an MCP host calls an MCP server, it knows exactly what it's getting: structured tool descriptions, specific function signatures, predictable outputs. The agent can see inside the tool. A2A works differently. Agents remain opaque to each other. An A2A agent publishes an "Agent Card," a JSON metadata document at a well-known URL, describing its capabilities and authentication requirements. Other agents discover it, negotiate tasks through a defined lifecycle (submitted, working, input-required, completed), and collaborate without sharing memory or internal state.

Google's own documentation uses a repair shop analogy. MCP is how the mechanic uses diagnostic equipment. A2A is how the customer talks to the shop manager, or how the manager coordinates with a parts supplier. It works: both conversations happen in a real repair shop, and cutting either one doesn't simplify anything.

A2A [launched with 50+ partner organizations](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) and [grew to 150+ by July 2025](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade). The list includes Atlassian, Salesforce, SAP, ServiceNow, McKinsey, BCG, Accenture. [Google donated A2A to the Linux Foundation in June 2025](https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/). [IBM's competing Agent Communication Protocol merged into A2A in August](https://lfaidata.foundation/communityblog/2025/08/29/acp-joins-forces-with-a2a-under-the-linux-foundations-lf-ai-data/), with IBM's engineers joining the technical steering committee.

As of February 2026, A2A has roughly **21,900 GitHub stars**, about 40% of MCP's total. That gap tells you most of what you need to know about the current state of the race.

{{< img src="mcp-vs-a2a-protocol-race.png" alt="Exhibit comparing MCP and A2A protocol adoption: MCP leads with 37,000 GitHub stars, 18,000+ public servers, 97M monthly SDK downloads, and 10 SDK languages versus A2A at 21,900 stars, no public registry, and 3 languages" width="80%" >}}

## What history tells us about how this ends

Standards wars have a consistent pattern. The winner is almost never the technically superior option. It's the option that gets deployed first, stays open enough to attract builders, and reaches a critical mass before anyone can dislodge it.

TCP/IP and OSI are the canonical example. The OSI model, published by ISO in 1983, was architecturally more rigorous than TCP/IP's four-layer stack. It had real institutional backing: the US Commerce Department published its GOSIP mandate in August 1988, with formal enforcement beginning in 1990. European governments followed. OSI still lost. TCP/IP won because it had running code, freely available implementations bundled with BSD Unix workstations, while OSI remained elegant theory trapped in committee processes. By 1994 the outcome was obvious. David Clark's [IETF motto captures why](https://groups.csail.mit.edu/ana/People/DDC/future_ietf_92.pdf): "We reject kings, presidents and voting. We believe in rough consensus and running code."

VHS versus Betamax is the other lesson people cite, often incorrectly. Betamax had better picture quality. VHS won anyway, and the usual explanation is the movie library. That's part of it. But JVC openly licensed VHS to manufacturers across the industry, which drove prices down and built a content ecosystem Sony couldn't match. By 1987, [VHS held 90% of the US VCR market](https://en.wikipedia.org/wiki/Videotape_format_war). Sony conceded in 1988 by manufacturing VHS players. Ecosystem breadth, once established, creates a gravitational field that technical superiority alone can't escape.

USB is a more recent example with a twist. The consortium, Compaq, DEC, IBM, Intel, Microsoft, NEC, Nortel, formed in 1994 and [shipped USB 1.0 in January 1996](https://ethw.org/Milestones:Universal_Serial_Bus_\(USB\),_1996). Adoption was sluggish until [Apple shipped the iMac G3 in August 1998](https://en.wikipedia.org/wiki/IMac_G3) with only USB ports, forcing the entire peripheral industry to follow. I think of this as the "catalyst event": a player so central to an ecosystem that their adoption makes the standard inescapable for everyone connected to them. OpenAI adopting MCP in March 2025 is MCP's iMac moment.

But USB also offers a warning. USB-C's physical connector won universally, then the underlying protocol fragmented. The same connector could carry anything from USB 2.0 to USB4, 5W to 240W of power, depending on what you plugged together. [The EU eventually legislated convergence through its Radio Equipment Directive, which took effect December 28, 2024](https://single-market-economy.ec.europa.eu/sectors/electrical-and-electronic-engineering-industries-eei/radio-equipment-directive-red/one-common-charging-solution-all_en). A standard can win and still fragment when nobody governs the details.

{{< img src="standards-war-precedents.png" alt="Exhibit comparing historical standards wars: TCP/IP versus OSI decided by running code, VHS versus Betamax decided by open licensing, USB decided by Apple iMac catalyst event, all paralleling MCP ecosystem-first trajectory" width="80%" >}}

## What to actually do right now

[The Linux Foundation's Agentic AI Foundation (AAIF), launched December 9, 2025](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) with Anthropic, OpenAI, and Block as co-founders, [now has 146 member organizations](https://www.linuxfoundation.org/press/agentic-ai-foundation-welcomes-97-new-members), including JPMorgan Chase, American Express, Autodesk, Red Hat, and Huawei. A2A has its own Linux Foundation governance body. MCP sits within AAIF. Both are under the same umbrella, but they're not the same project.

This is the governance structure you typically see after a standards war has been decided in principle but before the implementation details have been hammered out. Think of the W3C in 1994, not the W3C in 1998.

For anyone making architectural decisions right now, the practical question isn't MCP versus A2A. Most major enterprise platforms already support both. Salesforce, SAP, IBM, Microsoft, and AWS have committed to both. The question is sequencing and depth.

[ISG analyst David Menninger](https://research.isg-one.com/analyst-perspectives/a2a-v-mcp-why-ai-agents-need-both) put it clearly: "MCP first for sharing context; then A2A for dynamic interaction among agents." That's the sequence I'd follow. MCP is the more mature protocol with the larger server ecosystem. The 10,000+ existing servers represent integration work that doesn't need to be rebuilt. Start there. Layer A2A on top when your use cases require multi-agent coordination across organizational boundaries, supply chain, cross-platform orchestration, which is exactly where the Tyson Foods and Adobe deployments have landed.

MCP security deserves a separate conversation. [Astrix Security's research](https://astrix.security/learn/blog/state-of-mcp-server-security-2025/) found that 53% of MCP servers rely on static credentials rather than OAuth. A critical vulnerability in the mcp-remote npm package (CVE-2025-6514) exposed 437,000+ installations to shell injection. TCP/IP had its share of early-stage security problems in the 1980s, so I'm not calling this fatal. But these are real vulnerabilities, and they will cause real incidents before the posture matures.

The agentic AI market is already large. Multiple analyst firms converge on an agentic AI market of roughly **$7–8 billion in 2025**, growing at 40–50% annually, with projections ranging from [$50 billion by 2030](https://www.grandviewresearch.com/industry-analysis/ai-agents-market-report) to [$199 billion by 2034](https://www.precedenceresearch.com/agentic-ai-market). NVIDIA's CUDA is the comparison that matters: 4 million developers, 15 years of compounding library investment, and switching costs that produce [$130.5 billion in annual revenue at 73% gross margins](https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2025). MCP's 97 million monthly downloads aren't CUDA yet. But the trajectory points the same direction.

{{< img src="agentic-ai-market-trajectory.png" alt="Exhibit showing agentic AI market projections from $7-8 billion in 2025 to $50 billion by 2030 and up to $199 billion by 2034, with consensus 45% CAGR and comparison to NVIDIA CUDA $131B annual revenue" width="80%" >}}

My best guess, and I want to be clear it's a guess: MCP becomes the foundational infrastructure layer, A2A becomes the coordination layer, much as TCP handles transport while HTTP handles application-layer communication. Different floors of the same building. The question I'd actually watch is whether 146 AAIF members can hold coherent standards against the competitive pressure of [over 1,000 active agentic AI startups](https://tracxn.com/d/sectors/agentic-ai/__oyRAfdUfHPjf2oap110Wis0Qg12Gd8DzULlDXPJzrzs), each with economic incentives to differentiate. That's the USB-C problem showing up early. I genuinely don't know how it resolves.
