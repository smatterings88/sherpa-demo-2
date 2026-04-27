const GHL_BASE_URL = 'https://rest.gohighlevel.com/v1'

export const GHL_DEMO_TAGS = {
  SUBMITTED_TRANSCRIPT: 'sherpa --> submitted transcript',
  DID_TEST_CALL: 'sherpa --> did test call',
} as const

export type GhlContact = {
  id: string
  email?: string
  tags?: string[]
  [key: string]: unknown
}

export class GhlDemoApiError extends Error {
  status?: number
  code?: string
  details?: unknown

  constructor(message: string, opts?: { status?: number; code?: string; details?: unknown }) {
    super(message)
    this.name = 'GhlDemoApiError'
    this.status = opts?.status
    this.code = opts?.code
    this.details = opts?.details
  }
}

function getEnv() {
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process
  return proc?.env ?? {}
}

function isDevLoggingEnabled() {
  const env = getEnv()
  return env.NODE_ENV === 'development' || env.VERCEL_ENV === 'development'
}

function devLog(payload: Record<string, unknown>) {
  if (!isDevLoggingEnabled()) return
  console.info(JSON.stringify({ tag: 'ghl_demo', ...payload }))
}

function sleep(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms))
}

function jitterMs(base: number) {
  return Math.floor(base * (0.85 + Math.random() * 0.3))
}

export async function retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
  const maxRetries = 3
  const baseDelayMs = 750
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      const status = err instanceof GhlDemoApiError ? err.status : undefined
      const retryable =
        status === 429 || status === 500 || status === 502 || status === 503 || status === 504
      if (!retryable || attempt === maxRetries) throw err
      const delay = jitterMs(baseDelayMs * 2 ** (attempt - 1))
      await sleep(delay)
    }
  }
  throw new GhlDemoApiError('GHL retry exhausted.')
}

export async function handleGhlResponse(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '')
  if (!text) {
    if (!response.ok) {
      throw new GhlDemoApiError(`GHL request failed: ${response.status} ${response.statusText}`, {
        status: response.status,
      })
    }
    return {}
  }

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    if (!response.ok) {
      throw new GhlDemoApiError(`GHL request failed: ${response.status} ${response.statusText}`, {
        status: response.status,
        details: text.slice(0, 500),
      })
    }
    return { raw: text }
  }

  if (!response.ok) {
    const anyJson = json as Record<string, unknown>
    const msg =
      (typeof anyJson.message === 'string' && anyJson.message) ||
      (typeof anyJson.error === 'string' && anyJson.error) ||
      `GHL request failed: ${response.status} ${response.statusText}`
    const code = typeof anyJson.code === 'string' ? anyJson.code : undefined
    throw new GhlDemoApiError(msg, { status: response.status, code, details: anyJson })
  }

  return json
}

function ghlHeaders() {
  const env = getEnv()
  const token = env.GHL_API_KEY
  if (!token) throw new Error('GHL_API_KEY is not set.')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
    'User-Agent': 'SherpaAlexDemo/1.0',
  } as const
}

async function ghlFetch(path: string, init: RequestInit, timeoutMs = 10_000): Promise<Response> {
  const controller = new AbortController()
  const t = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(`${GHL_BASE_URL}${path}`, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(t)
  }
}

export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  // pragmatic validation (demo)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Invalid email address.')
  }
  return trimmed
}

export function splitName(name?: string): { firstName: string; lastName: string; name: string } {
  const cleaned = (name ?? '').trim().replace(/\s+/g, ' ')
  if (!cleaned) return { firstName: '', lastName: '', name: '' }
  const parts = cleaned.split(' ')
  if (parts.length === 1) return { firstName: parts[0] ?? '', lastName: '', name: cleaned }
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    name: cleaned,
  }
}

export function assertGhlDemoConfigured() {
  const env = getEnv()
  if (!env.GHL_API_KEY) throw new Error('GHL_API_KEY is not configured.')
  if (!env.GHL_LOCATION_ID) throw new Error('GHL_LOCATION_ID is not configured.')
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((t): t is string => typeof t === 'string')
}

function extractContacts(data: unknown): GhlContact[] {
  if (!data) return []
  if (Array.isArray(data)) return data as GhlContact[]

  const obj = data as Record<string, unknown>
  if (Array.isArray(obj.contacts)) return obj.contacts as GhlContact[]
  if (obj.contact && typeof obj.contact === 'object') return [obj.contact as GhlContact]
  if (Array.isArray(obj.data)) return obj.data as GhlContact[]

  const nested = obj.data as Record<string, unknown> | undefined
  if (nested && Array.isArray(nested.contacts)) return nested.contacts as GhlContact[]
  if (nested && nested.contact && typeof nested.contact === 'object') return [nested.contact as GhlContact]

  return []
}

export async function searchGhlContactByEmail(email: string): Promise<{
  found: boolean
  contact: GhlContact | null
}> {
  const normalizedEmail = normalizeEmail(email)
  const json = await retryWithBackoff(async () => {
    const res = await ghlFetch(
      `/contacts/?query=${encodeURIComponent(normalizedEmail)}`,
      { method: 'GET', headers: ghlHeaders() },
    )
    return handleGhlResponse(res)
  })

  const contacts = extractContacts(json)
  const exact =
    contacts.find((c) => (c.email || '').toLowerCase() === normalizedEmail) ||
    contacts.find((c) => typeof c.email === 'string' && normalizeEmail(c.email) === normalizedEmail) ||
    null

  return { found: Boolean(exact), contact: exact }
}

export async function createGhlContact(input: { email: string; name?: string }): Promise<GhlContact> {
  assertGhlDemoConfigured()
  const env = getEnv()
  const email = normalizeEmail(input.email)
  const { firstName, lastName, name } = splitName(input.name)

  const body = {
    email,
    name,
    firstName,
    lastName,
    locationId: env.GHL_LOCATION_ID,
    source: 'Sherpa Alex Demo',
  }

  const json = await retryWithBackoff(async () => {
    const res = await ghlFetch(`/contacts/`, {
      method: 'POST',
      headers: ghlHeaders(),
      body: JSON.stringify(body),
    })
    return handleGhlResponse(res)
  })

  const obj = json as Record<string, unknown>
  const contact = (obj.contact as GhlContact | undefined) || (obj as unknown as GhlContact | undefined)
  if (!contact?.id) {
    throw new GhlDemoApiError('GHL create contact response missing contact id.', { details: obj })
  }
  return contact
}

async function getGhlContact(contactId: string): Promise<GhlContact> {
  const json = await retryWithBackoff(async () => {
    const res = await ghlFetch(`/contacts/${encodeURIComponent(contactId)}`, {
      method: 'GET',
      headers: ghlHeaders(),
    })
    return handleGhlResponse(res)
  })
  const obj = json as Record<string, unknown>
  const contact = (obj.contact as GhlContact | undefined) || (obj as unknown as GhlContact | undefined)
  if (!contact?.id) throw new GhlDemoApiError('GHL get contact response missing contact.', { details: obj })
  return contact
}

async function addTagsViaPost(contactId: string, tags: string[]) {
  const res = await ghlFetch(`/contacts/${encodeURIComponent(contactId)}/tags`, {
    method: 'POST',
    headers: ghlHeaders(),
    body: JSON.stringify({ tags }),
  })
  return handleGhlResponse(res)
}

export async function addTagToGhlContact(input: {
  contactId: string
  tag: string
  existingTags?: string[]
}): Promise<{ tagAction: 'added' | 'already_tagged'; tags: string[] }> {
  assertGhlDemoConfigured()

  const tag = input.tag.trim()
  if (!tag) throw new Error('Tag is required.')

  const starting = (input.existingTags ? [...input.existingTags] : []).map((t) => t.trim()).filter(Boolean)
  if (starting.includes(tag)) {
    return { tagAction: 'already_tagged', tags: Array.from(new Set(starting)) }
  }

  // Preferred: merge + PUT (per integration notes). This requires current tags to avoid wiping.
  let currentTags = starting
  if (!input.existingTags?.length) {
    try {
      const c = await getGhlContact(input.contactId)
      currentTags = asStringArray(c.tags)
    } catch {
      currentTags = []
    }
  }

  if (currentTags.includes(tag)) {
    return { tagAction: 'already_tagged', tags: Array.from(new Set(currentTags)) }
  }

  const mergedForPut = Array.from(new Set([...currentTags.map((t) => t.trim()).filter(Boolean), tag]))

  try {
    const res = await ghlFetch(`/contacts/${encodeURIComponent(input.contactId)}`, {
      method: 'PUT',
      headers: ghlHeaders(),
      body: JSON.stringify({ tags: mergedForPut }),
    })
    await handleGhlResponse(res)
    return { tagAction: 'added', tags: mergedForPut }
  } catch (err) {
    // Fallback: tag-specific endpoint (adds without requiring full merge correctness)
    try {
      await retryWithBackoff(async () => addTagsViaPost(input.contactId, [tag]))
      const refreshed = await getGhlContact(input.contactId)
      const tags = asStringArray(refreshed.tags)
      return { tagAction: tags.includes(tag) ? 'added' : 'already_tagged', tags }
    } catch (err2) {
      const msg = err2 instanceof Error ? err2.message : 'Failed to add tag.'
      throw new GhlDemoApiError(msg, { details: { putError: String(err), postError: String(err2) } })
    }
  }
}

export async function upsertGhlDemoContactAndTag(input: {
  email: string
  name?: string
  tag: string
}): Promise<{
  ok: true
  email: string
  contactId: string
  contactCreated: boolean
  tag: string
  tagAction: 'added' | 'already_tagged'
}> {
  const email = normalizeEmail(input.email)
  assertGhlDemoConfigured()

  let contactCreated = false
  const found = await searchGhlContactByEmail(email)
  let contact: GhlContact | null =
    found.found && found.contact?.id ? found.contact : null

  if (!contact) {
    try {
      contact = await createGhlContact({ email, name: input.name })
      contactCreated = true
    } catch (err) {
      // If create races / duplicate, recover by searching again.
      const msg = err instanceof Error ? err.message : ''
      const status = err instanceof GhlDemoApiError ? err.status : undefined
      const maybeDup =
        status === 409 ||
        status === 422 ||
        /duplicate|already exists|exist/i.test(msg)
      if (!maybeDup) throw err
      const again = await searchGhlContactByEmail(email)
      if (!again.found || !again.contact?.id) throw err
      contact = again.contact
      contactCreated = false
    }
  }

  if (!contact?.id) throw new GhlDemoApiError('Unable to resolve GHL contact id.')

  const tagResult = await addTagToGhlContact({
    contactId: contact.id,
    tag: input.tag,
    existingTags: asStringArray(contact.tags),
  })

  devLog({
    operation: 'upsertGhlDemoContactAndTag',
    email,
    contactId: contact.id,
    tag: input.tag,
    contactCreated,
    tagAction: tagResult.tagAction,
  })

  return {
    ok: true,
    email,
    contactId: contact.id,
    contactCreated,
    tag: input.tag,
    tagAction: tagResult.tagAction,
  }
}

export async function safeTrackGhlDemoTag(input: {
  email?: string | null
  name?: string | null
  tag: string
  context: string
}): Promise<
  | { ok: true; skipped: false; result: Awaited<ReturnType<typeof upsertGhlDemoContactAndTag>> }
  | { ok: false; skipped: true; reason: 'missing_email' | 'ghl_not_configured' }
  | { ok: false; skipped: false; reason: 'ghl_error'; message: string }
> {
  if (!input.email || !input.email.trim()) {
    return { ok: false, skipped: true, reason: 'missing_email' }
  }

  try {
    assertGhlDemoConfigured()
  } catch {
    return { ok: false, skipped: true, reason: 'ghl_not_configured' }
  }

  try {
    const result = await upsertGhlDemoContactAndTag({
      email: input.email,
      name: input.name ?? undefined,
      tag: input.tag,
    })
    return { ok: true, skipped: false, result }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'GHL tracking failed.'
    console.error(
      JSON.stringify({
        tag: 'ghl_demo_error',
        context: input.context,
        message,
      }),
    )
    return { ok: false, skipped: false, reason: 'ghl_error', message }
  }
}
