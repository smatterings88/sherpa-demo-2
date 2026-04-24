import { Redis } from '@upstash/redis'

function getEnv() {
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process
  return proc?.env ?? {}
}

export function getRedis() {
  const env = getEnv()
  const url = env.KV_REST_API_URL
  const token = env.KV_REST_API_TOKEN
  if (!url || !token) {
    throw new Error('KV is not configured (KV_REST_API_URL / KV_REST_API_TOKEN).')
  }
  return new Redis({ url, token })
}

export const SESSION_PREFIX = 'sherpa_demo:'

export function sessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`
}

