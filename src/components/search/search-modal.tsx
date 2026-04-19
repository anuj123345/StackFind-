"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Search, X, ArrowRight, Zap } from "lucide-react"
import type { SearchResult } from "@/app/api/search/route"

const PRICING_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  free:        { label: "Free",        color: "#166534", bg: "rgba(22,101,52,0.08)" },
  freemium:    { label: "Freemium",    color: "#075985", bg: "rgba(7,89,133,0.08)" },
  paid:        { label: "Paid",        color: "#6B21A8", bg: "rgba(107,33,168,0.08)" },
  open_source: { label: "Open Source", color: "#92400E", bg: "rgba(146,64,14,0.08)" },
}

const QUICK_LINKS = [
  { label: "All AI Tools",       href: "/tools",                    icon: "🔭" },
  { label: "Made in India",      href: "/tools?india=1",            icon: "🇮🇳" },
  { label: "Free tools",         href: "/tools?pricing=free",       icon: "✨" },
  { label: "Image generation",   href: "/tools?category=image-generation", icon: "🎨" },
  { label: "Coding assistants",  href: "/tools?category=coding",    icon: "💻" },
  { label: "Writing tools",      href: "/tools?category=writing",   icon: "✍️" },
]

function ToolLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const [failed, setFailed] = useState(false)
  const initials = name.slice(0, 2).toUpperCase()

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setFailed(true)}
        className="w-9 h-9 rounded-xl object-contain"
        style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.08)" }}
      />
    )
  }

  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
      style={{ background: "rgba(79,70,229,0.08)", color: "#4338CA", border: "1px solid rgba(79,70,229,0.1)" }}
    >
      {initials}
    </div>
  )
}

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Open from navbar button or external trigger
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-search", handler)
    return () => window.removeEventListener("open-search", handler)
  }, [])

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setResults([])
      setActiveIdx(0)
    }
  }, [open])

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results ?? [])
      setActiveIdx(0)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, doSearch])

  // Keyboard navigation inside modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return }
    const total = query.length >= 2 ? results.length : QUICK_LINKS.length
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, total - 1))
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    }
    if (e.key === "Enter") {
      e.preventDefault()
      if (query.length >= 2 && results[activeIdx]) {
        const r = results[activeIdx]
        window.open(r.website ?? `/tools`, "_blank", "noopener")
        setOpen(false)
      } else if (!query && QUICK_LINKS[activeIdx]) {
        window.location.href = QUICK_LINKS[activeIdx].href
        setOpen(false)
      }
    }
  }, [query, results, activeIdx])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      style={{ background: "rgba(28,22,17,0.5)", backdropFilter: "blur(4px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[600px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FAF7F2", border: "1px solid rgba(140,110,80,0.15)" }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: "1px solid rgba(140,110,80,0.1)" }}
        >
          {loading
            ? <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0"
                style={{ borderColor: "#C4B0A0", borderTopColor: "#1C1611" }} />
            : <Search size={16} className="flex-shrink-0" style={{ color: "#C4B0A0" }} />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0) }}
            placeholder="Search AI tools…"
            className="flex-1 bg-transparent outline-none text-[0.9375rem]"
            style={{ color: "#1C1611" }}
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={14} style={{ color: "#C4B0A0" }} />
              </button>
            )}
            <kbd
              className="hidden sm:flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: "rgba(140,110,80,0.08)", color: "#C4B0A0", border: "1px solid rgba(140,110,80,0.12)" }}
            >
              ESC
            </kbd>
          </div>
        </div>

        {/* Results / Quick links */}
        <div className="overflow-y-auto" style={{ maxHeight: "min(60vh, 420px)" }}>
          {query.length >= 2 ? (
            results.length > 0 ? (
              <ul className="py-2">
                {results.map((r, i) => {
                  const pricing = PRICING_LABELS[r.pricing_model]
                  const isActive = i === activeIdx
                  return (
                    <li key={r.slug}>
                      <a
                        href={r.website ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{ background: isActive ? "rgba(79,70,229,0.05)" : "transparent" }}
                      >
                        <ToolLogo name={r.name} logoUrl={r.logo_url} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm" style={{ color: "#1C1611" }}>
                              {r.name}
                            </span>
                            {r.is_made_in_india && (
                              <span className="text-[10px]">🇮🇳</span>
                            )}
                            {r.categories.map(cat => (
                              <span
                                key={cat}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(140,110,80,0.07)", color: "#7A6A57" }}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs truncate mt-0.5" style={{ color: "#7A6A57" }}>
                            {r.tagline}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {pricing && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: pricing.bg, color: pricing.color }}
                            >
                              {pricing.label}
                            </span>
                          )}
                          <ArrowRight size={12} style={{ color: isActive ? "#6366f1" : "#C4B0A0" }} />
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : !loading ? (
              <div className="py-12 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="font-semibold text-sm mb-1" style={{ color: "#1C1611" }}>No tools found for "{query}"</p>
                <p className="text-xs" style={{ color: "#C4B0A0" }}>Try a different keyword or browse all tools</p>
                <a
                  href={`/tools?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold mt-4 px-4 py-2 rounded-xl transition-all"
                  style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}
                >
                  Browse all tools <ArrowRight size={11} />
                </a>
              </div>
            ) : null
          ) : (
            /* Quick links */
            <div className="py-2">
              <p
                className="text-[10px] font-semibold tracking-[0.12em] uppercase px-4 pt-2 pb-2"
                style={{ color: "#C4B0A0" }}
              >
                Quick links
              </p>
              <ul>
                {QUICK_LINKS.map((link, i) => {
                  const isActive = i === activeIdx
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                        style={{ background: isActive ? "rgba(79,70,229,0.05)" : "transparent" }}
                      >
                        <span className="text-base w-6 text-center flex-shrink-0">{link.icon}</span>
                        <span className="text-sm font-medium" style={{ color: "#1C1611" }}>{link.label}</span>
                        <ArrowRight size={12} className="ml-auto flex-shrink-0" style={{ color: isActive ? "#6366f1" : "#C4B0A0" }} />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: "1px solid rgba(140,110,80,0.08)", background: "rgba(140,110,80,0.02)" }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-indigo-500 flex items-center justify-center">
              <Zap size={8} className="text-white fill-white" />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: "#C4B0A0" }}>StackFind</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: "#C4B0A0" }}>
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
