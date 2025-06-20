---
title: "AI Learns Economics Like Undergrads"
date: 2024-11-01
images: ['https://static.philippdubach.com/ograph/ograph-post.jpg']
external_url: "https://arxiv.org/abs/2411.00782"
---

This cuts to the heart of how LLMs actually work: Testing Large Language Models on economics problems reveals that these supposedly sophisticated systems don't just learn correct reasoning—they absorb our misconceptions too. The study found LLMs performing reasonably well on undergraduate economics questions (around 65% accuracy) but falling flat on graduate-level problems (35% accuracy). More tellingly, the specific errors weren't random failures but systematic mistakes that mirror exactly what human students get wrong.

> "Interestingly, the errors made by LLMs often mirror those made by human students, suggesting that these models may have learned not just correct economic reasoning but also common misconceptions."

Which kind of makes sense when we understand how language models actually work: They're not reasoning through economic principles—they're pattern-matching against their training data, which includes millions of wrong answers, confused explanations, and half-understood concepts scattered across the internet. 

What are the practical implications? If you're using AI for financial analysis or economic modeling, you're essentially getting a very confident undergraduate who's memorized a lot of material but fundamentally doesn't understand when to apply which concepts. The models particularly struggled with dynamic optimization and game theory—exactly the areas where getting it wrong costs real money. Perhaps most unsettling: chain-of-thought prompting barely helped. Even when asked to show their work, the models maintained their confident confusion, just with more elaborate explanations of why 2+2 equals 5.

_Note: From the paper: "testing set: January 1, 2023, to December 31, 2023"_