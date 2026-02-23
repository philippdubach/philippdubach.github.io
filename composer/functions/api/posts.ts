// GET /api/posts - List all posts from GitHub
// GET /api/posts?path=content/posts/FILE.md - Read a single post

const REPO = 'philippdubach/philippdubach.github.io'
const POSTS_PATH = 'content/posts'

const ALLOWED_ORIGINS = [
  'https://post-composer.pages.dev',
  'http://localhost:5173',
  'http://localhost:8788',
]

interface Env {
  GITHUB_TOKEN: string
}

function corsHeaders(origin: string | null) {
  const corsOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

function jsonResponse(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(origin),
    },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const origin = request.headers.get('Origin')
  const url = new URL(request.url)
  const path = url.searchParams.get('path')

  if (!env.GITHUB_TOKEN) {
    return jsonResponse({ error: 'GITHUB_TOKEN not configured' }, 500, origin)
  }

  try {
    if (path) {
      // Read single post
      return await getPost(env.GITHUB_TOKEN, path, origin)
    } else {
      // List all posts
      return await listPosts(env.GITHUB_TOKEN, origin)
    }
  } catch (err) {
    console.error('Posts API error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500, origin)
  }
}

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin')
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

async function listPosts(token: string, origin: string | null) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${POSTS_PATH}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'post-composer',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('GitHub API error:', res.status, text)
    return jsonResponse({ error: `GitHub API error: ${res.status}` }, res.status, origin)
  }

  const files: { name: string; path: string; sha: string; size: number }[] = await res.json()

  // Filter to .md files and extract metadata from filenames
  const posts = files
    .filter((f) => f.name.endsWith('.md'))
    .map((f) => {
      const match = f.name.match(/^(\d{8})-(.+)\.md$/)
      const datePrefix = match ? `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}` : ''
      return {
        name: f.name,
        path: f.path,
        sha: f.sha,
        size: f.size,
        date: datePrefix,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  // Detect drafts via GitHub Search API
  const draftFiles = new Set<string>()
  try {
    const searchRes = await fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent('"draft = true"')}+repo:${REPO}+path:${POSTS_PATH}+extension:md`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'post-composer',
        },
      }
    )
    if (searchRes.ok) {
      const searchData: { items: { name: string }[] } = await searchRes.json()
      for (const item of searchData.items) {
        draftFiles.add(item.name)
      }
    }
  } catch {
    // Non-critical — draft detection is best-effort
  }

  const postsWithDraft = posts.map((p) => ({ ...p, isDraft: draftFiles.has(p.name) }))

  return jsonResponse({ posts: postsWithDraft, total: postsWithDraft.length }, 200, origin)
}

async function getPost(token: string, path: string, origin: string | null) {
  // Validate path to prevent traversal
  if (!path.startsWith('content/posts/') || path.includes('..')) {
    return jsonResponse({ error: 'Invalid path' }, 400, origin)
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'post-composer',
    },
  })

  if (!res.ok) {
    if (res.status === 404) {
      return jsonResponse({ error: 'Post not found' }, 404, origin)
    }
    return jsonResponse({ error: `GitHub API error: ${res.status}` }, res.status, origin)
  }

  const data: { content: string; sha: string; name: string; path: string } = await res.json()

  // Decode base64 content (handles multi-byte UTF-8)
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), (c) => c.charCodeAt(0))
  const content = new TextDecoder().decode(bytes)

  return jsonResponse({
    content,
    sha: data.sha,
    name: data.name,
    path: data.path,
  }, 200, origin)
}
