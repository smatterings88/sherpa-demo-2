import type { RoleplayEvaluation } from '../types/demo'

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

const STRONG_PHRASES = [
  'what typically needs to happen',
  'what needs to happen',
  'get approved',
  'approval',
  'who needs to be involved',
  'what happens on your side',
  'decision process',
] as const

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

export function evaluateRoleplayAttempt(text: string): RoleplayEvaluation {
  const t = text.toLowerCase().trim()
  if (!t) {
    return {
      status: 'retry',
      message: 'Tighter.\n\nAsk for the decision process.',
      issue: null,
    }
  }

  for (const phrase of WEAK_PHRASES) {
    if (t.includes(phrase)) {
      return {
        status: 'fail',
        message:
          "Stop.\n\nYou felt the tension and made it easier.\n\nThat’s where control slips.\n\nRun it again. Keep it tight.",
        issue: phrase,
      }
    }
  }
  for (const phrase of STRONG_PHRASES) {
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
    message: 'Tighter.\n\nAsk for the decision process.',
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
