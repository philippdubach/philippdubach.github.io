import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { listPosts, type PostListItem } from '../api/github'
import { listDrafts, type DraftItem } from '../api/drafts'

type CombinedPost = {
  filename: string
  date: string
  title?: string
  isGitHub: boolean
  isKvDraft: boolean
  isDraft: boolean
  kvUpdatedAt?: string
  sha?: string
  size?: number
}

export default function PostList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterDrafts, setFilterDrafts] = useState<'all' | 'github' | 'kv' | 'drafts'>('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const results = await Promise.allSettled([listPosts(), listDrafts()])

      if (results[0].status === 'fulfilled') {
        setPosts(results[0].value)
      } else {
        console.warn('Failed to load GitHub posts:', results[0].reason)
        // Not critical — might not have GITHUB_TOKEN configured yet
      }

      if (results[1].status === 'fulfilled') {
        setDrafts(results[1].value)
      } else {
        console.warn('Failed to load KV drafts:', results[1].reason)
        // Not critical — might not have DRAFTS_KV configured yet
      }

      setLoading(false)
    }
    load()
  }, [])

  const combined = useMemo(() => {
    const map = new Map<string, CombinedPost>()

    // Add GitHub posts
    for (const p of posts) {
      map.set(p.name, {
        filename: p.name,
        date: p.date,
        isGitHub: true,
        isKvDraft: false,
        isDraft: p.isDraft,
        sha: p.sha,
        size: p.size,
      })
    }

    // Merge KV drafts
    for (const d of drafts) {
      const existing = map.get(d.filename)
      if (existing) {
        existing.isKvDraft = true
        existing.kvUpdatedAt = d.metadata?.updatedAt
        existing.title = d.metadata?.title || existing.title
      } else {
        map.set(d.filename, {
          filename: d.filename,
          date: d.filename.match(/^(\d{4})(\d{2})(\d{2})/)?.[0]
            ? `${d.filename.slice(0, 4)}-${d.filename.slice(4, 6)}-${d.filename.slice(6, 8)}`
            : '',
          title: d.metadata?.title,
          isGitHub: false,
          isKvDraft: true,
          isDraft: false,
          kvUpdatedAt: d.metadata?.updatedAt,
        })
      }
    }

    let items = Array.from(map.values())

    // Filter
    if (filterDrafts === 'github') items = items.filter((p) => p.isGitHub)
    if (filterDrafts === 'kv') items = items.filter((p) => p.isKvDraft)
    if (filterDrafts === 'drafts') items = items.filter((p) => p.isDraft)

    // Search
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) => p.filename.toLowerCase().includes(q) || (p.title && p.title.toLowerCase().includes(q))
      )
    }

    // Sort by date descending
    items.sort((a, b) => b.date.localeCompare(a.date))

    return items
  }, [posts, drafts, search, filterDrafts])

  return (
    <div className="post-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Posts ({combined.length})</h2>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>
          New Post
        </button>
      </div>

      <div className="post-list-controls">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterDrafts} onChange={(e) => setFilterDrafts(e.target.value as typeof filterDrafts)}>
          <option value="all">All</option>
          <option value="github">GitHub only</option>
          <option value="kv">KV drafts only</option>
          <option value="drafts">GitHub drafts</option>
        </select>
      </div>

      {loading && <div className="loading-spinner">Loading posts...</div>}

      {error && (
        <div style={{ padding: 16, background: '#fef2f2', borderRadius: 6, color: '#d32f2f', fontSize: '0.85rem', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!loading && combined.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '32px 0', textAlign: 'center' }}>
          {posts.length === 0 && drafts.length === 0
            ? 'No posts found. Configure GITHUB_TOKEN to load posts from the repo, or create a new post.'
            : 'No posts match your search.'}
        </p>
      )}

      {combined.map((p) => (
        <div
          key={p.filename}
          className="post-list-item"
          onClick={() => navigate(`/edit/${p.filename}`)}
        >
          <div className="post-item-info">
            <div className="post-item-title">
              {p.title || p.filename.replace(/^\d{8}-/, '').replace(/\.md$/, '').replace(/-/g, ' ')}
            </div>
            <div className="post-item-meta">
              <span>{p.date}</span>
              <span>{p.filename}</span>
              {p.size && <span>{(p.size / 1024).toFixed(1)} KB</span>}
              {p.kvUpdatedAt && (
                <span>Draft: {new Date(p.kvUpdatedAt).toLocaleString()}</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {p.isDraft && <span className="post-item-badge badge-draft">Draft</span>}
            {p.isGitHub && <span className="post-item-badge badge-category">GitHub</span>}
            {p.isKvDraft && <span className="post-item-badge badge-kv-draft">KV Draft</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
