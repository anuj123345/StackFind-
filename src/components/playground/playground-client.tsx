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
  Search, Copy, RotateCcw, DollarSign, ArrowRight, ChevronDown, Zap, FileText, ExternalLink,
  Download, Mail, CreditCard, Share2, Send, Layout
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getToolLogoBase64 } from "@/lib/utils/logo-resolver"
import { ExportEmailModal } from "./export-email-modal"

// ΓöÇΓöÇΓöÇ Constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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
  { id: "anthropic/claude-3-5-sonnet-20241022", name: "anthropic / claude-3.5-sonnet", provider: "Anthropic" },
  { id: "anthropic/claude-3-5-haiku-20241022",  name: "anthropic / claude-3.5-haiku",  provider: "Anthropic" },
  { id: "meta/llama-3.3-70b-instruct",     name: "meta / llama-3.3-70b-instruct",     provider: "NVIDIA NIM" },
  { id: "moonshotai/kimi-k2.5",            name: "moonshot / kimi-k2.5",              provider: "NVIDIA NIM" },
  { id: "qwen/qwen2.5-coder-32b-instruct", name: "qwen / qwen2.5-coder-32b",       provider: "NVIDIA NIM" },
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
    emoji: "≡ƒÜÇ",
    description: "Ship fast",
    slugs: ["cursor", "github", "vercel", "supabase", "clerk", "stripe", "resend", "sentry"],
  },
  {
    name: "AI App",
    emoji: "≡ƒñû",
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

const SUGGESTIONS = [
  "Freelancer invoicing tool with auto-reminders",
  "B2B analytics dashboard for multiple apps",
  "AI customer support bot trained on your docs",
  "Paid newsletter with subscription billing",
  "Digital products marketplace with instant checkout",
  "Internal OKR tracker for early-stage startups",
]

// ΓöÇΓöÇΓöÇ Markdown renderer ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function MarkdownOutput({ text }: { text: string }) {
  const html = useMemo(() => {
    let out = text.replace(/\[\s*STACK:[\s\S]*?\]/gi, "")
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
    out = out.replace(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n((?:> .+\n?)+)/gm, (_, type, content) => {
      const alertText = content.replace(/^> /gm, "").trim()
      return `<div class="pg-alert pg-alert-${type.toLowerCase()}">${alertText}</div>`
    })
    out = out.replace(/^> (.+)$/gm, '<blockquote class="pg-blockquote">$1</blockquote>')
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
        
        .pg-blockquote { border-left: 3px solid rgba(140,110,80,0.2); padding-left: 1rem; margin: 1rem 0; color: #7A6A57; font-style: italic; }
        .pg-alert { padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; font-size: 0.8125rem; border: 1px solid transparent; }
        .pg-alert-note { background: rgba(99,102,241,0.05); border-color: rgba(99,102,241,0.15); color: #6366f1; }
        .pg-alert-tip { background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.15); color: #059669; }
        .pg-alert-important { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.15); color: #ef4444; }
        .pg-alert-warning { background: rgba(245,158,11,0.05); border-color: rgba(245,158,11,0.15); color: #f59e0b; }
        .pg-alert-caution { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #b91c1c; font-weight: 600; }
      `}</style>
    </>
  )
}

// ΓöÇΓöÇΓöÇ Tool logo bubble ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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

// ΓöÇΓöÇΓöÇ Browser tool card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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
      className="w-full text-left rounded-xl p-4 transition-all duration-150 group"
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
              <span className="text-[9px]" style={{ color: "#C4B0A0" }}>Γé╣{tool.starting_price_inr}/mo</span>
            ) : tool.starting_price_usd ? (
              <span className="text-[9px]" style={{ color: "#C4B0A0" }}>Γé╣{Math.round(tool.starting_price_usd * usdToInrRate)}/mo*</span>
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
              <span className="text-[9px]">≡ƒç«≡ƒç│</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ΓöÇΓöÇΓöÇ Lock wall for guests ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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
              <span className="text-sm" style={{ color: "#C4B0A0" }}>Search toolsΓÇª</span>
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
            Free forever ┬╖ No credit card
          </p>
        </div>
      </div>
    </div>
  )
}


// ΓöÇΓöÇΓöÇ Custom Model Selector ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

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

// ΓöÇΓöÇΓöÇ Main component ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

interface Props {
  tools: PlaygroundTool[]
  isAuthenticated: boolean
  profile: any
  usdToInrRate: number
}

export function PlaygroundClient({ tools, isAuthenticated, profile, usdToInrRate }: Props) {
  const { stack, add, remove, toggle: toggleStack, clear, isInStack, setFullStack } = useStack()
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [idea, setIdea] = useState("")
  const [budget, setBudget] = useState<number | "">("")
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSelectingTools, setIsSelectingTools] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notionUrl, setNotionUrl] = useState("")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [pdfExporting, setPdfExporting] = useState(false)
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
    if (!idea.trim() || loading) return
    setOutput("")
    setError("")
    setLoading(true)
    setIsSelectingTools(stack.length === 0)
    
    try {
      const res = await fetch("/api/playground/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tools: stack.length > 0 ? stack : tools, 
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

      const reader = res.body?.getReader()
      if (!reader) { setError("Failed to start stream"); return }

      const decoder = new TextDecoder()
      setOutput("")
      
      await incrementPlaygroundUsage()
      setSessionUsage((prev: number) => prev + 1)

      let accumulatedText = ""
      let stackProcessed = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk
        setOutput(accumulatedText)
        
        // Check for [STACK: slug1, slug2] and update the UI
        if (!stackProcessed && (accumulatedText.includes("[STACK:") || accumulatedText.includes("[STACK:"))) {
          const match = accumulatedText.match(/\[\s*STACK:\s*([\s\S]*?)\]/i)
          if (match) {
            const slugs = match[1].split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
            if (slugs.length > 0) {
              const selectedTools: StackTool[] = []
              slugs.forEach(slug => {
                const tool = tools.find(t => t.slug === slug)
                if (tool) {
                  selectedTools.push({
                    slug: tool.slug,
                    name: tool.name,
                    tagline: tool.tagline,
                    website: tool.website,
                    logoUrl: tool.logo_url,
                    pricingModel: tool.pricing_model,
                    startingPriceUsd: tool.starting_price_usd,
                    startingPriceInr: tool.starting_price_inr,
                    managedBillingEnabled: tool.managed_billing_enabled,
                    convenienceFeePercent: tool.convenience_fee_percent,
                    categories: [tool.categoryName],
                  })
                }
              })
              
              if (selectedTools.length > 0) {
                setFullStack(selectedTools)
                stackProcessed = true
                setIsSelectingTools(false)
              }
            }
          }
        }

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

  async function handleExportNotion() {
    if (exporting) return
    if (stack.length === 0) {
      setError("Please select at least one tool for your stack.")
      return
    }
    
    setExporting(true)
    setError("")
    setNotionUrl("")

    const isGenericPlan = !output || output.includes("No detailed build plan generated yet");
    const finalPlan = isGenericPlan 
      ? `Quick Summary:\nYou have selected a stack of ${stack.length} tools. For a detailed step-by-step implementation guide including API integrations and costs, please use the 'Generate Plan' feature in the StackFind Playground.`
      : output;

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25s timeout

      const res = await fetch("/api/playground/export/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          stack: stack.map(t => ({ name: t.name, tagline: t.tagline, website: t.website })),
          plan: finalPlan
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Export failed")
      }

      const data = await res.json()
      if (data.url) {
        window.open(data.url, "_blank")
      }
    } catch (err: any) {
      setError(err.name === "AbortError" ? "Export timed out. Please try again." : err.message)
    } finally {
      setExporting(false)
    }
  }
  async function handleExportPdf() {
    if (pdfExporting) return
    setPdfExporting(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Header
      doc.setFillColor(99, 102, 241)
      doc.rect(0, 0, pageWidth, 40, "F")
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("StackFind Blueprint", 20, 25)
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - 60, 25)

      let currentY = 55

      // Project Info
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("PROJECT IDEA", 20, currentY)
      currentY += 8
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(71, 85, 105)
      const splitIdea = doc.splitTextToSize(idea || "Custom Project Build", pageWidth - 40)
      doc.text(splitIdea, 20, currentY)
      currentY += (splitIdea.length * 5) + 15

      // Stack Table
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("SELECTED TECHNOLOGY STACK", 20, currentY)
      currentY += 10

      const tableData = stack.map(t => [
        { content: "", logo: t.logoUrl }, // Placeholder for logo
        t.name,
        t.categories?.[0] || "General",
        t.startingPriceInr ? `₹${t.startingPriceInr}/mo` : "Free/Usage"
      ])

      ;(doc as any).autoTable({
        startY: currentY,
        head: [["", "Tool", "Category", "Starting Price"]],
        body: tableData,
        theme: "striped",
        headStyles: { 
          fillColor: [248, 250, 252], 
          textColor: [71, 85, 105],
          fontSize: 9,
          fontStyle: "bold"
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 6,
          lineColor: [241, 245, 249],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { fontStyle: "bold" }
        },
        didDrawCell: (data: any) => {
          if (data.section === "body" && data.column.index === 0) {
            const rowIndex = data.row.index
            const logo = (tableData[rowIndex][0] as any).logo
            if (logo) {
              doc.addImage(logo, "PNG", data.cell.x + 3.5, data.cell.y + 2.5, 8, 8)
            }
          }
        }
      })

      currentY = (doc as any).lastAutoTable.finalY + 20

      // Execution Plan
      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = 30
      }

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(99, 102, 241)
      doc.text("EXECUTION STRATEGY", 20, currentY)
      currentY += 10

      const planToRender = (!output || output.includes("No detailed build plan generated yet"))
        ? `Quick Summary:\nYou have selected a stack of ${stack.length} tools. For a detailed step-by-step implementation guide including API integrations and costs, please use the 'Generate Plan' feature in the StackFind Playground.`
        : output

      const lines = planToRender.split("\n")
      
      // Helper to render text cleanly in PDF
      const renderCleanText = (text: string, x: number, y: number, fontSize: number, maxWidth: number) => {
        // 1. Strip Markdown artifacts that break PDF rendering
        let clean = text
          .replace(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, "") // Strip callout headers
          .replace(/^> /g, "")                                          // Strip blockquote markers
          .replace(/\*\*/g, "")                                         // Strip bold markers (avoid & issue)
          .replace(/\[(.*?)\]\(.*?\)/g, "$1")                           // Strip links but keep text
          .trim()

        if (!clean) return 0

        doc.setFontSize(fontSize)
        doc.setTextColor(71, 85, 105)
        doc.setFont("helvetica", "normal")
        
        const wrappedLines = doc.splitTextToSize(clean, maxWidth)
        
        if (Array.isArray(wrappedLines)) {
          wrappedLines.forEach((l, idx) => {
            doc.text(l, x, y + (idx * fontSize * 0.5))
          })
          return wrappedLines.length * (fontSize * 0.5)
        } else {
          doc.text(wrappedLines, x, y)
          return fontSize * 0.5
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line || line.startsWith("|")) continue // Skip empty and tables

        if (currentY > pageHeight - 20) {
          doc.addPage()
          currentY = 30
        }

        if (line.startsWith("## ")) {
          doc.setFont("helvetica", "bold")
          doc.setFontSize(14)
          doc.setTextColor(30, 41, 59)
          doc.text(line.replace("## ", ""), 20, currentY)
          currentY += 10
        } else if (line.startsWith("### ")) {
          doc.setFont("helvetica", "bold")
          doc.setFontSize(12)
          doc.setTextColor(30, 41, 59)
          doc.text(line.replace("### ", ""), 20, currentY)
          currentY += 8
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          const height = renderCleanText("• " + line.substring(2), 25, currentY, 10, pageWidth - 45)
          currentY += height + 3
        } else {
          const height = renderCleanText(line, 20, currentY, 10, pageWidth - 40)
          currentY += height + 3
        }
      }

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      const footerText = "StackFind — Built for Indian Founders. Visit stackfind.in for more tools."
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" })
      doc.link(pageWidth / 2 - 40, pageHeight - 15, 80, 10, { url: "https://stackfind.in" })

      doc.save(`StackFind-Blueprint-${Date.now()}.pdf`)
    } catch (err: any) {
      console.error(err)
      setError("Failed to generate PDF: " + err.message)
    } finally {
      setPdfExporting(false)
    }
  }

  async function handleExportEmail(email: string) {
    const isGenericPlan = !output || output.includes("No detailed build plan generated yet");
    const finalPlan = isGenericPlan 
      ? `A curated selection of ${stack.length} elite tools has been compiled for your project. To unlock the full step-by-step execution roadmap, head back to the StackFind Playground.`
      : output;

    const techStack = stack.map(tool => ({
      name: tool.name,
      category: tool.categories?.[0] || "Tool",
      price: tool.startingPriceInr 
        ? `₹${tool.startingPriceInr}/mo` 
        : tool.startingPriceUsd 
          ? `₹${Math.round(tool.startingPriceUsd * usdToInrRate)}/mo*`
          : "Free to start",
      url: tool.website || "#"
    }));

    const res = await fetch("/api/playground/export/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        idea,
        techStack,
        plan: finalPlan
      })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Failed to send email")
    }
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
      if (!razorpayKey) throw new Error("Payment gateway configuration error.");

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
            if (verifyData.success) window.location.reload();
            else throw new Error(verifyData.message || "Payment verification failed");
          } catch (err: any) {
            alert(err.message || "Verification error.");
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: profile?.email || "",
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Failed to initiate payment.");
    }
  }
  const canGenerate = isAuthenticated && idea.trim().length > 0 && !loading && !hasReachedLimit

  return (
    <>
      <div className="relative">
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

      {!isAuthenticated && <PlaygroundLockWall tools={tools} />}

      {isAuthenticated && hasReachedLimit && (
        <div className="mt-12 py-10">
          <PlaygroundPaywall onUnlock={handleUnlockPro} />
        </div>
      )}

      {isAuthenticated && !hasReachedLimit && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-4">
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
                    style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(140,110,80,0.1)" }}
                  >
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {preset.toolData.slice(0, 5).map(t => <LogoBubble key={t.slug} tool={t} size={24} />)}
                      {preset.toolData.length > 5 && (
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold" style={{ background: "rgba(140,110,80,0.07)", color: "#A0907E" }}>
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

            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}>
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(140,110,80,0.07)" }}>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.1)" }}>
                  <Search size={13} style={{ color: "#C4B0A0" }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={`Search ${tools.length} tools…`}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#1C1611" }}
                  />
                  {search && <button onClick={() => setSearch("")}><X size={12} style={{ color: "#C4B0A0" }} /></button>}
                </div>
              </div>

              <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar" style={{ borderBottom: "1px solid rgba(140,110,80,0.07)" }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveCategory(cat.slug)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 whitespace-nowrap"
                    style={{
                      background: activeCategory === cat.slug ? "#6366f1" : "transparent",
                      color: activeCategory === cat.slug ? "#fff" : "#A0907E",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 overflow-y-auto max-h-[400px]">
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
                  <div className="py-10 text-center"><p className="text-sm" style={{ color: "#C4B0A0" }}>No tools match "{search}"</p></div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl space-y-6" style={{ background: "#fff", border: "1px solid rgba(140,110,80,0.1)", boxShadow: "0 20px 50px -12px rgba(140,110,80,0.12)" }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "#A0907E" }}>
                    <Sparkles size={12} className="text-[#6366f1]" />
                    Describe your idea
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 bg-[rgba(140,110,80,0.04)] px-3 py-1.5 rounded-lg border border-[rgba(140,110,80,0.08)] transition-all focus-within:border-[#6366f1]/30">
                        <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: "#A0907E" }}>
                          {budget === "" ? "Budget: Flexible" : "Target Budget"}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold" style={{ color: budget === "" ? "#A0907E" : "#1C1611" }}>₹</span>
                          <input
                            type="number"
                            value={budget}
                            onChange={e => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="Flexible"
                            className="w-16 bg-transparent outline-none text-xs font-bold"
                            style={{ color: "#1C1611" }}
                          />
                        </div>
                      </div>
                      <p className="text-[9px] font-medium opacity-60" style={{ color: "#7A6A57" }}>
                        {budget === "" ? "AI will suggest an optimal budget based on tools" : "AI will suggest a stack that fits this budget"}
                      </p>
                    </div>
                    <ModelSelector value={selectedModelId} onChange={setSelectedModelId} />
                  </div>
                </div>
                
                <div className="relative group">
                  <textarea
                    ref={textareaRef}
                    value={idea}
                    onChange={e => setIdea(e.target.value)}
                    placeholder="E.g. I want to build a real-time analytics dashboard for D2C brands in India using Shopify data..."
                    className="w-full min-h-[160px] p-5 rounded-2xl outline-none transition-all duration-300 resize-none text-[0.9375rem] leading-relaxed"
                    style={{
                      background: "rgba(140,110,80,0.03)",
                      border: "1px solid rgba(140,110,80,0.1)",
                      color: "#1C1611",
                    }}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <span className="text-[10px] font-medium" style={{ color: "#C4B0A0" }}>Press ⌘+Enter to build</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setIdea(s)}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-full border transition-all duration-150 hover:bg-[rgba(140,110,80,0.05)]"
                      style={{ background: "#fff", borderColor: "rgba(140,110,80,0.1)", color: "#7A6A57" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={generate}
                  disabled={!canGenerate}
                  title={!canGenerate ? (idea.trim().length === 0 ? "Describe your idea to generate a plan" : hasReachedLimit ? "Usage limit reached" : "Please fill in all details") : "Generate build plan"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
                  style={{
                    background: canGenerate ? "#1C1611" : "rgba(140,110,80,0.1)",
                    color: canGenerate ? "#fff" : "#A0907E",
                  }}
                >
                  {loading ? (
                    <><Loader2 size={13} className="animate-spin" /> {isSelectingTools ? "Architecting..." : "Generating…"}</>
                  ) : (
                    <>
                      <Sparkles size={13} className={canGenerate ? "text-[#6366f1] group-hover:scale-110 transition-transform" : "opacity-40"} />
                      Build Roadmap
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl" style={{ background: "#fff", border: "1px solid rgba(140,110,80,0.1)" }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#A0907E" }}>Your Stack</span>
                {stack.length > 0 && <button onClick={clear} className="text-[10px] font-bold text-red-500 hover:underline">Clear all</button>}
              </div>

              {stack.length > 0 ? (
                <div className="space-y-2.5 mb-8">
                  {stack.map(tool => (
                    <div key={tool.slug} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(140,110,80,0.04)", border: "1px solid rgba(140,110,80,0.05)" }}>
                      <div className="flex items-center gap-3">
                        <LogoBubble tool={tool as any} size={32} />
                        <div>
                          <p className="text-xs font-bold" style={{ color: "#1C1611" }}>{tool.name}</p>
                          <p className="text-[9px] font-medium" style={{ color: "#C4B0A0" }}>{tool.categories?.[0]}</p>
                        </div>
                      </div>
                      <button onClick={() => remove(tool.slug)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#C4B0A0] hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-3 text-center opacity-40">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(140,110,80,0.1)" }}><FlaskConical size={16} /></div>
                  <p className="text-xs font-bold" style={{ color: "#1C1611" }}>Stack is empty</p>
                  <p className="text-[10px]" style={{ color: "#7A6A57" }}>Load a starter stack or pick tools from the browser</p>
                </div>
              )}

              <div className="pt-6 border-t border-[rgba(140,110,80,0.08)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: "#C4B0A0" }}>Est. Monthly Cost</span>
                  <span className="text-sm font-black" style={{ color: "#1C1611" }}>₹{Math.round(totalCostInr).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 mb-4">
                  <CreditCard size={12} className="text-indigo-500" />
                  <p className="text-[9px] leading-relaxed text-indigo-700 font-medium">Get all these tools in one bill with <strong>StackFind Managed Billing</strong>. Pay via UPI/Netbanking.</p>
                </div>
                <button className="w-full py-2.5 rounded-xl text-[11px] font-bold transition-all hover:opacity-90" style={{ background: "#6366f1", color: "#fff" }}>Request Managed Billing</button>
              </div>
            </div>

            <div className="p-6 rounded-3xl min-h-[400px] flex flex-col" style={{ background: "#fff", border: "1px solid rgba(140,110,80,0.1)" }}>
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#A0907E" }}>Build Plan</span>
                {loading && (
                  <div className="flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" style={{ color: "#6366f1" }} />
                    <span className="text-xs" style={{ color: "#6366f1" }}>{isSelectingTools ? "Architecting your stack..." : "Thinking..."}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                {output ? (
                  <MarkdownOutput text={output} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                    <FileText size={32} className="mb-4" />
                    <p className="text-xs font-bold">No plan generated yet</p>
                    <p className="text-[10px] max-w-[160px] mx-auto mt-1">Describe your idea and click build to see the execution roadmap</p>
                  </div>
                )}
                {loading && !output && (
                  <div className="flex flex-col items-center gap-3 py-16">
                    <Loader2 size={24} className="animate-spin" style={{ color: "#6366f1" }} />
                    <p className="text-sm font-semibold" style={{ color: "#1C1611" }}>{isSelectingTools ? "AI is selecting the best tools for you..." : "Building your plan..."}</p>
                    <p className="text-xs" style={{ color: "#C4B0A0" }}>{isSelectingTools ? "Matching your idea with the best-fit database, auth, and payment tools..." : `Analysing ${stack.length} tools · usually 5–10 seconds`}</p>
                  </div>
                )}
                <div ref={outputRef} />
              </div>

              {output && !loading && (
                <div className="pt-6 mt-6 border-t border-[rgba(140,110,80,0.08)] grid grid-cols-2 gap-2">
                  <button onClick={copyOutput} className="flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold border border-[rgba(140,110,80,0.1)] hover:bg-[rgba(140,110,80,0.03)] transition-colors">
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Plan</>}
                  </button>
                  <div className="relative group">
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold bg-[#1C1611] text-white hover:opacity-90 transition-opacity">
                      <Share2 size={12} /> Export Plan
                    </button>
                    <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                      <div className="p-1 rounded-xl shadow-2xl bg-white border border-[rgba(140,110,80,0.1)] space-y-1">
                        <button onClick={handleExportNotion} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-gray-50 text-left">
                          <Layout size={12} /> {exporting ? "Exporting..." : "To Notion"}
                        </button>
                        <button onClick={() => setShowEmailModal(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-gray-50 text-left">
                          <Send size={12} /> To Email
                        </button>
                        <button onClick={handleExportPdf} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-gray-50 text-left">
                          <Download size={12} /> {pdfExporting ? "Preparing..." : "Download PDF"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      <ExportEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onExport={handleExportEmail}
      />
    </>
  )
}