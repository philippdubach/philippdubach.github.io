{{- /*
  Markdown variant of the {{< disclaimer >}} shortcode. Renders as a
  blockquote with a bold "Disclaimer." prefix — semantic, parseable,
  no <aside> HTML. AI consumers ingesting the markdown stream get
  the editorial caveat in a form their tooling can extract. Each
  variant carries the single most-critical jurisdictional concern
  inline and links to /disclaimers/#variant for the full text.
*/ -}}
{{- $type := .Get "type" | default "finance" -}}
{{- $custom := .Get "text" -}}
{{- $body := "" -}}
{{- if $custom -}}
  {{- $body = $custom -}}
{{- else if eq $type "finance" -}}
  {{- $body = "Journalism, not investment advice or a recommendation. Not directed at UK persons; not a financial promotion under FSMA s.21. The author may hold positions in instruments discussed and receives no compensation from issuers. [Full disclaimer](/disclaimers/#finance)." -}}
{{- else if eq $type "medical" -}}
  {{- $body = "Journalism on health topics, not medical advice and not a substitute for consulting a qualified clinician. No clinician-patient relationship is created. [Full disclaimer](/disclaimers/#medical)." -}}
{{- else if eq $type "pom" -}}
  {{- $body = "Journalistic reportage on prescription-only medicines. Not advertising under HMG / HMR / HWG / FDA frameworks, not medical advice. Prescription and use require a qualified clinician. [Full disclaimer](/disclaimers/#pom)." -}}
{{- else if eq $type "general" -}}
  {{- $body = "Personal opinion of the author, offered as commentary on matters of public concern. Not professional advice. [Full disclaimer](/disclaimers/#general)." -}}
{{- else if eq $type "ai" -}}
  {{- $body = "AI/ML content. Code and model outputs are illustrative, provided without warranty, and may be wrong or unsafe; verify before relying. [Full disclaimer](/disclaimers/#ai)." -}}
{{- else if eq $type "research" -}}
  {{- $body = "Summary of third-party research under quotation-right exceptions. Interpretations are the author's own; consult the cited primary source. [Full disclaimer](/disclaimers/#research)." -}}
{{- else if eq $type "gambling" -}}
  {{- $body = "Industry commentary, not advertising, inducement, or advice to gamble. Gambling involves significant risk and may be illegal in your jurisdiction. Help: 1-800-GAMBLER (US) · 0800 040 080 (CH) · 0800 1 372 700 (DE) · BeGambleAware.org (UK). [Full disclaimer](/disclaimers/#gambling)." -}}
{{- end -}}
> **Disclaimer.** {{ $body }}
