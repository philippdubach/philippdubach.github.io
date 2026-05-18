+++
title = "Moving the blog stack to Europe (kind of)"
seoTitle = "Hetzner + R2 EU: Moving a Hugo Blog Off GitHub Pages"
date = 2026-05-24
lastmod = 2026-05-24
publishDate = 2026-05-24T03:00:00Z
images = ["https://static.philippdubach.com/eu-move-cover.png"]
card_gravity = "0.35x0.5"
description = "How I moved a Hugo blog from GitHub Pages to a Hetzner box in Europe, switched object storage to Cloudflare R2 EU, and what I kept on US infrastructure."
keywords = ["self-hosted Hugo blog Hetzner", "GitHub Pages alternative", "Cloudflare R2 EU jurisdiction", "digital sovereignty Europe", "self-hosted blog stack 2026", "Listmonk self-hosted newsletter", "Forgejo GitHub alternative", "CLOUD Act EU hosting", "Hetzner CPX21 Hugo", "Caddy reverse proxy Hugo", "restic Cloudflare R2 backup", "self-hosted Mailchimp alternative", "EU data residency blog", "Hugo blog migration Hetzner", "self-hosted GoatCounter analytics"]
categories = ["Tech"]
type = "Project"
draft = false
takeaways = [
  "The site, newsletter, source code, analytics, and offsite backups now run from a single self-hosted Hetzner box in Nuremberg, with object storage on Cloudflare R2 pinned to the EU jurisdiction",
  "Cloudflare (CDN, Workers, edge rules) and Resend (transactional mail) stayed on US infrastructure because the cost of replacing them outweighs the marginal sovereignty gain",
  "The migration sat behind a hard gate: a full restore drill on a parallel staging box, which surfaced a missing backup path and a bad runbook step before the real cutover",
]
faq = [
  {question = "Why move a Hugo blog off GitHub Pages?", answer = "GitHub Pages has no access logs, a hard cap on file size, no control over response headers without a Cloudflare Worker in front, and no place to run anything dynamic alongside the static site. Moving to a self-hosted box adds operational responsibility but unlocks all of those, plus puts the site's data in a jurisdiction I chose."},
  {question = "Why Hetzner instead of a hyperscaler?", answer = "Cost, transparency, and jurisdiction. A Hetzner CPX21 in Nuremberg has more than enough capacity for a Hugo blog plus supporting services, costs a fraction of equivalent compute on AWS or DigitalOcean, runs on contracted renewable energy, and is operated by a German company under EU law. The tradeoff is fewer managed services, which I wanted anyway."},
  {question = "Why Cloudflare R2 EU instead of Hetzner Object Storage or Scaleway?", answer = "Cloudflare R2 EU jurisdiction keeps the data in EU data centers under stricter handling rules. R2 also has zero egress fees, an S3-compatible API, built-in integration with the existing Cloudflare Workers, and an image-resizing pipeline I'd already built. Cloudflare is still US-headquartered, so this is a partial sovereignty win, not a complete one."},
  {question = "Does Cloudflare R2 EU jurisdiction protect against the US CLOUD Act?", answer = "Partially. R2 EU jurisdiction guarantees data is stored and processed inside EU data centers and applies stricter handling rules, but Cloudflare remains a US-headquartered company subject to the CLOUD Act, so a US court could in principle compel disclosure. For posts and images that tradeoff was acceptable. For newsletter subscriber lists I moved off third-party services entirely onto a self-hosted Listmonk instance."},
  {question = "Why keep Cloudflare and Resend on US infrastructure?", answer = "Cloudflare's CDN, Workers, cache rules, and rate limiting make the site fast everywhere and keep brute-force probes away from self-hosted admin panels. Replacing that layer with a European alternative would be a significant downgrade in capability. Resend handles SPF, DKIM, DMARC, and reputation management for outbound mail. European alternatives exist; ones I trust for newsletter deliverability do not."},
  {question = "What's the operational overhead of self-hosting a Hugo blog?", answer = "Higher than a managed service, lower than people assume. The box runs Caddy for TLS and reverse proxy, Postgres for the supporting services, SQLite for analytics, restic for nightly encrypted backups to R2 EU, and templated systemd alerts that email on any failed unit. Backups have monthly integrity checks. Most ongoing work is reading log digests and applying OS updates."},
  {question = "How are backups handled and verified?", answer = "Nightly restic snapshots to a Cloudflare R2 EU bucket, encrypted with a passphrase stored in two places. Monthly partial-read integrity checks verify the archive is restorable. A full restore drill onto a clean parallel box was the hard gate before flipping DNS, and that drill is now part of the runbook."},
]
+++

{{< img src="eu-move-cover.png" alt="Two technicians in workwear pushing a black server rack on wheels from a van labeled Data Center toward a building entrance, with EU member-state flags raised above the entry" caption="*AI-generated, one-shot from the blog title via Gemini (Nano Banana).*" width="80%" priority="true" >}}

There's a version of this story where I move everything to Europe in one go and write a triumphant post about digital sovereignty. The actual version is less clean. As of this week, the site you're reading runs from a small [Hetzner box in Nuremberg](/posts/the-tech-behind-this-site/), and most of the supporting services moved with it. Some of the reasoning fed into my latest essay: [How DORA Made Sovereignty a Bank Problem](/posts/dora-critical-cloud-providers-sovereignty/).

## Why now

Two things converged. First, GitHub Pages started feeling more like a constraint than a freebie: no access logs, a hard cap on file size, no control over response headers without bolting on a Cloudflare Worker, no place to run anything dynamic next to the static site. Second, the EU jurisdictional question stopped feeling academic. Newsletter subscriber records, draft posts, analytics counters, backup archives: all of it sat in US-controlled storage by default.

Self-hosting isn't a moral position. It's a series of small choices about where data lives and how much operational overhead you're willing to absorb in exchange for control. Longer-term I want to be off the major hyperscalers entirely.

## Compute: GitHub Pages → Hetzner CPX21

The site moved from GitHub Pages to a Hetzner CPX21 in Nuremberg. Debian, four virtual cores, four gigabytes of RAM, plenty of headroom for a Hugo blog and the supporting services. Hetzner publishes its CO₂ footprint per server class and runs its EU fleet on renewable contracts.

For now, GitHub Pages remains a warm standby. The deploy workflow is still wired up, so if anything goes wrong with the self-hosted setup that I can't fix in an hour, flipping DNS back gets the site online while I sort it out. Sovereignty is good. A working escape hatch is also good.

## Object storage: R2 → R2 EU jurisdiction

The images and newsletter archives that the site loads from `static.philippdubach.com` used to live in a Cloudflare R2 bucket with no jurisdictional pinning, which in practice meant US-resident metadata. Hetzner Object Storage and Scaleway are both on the table, and I'm still weighing them.

R2 has zero egress fees, the API is S3-compatible, the Workers integration is built in, and the image-resizing pipeline I'd already wired up depends on it. Walking away from all of that to gain a one-step shorter jurisdictional chain felt like the wrong trade, so the bucket moved to Cloudflare's EU jurisdiction (`static-eu`) instead.

This part of the story doesn't fit the clean Europe-versus-US framing. Cloudflare is still US-headquartered. EU jurisdiction means the data stays in EU data centers and the company applies stricter handling, but a US court can still compel disclosure under the CLOUD Act.

## Newsletter: nothing at all → self-hosted Listmonk

Moving away from [my fully bootstrapped newsletter generator](https://philippdubach.com/posts/building-a-no-tracking-newsletter-from-markdown-to-distribution/). Listmonk is open source, runs in about 50 MB of RAM, and stores its data in the same Postgres instance I already had running for other services. Subscribers, campaigns, templates: all of it now lives on the same box as the blog itself.

I'm now responsible for deliverability, suppression lists, bounce handling, and the surprisingly large number of small operational decisions that hosted newsletter services hide from you. Sending mail still goes through Resend over standard SMTP. Operating my own outbound mail server is a level of pain I'm not willing to absorb for marginal sovereignty gains, and Hetzner blocks port 25 on new accounts anyway.

## Source code: GitHub → Forgejo

This was the move I expected to regret and didn't. Forgejo is a Gitea fork that runs as a single Go binary, includes a web UI, supports webhooks, and behaves like GitHub for every day-to-day operation. Pushing code to my own remote and watching a webhook fire a Hugo rebuild on the same box has a closed-loop simplicity I didn't realize I was missing.

I still mirror to GitHub for the public-repo discoverability and the social signal. The self-hosted instance is the source of truth; GitHub is the read replica.

## Analytics: already on GoatCounter, still on GoatCounter

Analytics never went through Google. The previous setup used a hosted GoatCounter, which is open source, privacy-preserving, and stores no personal data. The migration moved it onto my own box. Same software, different host, same privacy stance.

## Backups: a thing I now have

Before the migration, "backup" meant whatever GitHub kept of my repo and a vague trust that my newsletter provider would still exist next month. After the migration, it means a nightly restic snapshot to a Cloudflare R2 EU bucket, encrypted, with monthly integrity checks that email me if anything is wrong.

## What I kept on US infrastructure

Cloudflare. The CDN, the Workers that handle subscribe forms and edge logic, the cache rules, the rate limiting on admin endpoints. Moving off Cloudflare would mean rebuilding the edge layer that makes the site fast everywhere and the spam controls that keep brute-force login attempts away from the self-hosted admin panels. I'm not ready for that trade.

Resend, for outbound mail. They handle SPF, DKIM, DMARC, reputation management, and the dozen other things that determine whether your email lands in the inbox or the spam folder. European alternatives exist, and I'll look at them next.

GitHub, for the public mirror. The friction cost of asking everyone to discover my code on a self-hosted Forgejo instance is higher than the sovereignty benefit, given the code is open source and the source of truth is on my box anyway.
