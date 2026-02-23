import { useEditorStore } from '../../store/editorStore'

const CATEGORIES = ['AI', 'Economics', 'Finance', 'Medicine', 'Tech']
const TYPES = ['Article', 'Commentary', 'Analysis', 'Essay', 'Project']

export default function EssentialFields() {
  const fm = useEditorStore((s) => s.frontmatter)
  const set = useEditorStore((s) => s.setFrontmatter)

  const toggleCategory = (cat: string) => {
    const cats = fm.categories.includes(cat)
      ? fm.categories.filter((c) => c !== cat)
      : [...fm.categories, cat]
    set('categories', cats)
  }

  return (
    <>
      <div className="fm-field">
        <label>Title</label>
        <input
          type="text"
          value={fm.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Post title"
        />
      </div>

      <div className="fm-row">
        <div className="fm-field">
          <label>Date</label>
          <input
            type="date"
            value={fm.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
        <div className="fm-field">
          <label>Last Modified</label>
          <input
            type="date"
            value={fm.lastmod}
            onChange={(e) => set('lastmod', e.target.value)}
          />
        </div>
        <div className="fm-field">
          <label>Publish Date</label>
          <input
            type="datetime-local"
            value={fm.publishDate ? fm.publishDate.replace('Z', '').replace('T', 'T') : ''}
            onChange={(e) => {
              const val = e.target.value
              set('publishDate', val ? val + 'Z' : '')
            }}
          />
        </div>
      </div>

      <div className="fm-row">
        <div className="fm-field">
          <label>Type</label>
          <select value={fm.type} onChange={(e) => set('type', e.target.value)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="fm-field" style={{ display: 'flex', gap: 16, alignItems: 'flex-end', paddingBottom: 4 }}>
          <label className="fm-checkbox">
            <input type="checkbox" checked={fm.draft} onChange={(e) => set('draft', e.target.checked)} />
            Draft
          </label>
          <label className="fm-checkbox">
            <input type="checkbox" checked={fm.math} onChange={(e) => set('math', e.target.checked)} />
            Math
          </label>
        </div>
      </div>

      <div className="fm-field">
        <label>Categories</label>
        <div className="fm-checkboxes">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="fm-checkbox">
              <input
                type="checkbox"
                checked={fm.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>
    </>
  )
}
