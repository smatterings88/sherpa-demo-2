import { z } from 'zod'
import { getRedis, sessionKey } from '../_lib/kv.js'
import { optionsResponse, withCors } from '../_lib/cors.js'

export const config = {
  runtime: 'edge',
}

const bodySchema = z.object({
  sid: z.string().min(1),
})

const sessionSchema = z.object({
  offer: z.string().optional().default(''),
  buyer: z.string().optional().default(''),
  feltOff: z.string().optional().default(''),
  dealValue: z.number().optional().default(0),
  dealsPerMonth: z.number().optional().default(0),
  closeRate: z.number().optional().default(0),
})

function getEnv() {
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process
  return proc?.env ?? {}
}

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

    const s = sessionSchema.parse(session)

    const env = getEnv()
    const apiKey = env.ULTRAVOX_API_KEY
    const agentId = env.ULTRAVOX_DEMO_AGENT_ID
    if (!apiKey || !agentId) {
      return withCors(
        req,
        new Response('Voice session could not be created.', { status: 500 }),
      )
    }

    const payload = {
      templateContext: {
        offer: s.offer || '',
        buyer: s.buyer || '',
        feltOff: s.feltOff || '',
        dealValue: String(s.dealValue || ''),
        dealsPerMonth: String(s.dealsPerMonth || ''),
        closeRate: String(s.closeRate || ''),
        correctedMove: 'What typically needs to happen on your side for this to get approved?',
        breakpointProspectLine: 'I just need to run this by my team.',
        repResponseLine: 'Yeah of course, that makes sense. Let me know what they say.',
      },
      metadata: {
        sherpaMode: 'demo_voice_close',
        sherpaDemoSessionId: body.sid,
      },
      maxDuration: '180s',
      joinTimeout: '30s',
      recordingEnabled: false,
    }

    const url = `https://api.ultravox.ai/api/agents/${agentId}/calls`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return withCors(
        req,
        new Response('Voice session could not be created.', { status: 500 }),
      )
    }

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    const callId = (data.callId || data.id) as string | undefined
    const joinUrl = data.joinUrl as string | undefined

    if (!callId || !joinUrl) {
      return withCors(
        req,
        new Response('Voice session could not be created.', { status: 500 }),
      )
    }

    return withCors(
      req,
      new Response(
        JSON.stringify({
          provider: 'ultravox',
          callId,
          joinUrl,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request.'
    return withCors(req, new Response(msg, { status: 400 }))
  }
}

