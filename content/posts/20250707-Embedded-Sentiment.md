---
title: Sentiment Trading Revisited
date: 2025-07-07
images:
- https://static.philippdubach.com/ograph/ograph-post.jpg
seoTitle: "News Sentiment Embeddings Cut Stock Prediction Error 40%"
description: "A Rutgers study finds news sentiment embeddings from OpenAI models cut stock price prediction errors by 40%. Time-independent models perform just as well."
keywords:
- news sentiment embeddings stock prediction
- OpenAI embeddings stock market
- NLP stock prediction neural network
- sentiment analysis algorithmic trading
- news headlines stock price forecasting
external_url: https://arxiv.org/abs/2507.01970
categories:
- Finance
- AI
type: Commentary
draft: false
aliases:
- /2025/07/07/sentiment-trading-revisited/

faq:
- question: How much do news headline embeddings improve stock price prediction?
  answer: According to research by Ayaan Qayyum at Rutgers University, converting news headlines into high-dimensional vectors using OpenAI embedding models and training neural networks on those embeddings alongside economic data reduced prediction errors by up to 40% compared to models that relied on price and economic data alone. The study used over 18,000 Wall Street Journal headlines and tested across multiple neural network architectures.
- question: What is the difference between sentiment scoring and embedding-based approaches for stock prediction?
  answer: Traditional sentiment analysis assigns a simple positive, negative, or neutral score to a piece of text. Embedding-based approaches instead convert the entire text into a rich, high-dimensional vector that captures far more semantic nuance, including relationships between concepts that a single score would miss. The Rutgers study found that these richer embedding representations, processed through models like GRU, LSTM, and Temporal Convolutional Networks, produced substantially better forecasting results.
- question: Do time-dependent or time-independent sentiment models perform better for stock forecasting?
  answer: Surprisingly, the Rutgers research found that time-independent models, where training data was shuffled rather than kept in chronological order, performed just as well or better than time-dependent models. This suggests that markets react to the substance of news in consistent ways regardless of when a headline appears, and that the semantic content of a headline matters more than its specific place in a temporal sequence.
- question: What neural network architectures work best for sentiment-based stock prediction?
  answer: 'The Rutgers study tested five architectures: Gated Recurrent Units (GRU), Hidden Markov Models (HMM), Long Short-Term Memory networks (LSTM), Temporal Convolutional Networks (TCN), and Feed-Forward Neural Networks (FFNN), all implemented in PyTorch. Each was trained on OpenAI embedding vectors combined with economic indicators, and results varied by architecture, though all benefited from the inclusion of headline embedding data.'
---
Interesting new paper on news sentiment embeddings for stock price forecasting that builds on many of the ideas [I explored in this project](/posts/trading-on-market-sentiment/). The research, by Ayaan Qayyum, an [Undergraduate Research Scholar at Rutgers](https://soe.rutgers.edu/news/ayaan-qayyum-electrical-and-computer-engineering), shows that the core concept of using advanced language models for sentiment trading is not only viable but highly effective. The study takes a similar but more advanced approach. Instead of using a model like GPT-3.5 to generate a simple sentiment score, it uses [OpenAI's embedding models](https://platform.openai.com/docs/guides/embeddings/embedding-models) to convert news headlines into rich, high-dimensional vectors. By training a [battery of neural networks](https://arxiv.org/html/2507.01970v1/extracted/6556003/diagrams/model_comb_diagram.png) including
> Gated Recurrent Units (GRU), Hidden Markov Model (HMM), Long Short-Term Memory (LSTM), Temporal Convolutional Networks (TCN), and a Feed-Forward Neural Network (FFNN). All were implemented using PyTorch.

on these embeddings alongside economic data, the study found it could [reduce prediction errors by up to 40%](https://arxiv.org/html/2507.01970v1/extracted/6556003/diagrams/models_ranked_smape.png) compared to models without the news data. 

The most surprising insight to me, and one that directly addresses the challenge of temporal drift I discussed, was that Qayyum's time-independent models performed just as well, if not better, than the time-dependent ones. By shuffling the data, the models were forced to learn the pure semantic impact of a headline, independent of its specific place in time. This suggests that the market reacts to the substance of news in consistent ways, even if the narratives themselves change.
