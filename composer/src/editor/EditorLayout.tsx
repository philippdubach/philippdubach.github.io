import { useState, useRef, useCallback, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import TiptapEditor from './TiptapEditor'
import EditorToolbar from './EditorToolbar'
import FrontmatterPanel from './FrontmatterPanel'
import MarkdownPreview from './MarkdownPreview'
import StatusBar from '../components/StatusBar'
import { useEditorStore } from '../store/editorStore'
import { useToast } from '../components/Toast'
import { saveDraft, deleteDraft } from '../api/drafts'
import { savePost } from '../api/github'

export default function EditorLayout() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [splitRatio, setSplitRatio] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  const getFullContent = useEditorStore((s) => s.getFullContent)
  const getFilename = useEditorStore((s) => s.getFilename)
  const saveToLocalStorage = useEditorStore((s) => s.saveToLocalStorage)
  const isSaving = useEditorStore((s) => s.isSaving)
  const markSaving = useEditorStore((s) => s.markSaving)
  const markClean = useEditorStore((s) => s.markClean)

  // Resizer drag handling
  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = ((e.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(80, Math.max(20, ratio)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Save to KV (draft)
  const handleSave = useCallback(async () => {
    const content = getFullContent()
    const filename = getFilename()
    const title = useEditorStore.getState().frontmatter.title

    // Always save to localStorage as fallback
    saveToLocalStorage()

    try {
      markSaving(true)
      await saveDraft(filename, content, title)
      markClean()
      showToast('Saved draft', 'success')
    } catch (err) {
      // KV might not be configured — fall back to localStorage silently
      console.warn('KV save failed, using localStorage:', err)
      showToast('Saved to local storage', 'success')
    } finally {
      markSaving(false)
    }
  }, [getFullContent, getFilename, saveToLocalStorage, markSaving, markClean, showToast])

  // Post to GitHub
  const handlePost = useCallback(async () => {
    const content = getFullContent()
    const filename = getFilename()
    const path = `content/posts/${filename}`
    const sha = useEditorStore.getState().githubSha
    const title = useEditorStore.getState().frontmatter.title
    const message = sha ? `Update ${filename}` : `Add ${filename}`

    try {
      markSaving(true)
      const result = await savePost(path, content, sha, message)

      // Update SHA for future saves
      useEditorStore.setState({
        githubSha: result.sha,
        filename,
        isDirty: false,
        lastSaved: new Date(),
      })

      // Clean up KV draft after successful post
      try {
        await deleteDraft(filename)
      } catch {
        // Not critical
      }

      showToast(`Posted to GitHub`, 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to post'
      showToast(msg, 'error')
    } finally {
      markSaving(false)
    }
  }, [getFullContent, getFilename, markSaving, showToast])

  const handleDownload = useCallback(() => {
    const content = getFullContent()
    const filename = getFilename()
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Downloaded ${filename}`, 'success')
  }, [getFullContent, getFilename, showToast])

  const handleCopy = useCallback(async () => {
    const content = getFullContent()
    try {
      await navigator.clipboard.writeText(content)
      showToast('Copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy', 'error')
    }
  }, [getFullContent, showToast])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        handleCopy()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave, handleCopy])

  // Listen for save events from editor
  useEffect(() => {
    const handler = () => handleSave()
    window.addEventListener('composer:save', handler)
    return () => window.removeEventListener('composer:save', handler)
  }, [handleSave])

  return (
    <div className="editor-pane-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <EditorToolbar
        editor={editor}
        onSave={handleSave}
        onPost={handlePost}
        onDownload={handleDownload}
        onCopy={handleCopy}
        isSaving={isSaving}
      />
      <FrontmatterPanel />
      <div className="editor-layout" ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
        <div className="editor-pane" style={{ width: `${splitRatio}%` }}>
          <TiptapEditor onEditorReady={setEditor} />
        </div>
        <div
          className={`pane-resizer ${isResizing ? 'active' : ''}`}
          onMouseDown={handleMouseDown}
        />
        <div className="preview-pane" style={{ width: `${100 - splitRatio}%` }}>
          <MarkdownPreview />
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
