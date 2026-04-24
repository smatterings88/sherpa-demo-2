const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:5173']

function getEnv() {
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process
  return proc?.env ?? {}
}

function parseAllowedOrigins(raw: string | undefined) {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false
  if (DEV_ORIGINS.includes(origin)) return true
  const allowed = parseAllowedOrigins(getEnv().ALLOWED_GHL_ORIGIN)
  if (!allowed.length) return false
  return allowed.includes(origin)
}

export function corsHeaders(origin: string | null) {
  const allowOrigin = isAllowedOrigin(origin) ? origin : null
  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function withCors(req: Request, res: Response) {
  const origin = req.headers.get('origin')
  const h = new Headers(res.headers)
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    h.set(k, v)
  }
  return new Response(res.body, { status: res.status, headers: h })
}

export function optionsResponse(req: Request) {
  return withCors(req, new Response(null, { status: 204 }))
}

