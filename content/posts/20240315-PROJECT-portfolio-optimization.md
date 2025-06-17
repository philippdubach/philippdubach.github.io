---
title: "My First 'Optimal' Portfolio"
date: 2024-03-15
tags: ["Project"]
---

My first encounter with quantitative portfolio optimization came during my undergraduate studies.  Inspired by Meucci's [Risk and Asset Allocation](https://link.springer.com/book/10.1007/978-3-540-27904-4) as well as Diamond and Boyd's [Stanford teaching on Convex Optimization](https://web.stanford.edu/~boyd/teaching.html) I set out to build my first "optimal" portfolio.

With a healthy dose of home bias, I developed what would eventually be published as [A Python integration of practical asset allocation based on modern portfolio theory and its advancements](https://digitalcollection.zhaw.ch/handle/11475/24351).

What motivated me most at the time was that Modern Portfolio Theory was around since 1990 yet at that point still most optimization libraries were proprietary.

>Nevertheless, only a few comprehensive software models are available publicly to use, study, or modify. We tackle this issue by engineering practical tools for asset allocation and implementing them in the Python programming language.

and therefore 

>The focus is to keep the tools simple enough for interested practitioners to understand the underlying theory yet provide adequate numerical solutions.

Meanwhile others have built amazing projects such as [PyPortfolioOpt](https://github.com/robertmartin8/PyPortfolioOpt) or [Riskfolio-Lib](https://github.com/dcajasn/Riskfolio-Lib) that offer great open-source libraries for sophisticated portfolio optimization. Here's a short summary of what has been done in this thesis:

{{< img src="efficient-frontier.jpg" alt="Efficient Frontier Visualization" width="70%" >}}
This scatter plot showing the efficient frontier demonstrates the core concept of modern portfolio theory - the trade-off between risk and return that your optimization tackles.
<br>
<br>
{{< img src="results-vs-benchmark-table.jpg" alt="Benchmark vs Optimized Results" width="70%" >}}
Shows the dramatic improvement achieved: same 9.386% return but volatility reduced from 14.445% to 5.574%, nearly tripling the Sharpe ratio from 0.650 to 1.684.
<br>
<br>
{{< img src="risk-aversion-parameters.jpg" alt="Risk Aversion Parameter Effects" width="70%" >}}
This efficient frontier plot with different gamma values illustrates how the optimization framework adapts to different investor risk preferences.

>We demonstrate how even in an environment with high correlation, achieving a competitive return with a lower expected shortfall and lower excess risk than the given benchmark over multiple periods is possible.


{{< img src="oos-performance-table.jpg" alt="Out-of-Sample Performance" width="70%" >}}
Demonstrates real-world validation across different market conditions (2018 bear market, 2019 bull market), showing consistent CVaR reduction and improved risk-adjusted returns.
These selections effectively showcase both the theoretical foundation and practical implementation success of your portfolio optimization work.

Looking back, the project feels embarrassingly naive—and surprisingly foundational. While it earned some recognition at the time, it now serves as a valuable reminder: sometimes the best foundation is built before you know enough to doubt yourself.

