+++
title = "AI Capex Arms Race: Who Blinks First?"
seoTitle = "AI Capex 2026: The $690B Arms Race and FCF Collapse"
date = 2026-03-08
lastmod = 2026-03-08
publishDate = 2026-03-08T03:00:00Z
images = ["https://static.philippdubach.com/ograph/ograph-ai-capex-arms-race1.jpg"]
description = "Alphabet's free cash flow is on track to fall 90% in 2026. Amazon's is at $11B. The $690B AI capex buildout is cannibalizing the cash that justified these valuations."
keywords = ["AI capex 2026", "hyperscaler capital expenditure", "AI infrastructure bubble", "hyperscaler free cash flow", "GPU depreciation stranded assets", "AI capex vs revenue", "AI data center spending", "telecom bubble AI comparison", "AI ROI", "Sequoia 600 billion", "inference cost decline", "Dario Amodei AI spending"]
categories = ["Investing", "AI"]
type = "Analysis"
draft = true
unlisted = false
takeaways = [
  "The Big 4 hyperscalers are on track to spend $610–665 billion in 2026, roughly 70% above 2025 levels, with Goldman Sachs projecting cumulative 2025–2027 spend at $1.15 trillion",
  "Alphabet's free cash flow may fall from $73 billion to roughly $8 billion in 2026 as capex doubles; Amazon's is already compressed to $11 billion TTM with $200B guidance ahead",
  "Direct AI revenue covers roughly 15% of AI-specific capex: Sequoia's David Cahn calculated the ecosystem needs $600 billion in annual revenue to justify current infrastructure spending, against the roughly $50–100 billion it actually generates",
  "Inference costs are falling 50–200x per year (Epoch AI), meaning existing GPU infrastructure may become stranded faster than depreciation schedules assume",
]
faq = [
  {question = "How much is Big Tech spending on AI in 2026?", answer = "The Big 4 (Amazon, Alphabet, Meta, and Microsoft) are collectively guiding to $610–665 billion in 2026 capital expenditure, up from approximately $384 billion in 2025. Including Oracle, the figure reaches $660–690 billion. Goldman Sachs projects cumulative 2025–2027 spending at $1.15 trillion, more than double the $477 billion spent over the prior three years combined."},
  {question = "What is happening to Big Tech free cash flow?", answer = "It is compressing sharply. Alphabet's free cash flow held at $73 billion in 2025 despite capex nearly doubling, because operating cash flow grew 31.5%. But with 2026 capex guided at $175–185 billion, Pivotal Research projects FCF falling approximately 90% to $8.2 billion. Amazon's FCF is already at $11.2 billion TTM. BofA credit strategists found AI capex will consume 94% of operating cash flow minus dividends and share repurchases for the Big 4 in 2025–2026."},
  {question = "What is the AI capex to revenue ratio?", answer = "Rough estimates place direct AI revenue at $40–60 billion in 2025 against AI-specific capex of $290–330 billion (roughly 75% of total capex per CreditSights), yielding a coverage ratio of approximately 0.12–0.20x. Sequoia's David Cahn calculated that the AI ecosystem needs to generate $600 billion in annual revenue to justify current infrastructure spending. By 2026, with perhaps $80–120 billion in AI revenue against $450 billion in AI capex, the ratio may reach 0.18–0.27x, still far below 1x."},
  {question = "What did Dario Amodei say about AI spending risk?", answer = "On the Dwarkesh Podcast in February 2026, Anthropic CEO Dario Amodei said: 'If my revenue is not $1 trillion, if it's even $800 billion, there's no force on Earth, there's no hedge on Earth that could stop me from going bankrupt if I buy that much compute.' He warned that being off by a single year on growth forecasts could be fatal: 'What if the country of geniuses comes, but it comes in mid-2028 instead of mid-2027? You go bankrupt.'"},
  {question = "How fast are AI inference costs falling?", answer = "Epoch AI measured inference cost declines at a median 50x per year, accelerating to approximately 200x per year after January 2024. GPT-3-era processing cost around $20 per million tokens at launch in 2020; by early 2026, models of comparable capability cost roughly $0.07, a roughly 280-fold decline over five years. DeepSeek's R1 model priced API access at roughly $0.65 per million tokens, approximately 95% cheaper than OpenAI's o1 at launch."},
  {question = "How does AI infrastructure spending compare to the telecom bubble?", answer = "The scale is comparable: the telecom buildout invested over $500 billion (in 2000 dollars), financed mostly with debt, and by 2001 only 5% of installed fiber-optic capacity was in use. Key differences favor today's hyperscalers: they generate massive internal operating cash flows, whereas telecom builders were heavily debt-financed from the start. Key risks remain: AI hardware obsoletes far faster than fiber, inference cost deflation creates stranded asset risk, and the shift toward debt financing (J.P. Morgan projects $300 billion in investment-grade bonds for AI data centers in 2026 alone) is introducing telecom-era fragility."},
]
+++

Alphabet's free cash flow is projected to fall roughly **90%** in 2026. Not because the business is in trouble. Because the company has committed to spending **$83–93 billion more** on capital expenditure than it did last year.

That is what $660–690 billion in AI capex looks like up close. [Amazon guided to **$200 billion** alone](https://finance.yahoo.com/news/amazon-200-billion-ai-spending-153341517.html). Meta's long-term debt more than doubled to [**$58.7 billion**](https://www.sec.gov/Archives/edgar/data/1326801/000162828026003832/meta-12312025xexhibit991.htm) to help finance its share. [Goldman Sachs projects](https://www.goldmansachs.com/insights/articles/why-ai-companies-may-invest-more-than-500-billion-in-2026) cumulative 2025–2027 spending across the Big 4 at **$1.15 trillion**, more than double the $477 billion spent over the prior three years combined. BofA credit strategists found this will consume [**94% of operating cash flow minus dividends and buybacks**](https://techblog.comsoc.org/2025/11/01/ai-spending-boom-accelerates-big-tech-to-invest-invest-an-aggregate-of-400-billion-in-2025-more-in-2026/). The question is not whether AI is real. It is: at what revenue growth rate does any of this pay for itself? And what happens if inference costs fall 100-fold before the infrastructure is fully depreciated?

I want to think about this the way a credit analyst would. Not as a technology story but as a corporate finance story. Because the numbers, assembled from earnings releases and analyst reports through February 2026, look less like a technology platform buildout and more like a leveraged buyout of the future.


{{< img src="ai-capex-hockey-stick.png" alt="Exhibit showing 2025 actual versus 2026 guided capex for Big 4 hyperscalers: Amazon at $200B guided up 52%, Alphabet at $175-185B up 97%, Meta at $60-65B, Microsoft at $100-120B up 25%, totaling $610-655B combined up 63%" width="80%" >}}
## The LBO framing

An LBO thesis goes like this: we borrow heavily today, acquire an asset, generate enough cash flow to service the debt, and eventually sell or refinance at a profit. The bet works if the returns from the acquired asset exceed the cost of capital. It fails if the asset underperforms, the cost of capital rises, or the timeline extends beyond what the capital structure can absorb.

The hyperscaler capex thesis has the same structure, substituting "equity" and "operating cash flow" for debt. Each company is telling shareholders: we will deploy enormous capital today, accept near-zero or negative free cash flow for 18 to 36 months, and recoup that investment through AI revenue growth. Sundar Pichai put the bull case plainly [at Alphabet's Q2 2024 earnings](https://www.fool.com/earnings/call-transcripts/2024/07/23/alphabet-googl-q2-2024-earnings-call-transcript/): "The risk of underinvesting is dramatically greater than the risk of overinvesting for us here."

Run the depreciation math. At five-year straight-line on $175 billion in Alphabet capex, you get $35 billion in annual depreciation. Add a conservative 10% cost of capital on the incremental investment, and the hurdle gets harder still. For the full **$690 billion** in 2026 hyperscaler capex, the annual depreciation burden alone approaches **$115–140 billion** at five-year lives. That is before interest, power, operations, or the cost of next year's upgrade cycle.

The revenue side of this ledger is far smaller than the capex side. Rough estimates place direct AI revenue across the ecosystem at **$40–60 billion in 2025**, against AI-specific capex of roughly $300 billion. Coverage ratio: approximately **0.15x**. [Sequoia's David Cahn](https://sequoiacap.com/article/ais-600b-question/) calculated that the AI ecosystem needs to generate **$600 billion in annual revenue** to justify current infrastructure spending, against perhaps $50–100 billion it is actually generating. By 2026, with AI revenue perhaps reaching $80–120 billion and AI capex at $450 billion, the ratio improves to roughly **0.25x**. Still not a business.


{{< img src="ai-revenue-coverage-gap.png" alt="Exhibit showing AI revenue of roughly $50B in 2025 against $300B in AI-specific capex and the $600B revenue threshold estimated by Sequoia Capital, with coverage ratios of 0.17x in 2025 and 0.25x projected for 2026" width="80%" >}}
## What would have to be true

The spending is not obviously irrational. The bull case is worth taking seriously: the right moment to build infrastructure for a platform shift is before the platform fully exists. Railroads were overbuilt. Fiber was overbuilt. Both excesses funded genuinely useful infrastructure that later ran at capacity. If AI becomes the general-purpose technology that most proponents claim, the AI infrastructure being deployed today could look like the most prescient investment since Standard Oil.

But that argument requires you to believe some very specific things about revenue growth that have not yet materialized. The 2025–2030 revenue ramp embedded in current capex implies AI revenue growing from roughly $60 billion today to somewhere between $600 billion and $2 trillion by 2030, depending on which bullish scenario you pick. Bain calculates that even under the most aggressive adoption scenario, AI generates $1.2 trillion in revenue, against the $2 trillion the spending requires to break even. The revenue gap does not close.

[MIT's Daron Acemoglu](https://economics.mit.edu/news/daron-acemoglu-what-do-we-know-about-economics-ai), who won the 2024 Nobel Prize in Economics, projects AI will deliver a total GDP increase of just **1.1–1.6% over ten years**: roughly a **0.05% annual productivity gain**. Only about 5% of economic tasks, he estimates, are cost-effectively automatable at current prices. Goldman Sachs' Jim Covello made a similar argument in a [June 2024 note](https://www.datacenterdynamics.com/en/news/goldman-sachs-1tn-to-be-spent-on-ai-data-centers-chips-and-utility-upgrades-with-little-to-show-for-it-so-far/): "Replacing low-wage jobs with tremendously costly technology is basically the polar opposite of the prior technology transitions I've witnessed in my thirty years of closely following the tech industry." Neither of these is a fringe view. If either is roughly right, the revenue scenarios baked into current capex budgets do not close.

Dario Amodei, who is himself building the infrastructure, [put it bluntly on the Dwarkesh Podcast in February 2026](https://www.dwarkesh.com/p/dario-amodei-2): "If my revenue is not $1 trillion, if it's even $800 billion, there's no force on Earth, there's no hedge on Earth that could stop me from going bankrupt if I buy that much compute." He was describing his own spending discipline relative to peers. The companies spending three times as much as Anthropic apparently believe they have found the hedge he could not.

{{< readnext slug="the-most-expensive-assumption-in-ai" >}}

## The depreciation time bomb

One risk most analysis underweights: AI hardware obsoletes faster than any previous infrastructure cycle.

Hyperscalers have extended server useful lives from four to five and six years, saving billions in annual depreciation. But Amazon reversed course: in Q4 2024 it took a [**$920 million** charge to early-retire certain servers and networking equipment](https://behindthebalancesheet.substack.com/p/amazons-ai-reality-check), then effective January 1, 2025 it shortened useful lives for a subset of servers from six to five years, citing "the increased pace of technology development, particularly in the area of artificial intelligence," a decision expected to reduce 2025 operating income by a further $700 million. Jensen Huang, not a man known for underselling his own products, said of H100 GPUs once Blackwell shipped: ["You couldn't give Hoppers away."](https://www.rev.com/transcripts/gtc-keynote-with-nvidia-ceo-jensen-huang) Nvidia now releases new architectures annually, where it previously released them every two years.

[Michael Burry](https://www.cnbc.com/2025/11/11/big-short-investor-michael-burry-accuses-ai-hyperscalers-of-artificially-boosting-earnings.html), who spent 2005 correctly modeling the mortgage market's hidden risks, estimates that hyperscalers will understate depreciation by roughly **$176 billion** in aggregate between 2026 and 2028, causing them to overreport earnings by more than 20%. I have no idea whether Burry is right on the specific number. But the direction is correct. If the useful life of a Blackwell GPU is closer to three years than five because Rubin replaces it in 2027, the depreciation math gets far worse.

[Epoch AI measured](https://epoch.ai/data-insights/llm-inference-price-trends) inference costs falling at a median **50 times per year**, accelerating to **200 times per year** after January 2024. GPT-3-era processing cost around $20 per million tokens at launch in 2020. By early 2026, models of comparable capability cost roughly **$0.07** per million tokens. That is a roughly 280-fold decline over five years, and there is no obvious reason for it to stop.


{{< img src="ai-inference-cost-cliff.png" alt="Exhibit showing inference cost per million tokens falling from $20 at GPT-3 launch in 2020 to $0.07 in early 2026 on a log scale, with Epoch AI measuring acceleration to 200x per year decline after January 2024" width="80%" >}}
The hyperscaler response to this is Jevons: cheaper inference will explode demand, and the total compute consumed will far exceed what efficiency gains removed. They may be right. But the timing matters. Infrastructure being deployed today, at today's GPU prices, needs to generate enough revenue before the next architecture cycle renders it economically obsolete. The payback window is not 36 months. It may be 18.

{{< readnext slug="ai-models-as-standalone-pls" >}}

## The arms race logic

[Mark Zuckerberg acknowledged](https://fortune.com/2025/09/19/zuckerberg-ai-bubble-definitely-possibility-sam-altman-collapse/) the possibility of an AI bubble "definitely" in September 2025, then spent $72 billion anyway. This is not irrationality. It is game theory. If AI really does create winner-take-most outcomes, slowing down is a bet that the platform shift is smaller than your competitors believe. Most boards are not willing to make that bet. So everyone keeps spending.

But the same logic drove WorldCom's Bernie Ebbers. The same logic drove Global Crossing. The specific claim driving the 1990s telecom bubble was that internet traffic was "doubling every 100 days." It was false: [researcher Andrew Odlyzko traced it to misleading WorldCom/UUNET claims](https://www-users.cse.umn.edu/~odlyzko/doc/internet.growth.myth2.pdf), and actual traffic doubled roughly once per year. By 2001, only **5% of installed fiber capacity was in use**. The infrastructure eventually ran at capacity; it just took a decade and several dozen bankruptcies to get there.

[Howard Marks published a December 2025 memo](https://www.oaktreecapital.com/insights/memo/is-it-a-bubble) asking, with characteristic deliberateness, "Is It a Bubble?" He noted hyperscalers' capex was outpacing revenue momentum and lenders were sweetening terms to keep deal flow alive. J.P. Morgan projects **$300 billion in investment-grade bonds** for AI data centers in 2026 alone. That is the same fragility that destroyed the telecom builders: cheap debt financing infrastructure before anyone has proved the revenue exists to service it.

[Without AI spending, Pantheon Macroeconomics calculated in February 2026](https://fortune.com/2026/02/23/ai-capex-us-gdp-negative-pantheon/), U.S. corporate capex would currently be negative. The entire infrastructure investment story depends on this cycle continuing: total U.S. GDP grew just 1.4% annualized in H1 2025, and AI-related investment accounted for essentially all of it.

The question is whether that cycle sustains itself or collapses under its own weight. I am more confident in the framework than in the conclusion. But when the CEO of the most disciplined AI builder alive says that being off by a single year means bankruptcy, and every other player is spending at three times his pace, the problem has not been solved. It has been deferred.
