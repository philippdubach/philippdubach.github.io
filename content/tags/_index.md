---
title: "Tags"
# Tags is a marker-only taxonomy on this site (currently just `Project`).
# We keep the taxonomy registered in hugo.toml so:
#   - .Params.tags works in templates for badges/chips in lists
#   - related-posts weighting (weight=80) still picks up tag matches
#   - .Site.Taxonomies.tags is queryable
# But we don't want public /tags/ or /tags/<term>/ listing pages —
# they're thin, duplicate /projects/, and dilute SEO. The cascade pushes
# render=never to every auto-generated term page (e.g. /tags/project/).
build:
  render: never
  list: never
cascade:
  build:
    render: never
    list: never
---
