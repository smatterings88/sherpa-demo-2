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

export type DemoIssueType =
  | 'approval_deferral'
  | 'pricing_uncertainty'
  | 'usage_metering_concern'
  | 'technical_scope_confusion'
  | 'value_gap'
  | 'next_step_loss'
  | 'overexplaining'
  | 'general_control_loss'

export type DemoAnalysis = {
  contextLine: string
  breakpointProspectLine: string
  repResponseLine: string
  sherpaDiagnosis: string
  behaviorPattern: string
  moneyPain: string
  correctedMove: string
  issueType: DemoIssueType
  roleplayProspectLine: string
  roleplayTargetMove: string
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
