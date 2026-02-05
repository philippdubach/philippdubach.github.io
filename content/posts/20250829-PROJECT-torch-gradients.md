---
title: Visualizing Gradients with PyTorch
date: 2025-08-23
seoTitle: Visualizing Gradients in PyTorch with 2D Surface Plots
images:
- https://static.philippdubach.com/ograph/ograph-project.jpg
description: Build the right mental model for gradients with this PyTorch visualization tool. 2D surface plots with gradient vectors show the direction of steepest ascent.
keywords:
- pytorch gradient visualization
- visualize gradients python
- gradient descent visualization
- gradient vectors machine learning
- pytorch autograd tutorial
tags:
- Project
categories:
- AI
type: Project
draft: false
aliases:
- /2025/08/23/visualizing-gradients-with-pytorch/

faq:
- question: What does a gradient vector represent geometrically?
  answer: 'A gradient vector points in the direction of steepest ascent of a function at a given point. In a 2D input space, gradient vectors live in the x-y plane and indicate the direction in which the function value increases most rapidly. Their magnitude tells you how steep that increase is. This geometric intuition is the foundation of why gradient descent works: by moving opposite to the gradient, you move toward lower function values.'
- question: Why visualize gradients with surface plots instead of contour plots?
  answer: Surface plots show function values as a 3D colored surface while simultaneously displaying gradient vectors in the input plane below. This makes it easier to see the relationship between the terrain of the function and the direction of steepest ascent. Contour plots flatten the picture and can obscure how steep gradients correspond to tightly packed level curves.
- question: How does this gradient intuition generalize to higher dimensions?
  answer: 'In higher dimensions, the gradient remains a vector in the input space that points toward steepest ascent. While you can no longer visualize the full surface, the same principle holds: each component of the gradient is the partial derivative with respect to that input variable. This is exactly how neural network training works, where gradients are computed across thousands or millions of parameters simultaneously.'
- question: How does PyTorch compute gradients for visualization?
  answer: PyTorch uses its autograd engine to perform automatic differentiation. When you define a function using PyTorch tensors with requires_grad=True, the framework builds a computational graph and applies the chain rule to compute gradients via backpropagation. These gradient values can then be extracted and plotted as vector fields over the input domain.
---
[Gradients](https://en.wikipedia.org/wiki/Gradient) are one of the most important concepts in calculus and machine learning, but it's often poorly understood. Trying to understand them better myself, I wanted to build a visualization tool that helps me develop the correct mental picture of what the gradient of a function is. I came across [GistNoesis/VisualizeGradient](https://github.com/GistNoesis/VisualizeGradient), so I went on from there to write my own iteration. This mental model generalizes beautifully to higher dimensions and is the foundation for understanding optimization algorithms like gradient descent. 
{{< img src="torch-gradients_Figure_2.png" alt="2D Gradient Plot: The colored surface shows function values. Black arrows show gradient vectors in the input plane (x-y space), pointing toward the direction of steepest ascent." width="80%" >}}
*The colored surface shows function values. Black arrows show gradient vectors in the input plane (x-y space), pointing toward the direction of steepest ascent.*

If you are interested in having a closer look or replicating my approach, the full project can be found on my [GitHub](https://github.com/philippdubach/torch-gradients/). I'm also looking forward to doing something similar on the [Central Limit Theorem](https://blog.foletta.net/post/2025-07-14-clt/) as well as doing a short tutorial on [plotting options volatility surfaces with python](https://static.philippdubach.com/opt_vol_surface_plot_fig1.png), a project I have been waiting to finish for some time now.
