import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { generateSeo } from '../../api/seo'

export default function SeoFields() {
  const fm = useEditorStore((s) => s.frontmatter)
  const set = useEditorStore((s) => s.setFrontmatter)
  const body = useEditorStore((s) => s.body)
  const [generating, setGenerating] = useState(false)

  const descLen = fm.description.length
  const descClass = descLen === 0 ? '' : descLen < 120 ? 'warn' : descLen > 160 ? 'error' : ''

  const handleGenerateSeo = async () => {
    if (!fm.title || !body || body.length < 50) return
    setGenerating(true)
    try {
      const result = await generateSeo(fm.title, body)
      if (result.title) set('seoTitle', result.title)
      if (result.description) set('description', result.description)
      if (result.keywords?.length) set('keywords', result.keywords)
    } catch (err) {
      console.error('SEO generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          className="btn btn-sm"
          onClick={handleGenerateSeo}
          disabled={generating || !fm.title || !body || body.length < 50}
          title="Generate SEO title, description, and keywords using AI"
        >
          {generating ? 'Generating...' : 'Generate SEO'}
        </button>
      </div>

      <div className="fm-field">
        <label>SEO Title (overrides &lt;title&gt; tag only)</label>
        <input
          type="text"
          value={fm.seoTitle}
          onChange={(e) => set('seoTitle', e.target.value)}
          placeholder="Shorter title for search results (50-60 chars)"
        />
      </div>

      <div className="fm-field">
        <label>Description</label>
        <textarea
          value={fm.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Meta description (120-160 characters)"
          rows={2}
          style={{ fontFamily: 'var(--font-sans)' }}
        />
        <div className={`fm-char-count ${descClass}`}>
          {descLen}/160 characters {descLen > 0 && descLen < 120 && '(too short)'}{descLen > 160 && '(too long)'}
        </div>
      </div>

      <div className="fm-field">
        <label>Keywords (comma-separated)</label>
        <textarea
          value={fm.keywords.join(', ')}
          onChange={(e) => {
            const val = e.target.value
            set('keywords', val ? val.split(',').map((k) => k.trim()).filter(Boolean) : [])
          }}
          placeholder="primary keyword, secondary1, secondary2"
          rows={2}
        />
      </div>

      <div className="fm-field">
        <label>OG Image URL</label>
        <input
          type="url"
          value={fm.images[0] || ''}
          onChange={(e) => set('images', e.target.value ? [e.target.value] : [])}
          placeholder="https://static.philippdubach.com/ograph/..."
        />
      </div>
    </>
  )
}
