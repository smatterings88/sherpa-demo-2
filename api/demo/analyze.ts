import { z } from 'zod'
import { getRedis, sessionKey } from '../_lib/kv'
import { getOpenAI } from '../_lib/openai'
import { optionsResponse, withCors } from '../_lib/cors'

const bodySchema = z.object({
  sid: z.string().min(1),
})

const analysisSchema = z.object({
  contextLine: z.string(),
  breakpointProspectLine: z.string(),
  repResponseLine: z.string(),
  sherpaDiagnosis: z.string(),
  behaviorPattern: z.string(),
  moneyPain: z.string(),
  correctedMove: z.string(),
})

const FALLBACK = {
  contextLine: '$10K implementation. Head of Ops. Strong demo, then silence.',
  breakpointProspectLine:
    'Yeah, this looks really solid. I just need to run it by my team.',
  repResponseLine: 'Yeah of course, that makes sense. Let me know what they say.',
  sherpaDiagnosis:
    'This didn’t disappear after the call. You let it out of the room at the end.',
  behaviorPattern:
    'When it got slightly uncertain, you made it easier instead of keeping the decision active.',
  moneyPain: 'This is a $10K deal. Moments like this are where that leaks.',
  correctedMove:
    'What typically needs to happen on your side for something like this to get approved?',
}

const sessionSchema = z.object({
  transcript: z.string(),
  offer: z.string().optional().default(''),
  buyer: z.string().optional().default(''),
  feltOff: z.string().optional().default(''),
  dealValue: z.number().optional().default(10000),
  dealsPerMonth: z.number().optional().default(20),
  closeRate: z.number().optional().default(25),
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
    const s = sessionSchema.parse(session)

    const openai = getOpenAI()
    const system = `You are Alex the Sherpa.

You are not a generic AI sales coach.
You are a sales performance replay coach.

Your job is to find the single strongest moment where the deal lost control.

Tone:
direct, precise, calm, caring, high-standard.
No fluff.
No fake praise.
No motivational language.
No therapy language.
No "great job."
No "nice work."
No "based on my analysis."
No "maybe you could."
No "you may want to consider."

Rules:
- Return strict JSON only.
- Use exact transcript quotes when possible.
- Do not invent transcript quotes.
- If the transcript is messy, pick the clearest supported break.
- One breakpoint only.
- Tie the diagnosis to the user's deal context.
- Use observed language for transcript evidence.
- Use inferred language for money/revenue context.
- Keep each field concise.

Required JSON:
{
  "contextLine": "string",
  "breakpointProspectLine": "string",
  "repResponseLine": "string",
  "sherpaDiagnosis": "string",
  "behaviorPattern": "string",
  "moneyPain": "string",
  "correctedMove": "string"
}

Default correctedMove if buyer defers to team/approval/thinking:
"What typically needs to happen on your side for something like this to get approved?"`

    const user = JSON.stringify({
      transcript: s.transcript,
      offer: s.offer,
      buyer: s.buyer,
      feltOff: s.feltOff,
      dealValue: s.dealValue,
      dealsPerMonth: s.dealsPerMonth,
      closeRate: s.closeRate,
    })

    let analysis = FALLBACK
    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      })
      const content = res.choices[0]?.message?.content || ''
      const jsonStart = content.indexOf('{')
      const jsonEnd = content.lastIndexOf('}')
      const jsonText =
        jsonStart >= 0 && jsonEnd >= 0 ? content.slice(jsonStart, jsonEnd + 1) : ''
      if (jsonText) {
        const parsed = analysisSchema.safeParse(JSON.parse(jsonText))
        if (parsed.success) analysis = parsed.data
      }
    } catch {
      analysis = FALLBACK
    }

    return withCors(
      req,
      new Response(JSON.stringify(analysis), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request.'
    return withCors(req, new Response(msg, { status: 400 }))
  }
}

