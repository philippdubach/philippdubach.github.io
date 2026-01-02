---
title: 'Beyond Monte Carlo: Tensor-Based Market Modeling'
date: 2025-05-11
images:
- https://static.philippdubach.com/ograph/ograph-post.jpg
description: Using Transition Probability Tensors and attention mechanisms to bridge
  ML pattern recognition with arbitrage-free pricing in quant finance.
keywords:
- tensor-based market modeling
- Monte Carlo simulation
- quantitative finance
- attention mechanisms
- Transition Probability Tensors
- arbitrage-free pricing
- First Fundamental Theorem of Finance
- risk factor modeling
- financial derivatives pricing
- machine learning finance
- volatility regimes
- hedging strategies
- market stress testing
- UBS Investment Bank
- algorithmic trading
external_url: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5212863
aliases:
- /2025/05/11/beyond-monte-carlo-tensor-based-market-modeling/

---
A fascinating new paper from Stefano Iabichino at UBS Investment Bank explores what happens when you take the attention mechanisms powering modern AI and apply them to Wall Street's most fundamental pricing problems, tackling what might be quantitative finance's most intractable challenge.

The problem is elegantly simple yet profound: machine learning models are great at finding patterns in historical data, but financial theory demands that arbitrage-free prices be independent of past information. As the authors put it:

> We contend that a fundamental tension exists between the usage of ML methodologies in risk and pricing and the First Fundamental Theorem of Finance (FFTF). While ML models rely on historical data to identify recurring patterns, the FFTF posits that arbitrage-free market prices are independent of past information.

Their solution? Transition Probability Tensors (TPTs) that function like attention mechanisms in neural networks, dynamically weighting relationships between risk factors while maintaining mathematical rigor. Instead of learning from history, these tensors capture "dynamic, context-aware relationships across dimensions" in real-time.

The practical results are impressive: simulating 210 quantitative investment strategies across 100,000 market scenarios in just 70 seconds, while identifying optimal hedging strategies and stress-testing future market conditions. The framework even adapts to different volatility regimes, shifting focus toward tail events during high-volatility periods—exactly like attention mechanisms focusing on relevant context. Whether it scales beyond this impressive proof-of-concept remains to be seen, but it's seems to be a genuine attempt to resolve the fundamental tension between AI's pattern-seeking nature and finance's requirement for arbitrage-free pricing.