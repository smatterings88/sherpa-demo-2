// New demo-review engine types (GHL funnel redirects here)
export type DemoSubmission = {
  sessionId: string
  createdAt: string
  source: 'ghl_funnel' | 'direct' | 'vercel_landing'
  name: string
  email: string
  transcript: string
  offer: string
  buyer: string
  feltOff: string
  dealValue: number
  dealsPerMonth: number
  closeRate: number
}

export type DemoAnalysis = {
  contextLine: string
  breakpointProspectLine: string
  repResponseLine: string
  sherpaDiagnosis: string
  behaviorPattern: string
  moneyPain: string
  correctedMove: string
}

export type RoleplayEvaluation = {
  status: 'fail' | 'retry' | 'pass'
  message: string
  issue?: string | null
}

// Legacy types kept for the existing DemoFunnel component (not used by GHL flow).
export type LegacyDemoStep =
  | 'transcript'
  | 'context'
  | 'economics'
  | 'analyzing'
  | 'breakpoint'
  | 'money'
  | 'correction'
  | 'textRoleplay'
  | 'voiceTeaser'
  | 'frameworks'
  | 'paywall'

export type FrameworkChoice = 'direct' | 'value' | 'friction'

export type VoiceTeaserPhase = 'idle' | 'active' | 'interrupt' | 'redeemed'
