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
  "Fast mode costs more, but I still use it because waiting breaks concentration.",
  "Codex Ultra is a separate orchestration mode that I use rarely, when a large coding task can benefit from parallel sub-agents."
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

I have spent an unreasonable amount of time using large language models. Most of that time went to Anthropic and OpenAI, with plenty of Kimi and Qwen mixed in. I used them for research, writing, coding, and long agent runs.

I finally have a default for GPT-5.6 Sol reasoning effort: High in Fast mode.

That sounds like a small choice. It took me months to make it because I kept assuming that the strongest setting must be the best one. It is not. Max can be smarter and still make me less productive.

## I kept choosing the highest reasoning effort

Until this year, I was completely Anthropic-pilled. Claude was the model I opened first. That changed after the [Fable 5 incident](/posts/krugman-fable5-europe-decline/). Anthropic [released Fable 5](https://www.anthropic.com/news/claude-fable-5-mythos-5), suspended it days later, and later [brought it back with new safeguards](https://www.anthropic.com/news/redeploying-fable-5).

I continued to use Anthropic after that. Opus 4.8 was good. Fable 5 was often very good, but too verbose for my taste. Then came Opus 5. Yes, it is good. I still do not like it. It is somewhat slow and, gosh, it is hard to read.

I moved more of my workload to GPT-5.6 Sol. Naturally, I selected the biggest settings. I used Fast mode and reached for Codex Ultra on large jobs. Ultra can divide one coding task among several sub-agents and run them in parallel. At first, that sounded ideal. In practice, the agents sometimes expanded the plan, checked each other's work, and found new reasons not to finish.

Sol can also get stuck without Ultra. I watched it inspect a problem, revise the plan, inspect again, and then produce another plan instead of the change I asked for. The model was busy. I was not getting an answer.

{{< img src="openai_vs_anthropic_time_light.png" alt="GPT-5.6 Sol vs Claude Opus 5 and 20 other OpenAI and Anthropic configurations plotted by Intelligence Index and total working time." width="100%" imgWidth="2920" imgHeight="1360" priority="true" >}}

## The GPT-5.6 Sol reasoning effort curve bends at High

I compared 22 configurations using data captured on August 30, 2026. Each point uses the same nine tests in the [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/models/releases/gpt-5-6-sol). The index is a useful comparison. It is not a complete measure of intelligence.

Sol shows a clear pattern:

| Effort | Index | Estimated cost per test task |
|---|---:|---:|
| Low | 51 | $0.18 |
| Medium | 56 | $0.29 |
| High | 57 | $0.43 |
| Xhigh | 59 | $0.63 |
| Max | 61 | $0.95 |

Medium is the obvious bargain. High adds only one point, but it gives the model more room on difficult tasks without making every interaction feel slow.

After High, the trade gets worse. Xhigh costs about 47% more for two points. Max costs more than twice as much as High for four points. These figures estimate the cost of the benchmark tasks. They are not my subscription bill.

{{< img src="gpt56_speed_vs_intelligence_light.png" alt="GPT-5.6 Sol reasoning effort from Low through Max compared by Intelligence Index and time to first token in Standard and Fast modes." width="100%" imgWidth="2640" imgHeight="1200" >}}

The wait grows faster than the score. In my data, Sol Max spends about 146 seconds thinking before it starts writing in Standard mode. Moving from Xhigh to Max adds about 52.6 seconds of waiting for two points.

[OpenAI describes Max](https://openai.com/index/previewing-gpt-5-6-sol/) as a setting for problems that need extended reasoning. I now treat it that way. I do not leave it on by default.

## Working time matters more than token price

Time to first token is the pause before a model starts its answer. Output speed tells me how quickly it writes after that. I combined both into working time: the initial pause plus the time needed to generate the full response.

{{< img src="gpt56_time_vs_intelligence_light.png" alt="GPT-5.6 Sol, Terra, and Luna reasoning levels compared by Intelligence Index and total working time." width="100%" imgWidth="2880" imgHeight="1320" >}}

On the full test set, Sol takes about 88 hours at High and 150 at Xhigh. That is 1.7 times the working time for two points. Max rises to roughly 270 hours.

The same problem appeared when I tried [Kimi K3 inside Claude Code](/posts/kimi-k3-inside-claude-code/). Cheap tokens do not help if I need more retries or the model never closes the task. Price per million tokens is an input price. I care about the price of finished work.

{{< readnext slug="kimi-k3-inside-claude-code" >}}

## GPT-5.6 Sol vs Claude Opus 5 at the top

OpenAI dominates my normal time budget. Anthropic still has the highest scores in this comparison. [Opus 5 Xhigh scores 63](https://artificialanalysis.ai/models/claude-opus-5-xhigh). Fable 5 scores 62. Sol Max reaches 61.

{{< img src="claude_time_vs_intelligence_light.png" alt="Claude Opus 5, Fable 5, Opus 4.8, and Sonnet 5 compared by Intelligence Index and total working time." width="100%" imgWidth="2880" imgHeight="1320" >}}

Anthropic has the same problem at its upper end. Opus 5 reaches about 63 at Xhigh. Max stays near 63 after adding roughly 87 hours across the test set. More effort does not guarantee a better result.

Benchmarks also miss the parts I notice every day. They do not measure whether a response is pleasant to read. They do not know whether an agent recognizes that it is stuck. A model can score higher and still waste my time.

{{< newsletter >}}

## GPT-5.6 Sol Fast mode costs more, and I still use it

[OpenAI says Fast mode can run GPT-5.6 up to 2.5 times faster](https://openai.com/api-fast-mode/). It also costs more. The $0.43 estimate for Sol High in my table uses standard benchmark pricing, not Fast mode pricing.

I pay the premium because waiting breaks my concentration. If a model takes two minutes to begin, I switch windows. When it answers, I have to load the problem back into my head. The API bill counts tokens. It does not count that interruption.

I would choose differently for a background job. Nobody cares if a batch finishes a little later overnight. For interactive work, I would rather pay more and stay in the problem.

## Why GPT-5.6 Sol High is my default

This is what I use now:

- Sol High in Fast mode for normal work.
- Xhigh when the problem is genuinely difficult.
- Max only when more reasoning has a clear purpose.
- Codex Ultra for the rare coding job that can benefit from parallel sub-agents. I plan the work first.
