import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Markdown } from 'tiptap-markdown'
import { common, createLowlight } from 'lowlight'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import { parseFrontmatter } from '../lib/toml'
import { HugoImage } from './extensions/HugoImage'
import { HugoDisclaimer } from './extensions/HugoDisclaimer'
import { HugoNewsletter } from './extensions/HugoNewsletter'
import { HugoReadnext } from './extensions/HugoReadnext'
import { shortcodesToHtml } from '../lib/shortcodePreprocess'
import { uploadImage } from '../api/images'

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void
}

export default function TiptapEditor({ onEditorReady }: TiptapEditorProps) {
  const body = useEditorStore((s) => s.body)
  const setBody = useEditorStore((s) => s.setBody)
  const initializedRef = useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      HugoImage,
      HugoDisclaimer,
      HugoNewsletter,
      HugoReadnext,
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      if (initializedRef.current) {
        const md = ed.storage.markdown.getMarkdown()
        setBody(md)
      }
    },
  })

  // Pre-process markdown: convert Hugo shortcodes to custom HTML for tiptap parsing
  const loadContent = useCallback(
    (markdown: string) => {
      if (!editor) return
      const processed = shortcodesToHtml(markdown)
      editor.commands.setContent(processed)
    },
    [editor]
  )

  // Load/reload content when contentVersion changes (new post loaded or reset)
  const contentVersion = useEditorStore((s) => s.contentVersion)
  const loadedVersionRef = useRef(-1)

  useEffect(() => {
    if (!editor) return
    if (loadedVersionRef.current === contentVersion) return

    // Defer content loading to next frame to ensure ProseMirror view is
    // fully attached to the DOM. Safari silently drops setContent calls
    // when the view isn't ready yet.
    const frame = requestAnimationFrame(() => {
      if (editor.isDestroyed) return
      loadedVersionRef.current = contentVersion
      initializedRef.current = false

      if (body) {
        loadContent(body)
      } else {
        editor.commands.clearContent()
      }
      initializedRef.current = true
    })

    return () => cancelAnimationFrame(frame)
  }, [editor, contentVersion, body, loadContent])

  // Notify parent
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('composer:save'))
      }
    },
    []
  )

  // Intercept paste: detect frontmatter and populate fields
  const setFrontmatter = useEditorStore((s) => s.setFrontmatter)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text/plain')
      if (!text.startsWith('+++\n')) return

      const { frontmatter, body: pastedBody } = parseFrontmatter(text)
      // Only intercept if frontmatter was actually parsed (has a title or other fields)
      if (!frontmatter.title && !frontmatter.description) return

      e.preventDefault()
      e.stopPropagation()

      // Populate all frontmatter fields
      for (const [key, value] of Object.entries(frontmatter)) {
        setFrontmatter(key as keyof typeof frontmatter, value as never)
      }

      // Load body into editor
      if (pastedBody && editor) {
        loadContent(pastedBody)
        setBody(pastedBody)
      }

      window.dispatchEvent(
        new CustomEvent('composer:toast', {
          detail: { message: 'Frontmatter imported', type: 'success' },
        })
      )
    },
    [editor, loadContent, setBody, setFrontmatter]
  )

  // Image drag-and-drop upload
  const [uploading, setUploading] = useState(false)

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
      if (files.length === 0) return

      e.preventDefault()
      e.stopPropagation()

      if (!editor) return

      setUploading(true)
      for (const file of files) {
        try {
          const result = await uploadImage(file)
          // Extract relative path from CDN URL
          const path = result.path
          editor.chain().focus().insertContent({
            type: 'hugoImage',
            attrs: { src: path, alt: '', width: '80%' },
          }).run()
        } catch (err) {
          console.error('Upload failed:', err)
          window.dispatchEvent(
            new CustomEvent('composer:toast', {
              detail: { message: err instanceof Error ? err.message : 'Upload failed', type: 'error' },
            })
          )
        }
      }
      setUploading(false)
    },
    [editor]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return (
    <div
      className={`tiptap-wrapper ${uploading ? 'uploading' : ''}`}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <EditorContent editor={editor} />
      {uploading && <div className="upload-overlay">Uploading image...</div>}
    </div>
  )
}
