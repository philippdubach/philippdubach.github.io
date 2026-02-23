import { create } from 'zustand'
import { type Frontmatter, EMPTY_FRONTMATTER, parseFrontmatter, combineFrontmatterAndBody } from '../lib/toml'
import { generateFilename } from '../lib/filename'

interface EditorState {
  // Metadata
  filename: string | null
  githubSha: string | null

  // Content
  frontmatter: Frontmatter
  body: string

  // State
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  contentVersion: number

  // Actions
  setFrontmatter: <K extends keyof Frontmatter>(key: K, value: Frontmatter[K]) => void
  setBody: (body: string) => void
  loadFromRaw: (raw: string, filename?: string, sha?: string) => void
  reset: () => void
  getFullContent: () => string
  getFilename: () => string
  markClean: () => void
  markSaving: (saving: boolean) => void

  // localStorage
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => boolean
}

const LOCAL_STORAGE_KEY = 'composer-v2-draft'

export const useEditorStore = create<EditorState>((set, get) => ({
  filename: null,
  githubSha: null,
  frontmatter: { ...EMPTY_FRONTMATTER },
  body: '',
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  contentVersion: 0,

  setFrontmatter: (key, value) => {
    set((state) => ({
      frontmatter: { ...state.frontmatter, [key]: value },
      isDirty: true,
    }))
    get().saveToLocalStorage()
  },

  setBody: (body) => {
    set({ body, isDirty: true })
    get().saveToLocalStorage()
  },

  loadFromRaw: (raw, filename, sha) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    set((state) => ({
      frontmatter,
      body,
      filename: filename || null,
      githubSha: sha || null,
      isDirty: false,
      lastSaved: null,
      contentVersion: state.contentVersion + 1,
    }))
  },

  reset: () => {
    set((state) => ({
      frontmatter: { ...EMPTY_FRONTMATTER },
      body: '',
      filename: null,
      githubSha: null,
      isDirty: false,
      lastSaved: null,
      contentVersion: state.contentVersion + 1,
    }))
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch {}
  },

  getFullContent: () => {
    const { frontmatter, body } = get()
    return combineFrontmatterAndBody(frontmatter, body)
  },

  getFilename: () => {
    const { filename, frontmatter } = get()
    return filename || generateFilename(frontmatter.title, frontmatter.date)
  },

  markClean: () => set({ isDirty: false, lastSaved: new Date() }),
  markSaving: (saving) => set({ isSaving: saving }),

  saveToLocalStorage: () => {
    try {
      const { frontmatter, body, filename } = get()
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ frontmatter, body, filename, savedAt: new Date().toISOString() })
      )
    } catch {}
  },

  loadFromLocalStorage: () => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!data) return false
      const parsed = JSON.parse(data)
      if (parsed.frontmatter && typeof parsed.body === 'string') {
        set({
          frontmatter: { ...EMPTY_FRONTMATTER, ...parsed.frontmatter },
          body: parsed.body,
          filename: parsed.filename || null,
          isDirty: true,
        })
        return true
      }
    } catch {}
    return false
  },
}))
