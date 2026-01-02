---
title: Visualizing Gradients with PyTorch
date: 2025-08-23
images:
- https://static.philippdubach.com/ograph/ograph-project.jpg
description: A PyTorch visualization tool for understanding gradients with 2D surface
  plots and vectors to build intuition for optimization.
keywords:
- PyTorch gradients
- gradient visualization
- machine learning gradients
- calculus visualization
- gradient vectors
- steepest ascent
- optimization algorithms
- 2D gradient plots
- PyTorch tutorial
- mathematical visualization
- gradient descent
- function gradients
- torch-gradients
- gradient mental model
- ML optimization
tags:
- Project
draft: false
aliases:
- /2025/08/23/20250829-PROJECT-torch-gradients/
---
[Gradients](https://en.wikipedia.org/wiki/Gradient) are one of the most important concepts in calculus and machine learning, but it's often poorly understood. Trying to understand them better myself, I wanted to build a visualization tool that helps me develop the correct mental picture of what the gradient of a function is. I came across [GistNoesis/VisualizeGradient](https://github.com/GistNoesis/VisualizeGradient), so I went on from there to write my own iteration. This mental model generalizes beautifully to higher dimensions and is crucial for understanding optimization algorithms. 
{{< img src="torch-gradients_Figure_2.png" alt="2D Gradient Plot: The colored surface shows function values. Black arrows show gradient vectors in the input plane (x-y space), pointing toward the direction of steepest ascent." width="80%" >}}
*The colored surface shows function values. Black arrows show gradient vectors in the input plane (x-y space), pointing toward the direction of steepest ascent.*

If you are interested in having a closer look or replicating my approach, the full project can be found on my [GitHub](https://github.com/philippdubach/torch-gradients/). I'm also looking forward to doing something similar on the [Central Limit Theorem](https://blog.foletta.net/post/2025-07-14-clt/) as well as doing a short tutorial on [plotting options volatility surfaces with python](https://static.philippdubach.com/opt_vol_surface_plot_fig1.png), a project I have been waiting to finish for some time now.