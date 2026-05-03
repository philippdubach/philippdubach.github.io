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
{{- range where .Site.RegularPages "Section" "posts" -}}
{{- if eq .RelPermalink $target -}}
*Related: [{{ .Title }}]({{ .Permalink }})*
{{ end -}}
{{- end -}}
