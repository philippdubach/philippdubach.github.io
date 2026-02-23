import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { generateFaq } from '../../api/faq'

export default function FaqEditor() {
  const faq = useEditorStore((s) => s.frontmatter.faq)
  const title = useEditorStore((s) => s.frontmatter.title)
  const body = useEditorStore((s) => s.body)
  const set = useEditorStore((s) => s.setFrontmatter)
  const [generating, setGenerating] = useState(false)

  const update = (index: number, field: 'question' | 'answer', value: string) => {
    const next = faq.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    set('faq', next)
  }

  const remove = (index: number) => {
    set('faq', faq.filter((_, i) => i !== index))
  }

  const add = () => {
    set('faq', [...faq, { question: '', answer: '' }])
  }

  const handleGenerate = async () => {
    if (!title || !body || body.length < 100) return
    setGenerating(true)
    try {
      const result = await generateFaq(title, body)
      if (result.faq?.length) {
        set('faq', result.faq)
      }
    } catch (err) {
      console.error('FAQ generation failed:', err)
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
          title="Generate FAQ entries from post content using AI"
        >
          {generating ? 'Generating...' : 'Generate FAQ'}
        </button>
      </div>
      {faq.map((item, i) => (
        <div key={i} className="faq-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Q{i + 1}</label>
            <button className="remove-btn" onClick={() => remove(i)} title="Remove" style={{ marginTop: -4 }}>
              &times;
            </button>
          </div>
          <textarea
            value={item.question}
            onChange={(e) => update(i, 'question', e.target.value)}
            placeholder="Question?"
            rows={1}
          />
          <label>Answer</label>
          <textarea
            value={item.answer}
            onChange={(e) => update(i, 'answer', e.target.value)}
            placeholder="Answer..."
            rows={3}
          />
        </div>
      ))}
      <button className="add-btn" onClick={add}>+ Add FAQ</button>
    </>
  )
}
