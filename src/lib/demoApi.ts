import type { DemoAnalysis, DemoSubmission } from '../types/demo'

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res
}

export async function fetchDemoSession(sid: string): Promise<DemoSubmission> {
  const res = await apiFetch(`/api/demo/session?sid=${encodeURIComponent(sid)}`)
  return (await res.json()) as DemoSubmission
}

export async function analyzeDemoSession(sid: string): Promise<DemoAnalysis> {
  const res = await apiFetch('/api/demo/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sid }),
  })
  return (await res.json()) as DemoAnalysis
}

export type UltravoxDemoSession = {
  provider: 'ultravox'
  callId: string
  joinUrl: string
}

export async function startUltravoxDemoSession(
  sid: string,
): Promise<UltravoxDemoSession> {
  const res = await apiFetch('/api/demo/ultravox-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sid }),
  })
  return (await res.json()) as UltravoxDemoSession
}

