---
title: "Past issues"
slug: newsletter-archive
description: "Every monthly newsletter, indexed by date. Read the back catalogue or subscribe to get the next one."
robots: "noindex, nofollow"
draft: false
og_type: "website"
---

<div id="newsletter-archive-list" class="archive-issues" aria-live="polite">
  <p class="archive-issues__loading">Loading issues…</p>
</div>

<p class="archive-issues__cta"><a href="/subscribe/">Subscribe to get the next one →</a></p>

<script>
(function() {
  var container = document.getElementById('newsletter-archive-list');
  if (!container) return;

  function fmtDate(s) {
    if (!s) return '';
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  fetch('https://newsletter-api.philippd.workers.dev/api/newsletters')
    .then(function(r) {
      if (!r.ok) throw new Error('archive fetch failed');
      return r.json();
    })
    .then(function(data) {
      var list = data && data.newsletters;
      if (!list || !list.length) {
        container.innerHTML = '<p class="archive-issues__empty">No issues yet. The first one is on its way.</p>';
        return;
      }

      var html = '<ul class="archive-issues__list">';
      list.forEach(function(n) {
        var date = fmtDate(n.date);
        var title = n.title || n.filename || 'Issue';
        var url = n.url || (n.filename ? 'https://static.philippdubach.com/newsletter/' + n.filename : '#');
        html += '<li class="archive-issues__item">';
        html += '<a href="' + url + '" class="archive-issues__link" target="_blank" rel="noopener">';
        if (date) html += '<time class="archive-issues__date">' + date + '</time>';
        html += '<span class="archive-issues__title">' + title + '</span>';
        html += '</a>';
        html += '</li>';
      });
      html += '</ul>';
      container.innerHTML = html;
    })
    .catch(function() {
      container.innerHTML = '<p class="archive-issues__error">Could not load the archive right now. Try again in a moment.</p>';
    });
})();
</script>
