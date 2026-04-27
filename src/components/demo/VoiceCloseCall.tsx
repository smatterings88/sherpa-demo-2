import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../Card'
import { Button } from '../Button'
import { startUltravoxDemoSession } from '../../lib/demoApi'
import { startDemoVoiceCall } from '../../lib/ultravoxDemoClient'

type VoiceCloseState = 'idle' | 'creating' | 'connecting' | 'live' | 'ended' | 'error'

export function VoiceCloseCall({
  sid,
  onComplete,
}: {
  sid: string
  onComplete: () => void
}) {
  const [state, setState] = useState<VoiceCloseState>('idle')
  const [errorFlag, setErrorFlag] = useState(false)
  const endRef = useRef<null | (() => void)>(null)

  const statusLine = useMemo(() => {
    if (state === 'creating') return 'Creating the voice close…'
    if (state === 'connecting') return 'Connecting your mic…'
    if (state === 'live') return 'Voice close is live. Keep it tight.'
    if (state === 'error') return "Voice didn’t connect."
    return ''
  }, [state])

  const onStart = async () => {
    setErrorFlag(false)
    setState('creating')
    try {
      const { joinUrl } = await startUltravoxDemoSession(sid)
      setState('connecting')
      const conn = await startDemoVoiceCall(joinUrl, {
        onConnected: () => setState('live'),
        onEnded: () => setState('ended'),
        onError: () => {
          setErrorFlag(true)
          setState('error')
        },
      })
      endRef.current = conn.end
    } catch {
      setErrorFlag(true)
      setState('error')
    }
  }

  const onEnd = () => {
    endRef.current?.()
    endRef.current = null
    setState('ended')
  }

  useEffect(() => {
    if (state !== 'ended') return
    onComplete()
  }, [state, onComplete])

  return (
    <Card id="voice-close" className="border-white/[0.14]">
      <h2 className="text-xl font-bold text-white">Close it live</h2>
      <p className="mt-4 text-base leading-relaxed text-[#d1d5db]">
        Typing it is one thing.
        <br />
        Closing it live is different.
      </p>
      <p className="mt-4 text-base leading-relaxed text-[#9ca3af]">
        Activate your mic and run the moment out loud.
      </p>

      {state === 'idle' ? (
        <div className="mt-8">
          <Button onClick={onStart}>Start voice close</Button>
        </div>
      ) : null}

      {state === 'creating' || state === 'connecting' || state === 'live' ? (
        <div className="mt-8 space-y-4">
          <p className="text-base text-[#9ca3af]">{statusLine}</p>
          {state === 'live' ? (
            <Button variant="secondary" onClick={onEnd}>
              End call
            </Button>
          ) : null}
        </div>
      ) : null}

      {state === 'error' ? (
        <div className="mt-8">
          <p className="text-base text-white">{statusLine}</p>
          <p className="mt-4 text-base text-[#9ca3af]">The move is still the same.</p>
          <div className="mt-6">
            <Button variant="secondary" onClick={onComplete}>
              Continue
            </Button>
          </div>

          {errorFlag ? (
            <div className="mt-10 rounded-2xl border border-[#f5b400]/20 bg-black/40 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                Voice close · simulation fallback
              </p>
              <p className="mt-4 text-base text-[#d1d5db]">
                If mic access is blocked on this device, you can still demo the cadence:
                stay tight, keep the decision in the room, then ask for the next step.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}

