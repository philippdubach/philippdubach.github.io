const API_BASE = import.meta.env.DEV ? 'http://localhost:8788' : ''

export interface TakeawaysResult {
  takeaways: string[]
}

export async function generateTakeaways(title: string, content: string): Promise<TakeawaysResult> {
  const res = await fetch(`${API_BASE}/generate-takeaways`, {
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
