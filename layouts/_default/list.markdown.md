# {{ .Title }}

{{ with .Description }}{{ . }}

{{ end -}}
{{ with .Content }}{{ . | plainify }}

{{ end -}}
---

{{ $pages := where .RegularPagesRecursive "Params.unlisted" "!=" true -}}
{{ range first 50 $pages -}}
- **[{{ .Title }}]({{ .Permalink }})** ({{ .Date.Format "2006-01-02" }}){{ with .Description }} — {{ . }}{{ end }}
{{ end }}
---

*{{ $.Site.Params.author }} — [{{ $.Site.BaseURL }}]({{ $.Site.BaseURL }})*
