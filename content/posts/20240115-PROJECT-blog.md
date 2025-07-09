---
title: "The Tech behind this Site"
date: 2024-01-15
images: ['https://static.philippdubach.com/ograph/ograph-projects.jpg']
description: "Describing the technical solution for implementing responsive images in Hugo static sites using Cloudflare's image CDN and custom shortcodes, maintaining clean markdown-like syntax while delivering optimized WebP images across different screen sizes."
keywords: ["Hugo static site", "responsive images", "Cloudflare image CDN", "Hugo shortcode", "WebP optimization", "image resizing", "R2 bucket", "static site generation", "markdown syntax", "picture element", "image transformations", "mobile optimization", "web performance"]
tags: ["Project"]
---

Similar to how Simon Willison describes his difficulties managing images for his [approach to running a link blog](https://simonwillison.net/2024/Dec/22/link-blog/) I found it hard to remain true to pure markdown syntax but have images embedded in a responsive way on this site.

My current pipeline is as follows: I host my all my images in a R2 bucket and serve them from ```static.philippdubach.com```. I use Cloudflares's image resizing CDN do I never have to worry about serving images in appropriate size or format. I basically just upload them with the highes possible quality and Cloudflare takes care of the rest.

Since the site runs on Hugo, I needed a solution that would work within this static site generation workflow. Pure markdown syntax like ```![alt](url)``` is clean and portable, but it doesn't give me the responsive image capabilities I was looking for.

The solution I settled on was creating a [Hugo shortcode](https://gist.github.com/philippdubach/167189c7090c6813c5110c467cb5ebe9) that leverages Cloudflare's image transformations while maintaining a simple, markdown-like syntax. 
The shortcode generates a ```<picture>``` element with multiple ```<source>``` tags, each targeting different screen sizes and serving WebP format. Here's how it works: instead of writing standard markdown image syntax, I use ```{{ img src="image.jpg" alt="Description" }}``` in my posts. Behind the scenes, the shortcode constructs URLs for different breakpoints. This means I upload one high-quality image, but users receive perfectly sized versions - a 320px wide WebP for mobile users, a 1600px version for desktop, and everything in between. The shortcode defaults to displaying images at 80% width and centered, but I can override this with a width parameter when needed. It's a nice compromise between the simplicity of markdown and the power of modern responsive image techniques. The syntax remains clean and the performance benefits are substantial - especially important since images are often the heaviest assets on any webpage.

