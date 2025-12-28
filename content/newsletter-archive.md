---
title: "Newsletter Archive"
slug: newsletter-archive
description: "Archive of past newsletters"
robots: "noindex, nofollow"
draft: false
---

<div id="newsletter-archive-list" class="newsletter-archive">
  <p>Loading newsletters...</p>
</div>

<script>
(function() {
  var container = document.getElementById('newsletter-archive-list');
  if (!container) return;
  
  fetch('https://newsletter-api.philippd.workers.dev/api/newsletters')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to fetch newsletters');
      return response.json();
    })
    .then(function(data) {
      if (!data.newsletters || data.newsletters.length === 0) {
        container.innerHTML = '<p>No newsletters found.</p>';
        return;
      }
      
      var html = '<ul class="newsletter-list">';
      data.newsletters.forEach(function(newsletter) {
        var date = newsletter.date || '';
        var title = newsletter.title || newsletter.filename;
        var url = newsletter.url || 'https://static.philippdubach.com/newsletter/' + newsletter.filename;
        html += '<li class="newsletter-item">';
        html += '<span class="newsletter-date">' + date + '</span> ';
        html += '<a href="' + url + '" target="_blank" rel="noopener">' + title + '</a>';
        html += '</li>';
      });
      html += '</ul>';
      container.innerHTML = html;
    })
    .catch(function(error) {
      container.innerHTML = '<p>Unable to load newsletters. Please try again later.</p>';
    });
})();
</script>

