import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EditorLayout from '../editor/EditorLayout'
import { useEditorStore } from '../store/editorStore'
import { getPost } from '../api/github'
import { getDraft } from '../api/drafts'

export default function EditorPage() {
  const { filename } = useParams<{ filename: string }>()
  const loadFromRaw = useEditorStore((s) => s.loadFromRaw)
  const loadFromLocalStorage = useEditorStore((s) => s.loadFromLocalStorage)
  const reset = useEditorStore((s) => s.reset)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftConflict, setDraftConflict] = useState<{
    kvContent: string
    kvUpdatedAt: string
    githubContent: string
    githubSha: string
  } | null>(null)

  useEffect(() => {
    if (!filename) {
      // New post: try to load from localStorage, or start fresh
      const loaded = loadFromLocalStorage()
      if (!loaded) reset()
      return
    }

    // Existing post: load from GitHub and check for KV draft
    async function load() {
      setLoading(true)
      setError(null)
      setDraftConflict(null)

      try {
        const [githubResult, kvResult] = await Promise.allSettled([
          getPost(filename!),
          getDraft(filename!),
        ])

        const githubPost = githubResult.status === 'fulfilled' ? githubResult.value : null
        const kvDraft = kvResult.status === 'fulfilled' ? kvResult.value : null

        if (githubPost && kvDraft) {
          // Both exist: show conflict resolution
          setDraftConflict({
            kvContent: kvDraft.content,
            kvUpdatedAt: kvDraft.metadata?.updatedAt || '',
            githubContent: githubPost.content,
            githubSha: githubPost.sha,
          })
        } else if (kvDraft) {
          // Only KV draft exists
          loadFromRaw(kvDraft.content, filename)
        } else if (githubPost) {
          // Only GitHub post exists
          loadFromRaw(githubPost.content, filename, githubPost.sha)
        } else {
          // Neither exists — start fresh with this filename
          reset()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [filename, loadFromRaw, loadFromLocalStorage, reset])

  // Unsaved changes guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (useEditorStore.getState().isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  if (loading) {
    return <div className="loading-spinner">Loading post...</div>
  }

  if (error) {
    return (
      <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: 12 }}>Error loading post</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</p>
        <button className="btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (draftConflict) {
    return (
      <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
        <h3 style={{ marginBottom: 12 }}>Draft conflict</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
          You have a KV draft from{' '}
          <strong>{new Date(draftConflict.kvUpdatedAt).toLocaleString()}</strong> that differs from
          the GitHub version. Which one do you want to load?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              loadFromRaw(draftConflict.kvContent, filename!)
              useEditorStore.setState({ githubSha: draftConflict.githubSha })
              setDraftConflict(null)
            }}
          >
            Load KV Draft
          </button>
          <button
            className="btn"
            onClick={() => {
              loadFromRaw(draftConflict.githubContent, filename!, draftConflict.githubSha)
              setDraftConflict(null)
            }}
          >
            Load GitHub Version
          </button>
        </div>
      </div>
    )
  }

  return <EditorLayout />
}
