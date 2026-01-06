---
title: "65% of Hacker News Posts Have Negative Sentiment, and They Outperform"
seoTitle: "65% of HN Posts Have Negative Sentiment, They Outperform"
date: 2026-01-06
lastmod: 2026-01-06
slug: hn-sentiment
images: ['https://static.philippdubach.com/ograph/ograph-hn-science.jpg']
description: "Analysis of 32,000 HN posts and 340K comments reveals negativity bias correlates with higher engagement. Data, methodology, and full paper available."
keywords: ["Hacker News sentiment analysis", "attention dynamics research", "HN engagement data", "NLP sentiment classification", "social news ranking", "content virality", "DistilBERT BERT RoBERTa", "LLM sentiment scoring", "tech community behavior", "computational social science"]
draft: false
---

Posts with negative sentiment average 35.6 points on [Hacker News](https://news.ycombinator.com). The overall average is 28 points. That's a 27% performance premium for negativity. {{< img src="hn-sentiment.png" alt="Distribution of sentiment scores across 32,000 Hacker News posts" width="80%" >}} This finding comes from an empirical study I've been running on HN attention dynamics, covering decay curves, preferential attachment, survival probability, and early-engagement prediction. The preprint is [available on SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5910263). I already had a gut feeling. Across 32,000 posts and 340,000 comments, nearly 65% register as negative. This might be a feature of my classifier being miscalibrated toward negativity; yet the pattern holds across six different models. {{< img src="sentiment_models_comparison_6models.png" alt="Sentiment distribution comparison across DistilBERT, BERT Multi, RoBERTa, Llama 3.1 8B, Mistral 3.1 24B, and Gemma 3 12B" width="80%" >}} I tested three transformer-based classifiers (DistilBERT, BERT Multi, RoBERTa) and three LLMs (Llama 3.1 8B, Mistral 3.1 24B, Gemma 3 12B). The distributions vary, but the negative skew persists across all of them (inverted scale for 2-6). The results I use in my dashboard are from DistilBERT because it runs efficiently in my Cloudflare-based pipeline.

What counts as "negative" here? Criticism of technology, skepticism toward announcements, complaints about industry practices, frustration with APIs. The usual. It's worth noting that technical critique reads differently than personal attacks; most HN negativity is substantive rather than toxic. But, does negativity cause engagement, or does controversial content attract both negative framing and attention? Probably some of both. 

I'll publish the full code, dataset, and a dashboard for the HN archiver soon and I'm happy to send you an update:

<aside class="inline-newsletter no-border" aria-label="Newsletter signup">
  <div class="inline-newsletter-content">
    <form id="subscribe-form" class="inline-newsletter-form">
      <label for="subscribe-email" class="visually-hidden">Email address</label>
      <input 
        type="email" 
        id="subscribe-email" 
        name="email" 
        placeholder="your@email.com" 
        required 
        class="inline-newsletter-input"
        aria-label="Email address"
      />
      <button type="submit" class="inline-newsletter-button">Sign Up</button>
    </form>
    <p id="subscribe-privacy" class="inline-newsletter-privacy"><a href="/posts/building-a-no-tracking-newsletter-from-markdown-to-distribution/">No tracking</a>. Unsubscribe anytime.</p>
    <div id="subscribe-message" class="inline-newsletter-message" style="display: none;"></div>
  </div>
</aside>

<script>
(function() {
  var formId = 'subscribe-form';
  var messageId = 'subscribe-message';
  var emailId = 'subscribe-email';
  var privacyId = 'subscribe-privacy';
  
  function init() {
    var form = document.getElementById(formId);
    var messageDiv = document.getElementById(messageId);
    var emailInput = document.getElementById(emailId);
    var privacyDiv = document.getElementById(privacyId);
    
    // Fetch subscriber count and prepend to privacy text
    if (privacyDiv) {
      fetch('https://newsletter-api.philippd.workers.dev/api/subscriber-count')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.display) {
            var currentHTML = privacyDiv.innerHTML;
            privacyDiv.innerHTML = 'Join ' + data.display + ' readers. ' + currentHTML;
          }
        })
        .catch(function() { /* Silent fail - shows default text */ });
    }
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      var email = emailInput.value.trim();
      if (!email) return;
      
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }
      
      var submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Subscribing...';
      
      fetch('https://newsletter-api.philippd.workers.dev/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        if (data.success) {
          form.style.display = 'none';
          document.querySelector('#' + formId).closest('.inline-newsletter').querySelector('.inline-newsletter-privacy').style.display = 'none';
          showMessage('Thanks for subscribing! You\'ll receive the next newsletter in your inbox. In the meantime, you can <a href="/newsletter-archive/">browse the archive</a>.', 'success');
        } else {
          showMessage(data.error || 'Something went wrong. Please try again.', 'error');
          submitButton.disabled = false;
          submitButton.textContent = 'Sign Up';
        }
      })
      .catch(function() {
        showMessage('Something went wrong. Please try again later.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
      });
    });
    
    function showMessage(text, type) {
      messageDiv.innerHTML = text;
      messageDiv.className = 'inline-newsletter-message inline-newsletter-message-' + type;
      messageDiv.style.display = 'block';
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>

Alternatively, you can also subscribe to the [RSS feed](/index.xml) or get updates on [Bluesky](https://bsky.app/profile/philippdubach.com).