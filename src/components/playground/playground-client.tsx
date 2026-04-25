"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useStack, type StackTool } from "@/hooks/use-stack"
import { getLogoUrl } from "@/lib/logo"
import type { PlaygroundTool } from "@/lib/queries"
import { incrementPlaygroundUsage } from "@/app/actions/usage"
import { PlaygroundPaywall } from "./playground-paywall"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  FlaskConical, Trash2, X, Sparkles, Loader2, Plus, Check,
  Search, Copy, RotateCcw, DollarSign, ArrowRight, ChevronDown, Zap,
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

const MODELS = [
  { id: "meta/llama-3.3-70b-instruct",     name: "meta / llama-3.3-70b-instruct",     provider: "NVIDIA NIM" },
  { id: "meta/llama-4-maverick-17b-128e-instruct", name: "meta / llama-4-maverick-17b", provider: "NVIDIA NIM" },
  { id: "meta/llama-4-scout-17b-16e-instruct", name: "meta / llama-4-scout-17b",    provider: "NVIDIA NIM" },
  { id: "qwen/qwen2.5-coder-32b-instruct", name: "qwen / qwen2.5-coder-32b",       provider: "NVIDIA NIM" },
  { id: "anthropic/claude-3-5-sonnet-20241022", name: "anthropic / claude-3.5-sonnet", provider: "Anthropic" },
  { id: "anthropic/claude-3-5-haiku-20241022",  name: "anthropic / claude-3.5-haiku",  provider: "Anthropic" },
]

const CATEGORIES = [
  { slug: "all",             name: "All"            },
  { slug: "chatbots",         name: "Chat Assistants"},
  { slug: "coding",          name: "Coding"         },
  { slug: "image-generation", name: "Image Gen"      },
  { slug: "video",           name: "Video Gen"      },
  { slug: "writing",         name: "Writing"        },
  { slug: "audio",           name: "Audio & Voice"  },
  { slug: "backend-db",      name: "Backend & DB"   },
  { slug: "deployment",      name: "Deployment"     },
  { slug: "auth",            name: "Auth"           },
  { slug: "payments",        name: "Payments"       },
  { slug: "automation",      name: "Automation"     },
  { slug: "marketing",       name: "Marketing AI"   },
  { slug: "productivity",    name: "Productivity"   },
  { slug: "emails",          name: "Email"          },
  { slug: "analytics",       name: "Analytics"      },
  { slug: "error-tracking",  name: "Error Tracking" },
  { slug: "version-control", name: "Version Control"},
  { slug: "redis",           name: "Redis"          },
  { slug: "vector-db",       name: "Vector DB"      },
  { slug: "domain",          name: "Domain"         },
  { slug: "dns",             name: "DNS & CDN"      },
  { slug: "others",          name: "Others"         },
]

const PRESET_STACKS: { name: string; emoji: string; description: string; slugs: string[] }[] = [
  {
    name: "MVP SaaS",
    emoji: "🚀",
    description: "Ship fast",
    slugs: ["cursor", "github", "vercel", "supabase", "clerk", "stripe", "resend", "sentry"],
  },
  {
    name: "AI App",
    emoji: "🤖",
    description: "LLM-powered",
    slugs: ["cursor", "github", "vercel", "supabase", "clerk", "pinecone", "upstash", "resend"],
  },
  {
    name: "Indian Startup",
    emoji: "🇮🇳",
    description: "Built for India",
    slugs: ["cursor", "github", "vercel", "supabase", "clerk", "razorpay", "resend", "posthog"],
  },
  {
    name: "Indie Hacker",
    emoji: "⚡",
    description: "Zero to shipped",
    slugs: ["cursor", "github", "railway", "pocketbase", "better-auth", "lemon-squeezy", "resend", "posthog"],
  },
]

const EXAMPLE_PROMPTS = [
  "Freelancer invoicing tool with auto-reminders",
  "B2B analytics dashboard for multiple apps",
  "AI customer support bot trained on your docs",
  "Paid newsletter with subscription billing",
  "Digital products marketplace with instant checkout",
  "Internal OKR tracker for early-stage startups",
]

// ─── Markdown renderer ───────────────────────────────────────────────────────

function MarkdownOutput({ text }: { text: string }) {
  const html = useMemo(() => {
    let out = text
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
    out = out.replace(/^## (.+)$/gm, '<h2 class="pg-h2">$1</h2>')
    out = out.replace(/^### (.+)$/gm, '<h3 class="pg-h3">$1</h3>')
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong class="pg-strong">$1</strong>')
    out = out.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map(l =>
        `<li>${l.replace(/^\d+\. /, "")}</li>`).join("")
      return `<ol class="pg-ol">${items}</ol>`
    })
    out = out.replace(/((?:^- .+\n?)+)/gm, (block) => {
      const items = block.trim().split("\n").map(l =>
        `<li>${l.replace(/^- /, "")}</li>`).join("")
      return `<ul class="pg-ul">${items}</ul>`
    })
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
        .pg-output { font-size: 0.9rem; line-height: 1.8; color: #7A6A57; }
        .pg-h2 {
          font-family: 'Bricolage Grotesque Variable', sans-serif;
          font-size: 1.125rem; font-weight: 800; color: #1C1611;
          margin: 2rem 0 0.75rem; padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(140,110,80,0.12);
        }
        .pg-h2:first-child { margin-top: 0; }
        .pg-h3 {
          font-family: 'Bricolage Grotesque Variable', sans-serif;
          font-size: 0.9375rem; font-weight: 700; color: #1C1611;
          margin: 1.5rem 0 0.375rem;
        }
        .pg-p { margin: 0.6rem 0; }
        .pg-strong { color: #1C1611; font-weight: 700; }
        .pg-ul { margin: 0.75rem 0 0.75rem 1.5rem; }
        .pg-ol { margin: 0.75rem 0 0.75rem 1.5rem; }
        .pg-ul li { list-style-type: disc; margin: 0.3rem 0; }
        .pg-ol li { list-style-type: decimal; margin: 0.3rem 0; }
        .pg-table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.8125rem; }
        .pg-th { text-align: left; padding: 10px 16px; font-weight: 700; color: #1C1611; background: rgba(140,110,80,0.05); border: 1px solid rgba(140,110,80,0.12); }
        .pg-td { padding: 10px 16px; color: #7A6A57; border: 1px solid rgba(140,110,80,0.09); }
        .pg-td strong, .pg-th strong { font-weight: 700; color: #1C1611; }
        tr:last-child .pg-td { font-weight: 700; color: #1C1611; background: rgba(140,110,80,0.03); }
      `}</style>
    </>
  )
}

// ─── Tool logo bubble ────────────────────────────────────────────────────────

function LogoBubble({ tool, size = 28 }: { tool: PlaygroundTool; size?: number }) {
  const logoSrc = getLogoUrl(tool.website, tool.logo_url)
  return (
    <div
      className="rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size, height: size,
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(140,110,80,0.12)",
      }}
    >
      {logoSrc
        ? <img src={logoSrc} alt={tool.name} style={{ width: size * 0.7, height: size * 0.7, objectFit: "contain" }} />
        : <span style={{ fontSize: size * 0.4, fontWeight: 900, color: "#7A6A57" }}>{tool.name[0]}</span>
      }
    </div>
  )
}

// ─── Browser tool card ───────────────────────────────────────────────────────

function BrowserCard({ tool, inStack, onToggle, usdToInrRate }: {
  tool: PlaygroundTool
  inStack: boolean
  onToggle: (tool: PlaygroundTool) => void
  usdToInrRate: number
}) {
  const p = PRICING_COLOR[tool.pricing_model] ?? PRICING_COLOR.freemium
  const logoSrc = getLogoUrl(tool.website, tool.logo_url)

  return (
    <button
      onClick={() => onToggle(tool)}
      className="w-full text-left rounded-xl p-3 transition-all duration-150 group"
      style={{
        background: inStack ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.6)",
        border: `1px solid ${inStack ? "rgba(99,102,241,0.22)" : "rgba(140,110,80,0.09)"}`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5"
          style={{ background: "rgba(140,110,80,0.05)", border: "1px solid rgba(140,110,80,0.1)" }}
        >
          {logoSrc
            ? <img src={logoSrc} alt={tool.name} className="w-6 h-6 object-contain" />
            : <span className="text-xs font-black" style={{ color: "#7A6A57" }}>{tool.name[0]}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className="text-xs font-bold truncate" style={{ color: "#1C1611" }}>{tool.name}</p>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150"
              style={{
                background: inStack ? "#6366f1" : "transparent",
                border: inStack ? "none" : "1.5px solid rgba(140,110,80,0.2)",
              }}
            >
              {inStack
                ? <Check size={9} style={{ color: "#fff" }} strokeWidth={3} />
                : <Plus size={9} style={{ color: "#C4B0A0" }} strokeWidth={2.5} />
              }
            </div>
          </div>
          <p className="text-[10px] leading-snug line-clamp-2 mb-1.5" style={{ color: "#A0907E" }}>
            {tool.tagline}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: p.bg, color: p.color }}>
              {PRICING_LABEL[tool.pricing_model]}
            </span>
            {tool.starting_price_inr ? (
              <span className="text-[9px]" style={{ color: "#C4B0A0" }}>₹{tool.starting_price_inr}/mo</span>
            ) : tool.starting_price_usd ? (
              <span className="text-[9px]" style={{ color: "#C4B0A0" }}>₹{Math.round(tool.starting_price_usd * usdToInrRate)}/mo*</span>
            ) : null}
            {tool.managed_billing_enabled && (
              <div 
                className="flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight"
                style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}
                title="StackFind Managed INR Billing supported"
              >
                <Sparkles size={8} /> Managed
              </div>
            )}
            {tool.is_made_in_india && (
              <span className="text-[9px]">🇮🇳</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Lock wall for guests ─────────────────────────────────────────────────────

function PlaygroundLockWall({ tools }: { tools: PlaygroundTool[] }) {
  const sampleTools = tools.slice(0, 9)

  return (
    <div>
      {/* Blurred playground preview */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none", opacity: 0.5 }}
        aria-hidden
      >
        {/* Fake preset row */}
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_STACKS.map(preset => (
              <div
                key={preset.name}
                className="rounded-2xl p-3.5"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(140,110,80,0.1)" }}
              >
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="w-6 h-6 rounded-lg" style={{ background: "rgba(140,110,80,0.12)" }} />
                  ))}
                </div>
                <p className="text-xs font-bold" style={{ color: "#1C1611" }}>{preset.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#C4B0A0" }}>{preset.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fake tool browser */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
        >
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(140,110,80,0.07)" }}>
            <div
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
              style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.1)" }}
            >
              <Search size={13} style={{ color: "#C4B0A0" }} />
              <span className="text-sm" style={{ color: "#C4B0A0" }}>Search tools…</span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {sampleTools.map((tool, i) => {
                const p = PRICING_COLOR[tool.pricing_model] ?? PRICING_COLOR.freemium
                const logoSrc = getLogoUrl(tool.website, tool.logo_url)
                return (
                  <div
                    key={i}
                    className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(140,110,80,0.09)" }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5"
                        style={{ background: "rgba(140,110,80,0.05)", border: "1px solid rgba(140,110,80,0.1)" }}>
                        {logoSrc
                          ? <img src={logoSrc} alt={tool.name} className="w-6 h-6 object-contain" />
                          : <span className="text-xs font-black" style={{ color: "#7A6A57" }}>{tool.name[0]}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate mb-0.5" style={{ color: "#1C1611" }}>{tool.name}</p>
                        <p className="text-[10px] leading-snug line-clamp-2 mb-1.5" style={{ color: "#A0907E" }}>{tool.tagline}</p>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: p.bg, color: p.color }}>
                          {PRICING_LABEL[tool.pricing_model]}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
        <div
          className="rounded-2xl px-8 py-8 text-center w-full max-w-md mx-auto"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(140,110,80,0.14)",
            boxShadow: "0 8px 48px rgba(140,110,80,0.18), 0 2px 12px rgba(140,110,80,0.1)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(99,102,241,0.08)" }}
          >
            <FlaskConical size={22} style={{ color: "#6366f1" }} />
          </div>
          <p
            className="font-black mb-2 leading-tight"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "1.5rem",
              color: "#1C1611",
              letterSpacing: "-0.02em",
            }}
          >
            Sign in to use the Playground
          </p>
          <p className="text-[0.875rem] mb-6 leading-relaxed" style={{ color: "#7A6A57" }}>
            Build your stack, describe your idea, and get a complete build plan with timelines and cost breakdown.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent("/playground?unlock=pro")}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[0.9375rem] transition-all duration-200 hover:opacity-90"
            style={{ background: "#6366f1", color: "#fff" }}
          >
            Sign in free <ArrowRight size={14} />
          </Link>
          <p className="text-[0.75rem] mt-3" style={{ color: "#C4B0A0" }}>
            Free forever · No credit card
          </p>
        </div>
      </div>
    </div>
  )
}


// ─── Custom Model Selector ──────────────────────────────────────────────────

function ModelSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const selectedModel = MODELS.find(m => m.id === value) || MODELS[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 pl-3.5 pr-2.5 py-2 rounded-xl text-[0.8125rem] font-bold transition-all duration-200 outline-none border border-transparent hover:border-[#6366f1]/30"
        style={{ 
          background: "rgba(140,110,80,0.06)", 
          color: "#1C1611",
        }}
      >
        <span className="truncate max-w-[120px] sm:max-w-none">
          {selectedModel.name.split(" / ")[1] || selectedModel.name}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="opacity-40"
        >
          <ChevronDown size={12} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 bottom-full mb-2 min-w-[220px] z-[100] rounded-2xl overflow-hidden shadow-2xl p-1.5"
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(140, 110, 80, 0.15)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div className="px-3 py-2 border-b border-black/[0.04] mb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">Select Model</p>
            </div>
            {MODELS.map(m => {
              const isSelected = m.id === value
              return (
                <button
                  key={m.id}
                  onClick={() => { onChange(m.id); setIsOpen(false) }}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex flex-col gap-0.5 group"
                  style={{
                    background: isSelected ? "#6366f1" : "transparent",
                  }}
                >
                  <span 
                    className="text-[0.8125rem] font-bold truncate"
                    style={{ color: isSelected ? "#fff" : "#1C1611" }}
                  >
                    {m.name.split(" / ")[1] || m.name}
                  </span>
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-[10px] font-medium opacity-60"
                      style={{ color: isSelected ? "rgba(255,255,255,0.8)" : "#7A6A57" }}
                    >
                      {m.provider}
                    </span>
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  tools: PlaygroundTool[]
  isAuthenticated: boolean
  profile: any
  usdToInrRate: number
}

export function PlaygroundClient({ tools, isAuthenticated, profile, usdToInrRate }: Props) {
  const { stack, add, remove, toggle: toggleStack, clear, isInStack } = useStack()
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [idea, setIdea] = useState("")
  const [budget, setBudget] = useState<number | "">(5000)
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()
  const [sessionUsage, setSessionUsage] = useState(profile?.playground_usage_count || 0)
  const outputRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isPremium = profile?.is_premium_playground || false
  const hasReachedLimit = !isPremium && sessionUsage >= 10

  useEffect(() => {
    if (searchParams.get("unlock") === "pro" && isAuthenticated && !isPremium) {
      handleUnlockPro()
    }
  }, [searchParams, isAuthenticated, isPremium])

  const totalCostInr = stack.reduce((sum, t) => {
    if (t.startingPriceInr) return sum + t.startingPriceInr
    if (t.startingPriceUsd) {
      const base = t.startingPriceUsd * usdToInrRate
      // If managed, add the 5% fee (default behavior)
      const markup = t.managedBillingEnabled ? 1.05 : 1.0
      return sum + (base * markup)
    }
    return sum
  }, 0)

  // Enrich presets with resolved tool data (for logo display)
  const presetsWithTools = useMemo(() =>
    PRESET_STACKS.map(p => ({
      ...p,
      toolData: p.slugs
        .map(slug => tools.find(t => t.slug === slug))
        .filter(Boolean) as PlaygroundTool[],
    }))
  , [tools])

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
    toggleStack({
      slug: tool.slug, name: tool.name, tagline: tool.tagline,
      website: tool.website, logoUrl: tool.logo_url,
      pricingModel: tool.pricing_model,
      startingPriceUsd: tool.starting_price_usd,
      startingPriceInr: tool.starting_price_inr,
      managedBillingEnabled: tool.managed_billing_enabled,
      convenienceFeePercent: tool.convenience_fee_percent,
      categories: [tool.categoryName],
    })
  }, [toggleStack])

  function loadPreset(preset: typeof PRESET_STACKS[0]) {
    clear()
    for (const slug of preset.slugs) {
      const tool = tools.find(t => t.slug === slug)
      if (tool) {
        add({
          slug: tool.slug, name: tool.name, tagline: tool.tagline,
          website: tool.website, logoUrl: tool.logo_url,
          pricingModel: tool.pricing_model,
          startingPriceUsd: tool.starting_price_usd,
          startingPriceInr: tool.starting_price_inr,
          managedBillingEnabled: tool.managed_billing_enabled,
          convenienceFeePercent: tool.convenience_fee_percent,
          categories: [tool.categoryName],
        })
      }
    }
  }

  async function generate() {
    if (!idea.trim() || (stack.length === 0 && budget === "") || loading) return
    setOutput("")
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/playground/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tools: stack, 
          productIdea: idea,
          budget: budget === "" ? 0 : budget,
          modelId: selectedModelId,
          usdToInrRate,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? `Server error ${res.status}`)
        return
      }

      // Handle streaming response
      const reader = res.body?.getReader()
      if (!reader) { setError("Failed to start stream"); return }

      const decoder = new TextDecoder()
      setOutput("") // Clear previous output
      
      // Increment and update local state
      await incrementPlaygroundUsage()
      setSessionUsage((prev: number) => prev + 1)

      let accumulatedText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk
        setOutput(accumulatedText)
        
        // Auto-scroll as text arrives
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
      }
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

  async function handleUnlockPro() {
    if (loading) return;
    try {
      const res = await fetch("/api/billing/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: 499 * 100, // ₹499
          receipt: `pro_upgrade_${profile?.id}_${Date.now()}`,
          notes: {
            type: "playground_pro",
            userId: profile?.id
          }
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create order");
      }
      const order = await res.json();
      
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        console.error("Razorpay Public Key is missing in environment variables.");
        throw new Error("Payment gateway configuration error. Please contact support.");
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "StackFind Pro",
        description: "Lifetime Playground Access",
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/billing/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              window.location.reload(); // Refresh to update premium status
            } else {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (err: any) {
            console.error("Verification Error:", err);
            alert(err.message || "Verification error. Please contact support.");
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: profile?.email || "",
        },
        theme: {
          color: "#6366f1",
        },
      };

      if (!(window as any).Razorpay) {
        alert("Payment gateway loading... please wait a second and try again.");
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Unlock Error:", err);
      alert(err.message || "Failed to initiate payment. Please try again.");
    }
  }

  const canGenerate = isAuthenticated && idea.trim().length > 0 && (stack.length > 0 || (typeof budget === "number" && budget >= 0)) && !loading && !hasReachedLimit

  return (
    <div>
      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical size={13} style={{ color: "#6366f1" }} />
          <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#6366f1" }}>
            Stack Playground
          </span>
        </div>
        <h1
          className="font-black leading-none mb-3"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            color: "#1C1611",
            letterSpacing: "-0.02em",
          }}
        >
          {hasReachedLimit ? "Pro Access Required" : "What are you building?"}
        </h1>
        <p className="max-w-xl" style={{ color: "#7A6A57", fontSize: "0.9375rem", lineHeight: "1.65" }}>
          {hasReachedLimit 
            ? "You've crafted some great stacks! Unlock Premium for unlimited builds and advanced Indian-market intelligence."
            : "Pick your stack, describe your idea — get a complete build plan with timelines and cost breakdown."
          }
        </p>
      </div>


      {/* ── Guest lock wall ───────────────────────────────────────────── */}
      {!isAuthenticated && (
        <div className="relative">
          <PlaygroundLockWall tools={tools} />
        </div>
      )}

      {/* ── Paywall ── */}
      {isAuthenticated && hasReachedLimit && (
        <div className="mt-12 py-10">
          <PlaygroundPaywall onUnlock={handleUnlockPro} />
        </div>
      )}

      {isAuthenticated && !hasReachedLimit && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left: browser + input ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Starter stacks */}
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-[0.13em] uppercase mb-2.5" style={{ color: "#C4B0A0" }}>
              Starter stacks
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {presetsWithTools.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset)}
                  className="text-left rounded-2xl p-3.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.99]"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(140,110,80,0.1)",
                  }}
                >
                  {/* Tool logo row */}
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {preset.toolData.slice(0, 5).map(t => (
                      <LogoBubble key={t.slug} tool={t} size={24} />
                    ))}
                    {preset.toolData.length > 5 && (
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold"
                        style={{ background: "rgba(140,110,80,0.07)", color: "#A0907E" }}
                      >
                        +{preset.toolData.length - 5}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold leading-tight" style={{ color: "#1C1611" }}>{preset.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#C4B0A0" }}>{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tool browser */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            {/* Search bar */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(140,110,80,0.07)" }}>
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.1)" }}
              >
                <Search size={13} style={{ color: "#C4B0A0" }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${tools.length} tools…`}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "#1C1611" }}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="hover:opacity-60 transition-opacity">
                    <X size={12} style={{ color: "#C4B0A0" }} />
                  </button>
                )}
              </div>
            </div>

            {/* Category strip — horizontal scroll, no wrap */}
            <div
              className="flex gap-1.5 px-4 py-2.5 overflow-x-auto"
              style={{
                borderBottom: "1px solid rgba(140,110,80,0.07)",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style jsx global>{`.cat-strip::-webkit-scrollbar { display: none; }`}</style>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0"
                  style={{
                    background: activeCategory === cat.slug ? "#6366f1" : "transparent",
                    color: activeCategory === cat.slug ? "#fff" : "#A0907E",
                    fontWeight: activeCategory === cat.slug ? 700 : 500,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Tool grid */}
            <div className="p-4">
              {filteredTools.length > 0 ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 overflow-y-auto"
                  style={{ maxHeight: 400 }}
                >
                  {filteredTools.map(tool => (
                    <BrowserCard
                      key={tool.slug}
                      tool={tool}
                      inStack={isInStack(tool.slug)}
                      onToggle={handleToggle}
                      usdToInrRate={usdToInrRate}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm" style={{ color: "#C4B0A0" }}>No tools match "{search}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Idea input */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            <div className="flex flex-col sm:flex-row gap-5 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-3" style={{ color: "#1C1611" }}>
                  Describe what you want to build
                </label>
                <textarea
                  ref={textareaRef}
                  value={idea}
                  onChange={e => setIdea(e.target.value)}
                  placeholder="e.g. A SaaS for freelancers to track invoices and auto-remind clients when payments are overdue…"
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
              </div>

              <div className="w-full sm:w-52">
                <label className="block text-sm font-bold mb-3" style={{ color: "#1C1611" }}>
                  Monthly Budget (₹)
                </label>
                <div 
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{ 
                    background: "rgba(140,110,80,0.03)", 
                    border: "1px solid rgba(140,110,80,0.12)",
                  }}
                >
                  <DollarSign size={14} style={{ color: "#6366f1" }} />
                  <input 
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 5000"
                    className="bg-transparent outline-none text-sm font-bold w-full"
                    style={{ color: "#1C1611" }}
                  />
                </div>
                <p className="text-[10px] mt-2 leading-relaxed" style={{ color: "#C4B0A0" }}>
                  AI will suggest a stack <br /> that fits this budget.
                </p>
              </div>
            </div>

            {/* Example prompts */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => { setIdea(prompt); textareaRef.current?.focus() }}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all duration-150"
                  style={{
                    background: "rgba(140,110,80,0.05)",
                    color: "#7A6A57",
                    border: "1px solid rgba(140,110,80,0.1)",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Generate row */}
            <div
              className="flex items-center justify-between mt-4 pt-4 flex-wrap gap-3"
              style={{ borderTop: "1px solid rgba(140,110,80,0.08)" }}
            >
              {/* Stack status */}
              <div className="flex items-center gap-2 flex-wrap">
                {stack.length === 0 ? (
                  <span className="text-xs" style={{ color: "#C4B0A0" }}>Add tools from the browser above</span>
                ) : (
                  <>
                    <div className="flex items-center -space-x-1.5">
                      {stack.slice(0, 5).map(t => {
                        const logo = getLogoUrl(t.website, t.logoUrl)
                        return (
                          <div
                            key={t.slug}
                            className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center"
                            style={{
                              background: "rgba(255,255,255,0.9)",
                              border: "1.5px solid #FAF7F2",
                            }}
                          >
                            {logo
                              ? <img src={logo} alt={t.name} className="w-4 h-4 object-contain" />
                              : <span style={{ fontSize: 8, fontWeight: 900, color: "#7A6A57" }}>{t.name[0]}</span>
                            }
                          </div>
                        )
                      })}
                      {stack.length > 5 && (
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold"
                          style={{ background: "rgba(140,110,80,0.08)", border: "1.5px solid #FAF7F2", color: "#7A6A57" }}
                        >
                          +{stack.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium" style={{ color: "#7A6A57" }}>
                      {stack.length} tool{stack.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs" style={{ color: "#C4B0A0" }}>·</span>
                    <span className="text-xs font-semibold" style={{ color: totalCostInr === 0 ? "#059669" : "#1C1611" }}>
                      { totalCostInr === 0
                        ? "Free to start"
                        : `from ₹${Math.round(totalCostInr)}/mo`
                      }
                    </span>
                    <span className="text-[10px]" style={{ color: "#C4B0A0" }}>
                      *Est. at $1 = ₹{usdToInrRate}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Model Selector Pill */}
                {isAuthenticated && (
                  <ModelSelector value={selectedModelId} onChange={setSelectedModelId} />
                )}

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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90 shadow-sm"
                    style={{ background: "#6366f1", color: "#fff" }}
                  >
                    Sign in to generate <ArrowRight size={13} />
                  </Link>
                ) : (
                  <button
                    onClick={generate}
                    disabled={!canGenerate}
                    title={!canGenerate ? 
                      (idea.trim().length === 0 ? "Describe your idea to generate a plan" : 
                       (stack.length === 0 && (budget === "" || budget < 0)) ? "Add tools or set a budget to suggest a stack" :
                       hasReachedLimit ? "Usage limit reached" : "Please fill in all details") 
                      : "Generate build plan"
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
                    style={{
                      background: canGenerate ? "#1C1611" : "rgba(140,110,80,0.12)",
                      color: canGenerate ? "#fff" : "#A0907E",
                    }}
                  >
                    {loading ? (
                      <><Loader2 size={13} className="animate-spin" /> Generating…</>
                    ) : (
                      <>
                        <Sparkles size={13} className={canGenerate ? "text-[#6366f1] group-hover:scale-110 transition-transform" : "opacity-40"} />
                        Generate plan
                        <ArrowRight size={14} className={canGenerate ? "group-hover:translate-x-0.5 transition-transform" : "opacity-40"} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: stack panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm" style={{ color: "#1C1611" }}>Your Stack</span>
                {stack.length > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full tabular-nums"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                  >
                    {stack.length}
                  </span>
                )}
              </div>
              {stack.length > 0 && (
                <button
                  onClick={clear}
                  className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-50"
                  style={{ color: "#C4B0A0" }}
                >
                  <Trash2 size={10} /> Clear all
                </button>
              )}
            </div>

            {/* Empty state */}
            {stack.length === 0 && (
              <div className="px-5 py-12 text-center">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.1)" }}
                >
                  <FlaskConical size={18} style={{ color: "rgba(140,110,80,0.3)" }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "#C4B0A0" }}>Stack is empty</p>
                <p className="text-xs" style={{ color: "rgba(196,176,160,0.7)" }}>
                  Load a starter stack or pick tools from the browser
                </p>
              </div>
            )}

            {/* Tool list */}
            {stack.length > 0 && (
              <>
                <div
                  className="divide-y overflow-y-auto"
                  style={{ borderColor: "rgba(140,110,80,0.06)", maxHeight: 320 }}
                >
                  {stack.map(tool => {
                    const p = PRICING_COLOR[tool.pricingModel] ?? PRICING_COLOR.freemium
                    const logoSrc = getLogoUrl(tool.website, tool.logoUrl)
                    return (
                      <div key={tool.slug} className="flex items-center gap-3 px-5 py-3 group">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ background: "rgba(140,110,80,0.05)", border: "1px solid rgba(140,110,80,0.1)" }}
                        >
                          {logoSrc
                            ? <img src={logoSrc} alt={tool.name} className="w-5 h-5 object-contain" />
                            : <span className="text-[10px] font-black" style={{ color: "#7A6A57" }}>{tool.name[0]}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "#1C1611" }}>{tool.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                              style={{ background: p.bg, color: p.color }}
                            >
                              {PRICING_LABEL[tool.pricingModel]}
                            </span>
                            {tool.startingPriceInr ? (
                              <span className="text-[9px]" style={{ color: "#C4B0A0" }}>₹{tool.startingPriceInr}/mo</span>
                            ) : tool.startingPriceUsd ? (
                              <span className="text-[9px]" style={{ color: "#C4B0A0" }}>₹{Math.round(tool.startingPriceUsd * usdToInrRate)}/mo*</span>
                            ) : null}
                          </div>
                        </div>
                        <button
                          onClick={() => remove(tool.slug)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/5"
                          style={{ color: "#C4B0A0" }}
                          title="Remove"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Cost summary */}
                <div
                  className="px-5 py-4 space-y-2"
                  style={{ borderTop: "1px solid rgba(140,110,80,0.08)", background: "rgba(140,110,80,0.02)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#A0907E" }}>Min. monthly</span>
                    <span className="text-sm font-black" style={{ color: "#1C1611" }}>
                      {totalCostInr === 0
                        ? "Free"
                        : `₹${Math.round(totalCostInr)}/mo`
                      }
                    </span>
                  </div>
                  {/* Per-tool breakdown */}
                  {stack.filter(t => t.startingPriceInr || t.startingPriceUsd).map(t => (
                    <div key={t.slug} className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "#C4B0A0" }}>{t.name}</span>
                      <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#7A6A57" }}>
                        {t.startingPriceInr 
                          ? `₹${t.startingPriceInr}` 
                          : `₹${Math.round((t.startingPriceUsd ?? 0) * usdToInrRate)}*`
                        }/mo
                      </span>
                    </div>
                  ))}
                  {stack.every(t => !t.startingPriceInr && !t.startingPriceUsd) && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "#C4B0A0" }}>
                        {stack.filter(t => !t.startingPriceUsd).map(t => t.name).join(", ")}
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: "#059669" }}>Free</span>
                    </div>
                  )}
                  <p className="text-[9px] pt-1" style={{ color: "rgba(196,176,160,0.7)" }}>
                    Starting plan prices only. Actual cost scales with usage.
                  </p>

                  {/* View Cost Breakdown Button */}
                  {stack.length > 0 && totalCostInr > 0 && (
                    <Link
                      href={`/checkout/stack?slugs=${stack.map(t => t.slug).join(",")}`}
                      className="flex items-center justify-center gap-2 w-full py-3 mt-3 rounded-xl font-bold text-xs transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                      style={{ 
                        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", 
                        color: "#fff",
                      }}
                    >
                      <Zap size={13} />
                      View Cost Breakdown
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>}

      {/* ── Output ────────────────────────────────────────────────────────── */}
      {(output || loading) && (
        <div
          ref={outputRef}
          className="mt-5 rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(140,110,80,0.1)" }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={14} style={{ color: "#6366f1" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6366f1" }}>
                Build Plan
              </span>
              {loading && (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" style={{ color: "#C4B0A0" }} />
                  <span className="text-xs" style={{ color: "#C4B0A0" }}>Thinking…</span>
                </div>
              )}
            </div>
            {!loading && output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyOutput}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
                  style={{
                    background: copied ? "rgba(16,185,129,0.08)" : "rgba(140,110,80,0.06)",
                    color: copied ? "#059669" : "#7A6A57",
                    border: "1px solid rgba(140,110,80,0.1)",
                  }}
                >
                  {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
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

          <div className="px-6 py-6">
            {loading && !output && (
              <div className="flex flex-col items-center gap-3 py-16">
                <Loader2 size={24} className="animate-spin" style={{ color: "#6366f1" }} />
                <p className="text-sm font-semibold" style={{ color: "#1C1611" }}>
                  Building your plan…
                </p>
                <p className="text-xs" style={{ color: "#C4B0A0" }}>
                  Analysing {stack.length} tools · usually 5–10 seconds
                </p>
              </div>
            )}
            {output && <MarkdownOutput text={output} />}
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div
          className="mt-5 rounded-2xl px-6 py-5 flex items-start gap-3"
          style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }}
        >
          <span className="text-lg mt-0.5 flex-shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1" style={{ color: "#DC2626" }}>Generation failed</p>
            <p className="text-sm" style={{ color: "#7A2020" }}>{error}</p>
            {error.includes("ANTHROPIC_API_KEY") && (
              <p className="text-xs mt-2" style={{ color: "#9A3A3A" }}>
                Go to <strong>Vercel → Project → Settings → Environment Variables</strong> and add{" "}
                <code className="px-1 py-0.5 rounded text-xs" style={{ background: "rgba(239,68,68,0.1)" }}>
                  ANTHROPIC_API_KEY
                </code>.
              </p>
            )}
          </div>
          <button onClick={() => setError("")} className="hover:opacity-50 transition-opacity flex-shrink-0">
            <X size={14} style={{ color: "#DC2626" }} />
          </button>
        </div>
      )}

      {/* ── Idle placeholder ──────────────────────────────────────────────── */}
      {!output && !loading && !error && stack.length > 0 && idea.trim() && (
        <div
          className="mt-5 rounded-2xl py-14 text-center"
          style={{ background: "rgba(99,102,241,0.02)", border: "1px dashed rgba(99,102,241,0.15)" }}
        >
          <Sparkles size={18} className="mx-auto mb-2.5" style={{ color: "rgba(99,102,241,0.3)" }} />
          <p className="text-sm font-medium" style={{ color: "#A0907E" }}>
            Ready — click Generate plan to continue
          </p>
        </div>
      )}

    </div>
  )
}
