---
title: "Subscribe"
slug: subscribe
description: "Get monthly insights on quantitative finance, AI strategy, and macroeconomics delivered to your inbox."
draft: false
---

A monthly email with my latest writing on quantitative finance, AI infrastructure, and macro strategy—plus interesting reads from around the web.

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

Alternatively, you can also subscribe to the [RSS feed](/index.xml) or get updates on [Bluesky](https://bsky.app/profile/philippdubach.com) or [X (Twitter)](https://x.com/philippdubach).
