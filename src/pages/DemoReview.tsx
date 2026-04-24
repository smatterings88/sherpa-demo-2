import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import type { DemoAnalysis, DemoSubmission, RoleplayEvaluation } from '../types/demo'
import { analyzeDemoSession, fetchDemoSession, startUltravoxDemoSession } from '../lib/demoApi'
import { evaluateRoleplayAttempt } from '../lib/demoLogic'

const ANALYZING_STEPS = [
  'Reading the call…',
  'Finding the shift…',
  'Checking the decision moment…',
] as const

type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading'; lineIndex: number }
  | { status: 'ready'; analysis: DemoAnalysis }
  | { status: 'error'; message: string }

type VoiceState =
  | { status: 'idle' }
  | { status: 'starting' }
  | { status: 'placeholder'; phase: 'prompt' | 'interrupt' | 'redeemed' }
  | { status: 'error'; message: string }

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
        {label}
      </p>
      <p className="mt-1 text-base font-medium text-white">{value}</p>
    </div>
  )
}

function splitParagraphs(text: string) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

export function DemoReview() {
  const [params] = useSearchParams()
  const sid = params.get('sid')?.trim() ?? ''

  const analysisStartedRef = useRef(false)

  const [sessionState, setSessionState] = useState<
    | { status: 'missingSid' }
    | { status: 'loading' }
    | { status: 'expired' }
    | { status: 'ready'; session: DemoSubmission }
    | { status: 'error'; message: string }
  >({ status: sid ? 'loading' : 'missingSid' })

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
  })

  const [roleText, setRoleText] = useState('')
  const [roleEval, setRoleEval] = useState<RoleplayEvaluation | null>(null)
  const [voiceState, setVoiceState] = useState<VoiceState>({ status: 'idle' })

  const checkoutUrl = import.meta.env.VITE_GHL_CHECKOUT_URL as
    | string
    | undefined

  useEffect(() => {
    if (!sid) return
    let cancelled = false
    const t0 = window.setTimeout(() => {
      if (!cancelled) setSessionState({ status: 'loading' })
    }, 0)
    fetchDemoSession(sid)
      .then((session) => {
        if (cancelled) return
        setSessionState({ status: 'ready', session })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'Failed to load session.'
        if (msg.includes('404')) setSessionState({ status: 'expired' })
        else setSessionState({ status: 'error', message: msg })
      })
    return () => {
      cancelled = true
      window.clearTimeout(t0)
    }
  }, [sid])

  useEffect(() => {
    if (sessionState.status !== 'ready') return
    if (analysisStartedRef.current) return
    analysisStartedRef.current = true

    let cancelled = false
    setAnalysisState({ status: 'loading', lineIndex: 0 })

    const a = window.setTimeout(() => {
      if (!cancelled) setAnalysisState({ status: 'loading', lineIndex: 1 })
    }, 650)
    const b = window.setTimeout(() => {
      if (!cancelled) setAnalysisState({ status: 'loading', lineIndex: 2 })
    }, 1350)
    const c = window.setTimeout(async () => {
      try {
        const analysis = await analyzeDemoSession(sessionState.session.sessionId)
        if (!cancelled) setAnalysisState({ status: 'ready', analysis })
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Analysis failed. Try again.'
        if (!cancelled) setAnalysisState({ status: 'error', message: msg })
      }
    }, 2050)

    return () => {
      cancelled = true
      window.clearTimeout(a)
      window.clearTimeout(b)
      window.clearTimeout(c)
    }
  }, [sessionState])

  const headerLine = useMemo(() => {
    if (sessionState.status !== 'ready') return ''
    const s = sessionState.session
    return `${s.offer || 'Offer'}. ${s.buyer || 'Buyer'}. ${s.feltOff || 'Felt off.'}`
  }, [sessionState])

  const runRoleplay = () => {
    const ev = evaluateRoleplayAttempt(roleText)
    setRoleEval(ev)
  }

  const startVoiceClose = async () => {
    if (sessionState.status !== 'ready') return
    setVoiceState({ status: 'starting' })
    try {
      const res = await startUltravoxDemoSession(sessionState.session.sessionId)
      if (res.mode === 'live') {
        // If/when a real Ultravox client integration is added, wire it here.
        setVoiceState({
          status: 'placeholder',
          phase: 'prompt',
        })
        return
      }
      setVoiceState({ status: 'placeholder', phase: 'prompt' })
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Voice close failed. Try again.'
      setVoiceState({ status: 'error', message: msg })
    }
  }

  const goCheckout = () => {
    if (checkoutUrl && checkoutUrl.trim()) {
      window.location.href = checkoutUrl
      return
    }
    window.alert('Checkout connection goes here.')
  }

  return (
    <div className="min-h-svh bg-[#0b0d10] text-[#e5e7eb]">
      <div className="mx-auto max-w-[860px] px-5 py-14 sm:py-16">
        <div className="mb-10 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">
              Alex the Sherpa
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Sales performance replay
            </h1>
          </div>
        </div>

        {sessionState.status === 'missingSid' ? (
          <Card>
            <p className="text-lg font-semibold text-white">
              No demo session found. Submit a call from the funnel first.
            </p>
          </Card>
        ) : null}

        {sessionState.status === 'loading' ? (
          <Card>
            <p className="text-lg font-semibold text-white">
              Opening the replay room...
            </p>
          </Card>
        ) : null}

        {sessionState.status === 'expired' ? (
          <Card>
            <p className="text-lg font-semibold text-white">
              This demo session expired. Submit the call again.
            </p>
          </Card>
        ) : null}

        {sessionState.status === 'error' ? (
          <Card>
            <p className="text-lg font-semibold text-white">{sessionState.message}</p>
          </Card>
        ) : null}

        {sessionState.status === 'ready' ? (
          <div className="space-y-10">
            <Card className="border-white/[0.14]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Offer" value={sessionState.session.offer || '—'} />
                <Field label="Buyer" value={sessionState.session.buyer || '—'} />
                <Field
                  label="Where it felt off"
                  value={sessionState.session.feltOff || '—'}
                />
                <Field
                  label="Deal value"
                  value={`$${sessionState.session.dealValue.toLocaleString()}`}
                />
                <Field
                  label="Deals/month"
                  value={`${sessionState.session.dealsPerMonth}`}
                />
                <Field
                  label="Close rate"
                  value={`${sessionState.session.closeRate}%`}
                />
              </div>
            </Card>

            <AnimatePresence mode="wait">
              <motion.div
                key={analysisState.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {analysisState.status === 'loading' ? (
                  <Card className="py-16 text-center">
                    <p className="text-xl font-medium text-[#f5b400]">
                      {ANALYZING_STEPS[analysisState.lineIndex]}
                    </p>
                  </Card>
                ) : null}

                {analysisState.status === 'error' ? (
                  <Card>
                    <p className="text-white">{analysisState.message}</p>
                    <div className="mt-8">
                      <Button
                        variant="secondary"
                        onClick={() => setAnalysisState({ status: 'idle' })}
                      >
                        Retry analysis
                      </Button>
                    </div>
                  </Card>
                ) : null}

                {analysisState.status === 'ready' ? (
                  <div className="space-y-6">
                    <Card className="border-[#f5b400]/25">
                      <div className="space-y-3 text-base leading-relaxed text-[#e5e7eb]">
                        <p>Alright.</p>
                        <p className="text-white">
                          {analysisState.analysis.contextLine || headerLine}
                        </p>
                        <p>Give me a second.</p>
                        <p className="pt-2 text-white">
                          {analysisState.analysis.sherpaDiagnosis}
                        </p>
                      </div>
                    </Card>

                    <Card className="border-white/[0.14]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                        Prospect
                      </p>
                      <p className="mt-3 text-lg text-white">
                        “{analysisState.analysis.breakpointProspectLine}”
                      </p>
                      <div className="mt-6 border-t border-white/[0.08] pt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                          Sherpa
                        </p>
                        <p className="mt-3 text-base text-[#d1d5db]">
                          That’s the moment.
                        </p>
                      </div>
                    </Card>

                    <Card className="border-white/[0.14]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                        Rep
                      </p>
                      <p className="mt-3 text-lg text-white">
                        “{analysisState.analysis.repResponseLine}”
                      </p>
                      <div className="mt-6 border-t border-white/[0.08] pt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                          Sherpa
                        </p>
                        <p className="mt-3 text-base text-[#d1d5db]">
                          That ends the deal.
                        </p>
                      </div>
                    </Card>

                    <Card className="border-white/[0.14]">
                      <p className="text-base leading-relaxed text-[#d1d5db]">
                        {analysisState.analysis.behaviorPattern}
                      </p>
                    </Card>

                    <Card className="border-white/[0.14]">
                      <p className="text-base leading-relaxed text-[#d1d5db]">
                        {analysisState.analysis.moneyPain}
                      </p>
                    </Card>

                    <Card className="border-white/[0.14]">
                      <p className="text-base text-[#d1d5db]">
                        When that line shows up, you narrow.
                      </p>
                      <p className="mt-4 text-base text-[#9ca3af]">Say this:</p>
                      <p className="mt-3 rounded-lg border border-[#f5b400]/30 bg-[#f5b400]/[0.06] p-5 text-lg font-medium text-white">
                        “{analysisState.analysis.correctedMove}”
                      </p>
                      <p className="mt-5 text-base text-[#d1d5db]">
                        That keeps the decision in the room.
                      </p>
                    </Card>

                    <Card className="border-white/[0.14]">
                      <h2 className="text-xl font-bold text-white">
                        Run the moment again
                      </h2>
                      <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/30 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                          AI Prospect
                        </p>
                        <p className="mt-3 text-base text-white">
                          “I just need to run this by my team.”
                        </p>
                      </div>
                      <div className="mt-6">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
                          Your line
                        </p>
                        <textarea
                          value={roleText}
                          onChange={(e) => setRoleText(e.target.value)}
                          placeholder="Type your response..."
                          rows={4}
                          className="w-full resize-y rounded-lg border border-white/[0.12] bg-[#080b10] px-4 py-3.5 text-base text-white placeholder:text-[#6b7280] transition-colors focus:border-[#f5b400]/55 focus:outline-none focus:ring-2 focus:ring-[#f5b400]/25"
                        />
                      </div>
                      <div className="mt-5">
                        <Button onClick={runRoleplay}>Send</Button>
                      </div>

                      {roleEval ? (
                        <div className="mt-8 border-t border-white/[0.08] pt-6">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                            Sherpa
                          </p>
                          <div className="mt-4 space-y-2">
                            {splitParagraphs(roleEval.message).map((p) => (
                              <p
                                key={p}
                                className={
                                  roleEval.status === 'fail' &&
                                  p === 'Run it again. Keep it tight.'
                                    ? 'text-base font-semibold text-white'
                                    : 'text-base text-[#d1d5db]'
                                }
                              >
                                {p}
                              </p>
                            ))}
                          </div>
                          {roleEval.status === 'pass' ? (
                            <div className="mt-8">
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setVoiceState({ status: 'idle' })
                                  document
                                    .getElementById('voice-close')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                                }}
                              >
                                Close it live
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </Card>

                    <Card
                      id="voice-close"
                      className="border-white/[0.14]"
                    >
                      <h2 className="text-xl font-bold text-white">Close it live</h2>
                      <p className="mt-4 text-base leading-relaxed text-[#d1d5db]">
                        Typing it is one thing.
                        <br />
                        Closing it live is different.
                      </p>
                      <p className="mt-4 text-base leading-relaxed text-[#9ca3af]">
                        Activate your mic and run the moment out loud.
                      </p>

                      {voiceState.status === 'idle' ? (
                        <div className="mt-8">
                          <Button onClick={startVoiceClose}>
                            Start voice close
                          </Button>
                        </div>
                      ) : null}

                      {voiceState.status === 'starting' ? (
                        <div className="mt-8">
                          <p className="text-base text-[#9ca3af]">
                            Starting voice close…
                          </p>
                        </div>
                      ) : null}

                      {voiceState.status === 'error' ? (
                        <div className="mt-8">
                          <p className="text-base text-white">{voiceState.message}</p>
                          <div className="mt-6">
                            <Button
                              variant="secondary"
                              onClick={() => setVoiceState({ status: 'idle' })}
                            >
                              Try again
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {voiceState.status === 'placeholder' ? (
                        <div className="mt-10 rounded-2xl border border-[#f5b400]/20 bg-black/40 p-6">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                              Voice close · simulation
                            </p>
                          </div>
                          <div className="mt-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                              Prospect
                            </p>
                            <p className="mt-3 text-base text-white">
                              {voiceState.phase === 'redeemed'
                                ? '“Okay, I can talk to them Thursday.”'
                                : '“I just need to run this by my team.”'}
                            </p>
                          </div>

                          {voiceState.phase === 'prompt' ? (
                            <div className="mt-8">
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  setVoiceState({
                                    status: 'placeholder',
                                    phase: 'interrupt',
                                  })
                                }
                              >
                                I answered out loud
                              </Button>
                            </div>
                          ) : null}

                          {voiceState.phase === 'interrupt' ? (
                            <div className="mt-8 space-y-6 border-t border-white/[0.08] pt-6">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                                  Sherpa
                                </p>
                                <p className="mt-3 text-base text-[#d1d5db]">
                                  Stop.
                                </p>
                                <p className="mt-2 text-base text-[#d1d5db]">
                                  You softened it.
                                </p>
                                <p className="mt-2 text-base text-[#d1d5db]">
                                  Say it tighter.
                                </p>
                              </div>
                              <Button
                                onClick={() =>
                                  setVoiceState({
                                    status: 'placeholder',
                                    phase: 'redeemed',
                                  })
                                }
                              >
                                Run it again
                              </Button>
                            </div>
                          ) : null}

                          {voiceState.phase === 'redeemed' ? (
                            <div className="mt-8 space-y-6 border-t border-white/[0.08] pt-6">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                                  Sherpa
                                </p>
                                <p className="mt-3 text-base font-semibold text-white">
                                  There.
                                </p>
                                <p className="mt-2 text-base text-[#d1d5db]">
                                  Now the deal stays alive.
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </Card>

                    <Card className="border-[#f5b400]/20">
                      <p className="text-base leading-relaxed text-[#d1d5db]">
                        There&apos;s another place in this call where you gave up
                        leverage before this even happened.
                      </p>
                      <p className="mt-4 text-base font-medium text-white">
                        That&apos;s the one that usually decides whether this closes.
                      </p>
                      <p className="mt-6 text-base text-[#9ca3af]">
                        Same call. Same buyer.
                      </p>
                      <p className="mt-2 text-base text-[#d1d5db]">
                        One version drifts.
                      </p>
                      <p className="mt-1 text-base text-[#d1d5db]">
                        One version stays alive.
                      </p>
                      <div className="mt-8">
                        <Button onClick={goCheckout}>
                          Run the full call — $297/month
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </div>
  )
}

