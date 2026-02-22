---
title: Working with Models
seoTitle: "Diffusion Models: Learn the Math with Stanford CS236"
date: 2025-11-08
images:
- https://static.philippdubach.com/ograph/ograph-models.jpg
external_url: https://arxiv.org/abs/2510.21890
description: "Diffusion models corrupt data into noise, then reverse the process. Learn the math with Stefano Ermon's Stanford CS236 course, free on YouTube."
keywords:
- diffusion models explained
- Stanford CS236 course
- deep generative models tutorial
- diffusion model forward process
- Stefano Ermon lectures
- generative AI architecture
- AI model training foundations
categories:
- AI
type: Commentary
draft: false
aliases:
- /2025/11/08/working-with-models/

faq:
- question: What is the forward process in diffusion models?
  answer: The forward process gradually corrupts data into noise, linking the data distribution to a simple prior through a continuum of intermediate distributions. Small Gaussian noise is incrementally added over many timesteps until the original data becomes indistinguishable from pure noise.
- question: Where can I learn diffusion models for free?
  answer: Stefano Ermon's Stanford CS236 Deep Generative Models course covers diffusion models with full mathematical foundations. The course website has materials at deepgenerativemodels.github.io, and complete lecture recordings are available on YouTube.
- question: What does Stanford CS236 cover?
  answer: CS236 covers the probabilistic foundations and learning algorithms for deep generative models, including variational autoencoders, generative adversarial networks, autoregressive models, normalizing flows, energy-based models, and score-based diffusion models.
---
There was this "[I work with Models](https://us1.discourse-cdn.com/flex001/uploads/ultralytics1/original/1X/45c604467b6f4212858281cf28f71a77083fb45e.jpeg)" joke which I first heard years ago from an analyst working on a valuation model ([see my previous post](/posts/everything-is-a-dcf-model/)). I guess it has become more relevant than ever:

>This monograph presents the core principles that have guided the development of diffusion models, tracing their origins and showing how diverse formulations arise from shared mathematical ideas. Diffusion modeling starts by defining a forward process that gradually corrupts data into noise, linking the data distribution to a simple prior through a continuum of intermediate distributions.

If you want to get into this topic in the first place, be sure to check out [Stefano Ermon's CS236 Deep Generative Models Course](https://deepgenerativemodels.github.io). Lecture recordings of the full course can also be found on [YouTube](https://www.youtube.com/playlist?list=PLoROMvodv4rPOWA-omMM6STXaWW4FvJT8).
