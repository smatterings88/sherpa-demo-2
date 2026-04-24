import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { Card } from './Card'
import { SAMPLE_TRANSCRIPT } from '../lib/sampleTranscript'
import {
  evaluateRoleplayAttempt,
  extractBreakpointEvidence,
  formatCurrency,
  formatSherpaContextSummary,
  getCloseRateTierLine,
} from '../lib/demoLogic'
import type {
  DemoStep,
  FrameworkChoice,
  RoleplayEvaluation,
  VoiceTeaserPhase,
} from '../types/demo'

const ANALYZING_STEPS = [
  'Reading the call…',
  'Finding the shift…',
  'Checking the decision moment…',
] as const

export function DemoFunnel() {
  const [step, setStep] = useState<DemoStep>('transcript')
  const [sampleMode, setSampleMode] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [recordingLabel, setRecordingLabel] = useState('')
  const [transcript, setTranscript] = useState('')
  const [selling, setSelling] = useState('')
  const [buyer, setBuyer] = useState('')
  const [feltOff, setFeltOff] = useState('')
  const [dealValue, setDealValue] = useState('')
  const [dealsPerMonth, setDealsPerMonth] = useState('')
  const [closeRate, setCloseRate] = useState('')
  const [analyzingIndex, setAnalyzingIndex] = useState(0)
  const [bpPhase, setBpPhase] = useState(0)
  const [roleplayInput, setRoleplayInput] = useState('')
  const [roleplayResult, setRoleplayResult] = useState<RoleplayEvaluation | null>(
    null,
  )
  const [voicePhase, setVoicePhase] = useState<VoiceTeaserPhase>('idle')
  const [selectedFramework, setSelectedFramework] =
    useState<FrameworkChoice | null>(null)

  const economics = useMemo(() => {
    return {
      dealValue: Number(dealValue) || 0,
      dealsPerMonth: Number(dealsPerMonth) || 0,
      closeRate: Number(closeRate) || 0,
    }
  }, [dealValue, dealsPerMonth, closeRate])

  const moneyTierLine = useMemo(
    () => getCloseRateTierLine(economics.closeRate),
    [economics.closeRate],
  )

  const evidence = useMemo(
    () => extractBreakpointEvidence(transcript, sampleMode),
    [transcript, sampleMode],
  )

  const contextSummary = useMemo(
    () =>
      formatSherpaContextSummary({
        selling: selling.trim() || '$10K implementation',
        buyer: buyer.trim() || 'Head of Ops',
        feltOff: feltOff.trim() || 'Strong demo, then silence',
      }),
    [selling, buyer, feltOff],
  )

  useEffect(() => {
    if (step !== 'analyzing') return
    const a = window.setTimeout(() => setAnalyzingIndex(1), 600)
    const b = window.setTimeout(() => setAnalyzingIndex(2), 1200)
    const c = window.setTimeout(() => {
      setBpPhase(0)
      setStep('breakpoint')
    }, 1900)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
      window.clearTimeout(c)
    }
  }, [step])

  useEffect(() => {
    if (step !== 'breakpoint') return
    let cancelled = false
    const t0 = window.setTimeout(() => {
      if (!cancelled) setBpPhase(1)
    }, 450)
    const t1 = window.setTimeout(() => {
      if (!cancelled) setBpPhase(2)
    }, 1100)
    const t2 = window.setTimeout(() => {
      if (!cancelled) setBpPhase(3)
    }, 1750)
    return () => {
      cancelled = true
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [step])

  const loadSample = () => {
    setSampleMode(true)
    setTranscript(SAMPLE_TRANSCRIPT)
    setSelling('$10K implementation')
    setBuyer('Head of Ops')
    setFeltOff('Strong demo, then silence')
    setDealValue('10000')
    setDealsPerMonth('20')
    setCloseRate('25')
  }

  const runAnalyze = () => {
    if (!transcript.trim()) return
    setStep('context')
  }

  const continueContext = () => {
    setStep('economics')
  }

  const runEconomics = () => {
    if (!transcript.trim()) return
    if (!(Number(dealValue) > 0)) return
    setAnalyzingIndex(0)
    setStep('analyzing')
  }

  const sendRoleplay = () => {
    const ev = evaluateRoleplayAttempt(roleplayInput)
    setRoleplayResult(ev)
  }

  const continueAfterStrongRoleplay = () => {
    setRoleplayResult(null)
    setRoleplayInput('')
    setVoicePhase('idle')
    setStep('voiceTeaser')
  }

  const fieldLabel = (text: string) => (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
      {text}
    </label>
  )

  const inputClass =
    'w-full rounded-lg border border-white/[0.1] bg-[#0b0d10] px-3 py-2.5 text-sm text-white placeholder:text-[#6b7280] focus:border-[#f5b400]/50 focus:outline-none'

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 'transcript' ? (
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  {fieldLabel('Name')}
                  <input
                    className={inputClass}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
                <div className="sm:col-span-1">
                  {fieldLabel('Email')}
                  <input
                    className={inputClass}
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="mt-5">
                {fieldLabel('Upload recording')}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="cursor-pointer">
                    <span className="inline-flex rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/[0.07]">
                      Choose file
                    </span>
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        setRecordingLabel(f ? f.name : '')
                      }}
                    />
                  </label>
                  <span className="text-xs text-[#6b7280]">
                    {recordingLabel
                      ? recordingLabel
                      : 'Audio or video (demo — not uploaded)'}
                  </span>
                </div>
              </div>
              <div className="mt-5">
                {fieldLabel('Paste transcript')}
                <p className="mb-2 text-xs text-[#6b7280]">
                  Text from your CRM or notes
                </p>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the transcript here..."
                  rows={10}
                  className={`${inputClass} min-h-[200px] resize-y font-mono text-[13px] leading-relaxed`}
                />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  className="w-full sm:w-auto"
                  onClick={runAnalyze}
                  disabled={!transcript.trim()}
                >
                  Analyze My Call
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={loadSample}
                >
                  Use sample call
                </Button>
              </div>
              <div className="mt-8 space-y-1 border-t border-white/[0.06] pt-6 text-xs leading-relaxed text-[#6b7280]">
                <p>Private. Not stored. Not shared.</p>
                <p>Messy is fine.</p>
                <p>Rough is fine.</p>
                <p>We&apos;re not grading you.</p>
              </div>
            </Card>
          ) : null}

          {step === 'context' ? (
            <Card>
              <div className="space-y-4">
                <div>
                  {fieldLabel('What are you selling?')}
                  <input
                    className={inputClass}
                    value={selling}
                    onChange={(e) => setSelling(e.target.value)}
                    placeholder="$10K implementation program"
                  />
                </div>
                <div>
                  {fieldLabel("Who's the buyer?")}
                  <input
                    className={inputClass}
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    placeholder="Head of Ops at a mid-size company"
                  />
                </div>
                <div>
                  {fieldLabel('Where did it feel off?')}
                  <input
                    className={inputClass}
                    value={feltOff}
                    onChange={(e) => setFeltOff(e.target.value)}
                    placeholder="Strong demo, then they said they needed to talk to the team"
                  />
                </div>
              </div>
              <div className="mt-8">
                <Button onClick={continueContext}>Continue</Button>
              </div>
            </Card>
          ) : null}

          {step === 'economics' ? (
            <Card>
              <div className="mt-0 grid gap-4 sm:grid-cols-3">
                <div>
                  {fieldLabel('Deal value')}
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div>
                  {fieldLabel('Deals you work per month')}
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={dealsPerMonth}
                    onChange={(e) => setDealsPerMonth(e.target.value)}
                    placeholder="20"
                  />
                </div>
                <div>
                  {fieldLabel('Current close rate')}
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={closeRate}
                    onChange={(e) => setCloseRate(e.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-[#6b7280]">
                Close rate as a percent (e.g. 25 for 25%).
              </p>
              <div className="mt-8">
                <Button
                  onClick={runEconomics}
                  disabled={!(Number(dealValue) > 0)}
                >
                  Continue
                </Button>
              </div>
            </Card>
          ) : null}

          {step === 'analyzing' ? (
            <Card className="py-14 text-center">
              <p className="text-sm font-medium text-[#f5b400]">
                {ANALYZING_STEPS[analyzingIndex]}
              </p>
              <p className="mt-4 text-xs text-[#6b7280]">
                Demo only — runs in your browser. Nothing is sent to a server.
              </p>
            </Card>
          ) : null}

          {step === 'breakpoint' ? (
            <div className="space-y-5">
              <Card className="border-[#f5b400]/25">
                {bpPhase >= 0 ? (
                  <div className="space-y-3 text-sm leading-relaxed text-[#e5e7eb]">
                    <p>Alright.</p>
                    <p className="text-white">{contextSummary}</p>
                    <p>Give me a second.</p>
                  </div>
                ) : null}
                {bpPhase >= 1 ? (
                  <div className="mt-5 space-y-3 border-t border-white/[0.08] pt-5 text-sm leading-relaxed text-[#e5e7eb]">
                    <p>This didn&apos;t disappear after the call.</p>
                    <p>You let it out of the room at the end.</p>
                  </div>
                ) : null}
              </Card>

              {bpPhase >= 2 ? (
                <div className="space-y-4">
                  <Card className="border-white/[0.1]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                      Prospect
                    </p>
                    <p className="mt-2 text-base text-white">
                      &ldquo;{evidence.prospectLine}&rdquo;
                    </p>
                    <div className="mt-5 border-t border-white/[0.06] pt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                        Sherpa
                      </p>
                      <p className="mt-2 text-sm text-[#d1d5db]">
                        That&apos;s the moment.
                      </p>
                      <p className="mt-1 text-sm text-[#d1d5db]">
                        You treated that like progress.
                      </p>
                      <p className="mt-1 text-sm text-[#d1d5db]">
                        It wasn&apos;t.
                      </p>
                    </div>
                  </Card>

                  <Card className="border-white/[0.1]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                      Rep
                    </p>
                    <p className="mt-2 text-base text-white">
                      &ldquo;{evidence.repLine}&rdquo;
                    </p>
                    <div className="mt-5 border-t border-white/[0.06] pt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                        Sherpa
                      </p>
                      <p className="mt-2 text-sm text-[#d1d5db]">
                        That ends the deal.
                      </p>
                      <p className="mt-1 text-sm text-[#d1d5db]">
                        You exited the decision with them.
                      </p>
                    </div>
                  </Card>
                </div>
              ) : null}

              {bpPhase >= 3 ? (
                <div className="pt-2">
                  <Button onClick={() => setStep('money')}>
                    Show me what it cost
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 'money' ? (
            <Card>
              <div className="space-y-3 text-sm leading-relaxed text-[#d1d5db]">
                <p>This is a {formatCurrency(economics.dealValue)} deal.</p>
                <p>
                  You&apos;re working {economics.dealsPerMonth} deals a month.
                </p>
                <p>Moments like this are where that leaks.</p>
                <p className="pt-1 text-[#e5e7eb]">{moneyTierLine}</p>
              </div>
              <div className="mt-8">
                <Button onClick={() => setStep('correction')}>Fix the move</Button>
              </div>
            </Card>
          ) : null}

          {step === 'correction' ? (
            <Card>
              <p className="text-sm text-[#d1d5db]">
                When that line shows up, you narrow.
              </p>
              <p className="mt-4 text-sm text-[#9ca3af]">Say this:</p>
              <p className="mt-2 rounded-lg border border-[#f5b400]/30 bg-[#f5b400]/[0.06] p-4 text-base font-medium text-white">
                &ldquo;What typically needs to happen on your side for something
                like this to get approved?&rdquo;
              </p>
              <p className="mt-5 text-sm text-[#d1d5db]">
                That keeps the decision in the room.
              </p>
              <div className="mt-8">
                <Button onClick={() => setStep('textRoleplay')}>Continue</Button>
              </div>
            </Card>
          ) : null}

          {step === 'textRoleplay' ? (
            <Card>
              <h3 className="text-lg font-semibold text-white">
                Run the moment again
              </h3>
              <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#0b0d10] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                  AI Prospect
                </p>
                <p className="mt-2 text-sm text-white">
                  &ldquo;I just need to run this by my team.&rdquo;
                </p>
              </div>
              <div className="mt-5">
                {fieldLabel('Your line')}
                <textarea
                  value={roleplayInput}
                  onChange={(e) => setRoleplayInput(e.target.value)}
                  placeholder="Type your response…"
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={sendRoleplay}>Send</Button>
              </div>

              {roleplayResult === 'weak' ? (
                <div className="mt-6 border-t border-white/[0.08] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                    Sherpa
                  </p>
                  <p className="mt-2 text-sm text-[#d1d5db]">Stop.</p>
                  <p className="mt-2 text-sm text-[#d1d5db]">
                    You felt the tension and made it easier.
                  </p>
                  <p className="mt-2 text-sm text-[#d1d5db]">
                    That&apos;s where control slips.
                  </p>
                  <p className="mt-3 text-sm font-medium text-white">
                    Run it again. Keep it tight.
                  </p>
                </div>
              ) : null}

              {roleplayResult === 'strong' ? (
                <div className="mt-6 border-t border-white/[0.08] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                    Sherpa
                  </p>
                  <p className="mt-3 text-base font-semibold text-white">
                    There.
                  </p>
                  <p className="mt-1 text-sm text-[#d1d5db]">
                    Same call. Different outcome.
                  </p>
                  <div className="mt-6">
                    <Button onClick={continueAfterStrongRoleplay}>
                      Run it out loud
                    </Button>
                  </div>
                </div>
              ) : null}

              {roleplayResult === 'other' ? (
                <div className="mt-6 border-t border-white/[0.08] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                    Sherpa
                  </p>
                  <p className="mt-3 text-sm text-[#d1d5db]">Tighter.</p>
                  <p className="mt-2 text-sm text-[#d1d5db]">
                    Ask for the decision process.
                  </p>
                </div>
              ) : null}
            </Card>
          ) : null}

          {step === 'voiceTeaser' ? (
            <Card>
              <p className="text-sm text-[#d1d5db]">Typing this isn&apos;t enough.</p>
              <p className="mt-2 text-sm text-white">This is a live moment.</p>
              <p className="mt-4 text-sm font-medium text-[#f5b400]">
                Run it out loud.
              </p>

              {voicePhase === 'idle' ? (
                <div className="mt-8">
                  <Button onClick={() => setVoicePhase('active')}>
                    Activate mic
                  </Button>
                </div>
              ) : null}

              {voicePhase !== 'idle' ? (
                <div className="mt-8 rounded-xl border border-[#f5b400]/20 bg-black/40 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                    Voice panel (simulation)
                  </p>
                  <p className="mt-2 text-xs text-[#f5b400]">
                    Mic active — demo simulation
                  </p>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                    Prospect
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {voicePhase === 'redeemed'
                      ? '\u201cOkay, I can talk to them Thursday.\u201d'
                      : '\u201cI just need to run this by my team.\u201d'}
                  </p>
                  {voicePhase === 'active' ? (
                    <div className="mt-6">
                      <Button
                        variant="secondary"
                        onClick={() => setVoicePhase('interrupt')}
                      >
                        I said my response
                      </Button>
                    </div>
                  ) : null}
                  {voicePhase === 'interrupt' ? (
                    <div className="mt-6 space-y-4 border-t border-white/[0.08] pt-5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                          Sherpa
                        </p>
                        <p className="mt-2 text-sm text-[#d1d5db]">
                          Stop. You softened it. Say it tighter.
                        </p>
                      </div>
                      <Button onClick={() => setVoicePhase('redeemed')}>
                        Try again
                      </Button>
                    </div>
                  ) : null}
                  {voicePhase === 'redeemed' ? (
                    <div className="mt-6 space-y-4 border-t border-white/[0.08] pt-5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5b400]">
                          Sherpa
                        </p>
                        <p className="mt-2 text-sm text-white">There.</p>
                        <p className="mt-1 text-sm text-[#d1d5db]">
                          Now the deal stays alive.
                        </p>
                      </div>
                      <Button onClick={() => setStep('frameworks')}>
                        Show strategic options
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <p className="mt-6 text-xs leading-relaxed text-[#6b7280]">
                Voice simulation for this demo. No real microphone processing.
                Full voice roleplay unlocks after signup.
              </p>
            </Card>
          ) : null}

          {step === 'frameworks' ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-[#d1d5db]">
                  There are a few ways to play that moment.
                </p>
                <p className="mt-2 text-sm text-white">
                  We used the most direct one.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(
                  [
                    {
                      id: 'direct' as const,
                      title: 'Direct Containment',
                      quote:
                        '\u201cWhat typically needs to happen on your side for something like this to get approved?\u201d',
                      label: 'Fastest control. Keeps the decision in the room.',
                    },
                    {
                      id: 'value' as const,
                      title: 'Value Re-Anchor',
                      quote:
                        '\u201cBefore you take it to your team, what stood out most to you about what we walked through?\u201d',
                      label: 'Useful when they need to sell it internally.',
                    },
                    {
                      id: 'friction' as const,
                      title: 'Friction Exposure',
                      quote:
                        '\u201cWhen something like this gets delayed internally, what usually causes that?\u201d',
                      label: 'Surfaces hidden resistance.',
                    },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFramework(f.id)}
                    className={`rounded-2xl border p-5 text-left transition-colors ${
                      selectedFramework === f.id
                        ? 'border-[#f5b400]/55 bg-[#f5b400]/[0.07]'
                        : 'border-white/[0.08] bg-[#11141a] hover:border-white/[0.14]'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f5b400]">
                      {f.title}
                    </p>
                    <p className="mt-3 text-sm text-[#e5e7eb]">{f.quote}</p>
                    <p className="mt-3 text-xs text-[#9ca3af]">{f.label}</p>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-[#9ca3af]">
                Pick one.
                <span className="mt-1 block text-[11px] text-[#6b7280]">
                  Based on this buyer, not your preference.
                </span>
              </p>
              <div className="flex justify-center">
                <Button
                  disabled={!selectedFramework}
                  onClick={() => setStep('paywall')}
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : null}

          {step === 'paywall' ? (
            <Card
              id="checkout"
              className="border-[#f5b400]/20"
            >
              <p className="text-sm leading-relaxed text-[#d1d5db]">
                There&apos;s another place in this call where you gave up
                leverage before this even happened.
              </p>
              <p className="mt-4 text-sm font-medium text-white">
                That&apos;s the one that usually decides whether this closes.
              </p>
              <p className="mt-6 text-sm text-[#9ca3af]">Same call. Same buyer.</p>
              <p className="mt-2 text-sm text-[#d1d5db]">
                One version drifts.
              </p>
              <p className="mt-1 text-sm text-[#d1d5db]">
                One version stays alive.
              </p>
              <div className="mt-8">
                <Button
                  onClick={() =>
                    window.alert('Checkout connection goes here.')
                  }
                >
                  Run the full call — $297/month
                </Button>
              </div>
            </Card>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
