# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
{{ with .Content }}{{ . | plainify }}

{{ end -}}
---

{{ $pages := where .RegularPagesRecursive "Params.unlisted" "!=" true -}}
{{ $cap := cond (eq .Kind "home") 500 50 -}}
{{ range first $cap $pages -}}
- **[{{ .Title }}]({{ .Permalink }})** ({{ .Date.Format "2006-01-02" }}){{ with .Description }} — {{ . }}{{ end }}
{{ end }}
{{ if and (eq .Kind "home") (gt (len $pages) $cap) -}}
*Showing first {{ $cap }} of {{ len $pages }} posts. Full set: [{{ "/api/posts.json" | absURL }}]({{ "/api/posts.json" | absURL }})*

{{ end -}}
---

*{{ $.Site.Params.author }} — [{{ $.Site.BaseURL }}]({{ $.Site.BaseURL }})*
