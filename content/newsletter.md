---
title: "Subscribe"
slug: subscribe
description: "A monthly email with new writing on quantitative finance, AI, and macro strategy."
draft: false
og_type: "website"
takeaways:
  - "Monthly cadence: one email per month, written when there's something worth saying."
  - "Coverage: quantitative finance, AI infrastructure, and macro strategy, plus shorter-form reads from across the web."
  - "Self-hosted on Cloudflare Workers, addresses in Cloudflare KV. No third-party processor, no open-tracking pixels."
---

The same research that appears as essays here, in shorter form, plus interesting reads from across the web.

Written for analysts, engineers, and investors who want signal over noise. No tracking pixels, no open-rate tracking, no third-party processor. Addresses live in Cloudflare KV under my own domain; nothing else is stored.

<form id="subscribe-form" class="subscribe-form">
  <label for="subscribe-email" class="visually-hidden">Email address</label>
  <input
    type="email"
    id="subscribe-email"
    name="email"
    placeholder="your@email.com"
    required
    class="subscribe-form__input"
    aria-label="Email address"
    autocomplete="email"
    inputmode="email"
  />
  <button type="submit" class="subscribe-form__button">Subscribe</button>
</form>

<p class="subscribe-form__privacy"><a href="/posts/building-a-no-tracking-newsletter-from-markdown-to-distribution/">No tracking</a>. Unsubscribe one click.</p>

<div id="subscribe-message" class="subscribe-form__message" style="display: none;"></div>

<script>
(function() {
  var form = document.getElementById('subscribe-form');
  var msg = document.getElementById('subscribe-message');
  if (!form) return;
  var email = document.getElementById('subscribe-email');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var v = email.value.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { show('Please enter a valid email address.', 'error'); return; }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Subscribing...';
    fetch('https://newsletter-api.philippd.workers.dev/api/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success) {
        form.style.display = 'none';
        document.querySelector('.subscribe-form__privacy').style.display = 'none';
        show('Thanks. The next issue will land in your inbox. In the meantime, the <a href="/newsletter-archive/">archive</a> is here.', 'success');
      } else {
        show(d.error || 'Something went wrong. Please try again.', 'error');
        btn.disabled = false; btn.textContent = 'Subscribe';
      }
    })
    .catch(function() {
      show('Something went wrong. Please try again later.', 'error');
      btn.disabled = false; btn.textContent = 'Subscribe';
    });
  });
  function show(t, kind) {
    msg.innerHTML = t;
    msg.className = 'subscribe-form__message subscribe-form__message--' + kind;
    msg.style.display = 'block';
  }
})();
</script>

Alternatively, subscribe to the [RSS feed](/index.xml) or follow on [Bluesky](https://bsky.app/profile/philippdubach.com).
