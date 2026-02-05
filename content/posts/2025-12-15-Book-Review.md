---
title: 'Book Review: Why Machines Learn'
seoTitle: "Why Machines Learn Review: Real Math, Not Just Metaphors"
date: 2025-12-27
images:
- https://static.philippdubach.com/ograph/ograph-aibookreview.jpg
description: "Why Machines Learn explains ML math with real equations and geometric intuition. Review of Ananthaswamy's approach to neural networks, PCA, and GANs."
keywords:
- Why Machines Learn book review
- machine learning math books
- linear algebra machine learning
- neural network mathematics explained
- AI math prerequisites
categories:
- AI
type: Review
draft: false
aliases:
- /2025/12/27/book-review-why-machines-learn/

faq:
- question: Is "Why Machines Learn" by Anil Ananthaswamy worth reading?
  answer: Yes, particularly if you want to understand the math behind ML with real equations rather than metaphors. The book treats linear algebra geometrically, showing how dot products measure alignment and how neural network layers work as pipelines of linear maps plus nonlinearities. You should have some familiarity with derivatives and matrix calculus, though you can keep pace with a pencil and patience.
- question: What math background do I need for "Why Machines Learn"?
  answer: The book covers vectors, dot products, projections, perceptrons, backpropagation, PCA, SVMs, convolutional networks, and GANs. If you have not looked at derivatives or matrix calculus in a while, you will feel it, but the "graded ascent" structure means early chapters provide scaffolding for later ones. Be prepared to read slowly and work through derivations.
- question: How does "Why Machines Learn" differ from typical AI books?
  answer: 'Unlike books that focus on human drama stories about labs and researchers, or flatten the material into a few metaphors, Ananthaswamy actually explains the math with equations and derivations. The geometric framing of linear algebra is the main strength: a neural network layer reads less like mysticism and more like a pipeline of linear transformations.'
---
> We cannot leave decisions about how AI will be built and deployed solely to its practitioners. If we are to effectively regulate this technology, another layer of society, educators, politicians, policymakers [...], must come to grips with the basics of the mathematics of machine learning.

I read a book that is sort of related to my recent writing on AI: *Why Machines Learn: The Elegant Math Behind Modern AI* by [Anil Ananthaswamy](https://www.anilananthaswamy.com/).

I admire the attempt to actually explain the math, with a ton of equations, instead of doing the [usual human drama story](https://en.wikipedia.org/wiki/Nexus:_A_Brief_History_of_Information_Networks_from_the_Stone_Age_to_AI) about geniuses and labs. I also admit I did not absorb all of it. That is not a complaint. It is a good sign that the author did not flatten the material into a few metaphors and call it a day.

If you have read my posts on why AI might commoditize rather than stay a winner-takes-all business, for example [Is AI Really Eating the World?](https://philippdubach.com/posts/is-ai-really-eating-the-world-1/2/), this book is a useful reminder that the story still starts with linear algebra. Ananthaswamy begins at the beginning: vectors, dot products, projections. The move here is to treat these as geometry, not just arithmetic. A dot product is a way to measure alignment, but it is also a way to map one space onto another. Once you see that, a neural network layer reads less like mysticism and more like a pipeline of linear maps plus nonlinearities.

That framing is the book’s main strength. When it works, you get an intuition for how high-dimensional data gets rotated, scaled, and squeezed until classes separate or features become easier to represent. When it stops working, you still have the derivations, so you can slow down and check what you missed.

The tour is broad. It moves from perceptrons to backpropagation, then through Principal Component Analysis and Support Vector Machines, and later into convolutional networks and generative models like GANs. There is history, but it is there to support the technical arc, not to replace it. The “graded ascent” idea mostly holds. Early chapters give you enough scaffolding to follow later ones. If you have not looked at derivatives or matrix calculus in a while, you will feel it, but you can still keep pace if you accept that this is a book you sometimes read with a pencil.

Two things I liked in particular: (1) It does not pretend there is a single "deep learning trick" that explains everything. The methods are varied and the trade-offs are real. (2) It gives you enough math to see why some ideas scale and others do not, without turning into a textbook.
