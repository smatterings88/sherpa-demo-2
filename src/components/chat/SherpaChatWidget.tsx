import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '../Button'

type ChatRole = 'user' | 'assistant'
type ChatMessage = { role: ChatRole; content: string }

const INITIAL_MESSAGE = "What’s going on with your deals right now?"

function clampMessages(messages: ChatMessage[]) {
  return messages.slice(-20).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 8000),
  }))
}

function splitParagraphs(text: string) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean)
}

export function SherpaChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const safeMessages = useMemo(() => clampMessages(messages), [messages])

  useEffect(() => {
    if (!isOpen) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [isOpen, messages, isStreaming])

  useEffect(() => {
    if (!isOpen) return
    if (hasStarted) return
    const t = window.setTimeout(() => {
      setHasStarted(true)
      setMessages([{ role: 'assistant', content: INITIAL_MESSAGE }])
    }, 0)
    return () => window.clearTimeout(t)
  }, [isOpen, hasStarted])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const close = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
    setError(null)
    setIsOpen(false)
  }

  const open = () => {
    setIsOpen(true)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || isStreaming) return
    setError(null)
    setInput('')

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    // placeholder assistant message for streaming
    next.push({ role: 'assistant', content: '' })
    setMessages(next)

    setIsStreaming(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/sherpa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: clampMessages(next.slice(0, -1)), // don't send empty assistant placeholder
          context: { page: window.location.pathname, source: 'sherpa_widget' },
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => '')
        throw new Error(msg || 'Something broke in the chat. Try that again.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue
        setMessages((prev) => {
          if (!prev.length) return prev
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role !== 'assistant') return prev
          updated[updated.length - 1] = { role: 'assistant', content: last.content + chunk }
          return updated
        })
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // ignore
      } else {
        const msg = err instanceof Error ? err.message : 'Something broke in the chat. Try that again.'
        setError(msg)
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const launcherBottom = 'bottom-[calc(env(safe-area-inset-bottom)+18px)]'
  const launcherRight = 'right-[calc(env(safe-area-inset-right)+18px)]'

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        aria-label={isOpen ? 'Close Sherpa chat' : 'Open Sherpa chat'}
        onClick={isOpen ? close : open}
        className={`fixed ${launcherBottom} ${launcherRight} z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.14] bg-[#11141a] text-[#f5b400] shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_22px_56px_-28px_rgba(0,0,0,0.78)] transition-colors hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b400]`}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Panel */}
      {isOpen ? (
        <div
          className={`fixed ${launcherRight} z-50 w-[min(440px,calc(100vw-36px-env(safe-area-inset-right)))] max-w-[440px] ${launcherBottom} translate-y-[-68px] sm:translate-y-[-72px]`}
        >
          <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0f1217] shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_28px_80px_-32px_rgba(0,0,0,0.85)]">
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">
                  Alex the Sherpa
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  Find where the deal broke.
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-[11px] text-[#9ca3af]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                  Ready
                </p>
              </div>
              <button
                type="button"
                aria-label="Close Sherpa chat"
                onClick={close}
                className="rounded-lg border border-white/[0.12] bg-white/[0.04] p-2 text-white/90 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b400]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4 sm:max-h-[72vh]"
            >
              {safeMessages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-2xl border border-[#f5b400]/20 bg-[#f5b400]/[0.06] px-4 py-3 text-sm text-white'
                        : 'max-w-[85%] rounded-2xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-[#e5e7eb]'
                    }
                  >
                    {splitParagraphs(m.content).map((p) => (
                      <p key={p} className="leading-relaxed">
                        {p}
                      </p>
                    ))}
                    {isStreaming && idx === safeMessages.length - 1 && m.role === 'assistant' ? (
                      <span className="mt-2 inline-block h-4 w-4 animate-pulse rounded-full bg-white/20" />
                    ) : null}
                  </div>
                </div>
              ))}

              {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-white">
                  <p>{error}</p>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setError(null)
                        inputRef.current?.focus()
                      }}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/[0.08] px-5 py-4">
              <div className="flex items-end gap-3">
                <label className="sr-only" htmlFor="sherpa-chat-input">
                  Message Alex the Sherpa
                </label>
                <textarea
                  id="sherpa-chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={2}
                  placeholder="Type what happened…"
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/[0.12] bg-[#080b10] px-4 py-3 text-sm text-white placeholder:text-[#6b7280] focus:border-[#f5b400]/55 focus:outline-none focus:ring-2 focus:ring-[#f5b400]/20"
                />
                <button
                  type="button"
                  aria-label="Send message"
                  onClick={() => void send()}
                  disabled={!input.trim() || isStreaming}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5b400] text-black shadow-[0_0_0_1px_rgba(245,180,0,0.4),0_10px_36px_-8px_rgba(245,180,0,0.35)] transition-colors hover:bg-[#ffc933] disabled:pointer-events-none disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-[11px] text-[#9ca3af]">
                Keep it tight. One deal. One moment.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

