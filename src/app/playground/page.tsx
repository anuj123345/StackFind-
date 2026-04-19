"use client"

import { useState, useRef, useEffect } from "react"
import { Footer } from "@/components/footer"
import { useStack } from "@/hooks/use-stack"
import { getLogoUrl } from "@/lib/logo"
import {
  FlaskConical, Trash2, X, Sparkles, ArrowUpRight,
  DollarSign, Loader2, ChevronRight, Plus
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// ─── Minimal markdown renderer ────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul class="md-ul">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li class="md-oli">$1</li>')
    .replace(/(<li class="md-oli">.*<\/li>\n?)+/g, (m) => `<ol class="md-ol">${m}</ol>`)
    .replace(/\|(.+)\|/g, (m) => {
      const cells = m.split("|").filter(Boolean).map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) return ""
      const isHeader = m.includes("Tool") || m.includes("Plan")
      const tag = isHeader ? "th" : "td"
      return `<tr>${cells.map(c => `<${tag} class="md-${tag}">${c}</${tag}>`).join("")}</tr>`
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (m) => `<table class="md-table"><tbody>${m}</tbody></table>`)
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/^(?!<)(.+)$/gm, (m) => m.trim() ? m : "")
}

const PRICING_LABEL: Record<string, string> = {
  free: "Free", freemium: "Freemium", paid: "Paid", open_source: "Open Source"
}
const PRICING_COLOR: Record<string, { bg: string; color: string }> = {
  free:        { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  freemium:    { bg: "rgba(99,102,241,0.1)",  color: "#6366f1" },
  paid:        { bg: "rgba(217,119,6,0.1)",   color: "#D97706" },
  open_source: { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
}

export default function PlaygroundPage() {
  const { stack, remove, clear } = useStack()
  const [idea, setIdea] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsAuthenticated(!!data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthenticated(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const totalCost = stack.reduce((sum, t) => sum + (t.startingPriceUsd ?? 0), 0)

  async function generate() {
    if (!idea.trim() || stack.length === 0 || loading) return
    setOutput("")
    setLoading(true)
    try {
      const res = await fetch("/api/playground/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: stack, productIdea: idea }),
      })
      if (!res.ok) {
        const err = await res.json()
        setOutput(`**Error:** ${err.error}`)
        return
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setOutput(full)
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <main className="pt-28 pb-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
                Stack Playground
              </span>
            </div>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1
                  className="font-black leading-tight"
                  style={{
                    fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                    color: "#1C1611",
                  }}
                >
                  Build with your stack
                </h1>
                <p className="mt-1 max-w-lg" style={{ color: "#7A6A57", fontSize: "1rem", lineHeight: "1.6" }}>
                  Pick tools from the directory, describe your idea, and get a complete build plan with cost estimate.
                </p>
              </div>
              {stack.length === 0 && (
                <Link
                  href="/tools"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-80 flex-shrink-0"
                  style={{ background: "#1C1611", color: "#FAF7F2" }}
                >
                  <Plus size={14} />
                  Browse tools
                  <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>

          {stack.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-2xl py-20 text-center"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(140,110,80,0.1)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(99,102,241,0.08)" }}
              >
                <FlaskConical size={24} style={{ color: "#6366f1" }} />
              </div>
              <p
                className="font-black mb-2"
                style={{
                  fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                  fontSize: "1.375rem",
                  color: "#1C1611",
                }}
              >
                Your playground is empty
              </p>
              <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: "#7A6A57", lineHeight: "1.6" }}>
                Browse the directory and click the <strong>+</strong> button on any tool card to add it to your stack.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/tools"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-80"
                  style={{ background: "#1C1611", color: "#FAF7F2" }}
                >
                  Browse all tools <ArrowUpRight size={14} />
                </Link>
                <Link
                  href="/category/backend-db"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.12)" }}
                >
                  🗄️ Backend & DB
                </Link>
                <Link
                  href="/category/deployment"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.12)" }}
                >
                  🚀 Deployment
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: stack panel */}
              <div className="lg:col-span-1">
                <div
                  className="rounded-2xl overflow-hidden sticky top-28"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
                >
                  {/* Panel header */}
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}
                  >
                    <div className="flex items-center gap-2">
                      <FlaskConical size={15} style={{ color: "#6366f1" }} />
                      <span className="font-bold text-sm" style={{ color: "#1C1611" }}>
                        Your Stack
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                      >
                        {stack.length}
                      </span>
                    </div>
                    <button
                      onClick={clear}
                      className="text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-70"
                      style={{ color: "#C4B0A0" }}
                      title="Clear stack"
                    >
                      <Trash2 size={11} />
                      Clear
                    </button>
                  </div>

                  {/* Tool list */}
                  <div className="divide-y" style={{ borderColor: "rgba(140,110,80,0.06)" }}>
                    {stack.map(tool => {
                      const p = PRICING_COLOR[tool.pricingModel] ?? PRICING_COLOR.freemium
                      const logoSrc = getLogoUrl(tool.website, tool.logoUrl)
                      return (
                        <div key={tool.slug} className="flex items-center gap-3 px-5 py-3 group">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.1)" }}
                          >
                            {logoSrc
                              ? <img src={logoSrc} alt={tool.name} className="w-6 h-6 object-contain rounded" />
                              : <span className="text-xs font-black" style={{ color: "#7A6A57" }}>{tool.name[0]}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "#1C1611" }}>{tool.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>
                                {PRICING_LABEL[tool.pricingModel]}
                              </span>
                              {tool.startingPriceUsd && (
                                <span className="text-[10px]" style={{ color: "#C4B0A0" }}>
                                  ${tool.startingPriceUsd}/mo
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => remove(tool.slug)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50"
                            title="Remove"
                          >
                            <X size={13} style={{ color: "#C4B0A0" }} />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Cost summary */}
                  <div
                    className="px-5 py-4"
                    style={{ borderTop: "1px solid rgba(140,110,80,0.08)", background: "rgba(140,110,80,0.02)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={13} style={{ color: "#7A6A57" }} />
                        <span className="text-xs font-medium" style={{ color: "#7A6A57" }}>Min monthly cost</span>
                      </div>
                      <span className="text-sm font-black" style={{ color: "#1C1611" }}>
                        {totalCost === 0 ? "Free" : `$${totalCost}/mo`}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "#C4B0A0" }}>
                      Based on starting plan prices. Free tools not counted.
                    </p>
                  </div>

                  {/* Add more */}
                  <div className="px-5 pb-4">
                    <Link
                      href="/tools"
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.1)" }}
                    >
                      <Plus size={12} /> Add more tools
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right: input + output */}
              <div className="lg:col-span-2 space-y-5">

                {/* Input card */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
                >
                  <label
                    className="block text-sm font-bold mb-3"
                    style={{ color: "#1C1611" }}
                  >
                    What do you want to build?
                  </label>
                  <textarea
                    value={idea}
                    onChange={e => setIdea(e.target.value)}
                    placeholder="e.g. A SaaS tool that helps freelancers track their invoices and automatically reminds clients when payments are overdue..."
                    rows={4}
                    className="w-full resize-none rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-[#C4B0A0]"
                    style={{
                      background: "rgba(140,110,80,0.03)",
                      border: "1px solid rgba(140,110,80,0.12)",
                      padding: "14px 16px",
                      color: "#1C1611",
                      lineHeight: "1.6",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(140,110,80,0.12)")}
                  />

                  <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                    <p className="text-xs" style={{ color: "#C4B0A0" }}>
                      Using {stack.length} tool{stack.length !== 1 ? "s" : ""} · est. ${totalCost}/mo minimum
                    </p>

                    {isAuthenticated === false ? (
                      <Link
                        href="/login"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
                        style={{ background: "#6366f1", color: "#fff" }}
                      >
                        Sign in to generate →
                      </Link>
                    ) : (
                      <button
                        onClick={generate}
                        disabled={loading || !idea.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ background: "#1C1611", color: "#FAF7F2" }}
                      >
                        {loading ? (
                          <><Loader2 size={14} className="animate-spin" /> Generating plan…</>
                        ) : (
                          <><Sparkles size={14} /> Generate build plan</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Output */}
                {output && (
                  <div
                    ref={outputRef}
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
                  >
                    <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}>
                      <Sparkles size={14} style={{ color: "#6366f1" }} />
                      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#C4B0A0" }}>
                        AI Build Plan
                      </span>
                      {loading && <Loader2 size={12} className="animate-spin ml-auto" style={{ color: "#C4B0A0" }} />}
                    </div>
                    <div
                      className="playground-output prose-sm"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                    />
                  </div>
                )}

                {/* Placeholder while empty */}
                {!output && !loading && (
                  <div
                    className="rounded-2xl py-16 text-center"
                    style={{ background: "rgba(140,110,80,0.02)", border: "1px dashed rgba(140,110,80,0.15)" }}
                  >
                    <Sparkles size={22} className="mx-auto mb-3" style={{ color: "rgba(140,110,80,0.3)" }} />
                    <p className="text-sm font-medium" style={{ color: "#C4B0A0" }}>
                      Your build plan will appear here
                    </p>
                    <p className="text-xs mt-1" style={{ color: "rgba(196,176,160,0.7)" }}>
                      Describe your product above and hit Generate
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .playground-output .md-h2 {
          font-family: 'Bricolage Grotesque Variable', sans-serif;
          font-size: 1.125rem;
          font-weight: 800;
          color: #1C1611;
          margin: 1.5rem 0 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(140,110,80,0.1);
        }
        .playground-output .md-h2:first-child { margin-top: 0; }
        .playground-output .md-h3 {
          font-family: 'Bricolage Grotesque Variable', sans-serif;
          font-size: 0.9375rem;
          font-weight: 700;
          color: #1C1611;
          margin: 1.25rem 0 0.5rem;
        }
        .playground-output .md-p { margin: 0.625rem 0; color: #7A6A57; font-size: 0.875rem; line-height: 1.7; }
        .playground-output p { margin: 0.625rem 0; color: #7A6A57; font-size: 0.875rem; line-height: 1.7; }
        .playground-output strong { color: #1C1611; font-weight: 700; }
        .playground-output .md-ul, .playground-output .md-ol {
          margin: 0.5rem 0 0.5rem 1.25rem;
          color: #7A6A57;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        .playground-output .md-ul li, .playground-output li {
          margin: 0.25rem 0;
          list-style-type: disc;
        }
        .playground-output .md-ol li, .playground-output .md-oli {
          margin: 0.25rem 0;
          list-style-type: decimal;
        }
        .playground-output .md-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.8125rem;
        }
        .playground-output .md-th {
          text-align: left;
          padding: 8px 12px;
          font-weight: 700;
          color: #1C1611;
          background: rgba(140,110,80,0.05);
          border: 1px solid rgba(140,110,80,0.12);
        }
        .playground-output .md-td {
          padding: 8px 12px;
          color: #7A6A57;
          border: 1px solid rgba(140,110,80,0.1);
        }
      `}</style>

      <Footer />
    </div>
  )
}
