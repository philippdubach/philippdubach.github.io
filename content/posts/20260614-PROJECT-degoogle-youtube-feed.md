+++
title = "Degoogling cost me my YouTube feed, so I made my own"
seoTitle = "Self-Hosted YouTube RSS Subscriptions Feed, No API Key"
date = 2026-06-14
lastmod = 2026-06-14
publishDate = 2026-06-14T03:00:00Z
images = ["https://static.philippdubach.com/degoogle-youtube-feed-cover.png"]
description = "I dropped the YouTube app and rebuilt only my subscriptions feed as a self-hosted Cloudflare Worker that reads each channel's RSS, no API key, no tracking."
keywords = ["self-hosted YouTube subscriptions feed", "YouTube subscriptions RSS feed", "watch YouTube without the app", "YouTube RSS feed without API key", "degoogle YouTube", "RSS feed for YouTube channel", "YouTube channel RSS videos.xml", "Cloudflare Worker RSS reader", "youtube-nocookie embed privacy", "YouTube picture-in-picture without Premium", "filter YouTube Shorts", "Piped Invidious FreeTube alternative", "watch YouTube without account", "vanilla JS Cloudflare Worker", "Cloudflare KV Cache API Worker", "fast-xml-parser Atom feed"]
categories = ["Tech"]
type = "Project"
draft = false
takeaways = [
  "The replacement is one Cloudflare Worker that reads each channel's public RSS feed, with no YouTube API key and no framework; the whole page is server-rendered as an HTML string",
  "Channel handles and URLs resolve to stable channel IDs by scraping the channel page, then the Atom XML is parsed with fast-xml-parser, so nothing depends on a Google API quota",
  "Feeds fetch in parallel with Promise.allSettled, per-channel timeouts, and a 15-minute edge cache, so one dead channel never breaks the page",
]
faq = [
  {question = "Why rebuild a YouTube feed instead of using the app?", answer = "I only ever used the app for one thing: seeing what the 10 to 15 channels I subscribe to had posted, newest first. Dropping the app as part of degoogling meant losing that. I never touched comments, recommendations, or Shorts, so rebuilding only the subscription feed got me the part I used without the rest of the app I didn't."},
  {question = "Does this need a YouTube Data API key?", answer = "No. Every YouTube channel publishes a public RSS feed at feeds/videos.xml listing its recent uploads as Atom XML. The Worker reads that feed directly and parses it with fast-xml-parser, so there is no API key, no quota, and no Google project to manage."},
  {question = "Can you watch YouTube subscriptions without a Google account?", answer = "Yes. The feed is built entirely from each channel's public RSS feed, which anyone can read without signing in, so there is no Google account, no login, and no subscription list stored on Google's side. You keep your own list of channels instead."},
  {question = "How does it find a channel's videos without the API?", answer = "You add a channel by URL or @handle. The Worker scrapes the channel page to resolve that input to a stable channel ID, which never changes even if the handle does, then fetches the RSS feed for that ID. Resolved channels are saved so the resolution step only runs once per channel."},
  {question = "How are YouTube Shorts filtered out?", answer = "Two independent checks. A title heuristic flags anything tagged #shorts, and a per-video redirect probe confirms whether a video is a Short, because Shorts and full videos resolve differently. Only full videos make it into the feed."},
  {question = "Does watching a video track you?", answer = "Not until you press play. Thumbnails are static, and clicking one loads the video inline through YouTube's nocookie IFrame player, so no tracking cookies are set until playback starts. On iOS the player autostarts muted with a tap-for-sound overlay, because Apple blocks one-tap sound on the web."},
  {question = "How are channels stored and the feed kept fast?", answer = "Channels you add at runtime persist in Cloudflare KV. The merged, sorted feed is edge-cached with the Cache API for 15 minutes, and all channel feeds are fetched in parallel with per-channel timeouts, so a slow or dead channel cannot stall or break the page."},
]
+++

{{< img src="degoogle-youtube-feed-cover.png" alt="The self-hosted feed open in a desktop browser window, titled Feed with an Updated just now label and an add-channel button. A vertical list of full-size video thumbnails from subscribed channels, each with its title, channel avatar circle, channel name, and a relative timestamp: Veritasium, Vizeh, First We Feast, and Saturday Night Live, newest first, with no comments, recommendations, or Shorts" width="80%" priority="true" >}}

Part of degoogling my life meant dropping the YouTube app. The only thing I actually used it for was the subscription feed: what the 10 to 15 channels I follow have posted, newest first. No comments, no recommendations, no Shorts. So I rebuilt that one screen and nothing else.

## Just the feed, nothing else

It's one chronological list: the newest videos across every channel I follow, merged and sorted newest first. You add channels from the page by URL or @handle and they stick around.

Everything YouTube stacks on top of the subscription feed is something I ignore or actively avoid, so building only the screen I use was less work than configuring the app to leave me alone.

## How it works without an API key

Every channel publishes a public RSS feed at `feeds/videos.xml` with its recent uploads as Atom XML, and the Worker reads that directly, parsed with `fast-xml-parser`. No quota, no Google project, no token to rotate.

People add channels by handle or vanity URL, and those change, so the Worker scrapes the channel page once to resolve whatever you typed to a stable channel ID, then uses that ID from then on. The input goes through an SSRF guard first, because "fetch whatever URL the user pasted" is how you turn your own Worker into someone's proxy into your network.

{{< readnext slug="moving-the-blog-stack-to-europe-kind-of" >}}

## Filtering out YouTube Shorts

Shorts were the main thing I wanted gone, and one check doesn't catch them reliably. So there are two: a title heuristic for anything tagged `#shorts`, and a per-video redirect probe, since Shorts and full videos resolve through different URLs. A video has to clear both to show up.

## Playback without the tracking

Click a thumbnail and the video plays inline through YouTube's nocookie IFrame player. The thumbnails are static images and the embed only loads on click, so no tracking cookies are set until you press play. It isn't perfect privacy, nocookie still writes a localStorage ID and sends your IP to Google once the player loads, but it's a long way better than the app. On iOS it autostarts muted with a "Tap for sound" overlay, because Apple blocks one-tap sound on the web and a muted-but-playing video is the least-bad workaround. Videos that block embedding get an "open on YouTube" fallback instead of a dead frame.


## Picture-in-picture came for free

A side effect I didn't plan for. Because playback is a plain web video element and not the YouTube app, the system controls come with it. On iOS that means picture-in-picture and background audio for nothing: the floating window follows me across apps, and sound keeps going when the screen locks. 

{{< img src="degoogle-youtube-feed-pip.png" alt="An iPhone showing the feed with a video playing picture-in-picture: a floating rounded window of a Casey Neistat video hovers over the page while the underlying video, WWDC 2026 Impressions by Marques Brownlee, plays inline below it" width="60%" >}}

## Fast and hard to break

Feeds fetch in parallel with `Promise.allSettled` and per-channel timeouts, so one slow or dead channel resolves to nothing instead of hanging the page. The merged result is edge-cached with the Cache API for 15 minutes, and the channels you add live in Cloudflare KV. The page is server-rendered to an HTML string and deployed with `wrangler`. 
