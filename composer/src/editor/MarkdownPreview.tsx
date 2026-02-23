import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useEditorStore } from '../store/editorStore'
import { processShortcodes } from '../lib/shortcodes'
import '../styles/preview.css'

export default function MarkdownPreview() {
  const fm = useEditorStore((s) => s.frontmatter)
  const body = useEditorStore((s) => s.body)

  const { html, wordCount, readingTime } = useMemo(() => {
    // Process shortcodes before markdown parsing
    const processed = processShortcodes(body)
    const rawHtml = marked.parse(processed, { async: false }) as string
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['sandbox', 'loading', 'allow', 'frameborder'],
      FORBID_ATTR: ['onerror', 'onload'],
    })

    // Word count: strip HTML, shortcodes, code blocks
    const textOnly = body
      .replace(/\{\{<[\s\S]*?>\}\}/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*_`\[\]()>-]/g, '')
    const words = textOnly.split(/\s+/).filter((w) => w.length > 0).length
    const minutes = Math.max(1, Math.ceil(words / 200))

    return { html: cleanHtml, wordCount: words, readingTime: minutes }
  }, [body])

  const categoryBadges = fm.categories.map((c) => (
    <span key={c} className="post-item-badge badge-category">{c}</span>
  ))

  return (
    <div className="preview-content">
      <div className="preview-header">
        <h1 className="preview-title">{fm.title || 'Untitled'}</h1>
        <div className="preview-meta">
          <span>{fm.date || 'No date'}</span>
          {fm.type && <span>{fm.type}</span>}
          <span>{wordCount} words</span>
          <span>{readingTime} min read</span>
          {categoryBadges}
        </div>
      </div>

      {fm.takeaways.length > 0 && fm.takeaways.some((t) => t.trim()) && (
        <div className="key-takeaways">
          <div className="key-takeaways-label">Key Takeaways</div>
          <ul>
            {fm.takeaways
              .filter((t) => t.trim())
              .map((t, i) => (
                <li key={i}>{t}</li>
              ))}
          </ul>
        </div>
      )}

      <div className="preview-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
