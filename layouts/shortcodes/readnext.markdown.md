{{- /*
  Markdown variant of the {{< readnext slug="..." >}} shortcode. Emits
  a single italic line linking to the related post. The .html sibling
  renders an <aside> floated to the right margin on wide viewports;
  in markdown that visual treatment is moot, but the signal — "if you
  liked this, see also..." — is editorially useful for AI consumers
  building related-content graphs.
*/ -}}
{{- $slug := .Get "slug" -}}
{{- $target := printf "/posts/%s/" $slug -}}
{{- $matched := where (where .Site.RegularPages "Section" "posts") "RelPermalink" $target -}}
{{- if not $matched -}}{{- warnf "readnext: slug %q not found (called from %s). Verify with `hugo list all`." $slug .Page.RelPermalink -}}{{- end -}}
{{- range $matched -}}
*Related: [{{ .Title }}]({{ .Permalink }})*
{{ end -}}
