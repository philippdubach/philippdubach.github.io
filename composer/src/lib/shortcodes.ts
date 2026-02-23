const STATIC_BASE = 'https://static.philippdubach.com'

const DISCLAIMER_TEXT: Record<string, string> = {
  finance:
    'This content is for informational and educational purposes only and should not be construed as financial or investment advice. Always consult a qualified financial advisor before making investment decisions.',
  medical:
    'This content is for informational and educational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider for medical decisions.',
  ai: 'This content discusses AI systems and their implications. Views expressed are analytical observations, not endorsements of any particular technology or approach.',
  research:
    'This content discusses academic research and its implications. Interpretations are those of the author and may not reflect the views of the original researchers.',
  gambling:
    'This content discusses gambling and sports betting from an analytical perspective. Gambling involves financial risk. If you or someone you know has a gambling problem, please contact the National Problem Gambling Helpline at 1-800-522-4700.',
  general:
    'This content is for informational and educational purposes only. Views expressed are those of the author.',
}

export function processShortcodes(markdown: string): string {
  let result = markdown

  // {{< img src="..." alt="..." width="..." >}}
  result = result.replace(
    /\{\{<\s*img\s+([\s\S]*?)\s*>\}\}/g,
    (_match, attrs: string) => {
      const src = extractAttr(attrs, 'src')
      const alt = extractAttr(attrs, 'alt')
      const width = extractAttr(attrs, 'width') || '80%'

      const fullSrc = src.startsWith('http') ? src : `${STATIC_BASE}/${src}`

      return `<div class="img-container" style="max-width:${width};margin:1.5rem auto;"><img src="${fullSrc}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto;border-radius:4px;" /></div>`
    }
  )

  // {{< disclaimer type="..." >}}
  result = result.replace(
    /\{\{<\s*disclaimer\s+([\s\S]*?)\s*>\}\}/g,
    (_match, attrs: string) => {
      const type = extractAttr(attrs, 'type') || 'finance'
      const text = DISCLAIMER_TEXT[type] || DISCLAIMER_TEXT.general
      return `<aside class="disclaimer"><p>${text}</p></aside>`
    }
  )

  // {{< newsletter >}}
  result = result.replace(
    /\{\{<\s*newsletter\s*>\}\}/g,
    '<aside class="inline-newsletter"><p><em>Subscribe to the newsletter for new posts.</em></p></aside>'
  )

  // {{< readnext slug="..." >}}
  result = result.replace(
    /\{\{<\s*readnext\s+([\s\S]*?)\s*>\}\}/g,
    (_match, attrs: string) => {
      const slug = extractAttr(attrs, 'slug')
      return `<aside class="readnext"><p>Related: <a href="/posts/${slug}/">${slug}</a></p></aside>`
    }
  )

  return result
}

function extractAttr(attrs: string, name: string): string {
  const match = attrs.match(new RegExp(`${name}="([^"]*?)"`))
  return match ? match[1] : ''
}
