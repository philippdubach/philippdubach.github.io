// GET /api/drafts - List all KV drafts
// GET /api/drafts?key=draft:FILENAME - Read a single draft
// PUT /api/drafts - Save a draft to KV
// DELETE /api/drafts?key=draft:FILENAME - Delete a draft

const ALLOWED_ORIGINS = [
  'https://post-composer.pages.dev',
  'http://localhost:5173',
  'http://localhost:8788',
]

interface Env {
  DRAFTS_KV: KVNamespace
}

function corsHeaders(origin: string | null) {
  const corsOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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
  const key = url.searchParams.get('key')

  if (!env.DRAFTS_KV) {
    return jsonResponse({ error: 'DRAFTS_KV not configured' }, 500, origin)
  }

  try {
    if (key) {
      // Read single draft
      if (!key.startsWith('draft:')) {
        return jsonResponse({ error: 'Invalid key format' }, 400, origin)
      }

      const value = await env.DRAFTS_KV.getWithMetadata(key)
      if (!value.value) {
        return jsonResponse({ error: 'Draft not found' }, 404, origin)
      }

      return jsonResponse({
        key,
        content: value.value,
        metadata: value.metadata,
      }, 200, origin)
    } else {
      // List all drafts
      const list = await env.DRAFTS_KV.list({ prefix: 'draft:' })
      const drafts = list.keys.map((k) => ({
        key: k.name,
        filename: k.name.replace('draft:', ''),
        metadata: k.metadata,
      }))

      return jsonResponse({ drafts, total: drafts.length }, 200, origin)
    }
  } catch (err) {
    console.error('Drafts GET error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500, origin)
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const origin = request.headers.get('Origin')

  if (!env.DRAFTS_KV) {
    return jsonResponse({ error: 'DRAFTS_KV not configured' }, 500, origin)
  }

  let body: { key: string; content: string; title?: string }
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, origin)
  }

  const { key, content, title } = body

  if (!key || !content) {
    return jsonResponse({ error: 'key and content are required' }, 400, origin)
  }

  if (!key.startsWith('draft:')) {
    return jsonResponse({ error: 'Key must start with draft:' }, 400, origin)
  }

  try {
    await env.DRAFTS_KV.put(key, content, {
      metadata: {
        updatedAt: new Date().toISOString(),
        title: title || '',
      },
    })

    return jsonResponse({ ok: true, key }, 200, origin)
  } catch (err) {
    console.error('Drafts PUT error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500, origin)
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const origin = request.headers.get('Origin')
  const url = new URL(request.url)
  const key = url.searchParams.get('key')

  if (!env.DRAFTS_KV) {
    return jsonResponse({ error: 'DRAFTS_KV not configured' }, 500, origin)
  }

  if (!key || !key.startsWith('draft:')) {
    return jsonResponse({ error: 'Invalid key' }, 400, origin)
  }

  try {
    await env.DRAFTS_KV.delete(key)
    return jsonResponse({ ok: true }, 200, origin)
  } catch (err) {
    console.error('Drafts DELETE error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500, origin)
  }
}

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin')
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
