// PUT /api/post - Create or update a post on GitHub

const REPO = 'philippdubach/philippdubach.github.io'

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
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const origin = request.headers.get('Origin')

  if (!env.GITHUB_TOKEN) {
    return jsonResponse({ error: 'GITHUB_TOKEN not configured' }, 500, origin)
  }

  let body: { path: string; content: string; sha?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, origin)
  }

  const { path, content, sha, message } = body

  if (!path || !content) {
    return jsonResponse({ error: 'path and content are required' }, 400, origin)
  }

  // Validate path
  if (!path.startsWith('content/posts/') || path.includes('..') || !path.endsWith('.md')) {
    return jsonResponse({ error: 'Invalid path: must be content/posts/*.md' }, 400, origin)
  }

  try {
    // Base64 encode the content
    const encoded = btoa(unescape(encodeURIComponent(content)))

    const githubBody: Record<string, string> = {
      message: message || `Update ${path.split('/').pop()}`,
      content: encoded,
    }

    // Include SHA for updates (required by GitHub API for existing files)
    if (sha) {
      githubBody.sha = sha
    }

    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'post-composer',
      },
      body: JSON.stringify(githubBody),
    })

    if (!res.ok) {
      const errorData = await res.text()
      console.error('GitHub PUT error:', res.status, errorData)

      if (res.status === 409) {
        return jsonResponse(
          { error: 'Conflict: file was modified outside the editor. Reload and try again.' },
          409,
          origin
        )
      }
      if (res.status === 422) {
        return jsonResponse(
          { error: 'Validation error: check path and content' },
          422,
          origin
        )
      }
      return jsonResponse({ error: `GitHub API error: ${res.status}` }, res.status, origin)
    }

    const data = await res.json()

    return jsonResponse({
      sha: data.content.sha,
      path: data.content.path,
      url: data.content.html_url,
      commit: data.commit.sha,
    }, 200, origin)
  } catch (err) {
    console.error('Post save error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500, origin)
  }
}

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin')
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
