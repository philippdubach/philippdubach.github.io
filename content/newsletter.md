---
title: "Subscribe"
slug: subscribe
description: "A monthly email with new writing on quantitative finance, AI, and macro strategy."
draft: false
og_type: "website"
---

The same research that appears as essays here, in shorter form, plus interesting reads from across the web.

Written for analysts, engineers, and investors who want signal over noise. No tracking pixels, no open-rate tracking, no third-party processor. Addresses live in Cloudflare KV under my own domain; nothing else is stored.

<aside class="home-newsletter subscribe-cta" aria-label="Newsletter signup" data-nosnippet>
  <div class="home-newsletter__label section-label">Newsletter</div>
  <p class="home-newsletter__pitch">A monthly email with my latest writing on quantitative finance, AI infrastructure, and macro strategy, plus interesting reads from around the web.</p>
  <form id="subscribe-newsletter-form" class="home-newsletter__form">
    <label for="subscribe-newsletter-email" class="visually-hidden">Email address</label>
    <input type="email" id="subscribe-newsletter-email" name="email" placeholder="your@email.com" required
           class="home-newsletter__input" aria-label="Email address" autocomplete="email" inputmode="email">
    <button type="submit" class="home-newsletter__button">Subscribe</button>
  </form>
  <p id="subscribe-newsletter-privacy" class="home-newsletter__meta"><a href="/posts/building-a-no-tracking-newsletter-from-markdown-to-distribution/">No tracking</a>. Unsubscribe anytime.</p>
  <div id="subscribe-newsletter-message" class="home-newsletter__message" style="display:none;"></div>
</aside>

<p id="subscribe-latest" class="subscribe-latest">
  <a id="subscribe-latest-link" href="/newsletter-archive/" class="subscribe-latest__link">
    <span class="subscribe-latest__label">Read the latest issue</span>
    <span id="subscribe-latest-title" class="subscribe-latest__title"></span>
    <span class="subscribe-latest__chevron" aria-hidden="true">→</span>
  </a>
</p>

<script>
(function() {
  var form = document.getElementById('subscribe-newsletter-form');
  var msg = document.getElementById('subscribe-newsletter-message');
  var privacy = document.getElementById('subscribe-newsletter-privacy');
  var emailInput = document.getElementById('subscribe-newsletter-email');

  if (form && emailInput) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var v = emailInput.value.trim();
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
          if (privacy) privacy.style.display = 'none';
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
  }
  function show(t, kind) {
    if (!msg) return;
    msg.innerHTML = t;
    msg.className = 'home-newsletter__message home-newsletter__message--' + kind;
    msg.style.display = 'block';
  }

  // Latest issue link — visible by default pointing at /newsletter-archive/.
  // JS enhances it with the direct issue URL + title once the API resolves.
  var latestLink = document.getElementById('subscribe-latest-link');
  var latestTitle = document.getElementById('subscribe-latest-title');
  if (latestLink && latestTitle) {
    fetch('https://newsletter-api.philippd.workers.dev/api/newsletters')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (!data || !data.newsletters || !data.newsletters.length) return;
        var top = data.newsletters[0];
        var url = top.url || (top.filename ? 'https://static.philippdubach.com/newsletter/' + top.filename : null);
        if (!url) return;
        latestLink.href = url;
        latestLink.target = '_blank';
        latestLink.rel = 'noopener';
        if (top.title) latestTitle.textContent = top.title;
      })
      .catch(function() { /* silent — link still works as archive fallback */ });
  }
})();
</script>

Alternatively, subscribe to the [RSS feed](/index.xml) or follow on [Bluesky](https://bsky.app/profile/philippdubach.com).
