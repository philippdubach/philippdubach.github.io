const API_BASE = import.meta.env.DEV ? 'http://localhost:8788' : ''

export interface UploadResult {
  url: string
  path: string
  size: number
}

export async function uploadImage(file: File, customPath?: string): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  if (customPath) {
    formData.append('path', customPath)
  }

  const res = await fetch(`${API_BASE}/api/upload-image`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return res.json()
}
