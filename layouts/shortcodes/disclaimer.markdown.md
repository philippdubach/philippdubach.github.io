{{- /*
  Markdown variant of the {{< disclaimer >}} shortcode. Renders as a
  blockquote with a bold "Disclaimer." prefix — semantic, parseable,
  no <aside> HTML. Same content variants as the .html sibling; AI
  consumers ingesting the markdown stream get the editorial caveat
  in a form their tooling can extract.
*/ -}}
{{- $type := .Get "type" | default "finance" -}}
{{- $custom := .Get "text" -}}
{{- $body := "" -}}
{{- if $custom -}}
  {{- $body = $custom -}}
{{- else if eq $type "finance" -}}
  {{- $body = "All opinions expressed are my own. This is not investment, financial, tax, or legal advice. Past performance does not indicate future results. Do your own research and consult qualified professionals before making financial decisions. No liability accepted for any losses." -}}
{{- else if eq $type "medical" -}}
  {{- $body = "For informational purposes only, not medical advice. Consult a qualified healthcare provider for any medical questions or conditions." -}}
{{- else if eq $type "general" -}}
  {{- $body = "All opinions expressed are my own. Information may be incomplete or outdated. No warranties given. Use at your own risk." -}}
{{- else if eq $type "ai" -}}
  {{- $body = "AI capabilities evolve rapidly; information may become outdated. Code and implementations provided as-is without warranty." -}}
{{- else if eq $type "research" -}}
  {{- $body = "Summarizes third-party research. No affiliation with cited researchers. Interpretations are my own and may differ from original authors' views." -}}
{{- else if eq $type "gambling" -}}
  {{- $body = "For informational purposes only, not financial or legal advice. Gambling involves significant risk of loss. You are responsible for compliance with your local laws and age restrictions. Gamble responsibly. Support: [BeGambleAware.org](https://www.gambleaware.org), [Gamblers Anonymous](https://gamblersanonymous.org)." -}}
{{- end -}}
> **Disclaimer.** {{ $body }}
