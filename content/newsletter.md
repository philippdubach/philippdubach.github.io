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

<p class="subscribe-latest">Read <a id="subscribe-latest-link" href="/newsletter-archive/"><span id="subscribe-latest-text">the latest issue</span></a>, or subscribe via <a href="/index.xml">RSS</a> or <a href="https://bsky.app/profile/philippdubach.com">Bluesky</a>.</p>

<script>
(function() {
  var form = document.getElementById('subscribe-newsletter-form');
  var msg = document.getElementById('subscribe-newsletter-message');
  var privacy = document.getElementById('subscribe-newsletter-privacy');
  var emailInput = document.getElementById('subscribe-newsletter-email');

  if (privacy && !privacy.dataset.countLoaded) {
    privacy.dataset.countLoaded = 'true';
    fetch('https://newsletter-api.philippd.workers.dev/api/subscriber-count')
      .then(function(r){return r.json();})
      .then(function(d){ if (d.display) privacy.insertBefore(document.createTextNode('Join ' + d.display + ' readers. '), privacy.firstChild); })
      .catch(function(){});
  }

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

  // Latest issue link — visible by default pointing at /newsletter-archive/
  // (the archive page does its own API call). Once the same API resolves
  // here, the link is upgraded to open the latest issue directly from the
  // CDN. Same endpoint as content/newsletter-archive.md so both pages stay
  // in sync; the localhost CSP/CORS may block this — that is fine, the
  // archive fallback keeps the link functional.
  var latestLink = document.getElementById('subscribe-latest-link');
  var latestText = document.getElementById('subscribe-latest-text');
  if (latestLink && latestText) {
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
        if (top.date) latestText.textContent = 'the ' + top.date + ' issue';
      })
      .catch(function() { /* silent — link still works as archive fallback */ });
  }
})();
</script>

