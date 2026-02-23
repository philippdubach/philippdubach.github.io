export function generateFilename(title: string, date: string): string {
  const datePrefix = date.replace(/-/g, '').slice(0, 8)
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

  return `${datePrefix}-${slug || 'untitled'}.md`
}

export function parseFilename(filename: string): { date: string; slug: string } | null {
  const match = filename.match(/^(\d{8})-(.+)\.md$/)
  if (!match) return null
  const raw = match[1]
  const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
  return { date, slug: match[2] }
}
