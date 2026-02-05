---
title: "RSS Swipr: Find Blogs Like You Find Your Dates"
seoTitle: "ML-Powered RSS Reader: Thompson Sampling Beats the Filter Bubble"
date: 2026-01-05
images:
- https://static.philippdubach.com/ograph/ograph-rss-swipr.jpg
description: "Build an open-source ML RSS reader with swipe interface. Uses MPNet embeddings and Thompson sampling for personalized feeds that escape the filter bubble."
keywords:
- machine learning RSS reader
- Thompson sampling recommendation
- MPNet sentence embeddings
- personalized RSS Python open source
- filter bubble RSS alternative
categories:
- AI
type: Project
draft: false
aliases:
- /standalone/rss-tinder/
- /posts/rss-swipr-find-your-blogs-like-you-find-your-dates/

faq:
- question: How does machine learning improve RSS readers?
  answer: Traditional RSS readers show all articles chronologically without filtering. An ML-powered RSS reader uses sentence embeddings (like MPNet) to understand article content semantically, then trains on your swipe behavior to predict preferences. This achieves 75.4% ROC-AUC accuracy in surfacing content you actually want to read.
- question: What is Thompson sampling in recommendation systems?
  answer: Thompson sampling balances exploration and exploitation in recommendations. It shows predicted-good content 80% of the time (exploit) while randomly introducing unexpected articles 20% of the time (explore). This prevents filter bubbles and lets the model discover when your interests change.
- question: Can you build a personalized RSS reader in Python?
  answer: Yes. Using Flask, SQLite, and sentence-transformers (MPNet), you can build a local RSS reader that learns preferences from swipe interactions. Training happens on Google Colab's free GPU tier. The entire system runs locally with zero infrastructure cost and no cloud dependencies.
- question: How do sentence embeddings work for content recommendation?
  answer: Sentence embeddings convert article titles and descriptions into 768-dimensional vectors that capture semantic meaning. Similar articles cluster together in this vector space. A Hybrid Random Forest classifier then learns which regions of this space match your preferences based on your voting history.
---
{{< img src="rss-tinder-demo2.gif" alt="GIF with interactive demo of the RSS Tinder App" width="80%" >}} Algorithmic timelines are everywhere now. But I still prefer the control of RSS. Readers are good at aggregating content but bad at filtering it. What I wanted was something borrowed from dating apps: instead of an infinite list, give me cards. Swipe right to like, left to dislike. Then train a model to surface what I actually want to read. So I built _RSS Swipr_. 

The frontend is vanilla JavaScript—no React, no build steps, just DOM manipulation and CSS transitions. You drag a card, it follows your finger, and snaps away with a satisfying animation. Behind the scenes, the app tracks everything: votes (like/neutral/dislike), time spent viewing each card, and whether you actually opened the link. If I swipe right but don't click through, that's a signal. If I spend 0.3 seconds on a card before swiping left, that's a signal too.{{< img src="screenshot_feed_import1.png" alt="Feed management interface showing 1084 imported RSS feeds with 9327 total entries" width="80%" >}}Feed management happens through a simple CSV import. Paste a list of `name,url` pairs, click refresh, and the fetcher pulls articles with proper HTTP caching (ETag/Last-Modified) to avoid hammering servers. You can use your own feed list or load a predefined list. Thanks to Manuel Moreale who created [blogroll](https://blogroll.org/) I was able to get an OPML export and load all curated RSS feeds directly. Something similar works with [minifeed](https://minifeed.net/global) or [Kagi's smallweb](https://kagi.com/api/v1/smallweb/feed). Or you use one of the [Hacker News RSS](https://hnrss.github.io) feeds. If that feels too adventurous, I created [curated feeds](https://rss-aggregator.philippd.workers.dev) for the most popular HN bloggers.

Building the model, I started with XGBoost and some hand-engineered features (title length, word count, time of day, feed source). Decent—around 66% ROC-AUC. It learned that I dislike short, clickbaity titles. But it didn't understand context.

The upgrade was MPNet (`all-mpnet-base-v2` from sentence-transformers) to generate 768-dimensional embeddings for every article's title and description. Combined with engineered features—feed preferences, temporal patterns, text statistics—this gets fed into a Hybrid Random Forest.

```python
def predict_preference(article):
    # Generate semantic embeddings (768 dims)
    embeddings = mpnet.encode(f"{article.title} {article.description}")

    # Extract behavioral + text features
    features = feature_pipeline.transform(article)

    # Predict with Hybrid RF
    X = np.hstack([embeddings, features])
    return model.predict_proba(X)
```

Training happens on Google Colab (free T4 GPU or even faster with H100 or A100 on a subscription). Upload your training CSV, run the notebook, download a `.pkl` file.{{< img src="screenshot_colab_head1.png" alt="Google Colab notebook showing model training setup with GPU configuration" width="80%" >}}The notebook handles everything: installing sentence-transformers, downloading the feature engineering pipeline, checking GPU availability, and running 5-fold cross-validation.{{< img src="screenshot_colab_results1.png" alt="Training results showing ROC-AUC of 0.7537 across 5-fold cross-validation" width="80%" >}}With ~1400 training samples, the model achieves _75.4% ROC-AUC (± 0.019 std)_. Not state-of-the-art, but enough to noticeably improve my reading experience. The model now understands that I like systems programming and ML papers, but skip most crypto and generic startup advice.

The problem with transformer models is latency. Generating MPNet embeddings takes ~1 second per article. In a swipe interface, that lag is unbearable. The next best thing is a preload queue. While you're reading the current card, the backend is scoring and fetching the next 3-5 articles in the background. By the time you swipe, the next card is already waiting.

```javascript
async loadNextBatch() {
    const excludeIds = this.cardQueue.map(c => c.id).join(',');
    const response = await fetch(`/api/posts/batch?count=3&exclude=${excludeIds}`);
    const data = await response.json();
    this.cardQueue.push(...data.posts);
}
```

Article selection uses Thompson Sampling: 80% of the time it shows what the model thinks you'll like (exploit), 20% it throws in something unexpected (explore). This prevents the filter bubble problem and lets the model discover if your tastes have changed.

The whole system is designed as a closed loop:

1. **Swipe** → votes get stored in SQLite
2. **Export** → download training CSV with votes + engagement data
3. **Train** → run Colab notebook, get new model
4. **Upload** → drag-drop the `.pkl` file back into the app

{{< img src="screenshot_export1.png" alt="Export interface showing 1421 votes with breakdown: 583 likes, 193 neutral, 645 dislikes" width="80%" >}}The export includes everything the model needs: article text, feed metadata, your votes, link opens, and time spent. You can also **import** a previous training CSV to restore your voting history on a fresh install—useful if you want to clone the repo on a new machine without losing your data.{{< img src="screenshot_model_selection1.png" alt="Model management interface showing active hybrid_rf model with ROC-AUC 0.7537" width="80%" >}}

Uploaded models show their ROC-AUC score so you can compare performance across training runs. Activate whichever one works best.

**Backend**: Python, Flask, SQLite
**Frontend**: Vanilla JS, CSS variables
**ML**: scikit-learn, XGBoost, sentence-transformers (MPNet)
**Training**: Google Colab (free GPU tier)

Total infrastructure cost: zero. Everything runs locally. No accounts, no cloud dependencies, no tracking.

```bash
git clone https://github.com/philippdubach/rss-swipr.git
cd rss-swipr
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The [full source](https://github.com/philippdubach/rss-swipr) and [Colab notebook](https://colab.research.google.com/drive/1XjnAuwF3naPElKH9yZ3UEdslzN7qAUrQ?usp=sharing) are available on GitHub.
