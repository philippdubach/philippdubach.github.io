/**
 * Pre-processes markdown to convert Hugo shortcodes into custom HTML elements
 * that Tiptap can parse via parseHTML rules on custom Node extensions.
 *
 * This runs before feeding markdown to tiptap's setContent().
 * The reverse (HTML → shortcode) is handled by each extension's markdown serializer.
 */

function extractAttr(str: string, name: string): string {
  const match = str.match(new RegExp(`${name}="([^"]*?)"`))
  return match ? match[1] : ''
}

export function shortcodesToHtml(markdown: string): string {
  let result = markdown

  // {{< img src="..." alt="..." width="..." >}}
  result = result.replace(
    /\{\{<\s*img\s+([\s\S]*?)\s*>\}\}/g,
    (_match, attrs: string) => {
      const src = extractAttr(attrs, 'src')
      const alt = extractAttr(attrs, 'alt')
      const width = extractAttr(attrs, 'width') || '80%'
      return `<hugo-img src="${src}" alt="${alt}" width="${width}"></hugo-img>`
    }
  )

  // {{< disclaimer type="..." >}}
  result = result.replace(
    /\{\{<\s*disclaimer\s+([\s\S]*?)\s*>\}\}/g,
    (_match, attrs: string) => {
      const type = extractAttr(attrs, 'type') || 'finance'
      return `<hugo-disclaimer type="${type}"></hugo-disclaimer>`
    }
  )

  // {{< newsletter >}}
  result = result.replace(
    /\{\{<\s*newsletter\s*>\}\}/g,
    '<hugo-newsletter></hugo-newsletter>'
  )

  // {{< readnext slug="..." >}}
  result = result.replace(
    /\{\{<\s*readnext\s+([\s\S]*?)\s*>\}\}/g,
    (_match, attrs: string) => {
      const slug = extractAttr(attrs, 'slug')
      return `<hugo-readnext slug="${slug}"></hugo-readnext>`
    }
  )

  return result
}
