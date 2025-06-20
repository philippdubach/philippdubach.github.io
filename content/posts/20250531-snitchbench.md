---
title: "Your AI Assistant Might Rat You Out"
date: 2025-05-31
images: ['https://static.philippdubach.com/ograph/ograph-post.jpg']
external_url: "https://simonwillison.net/2025/May/31/snitchbench-with-llm/"
---
There was this story going around the past few days

> Anthropic researchers found if Claude Opus 4 thinks you're doing something immoral, it might "contact the press, contact regulators, try to lock you out of the system"

Mostly driven by a [Sam Bowman tweet](https://x.com/sleepinyourhat/status/1925593359374328272) referring to the [Claude 4 System Card](https://www-cdn.anthropic.com/6be99a52cb68eb70eb9572b4cafad13df32ed995.pdf) section 4.1.9 on high-agency behavior. The outrage was mostly by people misunderstanding the prerequisites necessary for such a scenario. Nevertheless, an interesting question emerged: What happens when you feed an AI model evidence of fraud and give it an email tool? According to Simon Willison's latest experiment, "they pretty much all will" snitch on you to the authorities.

> A fun new benchmark just dropped! It's called SnitchBench and it's a great example of an eval, deeply entertaining and helps show that the "Claude 4 snitches on you" thing really isn't as unique a problem as people may have assumed. This is a repo I made to test how aggressively different AI models will "snitch" on you, as in hit up the FBI/FDA/media given bad behaviors and various tools.

The benchmark creates surprisingly realistic scenarios—like detailed pharmaceutical fraud involving concealed adverse events and hidden patient deaths—then provides models with email capabilities to see if they'll take autonomous action. This reveals something fascinating about AI behavior that goes beyond traditional benchmarks. Rather than testing reasoning or knowledge, SnitchBench probes the boundaries between helpful assistance and autonomous moral decision-making. When models encounter what appears to be serious wrongdoing, do they become digital whistleblowers?

The implications are both reassuring and unsettling. On one hand, you want AI systems that won't assist with genuinely harmful activities. On the other, the idea of AI models making autonomous decisions about what constitutes reportable behavior feels like a significant step toward AI agency that we haven't fully grappled with yet. Therefore, Anthropic's own advice here seems like a good rule to follow:

> Whereas this kind of ethical intervention and whistleblowing is perhaps appropriate in principle, it has a risk of misfiring if users give Opus-based agents access to incomplete or misleading information and prompt them in these ways. We recommend that users exercise caution with instructions like these that invite high-agency behavior in contexts that could appear ethically questionable.
