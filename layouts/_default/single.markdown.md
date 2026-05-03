{{- /*
  Markdown variant of every page on the site. Served at <permalink>/index.md
  (or via Accept: text/markdown content negotiation rewriting through the
  security-headers Worker). v3.x audit — May 2026 — moves from the regex-
  strip-after-the-fact pattern to:

  - Output-format-aware sibling shortcodes (img.markdown.md,
    disclaimer.markdown.md, newsletter.markdown.md, readnext.markdown.md)
    so HTML pollution never enters the markdown stream
  - YAML preamble for AI/RAG ingestion (parseable by gray-matter,
    frontmatter.parse, and every major LLM tooling SDK)
  - Drop the eq .Section "posts" gate so /about/, /research/,
    /subscribe/, etc. now ship real markdown content
  - Convert MathJax \(...\) → $...$ and \[...\] → $$...$$ for GFM/
    Pandoc/Obsidian compatibility
  - Structured footer with canonical URL + Content-Signal posture

  The HTML siblings keep all the lightbox + responsive-srcset machinery;
  this template gets the clean version.
*/ -}}
---
title: {{ .Title | jsonify }}
{{- with .Description }}
description: {{ . | jsonify }}
{{- end }}
{{- if not .Date.IsZero }}
date: {{ .Date.Format "2006-01-02" }}
{{- end }}
{{- if and (not .Lastmod.IsZero) (or .Date.IsZero (ne (.Lastmod.Format "2006-01-02") (.Date.Format "2006-01-02"))) }}
updated: {{ .Lastmod.Format "2006-01-02" }}
{{- end }}
author: {{ .Site.Params.author | jsonify }}
{{- with .Params.categories }}
categories:
{{- range . }}
  - {{ . | jsonify }}
{{- end }}
{{- end }}
{{- with .Params.keywords }}
keywords:
{{- range . }}
  - {{ . | jsonify }}
{{- end }}
{{- end }}
{{- with .Params.type }}
type: {{ . | jsonify }}
{{- end }}
{{- with .Params.doi }}
doi: {{ . | jsonify }}
{{- end }}
canonical_url: {{ .Permalink | jsonify }}
source_url: {{ printf "%sindex.md" .Permalink | jsonify }}
content_signal: search=yes, ai-input=yes, ai-train=yes
---

# {{ .Title }}

{{ if not .Date.IsZero }}*{{ .Site.Params.author }} · Published {{ .Date.Format "January 2, 2006" }}{{ if and (not .Lastmod.IsZero) (ne (.Lastmod.Format "2006-01-02") (.Date.Format "2006-01-02")) }} · Updated {{ .Lastmod.Format "January 2, 2006" }}{{ end }}*{{ else }}*{{ .Site.Params.author }}{{ if not .Lastmod.IsZero }} · Updated {{ .Lastmod.Format "January 2, 2006" }}{{ end }}*{{ end }}

{{ with .Params.takeaways }}
## Key Takeaways

{{ range . }}- {{ . }}
{{ end }}
{{ end }}
---

{{- /* Body. Sibling shortcodes emit clean markdown, so .RenderShortcodes
       is now safe to use directly. The remaining regex passes:
       - drop the lightbox-overlay anchor (Goldmark autolinker artifact)
       - drop the rendered .key-takeaways aside (we already emit takeaways
         from frontmatter above; the in-body aside is HTML scaffolding)
       - convert MathJax \(...\) inline → $...$ and \[...\] block → $$...$$
       - collapse 3+ consecutive blank lines to two
*/ -}}
{{- $body := .RenderShortcodes -}}
{{- /* Strip lightbox-overlay autolinker artifact (Goldmark) */ -}}
{{- $body = $body | replaceRE `(?s)<a[^>]*class="lightbox-overlay"[^>]*>.*?</a>` "" -}}
{{- /* Strip all asides — key-takeaways, newsletter forms, archive lists,
       readnext (already handled by shortcode siblings but defensive).
       Asides in markdown are by definition decoration. */ -}}
{{- $body = $body | replaceRE `(?s)<aside[^>]*>.*?</aside>` "" -}}
{{- /* Strip interactive elements that don't function in a markdown stream:
       forms, dialogs, scripts, noscripts. Some pages (subscribe,
       newsletter-archive) have raw HTML in the source for these. */ -}}
{{- $body = $body | replaceRE `(?s)<form[^>]*>.*?</form>` "" -}}
{{- $body = $body | replaceRE `(?s)<dialog[^>]*>.*?</dialog>` "" -}}
{{- $body = $body | replaceRE `(?s)<script[^>]*>.*?</script>` "" -}}
{{- $body = $body | replaceRE `(?s)<noscript[^>]*>.*?</noscript>` "" -}}
{{- /* Math syntax: convert MathJax \(...\) → $...$ and \[...\] → $$...$$
       for GFM/Pandoc/Obsidian compatibility. */ -}}
{{- $body = $body | replaceRE `\\\(([^)]*)\\\)` "$$$1$$" -}}
{{- $body = $body | replaceRE `(?s)\\\[(.*?)\\\]` "$$$$$1$$$$" -}}
{{- /* Collapse 3+ consecutive blank lines (TOML +++ frontmatter in
       source files leaves bands of empty lines behind). */ -}}
{{- $body = $body | replaceRE `\n{3,}` "\n\n" }}

{{ $body | safeHTML }}

{{ with .Params.faq }}
---

## Frequently Asked Questions

{{ range . }}
### {{ .question }}

{{ .answer }}

{{ end }}
{{ end }}
---

Canonical: {{ .Permalink }}
Content-Signal: search=yes, ai-input=yes, ai-train=yes
This file is the canonical machine-readable variant of {{ .Permalink }}. Author: {{ .Site.Params.author }} ({{ .Site.BaseURL }}).
