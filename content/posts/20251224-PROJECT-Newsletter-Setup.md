---
title: Building a No-Tracking Newsletter from Markdown to Distribution
seoTitle: Building a No-Tracking Newsletter System
date: 2025-12-24
lastmod: 2026-01-03
images:
- https://static.philippdubach.com/ograph/ograph-newsletter-setup.jpg
description: Building a privacy-focused newsletter from Markdown to HTML with Cloudflare
  Workers, KV storage, and Resend API.
keywords:
- newsletter system
- Cloudflare Workers
- email API
- privacy-focused email
- markdown to html
- KV storage
- Resend API
- self-hosted newsletter
- no-tracking email
- developer newsletter
tags:
- Project
draft: false
aliases:
- /2025/12/24/building-a-no-tracking-newsletter-from-markdown-to-distribution/

---
{{< img src="Newsletter_Overview2.jpg" alt="Screenshot of rendered newsletter showing article preview cards with images and descriptions" width="80%" >}}
Friends have been asking how they can stay up to date with what I'm working on and keep track of the things I read, write, and share. RSS feeds don't seem to be en vogue anymore, apparently. So I built a mailing list. What else would you do over the Christmas break?

From a previous marketing job I knew Mailchimp. Also, every newsletter I unsubscribe from is Mailchimp. I no longer wish to receive these emails.
{{< img src="unsubscribe2.png" alt="Unsubscribe confirmation from Mailchimp newsletters" width="80%" >}}
Or obviously Substack. I read [Simon Willison's Newsletter](https://simonw.substack.com) sometimes. And obviously [Michael Burry's $379 Substack](/posts/michael-burrys-379-newsletter/). Those are solid options, but I had a clear picture in mind of what I wanted. I wanted only HTML, no tracking (also why I use [GoatCounter](https://www.goatcounter.com/) on my site and not Google Analytics), and full control of the creation and distribution chain from end to end. So I sat down and drew into my notebook, what I always do when I have an idea after a long walk or a hot shower.
{{< img src="newsletter_scetch3.jpg" alt="Hand-drawn notebook sketch of newsletter architecture showing markdown to HTML to distribution flow" width="80%" >}}
I then went over to Illustrator (actually [Affinity Designer](https://affinity.serif.com/en-us/designer/), which I have been happily using since my Creative Cloud subscription ran out, sorry Adobe) and built a quick mockup of my drawing. I fed the mockup to Claude to generate pure HTML. After a few iterations it more or less looked like I wanted it to be.

The architecture: write the newsletter in Markdown (as I do for all of [my blog](/about)). Render it as HTML. Fetch OpenGraph images from my Cloudflare CDN at the lowest feasible resolution and pull descriptions automatically. Format links with preview cards. Keep some space for freetext at the top and bottom.
{{< img src="newsletter_architecture2.png" alt="Flowchart showing newsletter pipeline: Write Markdown, Render HTML, Host on R2, Fetch KV for subscribers, Send via Resend API" width="80%" >}}
I built a [Python engine](https://github.com/philippdubach/newsletter-generator) that renders my `.md` files to email-safe HTML. The script handles several things automatically: (1) It fetches OpenGraph metadata for every link using Beautiful Soup, caching results to avoid repeated requests. (2) optimizes images using Cloudflare's image transformation service. For email, I use 240px width (2x the display size of 120px for retina displays). (3) It generates LinkedIn-style preview cards with images on the left and text on the right. The output is table-based HTML because email clients from 2003 still exist and they're apparently immortal.
{{< img src="Newsletter_Overview.png" alt="Screenshot of rendered newsletter showing article preview cards with images and descriptions" width="80%" >}}
Originally I intended to manually copy-paste the HTML into an email and send it out since I did not expect many subscribers at first (or at all). But I had another challenge at hand: how do people sign up?

Since I had already been using [Cloudflare Workers KV](https://developers.cloudflare.com/kv/) to build an API with historic values of my temperature and humidity sensor at home, I resorted to that. The API is simple. POST to `/api/subscribe` with an email address, and it gets stored in KV with a timestamp and some metadata.

After some Copilot iterations (I'm not a security guy, so not sure how I feel about handing all the security and testing to an agent, please reach out if you can help) the Worker includes rate limiting, honeypot fields for spam protection, proper CORS headers, and RFC-compliant email validation. 

I then wanted to get a confirmation email every time someone signed up. Since SMTP sending over my domain did not work reliably at first, I had to look for other options. Even though I wanted everything self-hosted, I ended up using the [Resend API](https://resend.com/). The API is straightforward:

```typescript
async function sendWelcomeEmail(subscriberEmail: string, env: Env) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'Philipp Dubach <noreply@notifications.philippdubach.com>',
            to: [subscriberEmail],
            subject: 'Welcome to the Newsletter',
            html: `<p>Thanks for subscribing!</p>`,
        }),
    });
    return response.ok;
}
```
<br>

After implementing this, I figured: why not send a confirmation to the subscriber and a copy to me? Why not use Resend for the whole distribution? (This is not a paid advertisement.) The HTML newsletter I generate goes straight into the email body. No images hosted elsewhere (except for the optimized preview thumbnails). No tracking pixels. No click tracking. The email is just HTML.

I also looked at [Mailgun](https://www.mailgun.com/) and [SendGrid](https://sendgrid.com/) before settling on Resend. Mailgun has better deliverability monitoring but a more complex API. SendGrid has more features but felt overengineered for what I needed. Resend's free tier and simple API won. If you have strong opinions on email APIs, I'm curious to hear them.

The total cost of running this: zero. Cloudflare Workers has a generous free tier. Cloudflare R2 (where the HTML newsletters are hosted) has 10GB free storage. Resend gives 3,000 emails per month. The Python script runs locally or on my Azure instance.

You can find [my first newsletter here](https://static.philippdubach.com/newsletter/newsletter-2025-12.html). The full code for both the [newsletter generator](https://github.com/philippdubach/newsletter-generator) and the [subscriber API](https://github.com/philippdubach/newsletter-api) is on GitHub. Needless to say, I would be delighted if we keep in touch through my mailing list:

<aside class="inline-newsletter no-border" aria-label="Newsletter signup">
  <div class="inline-newsletter-content">
    <form id="project-newsletter-form" class="inline-newsletter-form">
      <label for="project-newsletter-email" class="visually-hidden">Email address</label>
      <input 
        type="email" 
        id="project-newsletter-email" 
        name="email" 
        placeholder="your@email.com" 
        required 
        class="inline-newsletter-input"
        aria-label="Email address"
      />
      <button type="submit" class="inline-newsletter-button">Sign Up</button>
    </form>
    <p id="project-newsletter-privacy" class="inline-newsletter-privacy"><a href="/posts/building-a-no-tracking-newsletter-from-markdown-to-distribution/">No tracking</a>. Unsubscribe anytime.</p>
    <div id="project-newsletter-message" class="inline-newsletter-message" style="display: none;"></div>
  </div>
</aside>

<script>
(function() {
  var formId = 'project-newsletter-form';
  var messageId = 'project-newsletter-message';
  var emailId = 'project-newsletter-email';
  var privacyId = 'project-newsletter-privacy';
  
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
          showMessage('Thanks for subscribing! You\'ll receive the next newsletter in your inbox.', 'success');
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
