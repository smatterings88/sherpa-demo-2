import type { DemoIssueType, RoleplayEvaluation } from '../types/demo'

const WEAK_PHRASES = [
  'makes sense',
  'no worries',
  'let me know',
  'keep me posted',
  'follow up',
  'send more info',
  'email you',
  'circle back',
  'sounds good',
] as const

const STRONG_BY_ISSUE: Record<DemoIssueType, readonly string[]> = {
  approval_deferral: [
    'what typically needs to happen',
    'what needs to happen',
    'approved',
    'approval',
    'who needs to be involved',
    'decision process',
  ],
  usage_metering_concern: [
    'when you ask about metering',
    'are you worried',
    'cost surprises',
    'usage limits',
    'what customers will see',
    'internal usage',
    'customer-facing',
    'what concern',
    'underneath the metering question',
  ],
  pricing_uncertainty: [
    'budget',
    'roi',
    'price',
    'pricing',
    'investment',
    'usage levels',
    'what changes',
  ],
  technical_scope_confusion: [
    'which part',
    'get clear on',
    'how it works',
    'customer sees',
    'internally',
    'build first',
  ],
  value_gap: ['worth', 'investment', 'clearer', 'value', 'outcome'],
  next_step_loss: ['next', 'keep moving', 'what would need to happen next'],
  overexplaining: [
    'before i explain',
    'what part',
    'trying to get clear',
    'what are you trying to understand',
  ],
  general_control_loss: [
    'main thing',
    'trying to resolve',
    'move forward',
    'before this can move',
  ],
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

type CloseTier = 'low' | 'mid' | 'high' | 'elite'

function closeRateTier(closeRate: number): CloseTier {
  if (closeRate <= 15) return 'low'
  if (closeRate <= 35) return 'mid'
  if (closeRate <= 60) return 'high'
  return 'elite'
}

/** One short line keyed by entered close rate (percent). */
export function getCloseRateTierLine(closeRate: number): string {
  const t = closeRateTier(closeRate)
  const lines: Record<CloseTier, string> = {
    low: 'Fixing even a small part of this changes your numbers fast.',
    mid: "You're close enough for this to matter. Two more recovered deals changes the month.",
    high: "You're not looking for more volume. You're trying to capture the deals already close enough to win.",
    elite: 'This is an edge leak. At your level, one saved deal pays for the system.',
  }
  return lines[t]
}

function weakFailMessage(issueType: DemoIssueType) {
  if (issueType === 'usage_metering_concern') {
    return "Stop.\n\nYou started explaining before you clarified the concern.\n\nThat’s where control slips.\n\nRun it again. Find out what they’re worried about."
  }
  if (issueType === 'approval_deferral') {
    return "Stop.\n\nYou felt the tension and made it easier.\n\nThat’s where control slips.\n\nRun it again. Keep it tight."
  }
  return "Stop.\n\nYou softened it.\n\nThat’s where control slips.\n\nRun it again. Keep it tight."
}

function retryHint(issueType: DemoIssueType) {
  if (issueType === 'usage_metering_concern') {
    return 'Tighter.\n\nClarify what they’re worried about before you explain.'
  }
  if (issueType === 'pricing_uncertainty') {
    return 'Tighter.\n\nClarify what pricing question they’re really asking.'
  }
  if (issueType === 'technical_scope_confusion') {
    return 'Tighter.\n\nIsolate what they need clarity on before you add detail.'
  }
  return 'Tighter.\n\nAsk what needs to happen for this to keep moving.'
}

export function evaluateRoleplayAttempt(
  text: string,
  issueType: DemoIssueType = 'approval_deferral',
): RoleplayEvaluation {
  const t = text.toLowerCase().trim()
  if (!t) {
    return {
      status: 'retry',
      message: retryHint(issueType),
      issue: null,
    }
  }

  for (const phrase of WEAK_PHRASES) {
    if (t.includes(phrase)) {
      return {
        status: 'fail',
        message: weakFailMessage(issueType),
        issue: phrase,
      }
    }
  }
  const strong = STRONG_BY_ISSUE[issueType] ?? STRONG_BY_ISSUE.approval_deferral
  for (const phrase of strong) {
    if (t.includes(phrase)) {
      return {
        status: 'pass',
        message: 'There.\n\nSame call. Different outcome.',
        issue: phrase,
      }
    }
  }
  return {
    status: 'retry',
    message: retryHint(issueType),
    issue: null,
  }
}

export type BreakpointEvidence = {
  prospectLine: string
  repLine: string
}

const DEFAULT_EVIDENCE: BreakpointEvidence = {
  prospectLine:
    'Yeah, this looks really solid. I just need to run it by my team.',
  repLine: 'Yeah of course, that makes sense. Let me know what they say.',
}

/** Pulls labeled lines from a pasted transcript, or falls back to the demo defaults. */
export function extractBreakpointEvidence(
  transcript: string,
  isSample: boolean,
): BreakpointEvidence {
  if (isSample) return DEFAULT_EVIDENCE

  const lines = transcript.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  let lastProspect = ''
  let lastRepAfterProspect = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prospectMatch = /^prospect:\s*(.+)$/i.exec(line)
    if (prospectMatch) {
      lastProspect = prospectMatch[1].replace(/^["']|["']$/g, '')
      lastRepAfterProspect = ''
      for (let j = i + 1; j < lines.length; j++) {
        const repMatch = /^rep:\s*(.+)$/i.exec(lines[j])
        if (repMatch) {
          lastRepAfterProspect = repMatch[1].replace(/^["']|["']$/g, '')
          break
        }
        const nextProspect = /^prospect:/i.test(lines[j])
        if (nextProspect) break
      }
    }
  }

  if (lastProspect && lastRepAfterProspect) {
    return { prospectLine: lastProspect, repLine: lastRepAfterProspect }
  }

  return DEFAULT_EVIDENCE
}

export function formatSherpaContextSummary(parts: {
  selling: string
  buyer: string
  feltOff: string
}): string {
  const bits = [parts.selling, parts.buyer, parts.feltOff].filter(
    (s) => s.trim().length > 0,
  )
  return bits.join('. ') + (bits.length ? '.' : '')
}
