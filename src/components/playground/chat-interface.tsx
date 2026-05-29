"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Send, Loader2, Bot, User, RotateCcw,
  Search, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, History, X,
} from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface StackRecord {
  id: string
  project_description: string
  tool_slugs: string[]
  is_saved: boolean
  created_at: string
}


const CHAT_MODELS = [
  { id: "meta/llama-3.3-70b-instruct",                  name: "Llama 3.3 70B"   },
  { id: "mistralai/mistral-large-3-675b-instruct-2512", name: "Mistral Large 3" },
  { id: "moonshotai/kimi-k2.6",                         name: "Kimi K2.6"       },
]

const STARTERS = [
  "I'm building a SaaS product with AI features",
  "Best stack for an Indian startup on a tight budget",
  "What tools should I use for a real-time chat app?",
  "I want to build an AI chatbot trained on my docs",
]

// ─── Simple markdown renderer ───────────────────────────────────────────────

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
              if (part.startsWith("**") && part.endsWith("**"))
                return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
              if (part.startsWith("`") && part.endsWith("`"))
                return (
                  <code key={j} className="px-1.5 py-0.5 rounded text-[11px] font-mono"
                    style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(140,110,80,0.1)" }}>
                    {part.slice(1, -1)}
                  </code>
                )
              return <span key={j}>{part}</span>
            })}
          </p>
        )
      })}
    </div>
  )
}

// ─── History panel ──────────────────────────────────────────────────────────

function HistoryPanel({ stacks, onSelect, onClose }: {
  stacks: StackRecord[]
  onSelect: (s: StackRecord) => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-10 flex flex-col rounded-3xl overflow-hidden"
      style={{ background: "#fff", border: "1px solid rgba(140,110,80,0.1)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}>
        <div className="flex items-center gap-2">
          <History size={13} style={{ color: "#6366f1" }} />
          <p className="text-sm font-bold" style={{ color: "#1C1611" }}>Stack History</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
            Episodic Memory
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-50">
          <X size={13} style={{ color: "#A0907E" }} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {stacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40 gap-2">
            <History size={24} />
            <p className="text-xs font-bold" style={{ color: "#1C1611" }}>No history yet</p>
            <p className="text-[10px]" style={{ color: "#7A6A57" }}>Your past stacks will appear here</p>
          </div>
        ) : (
          stacks.map((s) => (
            <button key={s.id} onClick={() => onSelect(s)}
              className="w-full text-left p-3.5 rounded-xl border transition-all hover:scale-[1.01]"
              style={{ background: "rgba(140,110,80,0.03)", borderColor: "rgba(140,110,80,0.1)" }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs font-bold line-clamp-2" style={{ color: "#1C1611" }}>
                  {s.project_description}
                </p>
                {s.is_saved && <BookmarkCheck size={12} style={{ color: "#6366f1", flexShrink: 0 }} />}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px]" style={{ color: "#C4B0A0" }}>
                  {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
                <span className="text-[10px]" style={{ color: "#C4B0A0" }}>·</span>
                <p className="text-[10px]" style={{ color: "#C4B0A0" }}>
                  {s.tool_slugs.length} tools
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export function ChatInterface({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState("")
  const [currentStackId, setCurrentStackId] = useState<string | null>(null)
  const [currentTools, setCurrentTools] = useState<string[]>([])
  const [modelId, setModelId] = useState(CHAT_MODELS[0].id)
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [history, setHistory] = useState<StackRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamText])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // Load history on mount
  useEffect(() => {
    if (!isAuthenticated) return
    fetch("/api/playground/stacks")
      .then((r) => r.json())
      .then((d) => setHistory(d.stacks || []))
      .catch(() => {})
  }, [isAuthenticated])

  // Extract tool slugs from AI response
  function extractToolSlugs(text: string): string[] {
    const match = text.match(/\[STACK:\s*([^\]]+)\]/i)
    if (match) {
      return match[1].split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    }
    // Fallback: look for backtick tool names (slugs)
    const slugMatches = text.match(/`([a-z0-9-]+)`/g) || []
    return slugMatches.map((s) => s.replace(/`/g, "")).slice(0, 6)
  }

  async function saveStack(description: string, toolSlugs: string[], reasoning: string, isSavedFlag = false) {
    try {
      const res = await fetch("/api/playground/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_description: description,
          tool_slugs: toolSlugs,
          ai_reasoning: reasoning.slice(0, 2000),
          source: "chat",
          is_saved: isSavedFlag,
        }),
      })
      const data = await res.json()
      if (data.stack?.id) {
        setCurrentStackId(data.stack.id)
        setHistory((prev) => [data.stack, ...prev])
        return data.stack.id
      }
    } catch {}
    return null
  }

  async function sendFeedback(signal: "positive" | "negative") {
    if (feedbackGiven) return
    setFeedbackGiven(signal)
    const userMsg = messages.find((m) => m.role === "user")
    await fetch("/api/playground/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stack_id: currentStackId,
        signal,
        project_description: userMsg?.content,
        recommended_tools: currentTools,
      }),
    }).catch(() => {})
  }

  async function toggleSave() {
    if (!currentStackId) return
    const next = !isSaved
    setIsSaved(next)
    await fetch("/api/playground/stacks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentStackId, is_saved: next }),
    }).catch(() => {})
    setHistory((prev) =>
      prev.map((s) => (s.id === currentStackId ? { ...s, is_saved: next } : s))
    )
  }

  async function send(text?: string) {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: "user", content }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput("")
    setLoading(true)
    setStreamText("")
    setFeedbackGiven(null)
    setIsSaved(false)
    setCurrentStackId(null)
    setCurrentTools([])

    try {
      const res = await fetch("/api/playground/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, modelId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Something went wrong. Please try again." },
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

      const finalMessage: Message = { role: "assistant", content: accumulated }
      setMessages((prev) => [...prev, finalMessage])
      setStreamText("")

      // Auto-save to episodic memory
      const slugs = extractToolSlugs(accumulated)
      setCurrentTools(slugs)
      if (slugs.length > 0) {
        await saveStack(content, slugs, accumulated)
      }
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

  function loadFromHistory(s: StackRecord) {
    setMessages([
      { role: "user", content: s.project_description },
      { role: "assistant", content: `Loaded from history. This stack included: ${s.tool_slugs.join(", ")}. Ask me anything to refine it.` },
    ])
    setCurrentStackId(s.id)
    setCurrentTools(s.tool_slugs)
    setIsSaved(s.is_saved)
    setShowHistory(false)
  }

  const isEmpty = messages.length === 0 && !streamText
  const lastAiMessage = [...messages].reverse().find((m) => m.role === "assistant")

  return (
    <div className="relative flex flex-col rounded-3xl overflow-hidden"
      style={{ height: "700px", background: "#fff", border: "1px solid rgba(140,110,80,0.1)", boxShadow: "0 20px 50px -12px rgba(140,110,80,0.12)" }}>

      {/* History panel overlay */}
      <AnimatePresence>
        {showHistory && (
          <HistoryPanel stacks={history} onSelect={loadFromHistory} onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.08)" }}>
            <Sparkles size={14} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#1C1611" }}>StackFind AI</p>
            <p className="text-[10px]" style={{ color: "#C4B0A0" }}>
              LangGraph · Llama 3.3 70B · 2500+ tools
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Model selector */}
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg outline-none transition-colors"
            style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.12)" }}
          >
            {CHAT_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        {/* History button */}
          <button onClick={() => setShowHistory(true)}
            className="relative flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
            style={{ color: "#A0907E" }}>
            <History size={11} />
            History
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: "#6366f1", color: "#fff" }}>
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </button>
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); setStreamText(""); setCurrentStackId(null); setFeedbackGiven(null); setIsSaved(false) }}
              className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-50"
              style={{ color: "#A0907E" }}>
              <RotateCcw size={10} /> New
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {isEmpty && (
          <div className="h-full flex flex-col items-center justify-center gap-6 text-center pb-4">
            <div>
              <p className="font-black text-xl mb-1.5"
                style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611", letterSpacing: "-0.02em" }}>
                What are you building?
              </p>
              <p className="text-sm" style={{ color: "#A0907E" }}>
                Describe your project — I&apos;ll search 2500+ tools and recommend the right stack.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-xs px-4 py-3 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: "rgba(140,110,80,0.03)", borderColor: "rgba(140,110,80,0.1)", color: "#7A6A57" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(99,102,241,0.08)" }}>
                  <Bot size={13} style={{ color: "#6366f1" }} />
                </div>
              )}
              <div className="max-w-[80%] px-4 py-3"
                style={{
                  background: msg.role === "user" ? "#1C1611" : "rgba(140,110,80,0.05)",
                  color: msg.role === "user" ? "#fff" : "#1C1611",
                  borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                }}>
                <MessageText text={msg.content} isDark={msg.role === "user"} />
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(140,110,80,0.08)" }}>
                  <User size={13} style={{ color: "#7A6A57" }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming */}
        {streamText && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(99,102,241,0.08)" }}>
              <Bot size={13} style={{ color: "#6366f1" }} />
            </div>
            <div className="max-w-[80%] px-4 py-3"
              style={{ background: "rgba(140,110,80,0.05)", color: "#1C1611", borderRadius: "1rem 1rem 1rem 0.25rem" }}>
              <MessageText text={streamText} />
              <span className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse"
                style={{ background: "#6366f1", verticalAlign: "middle" }} />
            </div>
          </motion.div>
        )}

        {/* Searching */}
        {loading && !streamText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.08)" }}>
              <Bot size={13} style={{ color: "#6366f1" }} />
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{ background: "rgba(140,110,80,0.05)", borderRadius: "1rem 1rem 1rem 0.25rem" }}>
              <Search size={12} className="animate-pulse" style={{ color: "#6366f1" }} />
              <span className="text-xs" style={{ color: "#A0907E" }}>Searching tools...</span>
            </div>
          </motion.div>
        )}

        {/* Feedback + Save row — shows after AI responds */}
        {lastAiMessage && !loading && !streamText && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 pl-10">
            <span className="text-[10px] font-medium" style={{ color: "#C4B0A0" }}>
              Was this helpful?
            </span>
            <button onClick={() => sendFeedback("positive")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
              style={{
                background: feedbackGiven === "positive" ? "rgba(16,185,129,0.1)" : "transparent",
                color: feedbackGiven === "positive" ? "#059669" : "#A0907E",
                border: "1px solid",
                borderColor: feedbackGiven === "positive" ? "rgba(16,185,129,0.2)" : "rgba(140,110,80,0.12)",
              }}>
              <ThumbsUp size={10} /> Yes
            </button>
            <button onClick={() => sendFeedback("negative")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
              style={{
                background: feedbackGiven === "negative" ? "rgba(239,68,68,0.08)" : "transparent",
                color: feedbackGiven === "negative" ? "#ef4444" : "#A0907E",
                border: "1px solid",
                borderColor: feedbackGiven === "negative" ? "rgba(239,68,68,0.15)" : "rgba(140,110,80,0.12)",
              }}>
              <ThumbsDown size={10} /> No
            </button>
            {currentStackId && (
              <button onClick={toggleSave}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ml-auto"
                style={{
                  background: isSaved ? "rgba(99,102,241,0.08)" : "transparent",
                  color: isSaved ? "#6366f1" : "#A0907E",
                  border: "1px solid",
                  borderColor: isSaved ? "rgba(99,102,241,0.2)" : "rgba(140,110,80,0.12)",
                }}>
                {isSaved ? <><BookmarkCheck size={10} /> Saved</> : <><Bookmark size={10} /> Save stack</>}
              </button>
            )}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-end gap-2 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.12)" }}>
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your project or ask about specific tools..."
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ color: "#1C1611", minHeight: "24px", maxHeight: "120px" }} />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 hover:opacity-80"
            style={{ background: input.trim() && !loading ? "#1C1611" : "rgba(140,110,80,0.1)" }}>
            {loading
              ? <Loader2 size={13} className="animate-spin" style={{ color: "#7A6A57" }} />
              : <Send size={13} style={{ color: input.trim() ? "#fff" : "#A0907E" }} />}
          </button>
        </div>
        <p className="text-[10px] text-center mt-2" style={{ color: "#C4B0A0" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
