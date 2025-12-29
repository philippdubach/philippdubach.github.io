---
title: "Building a No-Tracking Newsletter from Markdown to Distribution"
date: 2025-12-24
images: ['https://static.philippdubach.com/ograph/ograph-newsletter-setup.jpg']
description: "Building a privacy-focused newsletter from Markdown to HTML with Cloudflare Workers, KV storage, and Resend API."
keywords: ["newsletter system", "Cloudflare Workers", "email API", "privacy-focused email", "markdown to html", "KV storage", "Resend API", "self-hosted newsletter", "no-tracking email", "developer newsletter"]
tags: ["Project"]
draft: false
---
{{< img src="Newsletter_Overview2.jpg" alt="Screenshot of rendered newsletter showing article preview cards with images and descriptions" width="80%" >}}
Friends have been asking how they can stay up to date with what I'm working on and keep track of the things I read, write, and share. RSS feeds don't seem to be en vogue anymore, apparently. So I built a mailing list. What else would you do over the Christmas break?

From a previous marketing job I knew Mailchimp. Also, every newsletter I unsubscribe from is Mailchimp. I no longer wish to receive these emails.
{{< img src="unsubscribe2.png" alt="Unsubscribe confirmation from Mailchimp newsletters" width="80%" >}}
Or obviously Substack. I read [Simon Willison's Newsletter](https://simonw.substack.com) sometimes. And obviously [Michael Burry's $379 Substack](/2025/11/28/michael-burrys-379-newsletter/). Those are solid options, but I had a clear picture in mind of what I wanted. I wanted only HTML, no tracking (also why I use [GoatCounter](https://www.goatcounter.com/) on my site and not Google Analytics), and full control of the creation and distribution chain from end to end. So I sat down and drew into my notebook, what I always do when I have an idea after a long walk or a hot shower.
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
            bcc: ['info@philippdubach.com'],
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    var form = document.getElementById('newsletter-form');
    var messageDiv = document.getElementById('newsletter-message');
    var emailInput = document.getElementById('email');
    var countDiv = document.getElementById('subscriber-count');
    
    if (countDiv) {
      fetch('https://newsletter-api.philippd.workers.dev/api/subscriber-count')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.display) {
            countDiv.textContent = 'Join ' + data.display + ' readers';
            countDiv.style.display = 'block';
          }
        })
        .catch(function() {});
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
          if (countDiv) countDiv.style.display = 'none';
          showMessage('Thanks for subscribing! You\'ll receive the next newsletter in your inbox.', 'success');
        } else {
          showMessage(data.error || 'Something went wrong. Please try again.', 'error');
          submitButton.disabled = false;
          submitButton.textContent = 'Subscribe';
        }
      })
      .catch(function() {
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
