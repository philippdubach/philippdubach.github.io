---
title: "Deploying to Production with AI Agents: Testing Cursor on Azure"
images: ['https://static.philippdubach.com/ograph/ograph-agentic-deployment.jpg']
date: 2025-11-30
description: "First impressions of Cursor AI after using it to deploy YOURLS from scratch. How it handled SSH access, server configuration, and SSL certificates."
keywords: ["Cursor AI", "AI coding assistant", "YOURLS deployment", "SSH automation", "server setup"]
tags: ["Project"]
draft: false
---

I've been curious about [Cursor's capabilities](https://cursor.com/features) for a while, but never had a good reason to try it. This weekend I decided to host my own URL shortener and deployed [YOURLS](https://yourls.org), a free and open-source link shortener, on a fresh Azure VM. It seemed like a solid test case since it involves SSH access, server configuration, database setup, and SSL certificates. If an AI assistant could handle that end-to-end, it would be genuinely useful.

I was honestly surprised. Cursor didn't just write commands it connected via SSH, navigated the server, installed dependencies, configured Apache virtual hosts, set up MySQL, and handled the SSL certificate setup. It made sensible decisions about file permissions, security settings, and configuration details. When I asked for a custom YOURLS plugin to add date prefixes to short URLs, it built it on the first try. The whole build and deployment took about 15 minutes, which previously took me at least an hour of manual work and troubleshooting.

The URL shortener is now live and working. You can find this article at [pdub.click/2511308](https://pdub.click/2511308). I made the full scrubbed [transcript available](https://gist.github.com/philippdubach/d913591f906447041e2752729cd406e5) if you want to see exactly how Cursor handled each step. If you want to do this installation yourself, I wrote a [step-by-step tutorial](https://philippdubach.com/standalone/yourls-azure-tutorial/) covering the entire process, or you might as well let Cursor do it.

Right after finishing, I closed my laptop and went to clean my bathroom. This reminded me of [Joanna Maciejewska's quote](https://x.com/AuthorJMac/status/1773679197631701238?lang=en):

> I want AI to do my laundry and dishes so that I can do art and writing, not for AI to do my art and writing so that I can do laundry and dishes.