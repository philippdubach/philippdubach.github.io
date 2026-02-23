// POST /api/upload-image - Upload an image to R2 and return CDN URL

interface Env {
  R2_BUCKET: R2Bucket
}

const ALLOWED_ORIGINS = [
  'https://post-composer.pages.dev',
  'http://localhost:5173',
  'http://localhost:8788',
]

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const CDN_BASE = 'https://static.philippdubach.com'

function corsHeaders(origin: string | null) {
  const corsOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const origin = request.headers.get('Origin')

  if (!env.R2_BUCKET) {
    return jsonResponse({ error: 'R2_BUCKET not configured' }, 500, origin)
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const customPath = formData.get('path') as string | null

    if (!file) {
      return jsonResponse({ error: 'No file provided' }, 400, origin)
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonResponse({ error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}` }, 400, origin)
    }

    if (file.size > MAX_SIZE) {
      return jsonResponse({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB` }, 400, origin)
    }

    // Generate path: blog/YYYY/MM/filename.ext
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    const ext = file.name.split('.').pop() || 'jpg'
    const basename = file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')

    const path = customPath || `blog/${year}/${month}/${basename}.${ext}`

    // Prevent path traversal
    if (path.includes('..') || path.startsWith('/')) {
      return jsonResponse({ error: 'Invalid path' }, 400, origin)
    }

    await env.R2_BUCKET.put(path, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    })

    return jsonResponse({
      url: `${CDN_BASE}/${path}`,
      path,
      size: file.size,
    }, 200, origin)
  } catch (err) {
    console.error('Upload error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500, origin)
  }
}

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin')
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
