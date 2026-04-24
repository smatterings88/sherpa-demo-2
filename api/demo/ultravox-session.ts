import { z } from 'zod'
import { getRedis, sessionKey } from '../_lib/kv.js'
import { optionsResponse, withCors } from '../_lib/cors.js'

export const config = {
  runtime: 'edge',
}

const bodySchema = z.object({
  sid: z.string().min(1),
})

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse(req)
  if (req.method !== 'POST') {
    return withCors(req, new Response('Method Not Allowed', { status: 405 }))
  }

  try {
    const body = bodySchema.parse(await req.json())
    const redis = getRedis()
    const session = await redis.get(sessionKey(body.sid))
    if (!session) return withCors(req, new Response('Not Found', { status: 404 }))

    // Placeholder integration:
    // The Ultravox client/package pattern is intentionally not assumed here.
    // This keeps the endpoint stable for the frontend while we wire the real client later.
    const apiKey = process.env.ULTRAVOX_API_KEY
    if (!apiKey) {
      return withCors(
        req,
        new Response(
          JSON.stringify({
            mode: 'placeholder',
            message:
              'Ultravox integration not configured. Using voice close simulation.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    }

    return withCors(
      req,
      new Response(
        JSON.stringify({
          mode: 'placeholder',
          message:
            'Ultravox integration placeholder. Wire the real session creation here.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request.'
    return withCors(req, new Response(msg, { status: 400 }))
  }
}

