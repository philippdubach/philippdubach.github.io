---
title: "Subscribe"
slug: subscribe
description: "Subscribe to receive monthly updates with new posts, projects, and interesting articles I've been reading."
draft: false
---

I send out a newsletter version of this blog, things I've been working on, and interesting articles once every month or so. You can subscribe to that here:

<div id="newsletter-form-container">
  <form id="newsletter-form" class="newsletter-form">
    <div class="form-group">
      <label for="email" class="visually-hidden">Email address</label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        placeholder="your@email.com" 
        required 
        class="newsletter-input"
        aria-label="Email address"
      />
    </div>
    <button type="submit" class="newsletter-button">Subscribe</button>
  </form>
  <p id="subscriber-count" class="subscriber-count" style="display: none;"></p>
  <div id="newsletter-message" class="newsletter-message" style="display: none;"></div>
</div>

<script>
(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Form handling
    var form = document.getElementById('newsletter-form');
    var messageDiv = document.getElementById('newsletter-message');
    var emailInput = document.getElementById('email');
    var countDiv = document.getElementById('subscriber-count');
    
    // Fetch and display subscriber count
    if (countDiv) {
      fetch('https://newsletter-api.philippd.workers.dev/api/subscriber-count')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.display) {
            countDiv.textContent = 'Join ' + data.display + ' readers';
            countDiv.style.display = 'block';
          }
        })
        .catch(function() { /* Silent fail */ });
    }
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      var email = emailInput.value.trim();
      if (!email) return;
      
      // Basic email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }
      
      // Disable form during submission
      var submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Subscribing...';
      
      fetch('https://newsletter-api.philippd.workers.dev/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.success) {
          form.style.display = 'none';
          if (countDiv) countDiv.style.display = 'none';
          showMessage('Thanks for subscribing! You\'ll receive the next newsletter in your inbox. In the meantime, you can <a href="/newsletter-archive/">browse the archive</a>.', 'success');
        } else {
          showMessage(data.error || 'Something went wrong. Please try again.', 'error');
          submitButton.disabled = false;
          submitButton.textContent = 'Subscribe';
        }
      })
      .catch(function(error) {
        showMessage('Something went wrong. Please try again later.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe';
      });
    });
    
    function showMessage(text, type) {
      messageDiv.innerHTML = text;
      messageDiv.className = 'newsletter-message newsletter-message-' + type;
      messageDiv.style.display = 'block';
    }
  }
})();
</script>

Alternatively, you can also subscribe to the [RSS feed](/index.xml).
