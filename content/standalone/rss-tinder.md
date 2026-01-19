---
title: RSS Tinder
date: 2026-01-19
images:
- https://static.philippdubach.com/ograph/ograph-rss-tinder.jpg
description: Built an ML-powered RSS reader with Tinder-style interface using MPNet embeddings and Random Forest to predict reading preferences.
keywords:
- RSS reader machine learning
- news curation algorithm
- MPNet embeddings
- recommendation system
- swipe interface
categories:
- AI
type: Project
draft: false
---

{{< img src="rss-tinder-demo2.gif" alt="GIF with interactive demo of the RSS Tinder App" width="80%" >}} RSS feeds don’t seem to be en vogue anymore, apparently. Everyone is on algorithmic timelines now. But I still love the control of RSS; except for the part where I have 1,000+ unread items and a mild panic attack every time I open my reader.

So I built **RSS Tinder**. RSS readers are great at aggregating content but terrible at filtering it. What I wanted is known from dating Apps: Instead of a list, give me cards. Swipe right to like, left to dislike. Then, train a model to do the heavy lifting for me.

So I built the frontend with vanilla JavaScript because I wanted it to be lightweight and fast. No React, no build steps, just raw DOM manipulation and CSS transitions. It’s actually quite satisfying. You drag a card, it follows your mouse (or finger), and snaps away with a satisfying *thwack*.{{< img src="rss-tinder3.png" alt="Static overview of the RSS Tinder App" width="80%" >}}Behind the scenes, the app tracks everything. Not just votes (Like/Neutral/Dislike), but engagement time and link opens. If I swipe right but don't open the link, that's a signal. If I spend 0.5 seconds on a card before swiping left, that's a signal.

I started with **XGBoost** and some engineered features (title length, word count, time of day). It was decent—about **66% ROC-AUC**. It learned that I generally dislike short, clickbaity titles. But it didn't understand *context*.

I upgraded the pipeline to use **MPNet** (specifically `all-mpnet-base-v2` from Hugging Face) to generate 768-dimensional embeddings for every article title and description. I fed these, along with my engineered features, into a Hybrid Random Forest model.

The result? **73.5% ROC-AUC**. The model now understands that I like "Machine Learning" and "System Design" but gets bored by "Crypto" and generic "Startup Advice."

```python
def predict_preference(article):
    # 1. Generate semantic embeddings
    embeddings = mpnet.encode(article.text)
    
    # 2. Extract behavioral features (time, author, feed)
    features = extract_features(article)
    
    # 3. Predict with Hybrid RF
    score = model.predict_proba(np.hstack([embeddings, features]))
    return score

```
The only problem with heavy ML models is latency. Scoring an article with MPNet took about a second. In a swipe interface, a one-second lag feels like an eternity.

I solved this with a **Preload Queue**. The backend is frantically scoring and fetching the next 5 articles in the background.

```javascript
if (cardQueue.length < 5) {
    fetch('/api/posts/batch?limit=5')
        .then(posts => addToQueue(posts));
}

```

Now, the UI is buttery smooth. It uses **Thompson Sampling** (80% exploit, 20% explore) to decide what to show you next. Most of the time it shows what it *thinks* you like, but occasionally it throws in a wildcard just to see if your tastes have changed.

**Backend:** Python & Flask (Simple, effective).
**Database:** SQLite (Because Postgres is overkill for my reading habits).
**ML:** Scikit-learn, XGBoost, Sentence-Transformers (MPNet).
**Frontend:** Vanilla JS, CSS Variables.
<br> 
<br>
_If there is some interest I will make the code public so you can train and run your own version_
{{< newsletter >}}