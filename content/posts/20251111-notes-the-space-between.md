---
title: "Notes: The Space Between"
date: 2025-11-11
images:
- https://static.philippdubach.com/ograph/ograph-notes.jpg
description: Exploring a new content format that bridges ephemeral social media and heavyweight blog posts. A minimal, numbered note system built on Cloudflare.
keywords:
- content format
- blogging platform
- cloudflare workers
- minimalist publishing
- social media alternatives
categories:
- Tech
type: Essay
draft: false
---
I've been thinking about the gap between tweets and blog posts.

Tweets are ephemeral. You fire them off, they get buried in an algorithmic feed, and they're essentially designed to be forgotten. Blog posts are the opposite problem—they demand a certain weight. You don't write 200 words on a blog without feeling like you're wasting the format.{{< img src="notes_preview1.png" alt="Overview of the fist Note on notes.philippdubach.com" width="80%" >}}
So I built something in between. I'm calling it [Notes](https://github.com/philippdubach/notes), mine will live at [notes.philippdubach.com](https://notes.philippdubach.com).

The concept is simple: numbered notes, starting at #0001. Each note has a title, some text, and no navigation just a links to the previous note. No archives. No categories. No RSS. No comments. You land on the latest note, and if you're curious, you can walk backwards through time.

This is intentionally primitive. The navigation forces a kind of deliberate reading that feeds and infinite scrolls have trained out of us. You can't skim a timeline. You read one thing, then decide if you want to read the thing before it.

The format also changes how I think about writing. A note can be a paragraph. It can be a few sentences. It doesn't need to justify its existence with length or SEO or a hook. It just needs to be worth the number it's assigned.

There's something clarifying about constraints. Twitter gave us 140 characters and we got a new form of expression. Blogs gave us unlimited space and we got 3000-word posts that should have been 500. 

As almost all of my projects it runs on Cloudflare Workers and KV storage. It's open source at [github.com/philippdubach/notes](https://github.com/philippdubach/notes) you can deploy your own in minutes. The technical choices are deliberately boring: no framework, no database, just a Worker serving HTML with a simple admin panel for writing in Markdown. You can also [add .txt to the end of any URL](https://notes.philippdubach.com/0001.txt) to get the note served as plain text.

I don't know if this format will stick. Maybe I'll abandon it after a dozen notes. But I wanted a place to put thoughts that feel too substantial for social media and too slight for my blog.

{{< newsletter >}}