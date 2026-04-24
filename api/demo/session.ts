import { z } from 'zod'
import { getRedis, sessionKey } from '../_lib/kv.js'
import { optionsResponse, withCors } from '../_lib/cors.js'

export const config = {
  runtime: 'edge',
}

const querySchema = z.object({
  sid: z.string().min(1),
})

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse(req)
  if (req.method !== 'GET') {
    return withCors(req, new Response('Method Not Allowed', { status: 405 }))
  }

  try {
    const url = new URL(req.url)
    const parsed = querySchema.parse({ sid: url.searchParams.get('sid') })
    const redis = getRedis()
    const session = await redis.get(sessionKey(parsed.sid))
    if (!session) {
      return withCors(req, new Response('Not Found', { status: 404 }))
    }

    return withCors(
      req,
      new Response(JSON.stringify(session), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request.'
    return withCors(req, new Response(msg, { status: 400 }))
  }
}

