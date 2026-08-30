+++
title = "I Found the Performance–Cost–Speed Sweet Spot With LLMs"
cta_pitch = "I write every few weeks about AI systems, their economics, and what actually works in practice. Get the next one."
seoTitle = "GPT-5.6 Sol Reasoning Effort: Why High Became My Default"
slug = "llm-performance-cost-speed-sweet-spot"
date = 2026-08-30
lastmod = 2026-08-30
publishDate = 2026-08-30T12:00:00Z
description = "I compared every GPT-5.6 Sol reasoning effort across intelligence, cost, latency and total working time. See why High in Fast mode is my default for daily work."
images = ["https://static.philippdubach.com/openai_vs_anthropic_time_light.png"]
card_image = "https://static.philippdubach.com/openai_vs_anthropic_time_light.png"
keywords = ["GPT-5.6 Sol reasoning effort", "GPT-5.6 Sol High", "GPT-5.6 Sol Fast mode", "GPT-5.6 Sol Max vs Xhigh", "GPT-5.6 Sol vs Claude Opus 5", "best GPT-5.6 reasoning level", "GPT-5.6 Sol cost", "GPT-5.6 Sol benchmarks", "GPT-5.6 Sol speed", "GPT-5.6 reasoning settings", "LLM cost performance", "LLM latency", "time to first token", "reasoning effort benchmarks", "Artificial Analysis Intelligence Index", "Codex Ultra mode", "OpenAI Fast mode", "Claude Opus 5", "inference-time compute", "AI coding productivity"]
categories = ["AI"]
type = "Analysis"
draft = false
unlisted = false
takeaways = [
  "GPT-5.6 Sol High is now my default for interactive work because it gives up little measured performance while avoiding much of the wait at Xhigh and Max.",
  "Xhigh adds two Intelligence Index points over High but costs about 47% more per benchmark task, while Max more than doubles estimated cost for four points.",
  "Sol Max waits about 146 seconds before writing in Standard mode, and moving from Xhigh to Max adds 52.6 seconds for two index points.",
  "Across the full test set, Sol rises from about 88 hours at High to 150 at Xhigh and roughly 270 at Max."
]
faq = [
  {question = "Which GPT-5.6 Sol reasoning effort should I use?", answer = "High is the author's default for interactive research, writing, and coding. It keeps most of the measured capability while avoiding much of the cost and waiting time at Xhigh and Max."},
  {question = "What is the difference between GPT-5.6 Sol Medium, High, Xhigh, and Max?", answer = "The benchmark score rises from 56 at Medium to 57 at High, 59 at Xhigh, and 61 at Max. Cost and first-token waiting rise much faster than the score."},
  {question = "Is GPT-5.6 Sol Max worth the extra cost?", answer = "Max is worth considering when a difficult task clearly benefits from extended reasoning. In this snapshot, it adds four index points over High but more than doubles estimated benchmark-task cost."},
  {question = "Is GPT-5.6 Sol Fast mode worth it?", answer = "Fast mode can be worth the premium for interactive work because it reduces waiting and context switching. Standard processing is usually more economical for unattended batch jobs."},
  {question = "Is GPT-5.6 Sol better than Claude Opus 5?", answer = "Neither model is best for every workload. Sol leads the author's everyday time budget, while Claude Opus 5 reaches a higher Intelligence Index score at the upper end of this comparison."},
  {question = "Is Codex Ultra the same as Max reasoning effort?", answer = "No. Max increases one model's reasoning effort. Codex Ultra divides a large coding task among multiple sub-agents and runs their work in parallel."}
]
+++

{{< emoji-cover emoji="🤝" label="A handshake centered on a cyan-to-indigo gradient, representing the balance between LLM performance, cost, and speed." >}}

I have spent an unreasonable amount of time using large language models for both work and personal projects. Most of that time went to Anthropic and OpenAI, with some Kimi and Qwen mixed in. I used them for research, writing, coding, and long agent runs.

I finally feel like I have found the sweet spot for most tasks: GPT-5.6 Sol reasoning effort High in Fast mode.

It took me some time to settle on that because I kept assuming that the strongest setting must be the best one. It is not. Max can be smarter and still make me less productive.

## I kept choosing the highest reasoning effort

Until this year, I was completely Claude-pilled. Claude was the model I opened first. That changed after the [Fable 5 incident](/posts/krugman-fable5-europe-decline/). Anthropic [released Fable 5](https://www.anthropic.com/news/claude-fable-5-mythos-5), suspended it days later, and later [brought it back with new safeguards](https://www.anthropic.com/news/redeploying-fable-5).

I continued to use Anthropic after that. Opus 4.8 was good. Fable 5 was often very good, but too verbose for my taste. Then came Opus 5. Yes, it is good. I still do not like it. It is somewhat slow and, gosh, it is hard to read.

I moved more of my workload to GPT-5.6 Sol. Naturally, I selected the biggest settings. I used Fast mode and reached for Codex Ultra on large jobs. Ultra can divide one coding task among several sub-agents and run them in parallel. At first, that sounded ideal. In practice, the agents sometimes expanded the plan, checked each other's work, and found new reasons not to finish.

Sol can also get stuck without Ultra. I watched it inspect a problem, revise the plan, inspect again, and then produce another plan instead of the change I asked for. The model was busy. I was not getting an answer.

{{< img src="openai_vs_anthropic_time_light.png" alt="GPT-5.6 Sol vs Claude Opus 5 and 20 other OpenAI and Anthropic configurations plotted by Intelligence Index and total working time." width="100%" imgWidth="2920" imgHeight="1360" priority="true" >}}

## The GPT-5.6 Sol reasoning effort curve bends at High

I compared 22 configurations using the [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/models/releases/gpt-5-6-sol). Sol shows a clear pattern:

| Effort | Index | Estimated cost per test task |
|---|---:|---:|
| Low | 51 | $0.18 |
| Medium | 56 | $0.29 |
| High | 57 | $0.43 |
| Xhigh | 59 | $0.63 |
| Max | 61 | $0.95 |

Medium is the obvious bargain. High adds only one point, but it gives the model more room on difficult tasks without making every interaction feel slow.

After High, the trade gets worse. Xhigh costs about 47% more for two points. Max costs more than twice as much as High for four points.

{{< img src="gpt56_speed_vs_intelligence_light.png" alt="GPT-5.6 Sol reasoning effort from Low through Max compared by Intelligence Index and time to first token in Standard and Fast modes." width="100%" imgWidth="2640" imgHeight="1200" >}}

Sol Max spends about 146 seconds thinking before it starts writing in Standard mode. Moving from Xhigh to Max adds about 52.6 seconds of waiting for two points.

## Working time matters more than token price

Combining time to first token with output speed gives the total working time: the initial pause plus the time needed to generate the full response.

{{< img src="gpt56_time_vs_intelligence_light.png" alt="GPT-5.6 Sol, Terra, and Luna reasoning levels compared by Intelligence Index and total working time." width="100%" imgWidth="2880" imgHeight="1320" >}}

On the full test set, Sol takes about 88 hours at High and 150 at Xhigh. That is 1.7 times the working time for two points. Max rises to roughly 270 hours.

The same problem appeared when I tried [Kimi K3 inside Claude Code](/posts/kimi-k3-inside-claude-code/). Cheap tokens do not help if I need more retries or the model never closes the task.

{{< readnext slug="kimi-k3-inside-claude-code" >}}

## GPT-5.6 Sol vs Claude Opus 5 at the top

{{< img src="claude_time_vs_intelligence_light.png" alt="Claude Opus 5, Fable 5, Opus 4.8, and Sonnet 5 compared by Intelligence Index and total working time." width="100%" imgWidth="2880" imgHeight="1320" >}}

Anthropic has the same problem at its upper end. [Opus 5 reaches about 63 at Xhigh](https://artificialanalysis.ai/models/claude-opus-5-xhigh). Max stays near 63 after adding roughly 87 hours across the test set. More effort does not guarantee a better result.

Benchmarks also miss whether a response is pleasant to read. They do not know whether an agent recognizes that it is stuck. A model can score higher and still waste my time.
