import { Redis } from '@upstash/redis'

export function getRedis() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    throw new Error('KV is not configured (KV_REST_API_URL / KV_REST_API_TOKEN).')
  }
  return new Redis({ url, token })
}

export const SESSION_PREFIX = 'sherpa_demo:'

export function sessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`
}

