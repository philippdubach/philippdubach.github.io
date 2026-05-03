{{- /*
  Markdown variant of every section, taxonomy, and home list. v3.x audit —
  YAML preamble matches the single template; one-line summary surfaces the
  machine-readable feed alternates so AI consumers can switch from this
  human-readable list to the structured /api/posts.json or /feed.json.
*/ -}}
---
title: {{ .Title | jsonify }}
{{- with .Description }}
description: {{ . | jsonify }}
{{- end }}
type: index
canonical_url: {{ .Permalink | jsonify }}
source_url: {{ printf "%sindex.md" .Permalink | jsonify }}
content_signal: search=yes, ai-input=yes, ai-train=yes
---

# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
{{ with .Content }}{{ . | plainify }}

{{ end -}}
{{- $pages := where .RegularPagesRecursive "Params.unlisted" "!=" true -}}
{{- $cap := cond (eq .Kind "home") 500 50 -}}
*{{ len $pages }} {{ if eq (len $pages) 1 }}post{{ else }}posts{{ end }}. Machine-readable feeds: [/api/posts.json]({{ "/api/posts.json" | absURL }}) · [/feed.json]({{ "/feed.json" | absURL }}) · [/feed/index.xml]({{ "/feed/index.xml" | absURL }}) · [/llms.txt]({{ "/llms.txt" | absURL }}).*

---

{{ range first $cap $pages -}}
- **[{{ .Title }}]({{ .Permalink }})** ({{ .Date.Format "2006-01-02" }}{{ if ne (.Lastmod.Format "2006-01-02") (.Date.Format "2006-01-02") }}, updated {{ .Lastmod.Format "2006-01-02" }}{{ end }}){{ with .Description }} — {{ . }}{{ end }}
{{ end }}
{{ if and (eq .Kind "home") (gt (len $pages) $cap) -}}
*Showing first {{ $cap }} of {{ len $pages }} posts. Full set: [{{ "/api/posts.json" | absURL }}]({{ "/api/posts.json" | absURL }})*

{{ end -}}
---

Canonical: {{ .Permalink }}
Content-Signal: search=yes, ai-input=yes, ai-train=yes
This file is the canonical machine-readable variant of {{ .Permalink }}. Author: {{ .Site.Params.author }} ({{ .Site.BaseURL }}).
