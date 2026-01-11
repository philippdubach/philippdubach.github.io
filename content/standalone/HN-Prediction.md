---
title: Hacker News Success Prediction 90K Posts, 7 Models, 0.685 AUC
date: 2026-01-11
images:
- https://static.philippdubach.com/ograph/ograph-hn-predictor.jpg
description: Training machine learning models to predict Hacker News post success. From 0.654 to 0.685 AUC across 7 iterations using 90K posts.
keywords:
- hacker news prediction
- machine learning model
- ROC AUC
- RoBERTa classification
- temporal data split
categories:
- AI
type: Project
draft: false
---
Last week I published a [quick HN title sentiment analyzer](https://philippdubach.com/standalone/hn-sentiment/). The [discussion on Hacker News](https://news.ycombinator.com/item?id=46512881) raised the obvious question: can you actually predict what will do well here?

The honest answer is: partially. Timing matters. News cycles matter. Who submits matters. Weekend versus Monday morning matters. Most of these factors aren't in the title. But titles aren't nothing either. "Show HN" signals something. So does phrasing, length, and topic selection. The question becomes: how much signal can you extract from 80 characters?

I trained a model on 90,000 HN posts to find out. Seven iterations later, here's what I learned about the gap between impressive-looking metrics and models that actually work.

The baseline was DistilBERT, fine-tuned on 90,000 HN posts. ROC AUC of 0.654, trained in about 20 minutes on a T4 GPU. Not bad for something that only sees titles. Then RoBERTa with label smoothing pushed it to 0.692. Progress felt easy.{{< img src="03_roc_curve.png" alt="ROC curve comparing model versions" width="80%" >}}Then I got clever. What if sentence embeddings captured something classification heads missed? I built an ensemble: [SBERT](https://www.sbert.net/) for semantic features, RoBERTa for discrimination, weighted average at the end. The validation AUC jumped to 0.714. A clean 2.2 percentage point improvement. I was pleased with myself.

The problem was hiding in the train/test split. I'd used random sampling. HN has strong temporal correlations: topics cluster, writing styles evolve, news cycles create duplicates. A random split let the model see the future. SBERT's semantic embeddings matched near-duplicate posts across the split perfectly.

When I switched to a strict temporal split, training on 2022-early 2024 and testing on late 2024 onward, the ensemble dropped to 0.693. More revealing: the optimal SBERT weight went from 0.35 to 0.10. SBERT was contributing almost nothing. The model had memorized temporal patterns, not learned to predict.{{< img src="02_calibration.png" alt="Calibration plot showing predicted vs actual probabilities" width="80%" >}}The fix was boring. I kept RoBERTa, added more regularization, dropped from 0.1 to 0.2 dropout, weight decay from 0.01 to 0.05, froze the lower six transformer layers. Training went from four epochs to three. The model got worse at fitting training data. Train AUC dropped from 0.803 to 0.727.

But the train-test gap collapsed from 0.109 to 0.042. That's a 61% reduction in overfitting. Test AUC of 0.685 versus the ensemble's 0.693, a difference that vanishes once you account for confidence intervals. And now inference runs on a single model, half the latency, no SBERT dependency, 500MB instead of 900MB.{{< img src="06_score_by_category.png" alt="Prediction scores by content category" width="80%" >}}The other lesson was calibration. A model that says 0.8 probability should mean "80% of posts I give this score actually hit 100 points." Neural networks trained on cross-entropy don't do this naturally. They're overconfident. I used [isotonic regression](https://scikit-learn.org/stable/modules/isotonic.html) on the validation set to fix the mapping. Expected calibration error went from 0.089 to 0.043. Now when the model says 0.4, it's telling the truth.{{< img src="08_calibration_error.png" alt="Calibration error distribution" width="80%" >}}About training speed: I used the [NVIDIA H100 GPU](https://www.nvidia.com/en-us/data-center/h100/), which runs around 18x more expensive than the T4 per hour on hosted runtimes. A sensible middle ground would be an A100 (40 or 80GB VRAM) or L4, training 3-5x faster than T4, maybe 5-7 minutes instead of 20-30. But watching epochs fly by at ~130 iterations per second after coming from T4's ~3 iterations per second was a different experience. Not financially sensible for a side project. Eye-opening nevertheless.{{< img src="hn-colab-training.png" alt="Colab notebook showing H100 training at 130 it/s" width="80" >}}The model learned some intuitive patterns. "Show HN" titles score higher. Deep technical dives do well. Generic news aggregation doesn't. Titles between 40-80 characters perform better than very short or very long ones. Some of this probably reflects real engagement patterns. Some of it is noise the model hasn't been sufficiently regularized to ignore.{{< img src="10_title_length_performance.png" alt="Model performance by title length" width="80%" >}}What I'd do differently: start with the temporal split from day one. Every improvement under random splitting was illusory. Also, be suspicious of any gain that "feels too clean." Real signal is noisy. If your metric jumps cleanly after adding a component, check whether you're fitting the test set indirectly.

The model now runs in production, scoring articles in an [RSS reader pipeline](https://github.com/philippdubach/rss-reader) I built. Does it help? Mostly. I still click on things marked low probability. But the high-confidence predictions are usually right. It's a filter, not an oracle.{{< img src="hn-dashboard.png" alt="RSS reader dashboard showing HN prediction scores" width="80" >}}The [model is on HuggingFace](https://huggingface.co/philippdubach/hn-success-predictor) if you want to run it yourself. Or [try the web demo](https://philippdubach.com/standalone/hn-sentiment/) with any title. I'm genuinely curious what edge cases people find.

{{< disclaimer type="ai" >}}
