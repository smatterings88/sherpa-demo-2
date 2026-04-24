import { z } from 'zod'
import { getRedis, sessionKey } from '../_lib/kv'
import { getOpenAI } from '../_lib/openai'
import { optionsResponse, withCors } from '../_lib/cors'

const ALLOWED_MIME = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/webm',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

const MB_25 = 25 * 1024 * 1024

const schema = z.object({
  source: z.enum(['ghl_funnel', 'direct', 'vercel_landing']).default('ghl_funnel'),
  name: z.string().optional().default(''),
  email: z.string().email(),
  offer: z.string().optional().default(''),
  buyer: z.string().optional().default(''),
  feltOff: z.string().optional().default(''),
  transcript: z.string().max(80000).optional().default(''),
  dealValue: z.coerce.number().optional().default(10000),
  dealsPerMonth: z.coerce.number().optional().default(20),
  closeRate: z.coerce.number().optional().default(25),
})

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse(req)
  if (req.method !== 'POST') {
    return withCors(req, new Response('Method Not Allowed', { status: 405 }))
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let parsed: z.infer<typeof schema>
    let audioFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData()
      const raw = {
        source: (fd.get('source') as string | null) ?? undefined,
        name: (fd.get('name') as string | null) ?? undefined,
        email: (fd.get('email') as string | null) ?? undefined,
        offer: (fd.get('offer') as string | null) ?? undefined,
        buyer: (fd.get('buyer') as string | null) ?? undefined,
        feltOff: (fd.get('feltOff') as string | null) ?? undefined,
        transcript: (fd.get('transcript') as string | null) ?? undefined,
        dealValue: (fd.get('dealValue') as string | null) ?? undefined,
        dealsPerMonth: (fd.get('dealsPerMonth') as string | null) ?? undefined,
        closeRate: (fd.get('closeRate') as string | null) ?? undefined,
      }
      const file = fd.get('audioFile')
      if (file && file instanceof File) audioFile = file
      parsed = schema.parse(raw)
    } else if (contentType.includes('application/json')) {
      const raw = await req.json()
      parsed = schema.parse(raw)
    } else {
      return withCors(req, new Response('Unsupported Content-Type', { status: 415 }))
    }

    const hasTranscript = Boolean(parsed.transcript && parsed.transcript.trim())
    const hasAudio = Boolean(audioFile && audioFile.size > 0)
    if (!hasTranscript && !hasAudio) {
      return withCors(
        req,
        new Response('Either transcript or audioFile is required.', { status: 400 }),
      )
    }

    if (audioFile && audioFile.size > MB_25) {
      return withCors(req, new Response('audioFile exceeds 25MB.', { status: 413 }))
    }
    if (audioFile && audioFile.type && !ALLOWED_MIME.has(audioFile.type)) {
      return withCors(req, new Response('Unsupported audio/video type.', { status: 415 }))
    }

    let finalTranscript = parsed.transcript?.trim() ?? ''
    if (!finalTranscript && audioFile) {
      const openai = getOpenAI()
      const tr = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'gpt-4o-mini-transcribe',
      })
      finalTranscript = (tr.text || '').trim()
      if (!finalTranscript) {
        return withCors(req, new Response('Transcription failed.', { status: 502 }))
      }
    }

    const sessionId = `demo_${crypto.randomUUID()}`
    const createdAt = new Date().toISOString()

    const session = {
      sessionId,
      createdAt,
      source: parsed.source,
      name: parsed.name,
      email: parsed.email,
      transcript: finalTranscript,
      offer: parsed.offer,
      buyer: parsed.buyer,
      feltOff: parsed.feltOff,
      dealValue: Number.isFinite(parsed.dealValue) ? parsed.dealValue : 10000,
      dealsPerMonth: Number.isFinite(parsed.dealsPerMonth) ? parsed.dealsPerMonth : 20,
      closeRate: Number.isFinite(parsed.closeRate) ? parsed.closeRate : 25,
    }

    const redis = getRedis()
    await redis.set(sessionKey(sessionId), session, { ex: 60 * 60 * 24 })

    const baseUrl = process.env.DEMO_BASE_URL
    if (!baseUrl) {
      return withCors(req, new Response('DEMO_BASE_URL is not set.', { status: 500 }))
    }

    const redirectUrl = `${baseUrl.replace(/\/$/, '')}/demo-review?sid=${encodeURIComponent(
      sessionId,
    )}`

    return withCors(
      req,
      new Response(JSON.stringify({ sessionId, redirectUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request.'
    return withCors(req, new Response(msg, { status: 400 }))
  }
}

