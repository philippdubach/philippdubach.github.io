const API_BASE = import.meta.env.DEV ? 'http://localhost:8788' : ''

export interface FaqEntry {
  question: string
  answer: string
}

export interface FaqResult {
  faq: FaqEntry[]
}

export async function generateFaq(title: string, content: string): Promise<FaqResult> {
  const res = await fetch(`${API_BASE}/generate-faq`, {
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
