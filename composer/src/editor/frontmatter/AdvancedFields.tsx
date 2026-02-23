import { useEditorStore } from '../../store/editorStore'

export default function AdvancedFields() {
  const fm = useEditorStore((s) => s.frontmatter)
  const set = useEditorStore((s) => s.setFrontmatter)

  return (
    <>
      <div className="fm-field">
        <label>External URL</label>
        <input
          type="url"
          value={fm.external_url}
          onChange={(e) => set('external_url', e.target.value)}
          placeholder="https://... (links to external source)"
        />
      </div>

      <div className="fm-field">
        <label>DOI</label>
        <input
          type="text"
          value={fm.doi}
          onChange={(e) => set('doi', e.target.value)}
          placeholder="10.2139/ssrn.XXXXX"
        />
      </div>

      <div className="fm-field">
        <label>Aliases (one per line)</label>
        <textarea
          value={fm.aliases.join('\n')}
          onChange={(e) => {
            const val = e.target.value
            set('aliases', val ? val.split('\n').filter(Boolean) : [])
          }}
          placeholder="/old/path/to/post/"
          rows={2}
        />
      </div>
    </>
  )
}
