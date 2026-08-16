+++
title = "Degoogling cost me my YouTube feed, so I made my own"
seoTitle = "Self-Hosted YouTube RSS Subscriptions Feed, No API Key"
date = 2026-06-14
lastmod = 2026-08-16
publishDate = 2026-06-14T03:00:00Z
images = ["https://static.philippdubach.com/degoogle-youtube-feed-cover.png"]
description = "I dropped the YouTube app and rebuilt only my subscription feed. A self-hosted Cloudflare Worker reads public RSS feeds without an API key."
keywords = ["self-hosted YouTube subscriptions feed", "YouTube subscriptions RSS feed", "watch YouTube without the app", "YouTube RSS feed without API key", "degoogle YouTube", "RSS feed for YouTube channel", "YouTube channel RSS videos.xml", "Cloudflare Worker RSS reader", "youtube-nocookie embed privacy", "YouTube picture-in-picture without Premium", "filter YouTube Shorts", "Piped Invidious FreeTube alternative", "watch YouTube without account", "vanilla JS Cloudflare Worker", "Cloudflare KV Cache API Worker", "fast-xml-parser Atom feed"]
categories = ["Tech"]
type = "Project"
draft = false
takeaways = [
  "One Cloudflare Worker reads each channel's public RSS feed and returns a server-rendered page. It needs no YouTube API key or framework.",
  "The Worker converts handles and URLs into stable channel IDs. It parses each Atom feed with fast-xml-parser and avoids Google API quotas.",
  "It fetches channels in parallel, applies a timeout to each request, and caches results for 15 minutes. One failed channel cannot break the page.",
]
faq = [
  {question = "Why rebuild a YouTube feed instead of using the app?", answer = "I used the app only to see new videos from 10 to 15 channels. I did not use comments, recommendations, or Shorts. My replacement keeps only the subscription feed."},
  {question = "Does this need a YouTube Data API key?", answer = "No. Each YouTube channel publishes recent uploads at feeds/videos.xml in Atom, a standard XML feed format. The Worker reads it directly. It needs no Google project, quota, or key."},
  {question = "Can you watch YouTube subscriptions without a Google account?", answer = "Yes. Public channel feeds need no sign-in. You keep your own list of channels, and Google stores no subscription list for this feed."},
  {question = "How does it find a channel's videos without the API?", answer = "You add a URL or @handle. The Worker reads the channel page once and finds its stable channel ID. It saves that ID and uses it for later feed requests."},
  {question = "How are YouTube Shorts filtered out?", answer = "The Worker first checks the title for #shorts. It then tests how the video URL redirects, because Shorts and full videos resolve differently. A video appears only if it passes both checks."},
  {question = "Does watching a video track you?", answer = "Not before you press play. The page shows static thumbnails. A click loads YouTube's privacy-enhanced player, which can then receive your IP address and store a local identifier. On iOS, the video starts muted because Apple blocks one-tap sound."},
  {question = "How are channels stored and the feed kept fast?", answer = "Cloudflare KV stores the channel list. The Cache API keeps the merged feed near users for 15 minutes. Feed requests run in parallel and have timeouts, so one channel cannot stall the page."},
]
+++

{{< img src="degoogle-youtube-feed-cover.png" alt="The feed lists new videos from Veritasium, Vizeh, First We Feast, and Saturday Night Live in a desktop browser. It shows no comments, recommendations, or Shorts." width="80%" priority="true" >}}

I dropped the YouTube app as part of degoogling my life. I had used it for one screen: new videos from the 10 to 15 channels I follow. No comments, no recommendations, no Shorts. I rebuilt that screen and nothing else.

## Just the feed, nothing else

The result is one chronological list. It merges videos from every channel I follow and sorts them newest first. I can add a channel by URL or @handle, and it stays on the list.

I ignore or avoid everything YouTube adds to the subscription feed. Building the one screen I use took less work than configuring the app to leave me alone.

## How it works without an API key

Each channel publishes a public RSS feed at `feeds/videos.xml`. The file uses Atom, a standard XML format for content feeds. A Cloudflare Worker reads it, and `fast-xml-parser` converts the XML into structured data. The Worker is a small program that runs on Cloudflare's network.

This route avoids the YouTube Data application programming interface (API), Google's official interface for software requests. It needs no quota, Google project, or token.

A handle or vanity URL can change, but a channel ID remains stable. The Worker reads the channel page once to find that ID. It saves the result and uses the ID for later feed requests.

Before the Worker fetches a user-supplied URL, it checks the destination. This guard prevents server-side request forgery (SSRF). Without it, someone could make the Worker fetch an unintended address.

{{< readnext slug="moving-the-blog-stack-to-europe-kind-of" >}}

## Filtering out YouTube Shorts

Shorts were the main thing I wanted gone, and one check does not catch them reliably. The first check looks for `#shorts` in the title. The second tests how the video URL redirects because Shorts and full videos resolve differently. A video must pass both checks to appear.

## Playback without the tracking

Clicking a thumbnail loads the video through YouTube's privacy-enhanced iframe player. An iframe places a page from one site inside another page. The embed does not load before that click, so the player cannot set cookies before playback.

This is not perfect privacy. Once loaded, the player writes an identifier to local storage and sends your IP address to Google. It is still much less intrusive than the app.

On iOS, the video starts muted with a "Tap for sound" overlay. Apple blocks one-tap sound on the web, so muted playback is the least-bad workaround. Videos that block embedding show an "open on YouTube" link instead of a dead frame.

## Picture-in-picture came for free

Picture-in-picture was an unplanned bonus. Playback uses a normal web video element, so it receives the system controls. On iOS, the floating window follows me across apps. Audio also continues when the screen locks.

{{< img src="degoogle-youtube-feed-pip.png" alt="An iPhone plays Casey Neistat in a floating picture-in-picture window above the feed. A Marques Brownlee video remains open on the page below." width="60%" >}}

## Fast and hard to break

The Worker starts all feed requests together. JavaScript's `Promise.allSettled` waits for every result without rejecting the group when one request fails. Each request also has a timeout. A slow or dead channel therefore returns nothing instead of hanging the page.

The Cache API stores the merged feed on Cloudflare's network for 15 minutes. Cloudflare KV, a key-value database, stores the channel list. The Worker builds the complete HTML page before sending it to the browser. I deploy it with Cloudflare's `wrangler` command-line tool.
