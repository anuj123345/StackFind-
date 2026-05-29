"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Send, Loader2, Bot, User, RotateCcw, Search } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant"
  content: string
}

// ─── Starters ──────────────────────────────────────────────────────────────

const STARTERS = [
  "I'm building a SaaS product with AI features",
  "Best stack for an Indian startup on a tight budget",
  "What tools should I use for a real-time chat app?",
  "I want to build an AI chatbot trained on my docs",
]

// ─── Simple markdown renderer ──────────────────────────────────────────────

function MessageText({ text, isDark }: { text: string; isDark?: boolean }) {
  const lines = text.split("\n")
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />

        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={j} className="font-bold">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              if (part.startsWith("`") && part.endsWith("`")) {
                return (
                  <code
                    key={j}
                    className="px-1.5 py-0.5 rounded text-[11px] font-mono"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(140,110,80,0.1)",
                    }}
                  >
                    {part.slice(1, -1)}
                  </code>
                )
              }
              return <span key={j}>{part}</span>
            })}
          </p>
        )
      })}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

interface ChatInterfaceProps {
  isAuthenticated: boolean
}

export function ChatInterface({ isAuthenticated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamText])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [input])

  async function send(text?: string) {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: "user", content }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput("")
    setLoading(true)
    setStreamText("")

    try {
      const res = await fetch("/api/playground/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
          },
        ])
        return
      }

      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamText(accumulated)
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: accumulated },
      ])
      setStreamText("")
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0 && !streamText

  return (
    <div
      className="flex flex-col rounded-3xl overflow-hidden"
      style={{
        height: "700px",
        background: "#fff",
        border: "1px solid rgba(140,110,80,0.1)",
        boxShadow: "0 20px 50px -12px rgba(140,110,80,0.12)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.08)" }}
          >
            <Sparkles size={14} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <p
              className="text-sm font-bold"
              style={{ color: "#1C1611" }}
            >
              StackFind AI
            </p>
            <p className="text-[10px]" style={{ color: "#C4B0A0" }}>
              LangGraph · Llama 3.3 70B · 2500+ tools
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([])
              setStreamText("")
            }}
            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
            style={{ color: "#A0907E" }}
          >
            <RotateCcw size={10} />
            New chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Empty state */}
        {isEmpty && (
          <div className="h-full flex flex-col items-center justify-center gap-6 text-center pb-4">
            <div>
              <p
                className="font-black text-xl mb-1.5"
                style={{
                  fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                  color: "#1C1611",
                  letterSpacing: "-0.02em",
                }}
              >
                What are you building?
              </p>
              <p className="text-sm" style={{ color: "#A0907E" }}>
                Describe your project — I&apos;ll search 2500+ tools and recommend the right stack.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs px-4 py-3 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: "rgba(140,110,80,0.03)",
                    borderColor: "rgba(140,110,80,0.1)",
                    color: "#7A6A57",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(99,102,241,0.08)" }}
                >
                  <Bot size={13} style={{ color: "#6366f1" }} />
                </div>
              )}

              <div
                className="max-w-[80%] px-4 py-3 rounded-2xl"
                style={{
                  background: msg.role === "user" ? "#1C1611" : "rgba(140,110,80,0.05)",
                  color: msg.role === "user" ? "#fff" : "#1C1611",
                  borderRadius:
                    msg.role === "user"
                      ? "1rem 1rem 0.25rem 1rem"
                      : "1rem 1rem 1rem 0.25rem",
                }}
              >
                <MessageText text={msg.content} isDark={msg.role === "user"} />
              </div>

              {msg.role === "user" && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(140,110,80,0.08)" }}
                >
                  <User size={13} style={{ color: "#7A6A57" }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming response */}
        {streamText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(99,102,241,0.08)" }}
            >
              <Bot size={13} style={{ color: "#6366f1" }} />
            </div>
            <div
              className="max-w-[80%] px-4 py-3"
              style={{
                background: "rgba(140,110,80,0.05)",
                color: "#1C1611",
                borderRadius: "1rem 1rem 1rem 0.25rem",
              }}
            >
              <MessageText text={streamText} />
              <span
                className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse"
                style={{ background: "#6366f1", verticalAlign: "middle" }}
              />
            </div>
          </motion.div>
        )}

        {/* Searching indicator */}
        {loading && !streamText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.08)" }}
            >
              <Bot size={13} style={{ color: "#6366f1" }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{
                background: "rgba(140,110,80,0.05)",
                borderRadius: "1rem 1rem 1rem 0.25rem",
              }}
            >
              <Search
                size={12}
                className="animate-pulse"
                style={{ color: "#6366f1" }}
              />
              <span className="text-xs" style={{ color: "#A0907E" }}>
                Searching tools...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div
          className="flex items-end gap-2 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(140,110,80,0.04)",
            border: "1px solid rgba(140,110,80,0.12)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your project or ask about specific tools..."
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ color: "#1C1611", minHeight: "24px", maxHeight: "120px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 hover:opacity-80"
            style={{
              background:
                input.trim() && !loading ? "#1C1611" : "rgba(140,110,80,0.1)",
            }}
          >
            {loading ? (
              <Loader2
                size={13}
                className="animate-spin"
                style={{ color: "#7A6A57" }}
              />
            ) : (
              <Send
                size={13}
                style={{ color: input.trim() ? "#fff" : "#A0907E" }}
              />
            )}
          </button>
        </div>
        <p
          className="text-[10px] text-center mt-2"
          style={{ color: "#C4B0A0" }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
