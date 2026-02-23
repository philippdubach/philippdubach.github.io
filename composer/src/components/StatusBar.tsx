import { useMemo } from 'react'
import { useEditorStore } from '../store/editorStore'

export default function StatusBar() {
  const body = useEditorStore((s) => s.body)
  const isDirty = useEditorStore((s) => s.isDirty)
  const isSaving = useEditorStore((s) => s.isSaving)
  const lastSaved = useEditorStore((s) => s.lastSaved)
  const filename = useEditorStore((s) => s.filename)
  const getFilename = useEditorStore((s) => s.getFilename)

  const { wordCount, readingTime } = useMemo(() => {
    const text = body
      .replace(/\{\{<[\s\S]*?>\}\}/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*_`\[\]()>-]/g, '')
    const words = text.split(/\s+/).filter((w) => w.length > 0).length
    return { wordCount: words, readingTime: Math.max(1, Math.ceil(words / 200)) }
  }, [body])

  const statusClass = isSaving ? 'saving' : isDirty ? 'dirty' : 'clean'
  const statusText = isSaving
    ? 'Saving...'
    : isDirty
      ? 'Unsaved changes'
      : lastSaved
        ? `Saved ${lastSaved.toLocaleTimeString()}`
        : 'No changes'

  return (
    <div className="status-bar">
      <span>
        <span className={`status-dot ${statusClass}`} />
        {statusText}
      </span>
      <span>{wordCount} words</span>
      <span>{readingTime} min read</span>
      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>{filename || getFilename()}</span>
    </div>
  )
}
