import { parse, stringify } from 'smol-toml'

export interface Frontmatter {
  title: string
  seoTitle: string
  date: string
  lastmod: string
  publishDate: string
  images: string[]
  description: string
  keywords: string[]
  categories: string[]
  type: string
  draft: boolean
  math: boolean
  external_url: string
  doi: string
  aliases: string[]
  takeaways: string[]
  faq: { question: string; answer: string }[]
}

export const EMPTY_FRONTMATTER: Frontmatter = {
  title: '',
  seoTitle: '',
  date: new Date().toISOString().slice(0, 10),
  lastmod: '',
  publishDate: '',
  images: [],
  description: '',
  keywords: [],
  categories: [],
  type: 'Article',
  draft: true,
  math: false,
  external_url: '',
  doi: '',
  aliases: [],
  takeaways: [],
  faq: [],
}

export function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+\n?([\s\S]*)$/)
  if (!match) {
    return { frontmatter: { ...EMPTY_FRONTMATTER }, body: raw }
  }

  const tomlBlock = match[1]
  const body = match[2].trimStart()

  let parsed: Record<string, unknown>
  try {
    parsed = parse(tomlBlock)
  } catch {
    return { frontmatter: { ...EMPTY_FRONTMATTER }, body: raw }
  }

  const fm: Frontmatter = {
    title: str(parsed.title),
    seoTitle: str(parsed.seoTitle),
    date: dateStr(parsed.date),
    lastmod: dateStr(parsed.lastmod),
    publishDate: datetimeStr(parsed.publishDate),
    images: strArr(parsed.images),
    description: str(parsed.description),
    keywords: strArr(parsed.keywords),
    categories: strArr(parsed.categories),
    type: str(parsed.type) || 'Article',
    draft: parsed.draft === true,
    math: parsed.math === true,
    external_url: str(parsed.external_url),
    doi: str(parsed.doi),
    aliases: strArr(parsed.aliases),
    takeaways: strArr(parsed.takeaways),
    faq: parseFaq(parsed.faq),
  }

  return { frontmatter: fm, body }
}

export function serializeFrontmatter(fm: Frontmatter): string {
  const lines: string[] = ['+++']

  // Field ordering matches existing post conventions
  addStr(lines, 'title', fm.title)
  addStr(lines, 'seoTitle', fm.seoTitle)
  addBareDate(lines, 'date', fm.date)
  addBareDate(lines, 'lastmod', fm.lastmod)
  addDatetime(lines, 'publishDate', fm.publishDate)
  addStrArr(lines, 'images', fm.images)
  addStr(lines, 'description', fm.description)
  addStrArr(lines, 'keywords', fm.keywords)
  addStrArr(lines, 'categories', fm.categories)
  addStr(lines, 'type', fm.type)

  // Booleans: always emit draft, only emit math if true
  lines.push(`draft = ${fm.draft}`)
  if (fm.math) lines.push('math = true')

  addStr(lines, 'external_url', fm.external_url)
  addStr(lines, 'doi', fm.doi)
  addStrArr(lines, 'aliases', fm.aliases)
  addMultilineStrArr(lines, 'takeaways', fm.takeaways)
  addFaq(lines, fm.faq)

  lines.push('+++')
  return lines.join('\n')
}

export function combineFrontmatterAndBody(fm: Frontmatter, body: string): string {
  return serializeFrontmatter(fm) + '\n' + body
}

// --- Helpers for parsing ---

function str(v: unknown): string {
  if (typeof v === 'string') return v
  return ''
}

function strArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string')
  return []
}

function dateStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'string') return v.slice(0, 10)
  return ''
}

function datetimeStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().replace('.000Z', 'Z')
  if (typeof v === 'string') return v
  return ''
}

function parseFaq(v: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item: Record<string, unknown>) => ({
      question: str(item.question),
      answer: str(item.answer),
    }))
}

// --- Helpers for serialization ---

function escToml(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function addStr(lines: string[], key: string, val: string) {
  if (val) lines.push(`${key} = "${escToml(val)}"`)
}

function addBareDate(lines: string[], key: string, val: string) {
  if (val) lines.push(`${key} = ${val.slice(0, 10)}`)
}

function addDatetime(lines: string[], key: string, val: string) {
  if (val) lines.push(`${key} = ${val}`)
}

function addStrArr(lines: string[], key: string, val: string[]) {
  if (val.length === 0) return
  const items = val.map((s) => `"${escToml(s)}"`).join(', ')
  lines.push(`${key} = [${items}]`)
}

function addMultilineStrArr(lines: string[], key: string, val: string[]) {
  if (val.length === 0) return
  lines.push(`${key} = [`)
  for (const s of val) {
    lines.push(`  "${escToml(s)}",`)
  }
  lines.push(']')
}

function addFaq(lines: string[], faq: { question: string; answer: string }[]) {
  if (faq.length === 0) return
  lines.push('faq = [')
  for (const item of faq) {
    lines.push(`  {question = "${escToml(item.question)}", answer = "${escToml(item.answer)}"},`)
  }
  lines.push(']')
}
