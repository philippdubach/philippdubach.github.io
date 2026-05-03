+++
title = "Posts"
# The /posts/ section listing and its pagination (/posts/page/N/) are
# orphaned: nav goes Articles=/, no partials link them, and the homepage
# iterates the full essay archive without pagination. Suppress the
# section-level outputs so we don't ship dead URLs. Individual posts at
# /posts/<slug>/ keep rendering — render=never on a section affects only
# the section page (and its paginator children), never the leaf pages.
[build]
  render = "never"
  list = "never"
+++
