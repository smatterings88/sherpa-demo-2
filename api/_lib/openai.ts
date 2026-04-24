import OpenAI from 'openai'

function getEnv() {
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process
  return proc?.env ?? {}
}

export function getOpenAI() {
  const apiKey = getEnv().OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set.')
  }
  return new OpenAI({ apiKey })
}

