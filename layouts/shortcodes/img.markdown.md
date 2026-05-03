{{- /*
  Markdown variant of the {{< img >}} shortcode. Hugo picks this template
  automatically when the page is rendered with the Markdown output format
  (see hugo.toml [outputFormats.Markdown]). Emits standard CommonMark
  image syntax instead of the HTML <figure>/<picture>/<source>/<dialog>
  scaffolding the .html sibling outputs — the lightbox machinery and
  responsive srcsets are dead weight outside a browser.

  Single CDN URL at 1600px (the readable-in-markdown-viewer / downloadable
  sweet spot). format=auto so Cloudflare still serves AVIF/WebP to capable
  HTTP clients. Caption (when present) renders as an italic line below
  the image, separated by a blank line — Pandoc/Obsidian/GitHub all parse
  this idiomatically.
*/ -}}
{{- $baseUrl := "https://static.philippdubach.com" -}}
{{- $src := .Get "src" -}}
{{- $alt := .Get "alt" | default "" -}}
{{- $caption := .Get "caption" | default "" -}}
{{- $url := printf "%s/cdn-cgi/image/width=1600,quality=85,format=auto/%s" $baseUrl $src -}}
![{{ $alt }}]({{ $url }})
{{ with $caption }}
*{{ . }}*
{{ end -}}
