---
title: Math Template
date: 2024-01-01
images:
- https://static.philippdubach.com/ograph/ograph-post.jpg
external_url: https://gohugo.io/content-management/mathematics/
math: true
draft: true
categories:
- Tech
type: Essay
aliases:
- /2024/01/01/math-template/

---
$$\Delta u_{t+i,t-1} = \beta_i X_{t-1} + \delta_i + \epsilon_{u,t+i}$$
$$dy_{t+i,t-1} = dy^{POT}_{t+i,t-1} + \gamma_i \Delta u_{t+i,t-1} + \epsilon_{y,t+i}$$


This is an inline \(a^*=x-b^*\) equation.

These are block equations:

\[a^*=x-b^*\]

\[ a^*=x-b^* \]

\[
a^*=x-b^*
\]

These are also block equations:

$$a^*=x-b^*$$

$$ a^*=x-b^* $$

$$
a^*=x-b^*
$$

Full block:

\[
\begin{aligned}
KL(\hat{y} || y) &= \sum_{c=1}^{M}\hat{y}_c \log{\frac{\hat{y}_c}{y_c}} \\
JS(\hat{y} || y) &= \frac{1}{2}(KL(y||\frac{y+\hat{y}}{2}) + KL(\hat{y}||\frac{y+\hat{y}}{2}))
\end{aligned}
\]