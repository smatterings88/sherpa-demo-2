import { z } from 'zod'
import { getOpenAI } from './_lib/openai.js'
import { optionsResponse, withCors } from './_lib/cors.js'
import { SHERPA_CHAT_SYSTEM_PROMPT } from './_lib/sherpaChatPrompt.js'

export const config = {
  runtime: 'edge',
}

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
})

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  context: z
    .object({
      page: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
})

function lastN<T>(arr: T[], n: number) {
  return arr.length > n ? arr.slice(arr.length - n) : arr
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse(req)
  if (req.method !== 'POST') {
    return withCors(req, new Response('Method Not Allowed', { status: 405 }))
  }

  try {
    const body = bodySchema.parse(await req.json())
    const openai = getOpenAI()

    const trimmed = lastN(body.messages, 20).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 8000),
    }))

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      stream: true,
      messages: [
        { role: 'system', content: SHERPA_CHAT_SYSTEM_PROMPT },
        ...(body.context?.page || body.context?.source
          ? [
              {
                role: 'system' as const,
                content: `Context:\n${JSON.stringify(body.context)}`,
              },
            ]
          : []),
        ...trimmed,
      ],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) controller.enqueue(encoder.encode(delta))
          }
          controller.close()
        } catch {
          controller.error(new Error('Stream failed.'))
        }
      },
    })

    return withCors(
      req,
      new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      }),
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request.'
    return withCors(req, new Response(msg, { status: 400 }))
  }
}

