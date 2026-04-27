import { UltravoxSession } from 'ultravox-client'

type Handlers = {
  onConnected: () => void
  onEnded: () => void
  onError: (message: string) => void
  onTranscriptText?: (msg: { speaker?: string; text: string; isFinal?: boolean }) => void
}

export async function startDemoVoiceCall(
  joinUrl: string,
  handlers: Handlers,
): Promise<{ end: () => void }> {
  const session = new UltravoxSession()

  let didConnect = false
  const onStatus = () => {
    const status = session.status
    if (!didConnect && status !== 'disconnected') {
      didConnect = true
      handlers.onConnected()
    }
    if (didConnect && status === 'disconnected') {
      handlers.onEnded()
    }
  }

  const onTranscripts = () => {
    const anySession = session as unknown as { transcripts?: unknown }
    const transcripts = anySession.transcripts
    if (!transcripts || !Array.isArray(transcripts)) return
    const last = transcripts.at(-1) as Record<string, unknown> | undefined
    const text = typeof last?.text === 'string' ? last.text : ''
    if (!text) return
    const speaker = typeof last?.speaker === 'string' ? last.speaker : undefined
    const isFinal = typeof last?.isFinal === 'boolean' ? last.isFinal : undefined
    handlers.onTranscriptText?.({ speaker, text, isFinal })
  }

  session.addEventListener('status', onStatus)
  session.addEventListener('transcripts', onTranscripts)

  try {
    session.joinCall(joinUrl)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to join voice call.'
    handlers.onError(msg)
  }

  return {
    end: () => {
      session.removeEventListener('status', onStatus)
      session.removeEventListener('transcripts', onTranscripts)
      void session.leaveCall().catch(() => {
        // no-op
      })
    },
  }
}

