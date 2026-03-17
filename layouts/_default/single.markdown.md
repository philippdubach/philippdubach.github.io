{{- if eq .Section "posts" -}}
# {{ .Title }}

**Author:** {{ .Site.Params.author }} | **Published:** {{ .Date.Format "January 2, 2006" }}{{ if ne (.Lastmod.Format "2006-01-02") (.Date.Format "2006-01-02") }} | **Updated:** {{ .Lastmod.Format "January 2, 2006" }}{{ end }}
**Categories:** {{ delimit .Params.categories ", " }}
{{ with .Params.keywords }}**Keywords:** {{ delimit . ", " }}{{ end }}

{{ with .Params.takeaways -}}
## Key Takeaways
{{ range . }}
- {{ . }}
{{- end }}
{{ end }}
---

{{ .RenderShortcodes | replaceRE `(?s)<a[^>]*class="lightbox-overlay"[^>]*>.*?</a>` "" | replaceRE `(?s)<aside[^>]*class="readnext"[^>]*>.*?</aside>` "" | replaceRE `(?s)<aside[^>]*class="key-takeaways"[^>]*>.*?</aside>` "" }}

{{ with .Params.faq -}}
---

## Frequently Asked Questions
{{ range . }}
### {{ .question }}

{{ .answer }}
{{ end }}
{{- end }}

---

*{{ $.Site.Params.author }} — [{{ $.Site.BaseURL }}]({{ $.Site.BaseURL }}) — {{ .Date.Format "2006" }}*
{{- end -}}
