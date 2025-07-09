---
title: "Sentiment Trading Revisited"
date: 2025-07-07
images: ['https://static.philippdubach.com/ograph/ograph-post.jpg']
external_url: "https://arxiv.org/abs/2507.01970"
draft: false
---
Interesting new paper that builds on many of the ideas [I explored in this project](/2025/02/20/trading-on-market-sentiment/). The research, by Ayaan Qayyum, an [Undergraduate Research Scholar at Rutgers](https://soe.rutgers.edu/news/ayaan-qayyum-electrical-and-computer-engineering), shows that the core concept of using advanced language models for sentiment trading is not only viable but highly effective. The study takes a similar but more advanced approach. Instead of using a model like GPT-3.5 to generate a simple sentiment score, it uses [OpenAI's embedding models](https://platform.openai.com/docs/guides/embeddings/embedding-models) to convert news headlines into rich, high-dimensional vectors. By training a [battery of neural networks](https://arxiv.org/html/2507.01970v1/extracted/6556003/diagrams/model_comb_diagram.png) including
> Gated Recurrent Units (GRU), Hidden Markov Model (HMM), Long Short-Term Memory (LSTM), Temporal Convolutional Networks (TCN), and a Feed-Forward Neural Network (FFNN). All were implemented using PyTorch.

on these embeddings alongside economic data, the study found it could [reduce prediction errors by up to 40%](https://arxiv.org/html/2507.01970v1/extracted/6556003/diagrams/models_ranked_smape.png) compared to models without the news data. 

The most surprising insight to me, and one that directly addresses the challenge of temporal drift I discussed, was that Qayyum's time-independent models performed just as well, if not better, than the time-dependent ones. By shuffling the data, the models were forced to learn the pure semantic impact of a headline, independent of its specific place in time. This suggests that the market reacts to the substance of news in consistent ways, even if the narratives themselves change.