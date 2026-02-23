const API_BASE = import.meta.env.DEV ? 'http://localhost:8788' : ''

export interface PostListItem {
  name: string
  path: string
  sha: string
  size: number
  date: string
  isDraft: boolean
}

export interface PostContent {
  content: string
  sha: string
  name: string
  path: string
}

export interface SaveResult {
  sha: string
  path: string
  url: string
  commit: string
}

export async function listPosts(): Promise<PostListItem[]> {
  const res = await fetch(`${API_BASE}/api/posts`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.posts
}

export async function getPost(filename: string): Promise<PostContent> {
  const path = `content/posts/${filename}`
  const res = await fetch(`${API_BASE}/api/posts?path=${encodeURIComponent(path)}`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function savePost(
  path: string,
  content: string,
  sha?: string | null,
  message?: string
): Promise<SaveResult> {
  const res = await fetch(`${API_BASE}/api/post`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path,
      content,
      sha: sha || undefined,
      message,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return res.json()
}
