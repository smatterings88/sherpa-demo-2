import { UltravoxSession } from 'ultravox-client'

type Handlers = {
  onConnected: () => void
  onEnded: () => void
  onError: (message: string) => void
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

  session.addEventListener('status', onStatus)

  try {
    session.joinCall(joinUrl)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to join voice call.'
    handlers.onError(msg)
  }

  return {
    end: () => {
      session.removeEventListener('status', onStatus)
      void session.leaveCall().catch(() => {
        // no-op
      })
    },
  }
}

