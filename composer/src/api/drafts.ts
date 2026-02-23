const API_BASE = import.meta.env.DEV ? 'http://localhost:8788' : ''

export interface DraftItem {
  key: string
  filename: string
  metadata: {
    updatedAt: string
    title: string
  }
}

export interface DraftContent {
  key: string
  content: string
  metadata: {
    updatedAt: string
    title: string
  }
}

export async function listDrafts(): Promise<DraftItem[]> {
  const res = await fetch(`${API_BASE}/api/drafts`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.drafts
}

export async function getDraft(filename: string): Promise<DraftContent> {
  const key = `draft:${filename}`
  const res = await fetch(`${API_BASE}/api/drafts?key=${encodeURIComponent(key)}`)
  if (!res.ok) {
    if (res.status === 404) return null as unknown as DraftContent
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function saveDraft(filename: string, content: string, title: string): Promise<void> {
  const key = `draft:${filename}`
  const res = await fetch(`${API_BASE}/api/drafts`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, content, title }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
}

export async function deleteDraft(filename: string): Promise<void> {
  const key = `draft:${filename}`
  const res = await fetch(`${API_BASE}/api/drafts?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
}
