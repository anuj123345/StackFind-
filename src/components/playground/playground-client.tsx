"use client"

import { useState, useRef, useMemo, useCallback } from "react"
import { useStack, type StackTool } from "@/hooks/use-stack"
import { getLogoUrl } from "@/lib/logo"
import type { PlaygroundTool } from "@/lib/queries"
import Link from "next/link"
import {
  FlaskConical, Trash2, X, Sparkles, Loader2, Plus, Check,
  Search, Copy, RotateCcw, DollarSign, ChevronDown, ChevronUp as ChevronUpIcon,
} from "lucide-react"

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICING_LABEL: Record<string, string> = {
  free: "Free", freemium: "Freemium", paid: "Paid", open_source: "Open Source",
}
const PRICING_COLOR: Record<string, { bg: string; color: string }> = {
  free:        { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  freemium:    { bg: "rgba(99,102,241,0.1)",  color: "#6366f1" },
  paid:        { bg: "rgba(217,119,6,0.1)",   color: "#D97706" },
  open_source: { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
}

const CATEGORIES = [
  { slug: "all",             name: "All",             icon: "🔍" },
  { slug: "coding",          name: "Coding",          icon: "💻" },
  { slug: "backend-db",      name: "Backend & DB",    icon: "🗄️" },
  { slug: "deployment",      name: "Deployment",      icon: "🚀" },
  { slug: "auth",            name: "Auth",            icon: "🔐" },
  { slug: "payments",        name: "Payments",        icon: "💳" },
  { slug: "emails",          name: "Emails",          icon: "📧" },
  { slug: "analytics",       name: "Analytics",       icon: "📊" },
  { slug: "error-tracking",  name: "Error Tracking",  icon: "🐛" },
  { slug: "version-control", name: "Version Control", icon: "🔀" },
  { slug: "redis",           name: "Redis",           icon: "⚡" },
  { slug: "vector-db",       name: "Vector DB",       icon: "🧠" },
  { slug: "domain",          name: "Domain",          icon: "🌐" },
  { slug: "dns",             name: "DNS & CDN",       icon: "🔗" },
  { slug: "others",          name: "Others",          icon: "✨" },
]

const PRESET_STACKS: { name: string; emoji: string; description: string; slugs: string[] }[] = [
  {
    name: "MVP SaaS",
    emoji: "🚀",
    description: "Ship a SaaS product fast",
    // coding + version control + deployment + backend/auth + payments + email + error tracking
    slugs: ["cursor", "github", "vercel", "supabase", "clerk", "stripe", "resend", "sentry"],
  },
  {
    name: "AI App",
    emoji: "🤖",
    description: "Build an LLM-powered product",
    // coding + version control + deployment + backend + auth + vector DB + cache + email
    slugs: ["cursor", "github", "vercel", "supabase", "clerk", "pinecone", "upstash", "resend"],
  },
  {
    name: "Indian Startup",
    emoji: "🇮🇳",
    description: "Built for India, UPI + INR",
    // coding + version control + deployment + backend + auth + INR payments + email + analytics
    slugs: ["cursor", "github", "vercel", "supabase", "clerk", "razorpay", "resend", "posthog"],
  },
  {
    name: "Indie Hacker",
    emoji: "⚡",
    description: "Minimal cost, maximum output",
    // mostly free/open-source: coding + git + deployment + backend + auth + payments + email + analytics
    slugs: ["cursor", "github", "railway", "pocketbase", "better-auth", "lemon-squeezy", "resend", "posthog"],
  },
]

const EXAMPLE_PROMPTS = [
  "A SaaS tool that lets freelancers send invoices and auto-remind clients",
  "A B2B analytics dashboard that tracks user behaviour across multiple apps",
  "An AI chatbot for customer support that learns from your documentation",
  "A subscription product that delivers weekly curated content to paid members",
  "A marketplace where creators sell digital products with one-click checkout",
  "An internal tool for a startup to manage OKRs and weekly check-ins",
]

// ─── Markdown renderer ───────────────────────────────────────────────────────

function MarkdownOutput({ text }: { text: string }) {
  const html = useMemo(() => {
    let out = text
    // Tables — process before other rules
    out = out.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_, header, rows) => {
      const ths = header.split("|").filter((c: string) => c.trim()).map((c: string) =>
        `<th class="pg-th">${c.trim()}</th>`).join("")
      const trs = rows.trim().split("\n").map((row: string) => {
        const tds = row.split("|").filter((c: string) => c.trim()).map((c: string) =>
          `<td class="pg-td">${c.trim()}</td>`).join("")
        return `<tr>${tds}</tr>`
      }).join("")
      return `<table class="pg-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`
    })
    // Headings
    out = out.replace(/^## (.+)$/gm, '<h2 class="pg-h2">$1</h2>')
    out = out.replace(/^### (.+)$/gm, '<h3 class="pg-h3">$1</h3>')
    // Bold
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong class="pg-strong">$1</strong>')
    // Numbered lists
    out = out.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map(l =>
        `<li>${l.replace(/^\d+\. /, "")}</li>`).join("")
      return `<ol class="pg-ol">${items}</ol>`
    })
    // Bullet lists
    out = out.replace(/((?:^- .+\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map(l =>
        `<li>${l.replace(/^- /, "")}</li>`).join("")
      return `<ul class="pg-ul">${items}</ul>`
    })
    // Paragraphs
    out = out.replace(/\n\n+/g, "\n\n")
    out = out.split("\n\n").map(block => {
      if (block.startsWith("<")) return block
      if (!block.trim()) return ""
      return `<p class="pg-p">${block.trim()}</p>`
    }).join("\n")
    return out
  }, [text])

  return (
    <>
      <div className="pg-output" dangerouslySetInnerHTML={{ __html: html }} />
      <style jsx global>{`
        .pg-output { font-size: 0.875rem; line-height: 1.75; color: #7A6A57; }
        .pg-h2 {
          font-family: 'Bricolage Grotesque Variable', sans-serif;
          font-size: 1.0625rem; font-weight: 800; color: #1C1611;
          margin: 1.75rem 0 0.625rem; padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(140,110,80,0.1);
        }
        .pg-h2:first-child { margin-top: 0; }
        .pg-h3 {
          font-family: 'Bricolage Grotesque Variable', sans-serif;
          font-size: 0.9375rem; font-weight: 700; color: #1C1611;
          margin: 1.25rem 0 0.375rem;
        }
        .pg-p { margin: 0.5rem 0; }
        .pg-strong { color: #1C1611; font-weight: 700; }
        .pg-ul { margin: 0.5rem 0 0.5rem 1.25rem; }
        .pg-ol { margin: 0.5rem 0 0.5rem 1.25rem; counter-reset: item; }
        .pg-ul li { list-style-type: disc; margin: 0.2rem 0; }
        .pg-ol li { list-style-type: decimal; margin: 0.2rem 0; }
        .pg-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.8125rem; }
        .pg-th { text-align: left; padding: 8px 14px; font-weight: 700; color: #1C1611; background: rgba(140,110,80,0.05); border: 1px solid rgba(140,110,80,0.12); }
        .pg-td { padding: 8px 14px; color: #7A6A57; border: 1px solid rgba(140,110,80,0.09); }
        .pg-td strong, .pg-th strong { font-weight: 700; color: #1C1611; }
        tr:last-child .pg-td { font-weight: 700; color: #1C1611; background: rgba(140,110,80,0.03); }
      `}</style>
    </>
  )
}

// ─── Mini tool card for browser ──────────────────────────────────────────────

function BrowserCard({ tool, inStack, onToggle }: {
  tool: PlaygroundTool
  inStack: boolean
  onToggle: (tool: PlaygroundTool) => void
}) {
  const p = PRICING_COLOR[tool.pricing_model] ?? PRICING_COLOR.freemium
  const logoSrc = getLogoUrl(tool.website, tool.logo_url)

  return (
    <button
      onClick={() => onToggle(tool)}
      className="w-full text-left rounded-xl p-3 transition-all duration-150 group relative"
      style={{
        background: inStack ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.7)",
        border: `1px solid ${inStack ? "rgba(99,102,241,0.25)" : "rgba(140,110,80,0.1)"}`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5"
          style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.1)" }}
        >
          {logoSrc
            ? <img src={logoSrc} alt={tool.name} className="w-6 h-6 object-contain" />
            : <span className="text-xs font-black" style={{ color: "#7A6A57" }}>{tool.name[0]}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-bold truncate" style={{ color: "#1C1611" }}>{tool.name}</p>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: inStack ? "#6366f1" : "rgba(140,110,80,0.08)",
                border: inStack ? "none" : "1px solid rgba(140,110,80,0.15)",
              }}
            >
              {inStack
                ? <Check size={10} style={{ color: "#fff" }} />
                : <Plus size={10} style={{ color: "#C4B0A0" }} />
              }
            </div>
          </div>
          <p className="text-[10px] leading-snug mt-0.5 line-clamp-2" style={{ color: "#A0907E" }}>
            {tool.tagline}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>
              {PRICING_LABEL[tool.pricing_model]}
            </span>
            {tool.starting_price_usd && (
              <span className="text-[9px]" style={{ color: "#C4B0A0" }}>${tool.starting_price_usd}/mo</span>
            )}
            {tool.is_made_in_india && (
              <span className="text-[9px] font-bold" style={{ color: "#D97706" }}>🇮🇳</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  tools: PlaygroundTool[]
  isAuthenticated: boolean
}

export function PlaygroundClient({ tools, isAuthenticated }: Props) {
  const { stack, add, remove, toggle: toggleStack, clear, isInStack } = useStack()
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [idea, setIdea] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [browserOpen, setBrowserOpen] = useState(true)
  const outputRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const totalCost = stack.reduce((sum, t) => sum + (t.startingPriceUsd ?? 0), 0)

  // Filter tools for browser
  const filteredTools = useMemo(() => {
    let list = tools
    if (activeCategory !== "all") list = list.filter(t => t.categorySlug === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q))
    }
    return list
  }, [tools, activeCategory, search])

  const handleToggle = useCallback((tool: PlaygroundTool) => {
    const stackTool: StackTool = {
      slug: tool.slug,
      name: tool.name,
      tagline: tool.tagline,
      website: tool.website,
      logoUrl: tool.logo_url,
      pricingModel: tool.pricing_model,
      startingPriceUsd: tool.starting_price_usd,
      categories: [tool.categoryName],
    }
    toggleStack(stackTool)
  }, [toggleStack])

  function loadPreset(preset: typeof PRESET_STACKS[0]) {
    clear()
    for (const slug of preset.slugs) {
      const tool = tools.find(t => t.slug === slug)
      if (tool) {
        add({
          slug: tool.slug, name: tool.name, tagline: tool.tagline,
          website: tool.website, logoUrl: tool.logo_url,
          pricingModel: tool.pricing_model, startingPriceUsd: tool.starting_price_usd,
          categories: [tool.categoryName],
        })
      }
    }
  }

  function usePrompt(prompt: string) {
    setIdea(prompt)
    textareaRef.current?.focus()
  }

  async function generate() {
    if (!idea.trim() || stack.length === 0 || loading) return
    setOutput("")
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/playground/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: stack, productIdea: idea }),
      })

      let data: any
      try {
        data = await res.json()
      } catch {
        setError(`Server error ${res.status} — please try again`)
        return
      }

      if (!res.ok) {
        setError(data?.error ?? `Server error ${res.status}`)
        return
      }

      setOutput(data.plan ?? "")
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    } catch (err: any) {
      setError(err?.message ?? "Network error — check your connection and try again")
    } finally {
      setLoading(false)
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
          Stack Playground
        </span>
        <h1
          className="font-black leading-tight mt-1 mb-1.5"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            color: "#1C1611",
          }}
        >
          Build with your stack
        </h1>
        <p style={{ color: "#7A6A57", fontSize: "0.9375rem", lineHeight: "1.6" }}>
          Pick your tools, describe your idea — get a full build plan with cost estimate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: Tool browser ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Preset stacks */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#C4B0A0" }}>
              Starter stacks
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_STACKS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset)}
                  className="text-left rounded-xl p-3 transition-all duration-150 hover:scale-[1.02]"
                  style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.1)" }}
                >
                  <div className="text-xl mb-1">{preset.emoji}</div>
                  <p className="text-xs font-bold" style={{ color: "#1C1611" }}>{preset.name}</p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#C4B0A0" }}>{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tool browser */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            {/* Browser header */}
            <button
              onClick={() => setBrowserOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-black/[0.02]"
              style={{ borderBottom: browserOpen ? "1px solid rgba(140,110,80,0.08)" : "none" }}
            >
              <div className="flex items-center gap-2">
                <Search size={14} style={{ color: "#7A6A57" }} />
                <span className="text-sm font-bold" style={{ color: "#1C1611" }}>Browse & add tools</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(140,110,80,0.08)", color: "#7A6A57" }}>
                  {tools.length} tools
                </span>
              </div>
              {browserOpen
                ? <ChevronUpIcon size={15} style={{ color: "#C4B0A0" }} />
                : <ChevronDown size={15} style={{ color: "#C4B0A0" }} />
              }
            </button>

            {browserOpen && (
              <div className="p-4 space-y-3">
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.1)" }}
                >
                  <Search size={13} style={{ color: "#C4B0A0" }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tools…"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#1C1611" }}
                  />
                  {search && (
                    <button onClick={() => setSearch("")}>
                      <X size={12} style={{ color: "#C4B0A0" }} />
                    </button>
                  )}
                </div>

                {/* Category tabs */}
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategory(cat.slug)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-150 whitespace-nowrap"
                      style={{
                        background: activeCategory === cat.slug ? "rgba(99,102,241,0.1)" : "rgba(140,110,80,0.05)",
                        color: activeCategory === cat.slug ? "#6366f1" : "#7A6A57",
                        border: `1px solid ${activeCategory === cat.slug ? "rgba(99,102,241,0.2)" : "rgba(140,110,80,0.1)"}`,
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Tool grid */}
                {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredTools.map(tool => (
                      <BrowserCard
                        key={tool.slug}
                        tool={tool}
                        inStack={isInStack(tool.slug)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm" style={{ color: "#C4B0A0" }}>No tools found for "{search}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Idea input */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            <label className="block text-sm font-bold mb-3" style={{ color: "#1C1611" }}>
              What do you want to build?
            </label>

            <textarea
              ref={textareaRef}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g. A SaaS that lets freelancers track invoices and auto-remind clients when payments are overdue…"
              rows={3}
              className="w-full resize-none rounded-xl text-sm outline-none placeholder:text-[#C4B0A0]"
              style={{
                background: "rgba(140,110,80,0.03)",
                border: "1px solid rgba(140,110,80,0.12)",
                padding: "12px 14px",
                color: "#1C1611",
                lineHeight: "1.65",
                transition: "border-color 200ms",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.35)")}
              onBlur={e => (e.target.style.borderColor = "rgba(140,110,80,0.12)")}
            />

            {/* Example prompts */}
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#C4B0A0" }}>
                Try an example
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => usePrompt(prompt)}
                    className="text-xs px-2.5 py-1 rounded-full transition-all duration-150 text-left"
                    style={{ background: "rgba(140,110,80,0.05)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.1)" }}
                  >
                    {prompt.length > 50 ? prompt.slice(0, 50) + "…" : prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <p className="text-xs" style={{ color: "#C4B0A0" }}>
                {stack.length === 0
                  ? "Add tools to your stack first"
                  : `${stack.length} tool${stack.length !== 1 ? "s" : ""} · est. ${totalCost === 0 ? "Free" : `$${totalCost}/mo`} min`
                }
              </p>

              <div className="flex items-center gap-2">
                {output && !loading && (
                  <button
                    onClick={() => { setOutput(""); setIdea("") }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                    style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.1)" }}
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                )}

                {!isAuthenticated ? (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
                    style={{ background: "#6366f1", color: "#fff" }}
                  >
                    Sign in to generate →
                  </Link>
                ) : (
                  <button
                    onClick={generate}
                    disabled={loading || !idea.trim() || stack.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: "#1C1611", color: "#FAF7F2" }}
                  >
                    {loading
                      ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                      : <><Sparkles size={13} /> Generate plan</>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Stack panel ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl overflow-hidden lg:sticky lg:top-28"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}
            >
              <div className="flex items-center gap-2">
                <FlaskConical size={14} style={{ color: "#6366f1" }} />
                <span className="font-bold text-sm" style={{ color: "#1C1611" }}>Your Stack</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                >
                  {stack.length}
                </span>
              </div>
              {stack.length > 0 && (
                <button
                  onClick={clear}
                  className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-60"
                  style={{ color: "#C4B0A0" }}
                >
                  <Trash2 size={10} /> Clear
                </button>
              )}
            </div>

            {/* Empty state */}
            {stack.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium mb-1" style={{ color: "#C4B0A0" }}>No tools added yet</p>
                <p className="text-xs" style={{ color: "rgba(196,176,160,0.7)" }}>
                  Click a preset above or browse tools on the left
                </p>
              </div>
            )}

            {/* Tool list */}
            {stack.length > 0 && (
              <div className="divide-y max-h-[360px] overflow-y-auto" style={{ borderColor: "rgba(140,110,80,0.06)" }}>
                {stack.map(tool => {
                  const p = PRICING_COLOR[tool.pricingModel] ?? PRICING_COLOR.freemium
                  const logoSrc = getLogoUrl(tool.website, tool.logoUrl)
                  return (
                    <div key={tool.slug} className="flex items-center gap-3 px-5 py-3 group">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.1)" }}
                      >
                        {logoSrc
                          ? <img src={logoSrc} alt={tool.name} className="w-5 h-5 object-contain" />
                          : <span className="text-[10px] font-black" style={{ color: "#7A6A57" }}>{tool.name[0]}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#1C1611" }}>{tool.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>
                            {PRICING_LABEL[tool.pricingModel]}
                          </span>
                          {tool.startingPriceUsd && (
                            <span className="text-[9px]" style={{ color: "#C4B0A0" }}>${tool.startingPriceUsd}/mo</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(tool.slug)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
                        style={{ color: "#C4B0A0" }}
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Cost summary */}
            {stack.length > 0 && (
              <div
                className="px-5 py-4"
                style={{ borderTop: "1px solid rgba(140,110,80,0.08)", background: "rgba(140,110,80,0.02)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <DollarSign size={12} style={{ color: "#7A6A57" }} />
                    <span className="text-xs font-medium" style={{ color: "#7A6A57" }}>Min monthly cost</span>
                  </div>
                  <span className="text-sm font-black" style={{ color: "#1C1611" }}>
                    {totalCost === 0 ? "Free" : `$${totalCost}/mo`}
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: "#C4B0A0" }}>
                  Starting plan prices only. Actual cost depends on usage.
                </p>

                {/* Per-tool cost breakdown */}
                <div className="mt-3 space-y-1.5">
                  {stack.filter(t => t.startingPriceUsd).map(t => (
                    <div key={t.slug} className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "#A0907E" }}>{t.name}</span>
                      <span className="text-[10px] font-semibold" style={{ color: "#7A6A57" }}>${t.startingPriceUsd}/mo</span>
                    </div>
                  ))}
                  {stack.filter(t => !t.startingPriceUsd).length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "#C4B0A0" }}>
                        {stack.filter(t => !t.startingPriceUsd).map(t => t.name).join(", ")}
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: "#059669" }}>Free</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Output: full width below ──────────────────────────────────────── */}
      {(output || loading) && (
        <div
          ref={outputRef}
          className="mt-5 rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
        >
          {/* Output header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: "#6366f1" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#C4B0A0" }}>
                AI Build Plan
              </span>
              {loading && <Loader2 size={12} className="animate-spin" style={{ color: "#C4B0A0" }} />}
            </div>
            {!loading && output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyOutput}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
                  style={{
                    background: copied ? "rgba(16,185,129,0.1)" : "rgba(140,110,80,0.06)",
                    color: copied ? "#059669" : "#7A6A57",
                    border: "1px solid rgba(140,110,80,0.1)",
                  }}
                >
                  {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy plan</>}
                </button>
                <button
                  onClick={generate}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
                  style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                  <RotateCcw size={11} /> Regenerate
                </button>
              </div>
            )}
          </div>

          {/* Output content */}
          <div className="px-6 py-5">
            {loading && !output && (
              <div className="flex flex-col items-center gap-3 py-12 justify-center">
                <Loader2 size={22} className="animate-spin" style={{ color: "#6366f1" }} />
                <p className="text-sm font-medium" style={{ color: "#7A6A57" }}>Building your plan…</p>
                <p className="text-xs" style={{ color: "#C4B0A0" }}>Usually takes 5–10 seconds</p>
              </div>
            )}
            {output && <MarkdownOutput text={output} />}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && !loading && (
        <div
          className="mt-5 rounded-2xl px-6 py-5 flex items-start gap-3"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <span className="text-lg mt-0.5">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1" style={{ color: "#DC2626" }}>Generation failed</p>
            <p className="text-sm" style={{ color: "#7A2020" }}>{error}</p>
            {error.includes("ANTHROPIC_API_KEY") && (
              <p className="text-xs mt-2" style={{ color: "#9A3A3A" }}>
                Go to <strong>Vercel → Project → Settings → Environment Variables</strong> and add <code className="px-1 py-0.5 rounded text-xs" style={{ background: "rgba(239,68,68,0.1)" }}>ANTHROPIC_API_KEY</code> with your Anthropic API key. Then redeploy.
              </p>
            )}
          </div>
          <button onClick={() => setError("")} className="flex-shrink-0 hover:opacity-60">
            <X size={14} style={{ color: "#DC2626" }} />
          </button>
        </div>
      )}

      {/* Placeholder */}
      {!output && !loading && !error && stack.length > 0 && (
        <div
          className="mt-5 rounded-2xl py-12 text-center"
          style={{ background: "rgba(140,110,80,0.02)", border: "1px dashed rgba(140,110,80,0.15)" }}
        >
          <Sparkles size={20} className="mx-auto mb-2.5" style={{ color: "rgba(140,110,80,0.25)" }} />
          <p className="text-sm font-medium" style={{ color: "#C4B0A0" }}>Your build plan will appear here</p>
          <p className="text-xs mt-1" style={{ color: "rgba(196,176,160,0.7)" }}>
            Describe what you want to build above and click Generate
          </p>
        </div>
      )}
    </div>
  )
}
