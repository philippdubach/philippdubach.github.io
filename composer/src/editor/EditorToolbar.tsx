import type { Editor } from '@tiptap/react'

interface EditorToolbarProps {
  editor: Editor | null
  onSave: () => void
  onPost: () => void
  onDownload: () => void
  onCopy: () => void
  isSaving?: boolean
}

export default function EditorToolbar({ editor, onSave, onPost, onDownload, onCopy, isSaving }: EditorToolbarProps) {
  if (!editor) return null

  const btn = (
    label: string,
    action: () => void,
    isActive?: boolean,
    title?: string
  ) => (
    <button
      className={`toolbar-btn ${isActive ? 'active' : ''}`}
      onClick={action}
      title={title || label}
      type="button"
    >
      {label}
    </button>
  )

  const textBtn = (
    label: string,
    action: () => void,
    title?: string
  ) => (
    <button
      className="toolbar-btn toolbar-btn-text"
      onClick={action}
      title={title || label}
      type="button"
    >
      {label}
    </button>
  )

  const addLink = () => {
    const url = window.prompt('URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const src = window.prompt('Image URL (or path on static.philippdubach.com):')
    if (src) {
      editor.chain().focus().insertContent({
        type: 'hugoImage',
        attrs: { src, alt: '', width: '80%' },
      }).run()
    }
  }

  const insertDisclaimer = () => {
    editor.chain().focus().insertContent({
      type: 'hugoDisclaimer',
      attrs: { type: 'finance' },
    }).run()
  }

  const insertNewsletter = () => {
    editor.chain().focus().insertContent({
      type: 'hugoNewsletter',
    }).run()
  }

  const insertReadnext = () => {
    const slug = window.prompt('Post slug:')
    if (slug) {
      editor.chain().focus().insertContent({
        type: 'hugoReadnext',
        attrs: { slug },
      }).run()
    }
  }

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), 'Bold')}
        {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), 'Italic')}
        {btn('~', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), 'Strikethrough')}
        {btn('<>', () => editor.chain().focus().toggleCode().run(), editor.isActive('code'), 'Inline code')}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        {btn('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        {btn('UL', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), 'Bullet list')}
        {btn('OL', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), 'Ordered list')}
        {btn('"', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), 'Blockquote')}
        {btn('—', () => editor.chain().focus().setHorizontalRule().run(), false, 'Horizontal rule')}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        {textBtn('Link', addLink, 'Insert link')}
        {textBtn('Image', addImage, 'Insert image shortcode')}
        {textBtn('Code', () => editor.chain().focus().toggleCodeBlock().run(), 'Code block')}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        {textBtn('Disclaimer', insertDisclaimer, 'Insert disclaimer')}
        {textBtn('Newsletter', insertNewsletter, 'Insert newsletter')}
        {textBtn('ReadNext', insertReadnext, 'Insert readnext link')}
      </div>

      <div className="toolbar-actions">
        <button className="btn btn-sm" onClick={onCopy} title="Copy to clipboard (Cmd+E)">
          Copy
        </button>
        <button className="btn btn-sm" onClick={onDownload} title="Download .md">
          Download
        </button>
        <button className="btn btn-sm" onClick={onSave} title="Save draft to KV (Cmd+S)" disabled={isSaving}>
          Save
        </button>
        <button className="btn btn-sm btn-success" onClick={onPost} title="Post to GitHub" disabled={isSaving}>
          {isSaving ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}
