export type DemoStep =
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

export type DemoContext = {
  selling: string
  buyer: string
  feltOff: string
}

export type DemoEconomics = {
  dealValue: number
  dealsPerMonth: number
  closeRate: number
}

export type RoleplayEvaluation = 'weak' | 'strong' | 'other'

export type FrameworkChoice = 'direct' | 'value' | 'friction'

export type VoiceTeaserPhase = 'idle' | 'active' | 'interrupt' | 'redeemed'
