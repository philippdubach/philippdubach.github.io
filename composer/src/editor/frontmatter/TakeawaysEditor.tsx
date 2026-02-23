import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { generateTakeaways } from '../../api/takeaways'

export default function TakeawaysEditor() {
  const takeaways = useEditorStore((s) => s.frontmatter.takeaways)
  const title = useEditorStore((s) => s.frontmatter.title)
  const body = useEditorStore((s) => s.body)
  const set = useEditorStore((s) => s.setFrontmatter)
  const [generating, setGenerating] = useState(false)

  const update = (index: number, value: string) => {
    const next = [...takeaways]
    next[index] = value
    set('takeaways', next)
  }

  const remove = (index: number) => {
    set('takeaways', takeaways.filter((_, i) => i !== index))
  }

  const add = () => {
    set('takeaways', [...takeaways, ''])
  }

  const handleGenerate = async () => {
    if (!title || !body || body.length < 100) return
    setGenerating(true)
    try {
      const result = await generateTakeaways(title, body)
      if (result.takeaways?.length) {
        set('takeaways', result.takeaways)
      }
    } catch (err) {
      console.error('Takeaways generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          className="btn btn-sm"
          onClick={handleGenerate}
          disabled={generating || !title || !body || body.length < 100}
          title="Generate data-first takeaways using AI"
        >
          {generating ? 'Generating...' : 'Generate Takeaways'}
        </button>
      </div>
      {takeaways.map((t, i) => (
        <div key={i} className="list-editor-item">
          <textarea
            value={t}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Takeaway ${i + 1} — lead with data`}
            rows={2}
          />
          <button className="remove-btn" onClick={() => remove(i)} title="Remove">
            &times;
          </button>
        </div>
      ))}
      <button className="add-btn" onClick={add}>+ Add takeaway</button>
    </>
  )
}
