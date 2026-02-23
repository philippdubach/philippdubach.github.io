const API_BASE = import.meta.env.DEV ? 'http://localhost:8788' : ''

export interface SeoResult {
  title: string
  description: string
  keywords: string[]
}

export async function generateSeo(title: string, content: string): Promise<SeoResult> {
  const res = await fetch(`${API_BASE}/generate-seo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return res.json()
}
