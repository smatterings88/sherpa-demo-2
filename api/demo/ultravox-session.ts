import { z } from 'zod'
import { analysisKey, getRedis, sessionKey } from '../_lib/kv.js'
import { optionsResponse, withCors } from '../_lib/cors.js'
import { GHL_DEMO_TAGS, safeTrackGhlDemoTag } from '../_lib/ghlDemo.js'

export const config = {
  runtime: 'edge',
}

const bodySchema = z.object({
  sid: z.string().min(1),
})

const sessionSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional().default(''),
  offer: z.string().optional().default(''),
  buyer: z.string().optional().default(''),
  feltOff: z.string().optional().default(''),
  dealValue: z.number().optional().default(0),
  dealsPerMonth: z.number().optional().default(0),
  closeRate: z.number().optional().default(0),
})

const issueTypeSchema = z.enum([
  'approval_deferral',
  'pricing_uncertainty',
  'usage_metering_concern',
  'technical_scope_confusion',
  'value_gap',
  'next_step_loss',
  'overexplaining',
  'general_control_loss',
])

const analysisSchema = z.object({
  breakpointProspectLine: z.string(),
  repResponseLine: z.string(),
  correctedMove: z.string(),
  issueType: issueTypeSchema,
  roleplayProspectLine: z.string(),
  roleplayTargetMove: z.string(),
})

type DemoAnalysis = z.infer<typeof analysisSchema>

function roleplayTargetMoveFallback(issueType: z.infer<typeof issueTypeSchema>) {
  const targets: Record<z.infer<typeof issueTypeSchema>, string> = {
    approval_deferral: 'Name the approval path without softening the decision.',
    pricing_uncertainty: 'Clarify what pricing question they are really asking.',
    usage_metering_concern:
      'Clarify the concern behind metering before explaining the implementation.',
    technical_scope_confusion: 'Separate internal mechanics from customer-visible scope.',
    value_gap: 'Tie the offer to the outcome they care about before defending price.',
    next_step_loss: 'Lock the next step with a concrete decision, not a vague follow-up.',
    overexplaining: 'Ask what they need clarity on before adding more explanation.',
    general_control_loss: 'Name the blocker and keep the decision in the room.',
  }
  return targets[issueType]
}

function correctedMoveFallback(issueType: z.infer<typeof issueTypeSchema>) {
  const moves: Record<z.infer<typeof issueTypeSchema>, string> = {
    approval_deferral:
      'What typically needs to happen on your side for this to get approved?',
    pricing_uncertainty:
      'When you ask about price, are you trying to understand budget fit, ROI, or what changes at different usage levels?',
    usage_metering_concern:
      'When you ask about metering, are you worried about cost surprises, usage limits, or what customers will see?',
    technical_scope_confusion:
      'Which part are you trying to get clear on — how it works internally, what the customer sees, or what we need to build first?',
    value_gap: 'What would need to be clearer for this to feel worth the investment?',
    next_step_loss: 'What would need to happen next for this to keep moving?',
    overexplaining: 'Before I explain more, what part are you trying to get clear on?',
    general_control_loss:
      "What's the main thing you're trying to resolve before this can move forward?",
  }
  return moves[issueType]
}

function parseStoredAnalysis(raw: unknown): DemoAnalysis | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    try {
      return analysisSchema.parse(JSON.parse(raw))
    } catch {
      return null
    }
  }
  if (typeof raw === 'object') {
    return analysisSchema.safeParse(raw).success ? analysisSchema.parse(raw) : null
  }
  return null
}

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
    const analysisRaw = await redis.get(analysisKey(body.sid))
    const analysis = parseStoredAnalysis(analysisRaw)

    const env = getEnv()
    const apiKey = env.ULTRAVOX_API_KEY
    const agentId = env.ULTRAVOX_DEMO_AGENT_ID
    if (!apiKey || !agentId) {
      return withCors(
        req,
        new Response('Voice session could not be created.', { status: 500 }),
      )
    }

    const hasAnalysis = !!analysis

    const roleplayProspectLine = analysis?.roleplayProspectLine?.trim() || ''
    const breakpointProspectLine = analysis?.breakpointProspectLine?.trim() || ''
    const repResponseLine = analysis?.repResponseLine?.trim() || ''
    const correctedMove = analysis?.correctedMove?.trim() || ''
    const roleplayTargetMove = analysis?.roleplayTargetMove?.trim() || ''
    const issueType = analysis?.issueType

    console.info(
      JSON.stringify({
        tag: 'ultravox_demo_context',
        sid: body.sid,
        issueType: hasAnalysis ? issueType : 'unknown',
        roleplayProspectLine: hasAnalysis ? roleplayProspectLine : '',
        correctedMove: hasAnalysis ? correctedMove : '',
      }),
    )

    const templateContext = {
      offer: s.offer || '',
      buyer: s.buyer || '',
      feltOff: s.feltOff || '',
      dealValue: String(s.dealValue || ''),
      dealsPerMonth: String(s.dealsPerMonth || ''),
      closeRate: String(s.closeRate || ''),
      issueType: hasAnalysis ? issueType : 'unknown',
      roleplayProspectLine: hasAnalysis
        ? roleplayProspectLine || breakpointProspectLine
        : 'I just need to run this by my team.',
      roleplayTargetMove: hasAnalysis
        ? roleplayTargetMove ||
          roleplayTargetMoveFallback(issueType as z.infer<typeof issueTypeSchema>)
        : 'Name the approval path without softening the decision.',
      correctedMove: hasAnalysis
        ? correctedMove || correctedMoveFallback(issueType as z.infer<typeof issueTypeSchema>)
        : 'What typically needs to happen on your side for this to get approved?',
      breakpointProspectLine: hasAnalysis
        ? breakpointProspectLine || roleplayProspectLine
        : 'I just need to run this by my team.',
      repResponseLine: hasAnalysis
        ? repResponseLine
        : 'Yeah of course, that makes sense. Let me know what they say.',
    }

    const payload = {
      templateContext,
      metadata: {
        sherpaMode: 'demo_voice_close',
        sherpaDemoSessionId: body.sid,
        issueType: hasAnalysis ? issueType : 'unknown',
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

    const ghlTracking = await safeTrackGhlDemoTag({
      email: s.email,
      name: s.name,
      tag: GHL_DEMO_TAGS.DID_TEST_CALL,
      context: 'demo_voice_call_started',
    })

    const vercelEnv = process.env.VERCEL_ENV
    const includeGhlDebug = vercelEnv && vercelEnv !== 'production'

    return withCors(
      req,
      new Response(
        JSON.stringify({
          provider: 'ultravox',
          callId,
          joinUrl,
          ...(includeGhlDebug
            ? {
                ghlTracking: ghlTracking.ok
                  ? { ok: true, skipped: false, tagAction: ghlTracking.result.tagAction }
                  : ghlTracking.skipped
                    ? { ok: false, skipped: true, reason: ghlTracking.reason }
                    : { ok: false, skipped: false, reason: ghlTracking.reason },
              }
            : {}),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request.'
    return withCors(req, new Response(msg, { status: 400 }))
  }
}

