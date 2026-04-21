"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ArrowUpRight, ChevronUp, Star } from "lucide-react"
import Link from "next/link"
import type { ToolWithCategoryNames } from "@/lib/queries"
import { getLogoSources } from "@/lib/logo"

const ACCENT_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#0ea5e9"]

const LETTER_PALETTES = [
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#075985" },
  { bg: "#F3E8FF", text: "#6B21A8" },
  { bg: "#FFF1F2", text: "#9F1239" },
  { bg: "#ECFDF5", text: "#14532D" },
]
function letterPalette(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return LETTER_PALETTES[h % LETTER_PALETTES.length]
}

const PRICING_COLOR: Record<string, string> = {
  free: "#10b981", freemium: "#818cf8", paid: "#f59e0b", open_source: "#60a5fa",
}
const PRICING_LABEL: Record<string, string> = {
  free: "Free", freemium: "Freemium", paid: "Paid", open_source: "Open Source",
}

function FeaturedLogo({ name, website, logoUrl }: { name: string; website?: string | null; logoUrl?: string | null }) {
  const sources = getLogoSources(website, logoUrl)
  const [idx, setIdx] = useState(0)
  const palette = letterPalette(name)

  if (idx < sources.length) {
    return (
      <img
        key={sources[idx]}
        src={sources[idx]}
        alt={`${name} logo`}
        width={32}
        height={32}
        onError={() => setIdx(i => i + 1)}
        className="rounded-lg object-contain"
        style={{ width: 32, height: 32 }}
      />
    )
  }
  return (
    <span
      className="font-black flex items-center justify-center w-full h-full rounded-lg"
      style={{
        background: palette.bg,
        color: palette.text,
        fontFamily: "'Bricolage Grotesque Variable', sans-serif",
        fontSize: 13,
      }}
    >
      {name[0].toUpperCase()}
    </span>
  )
}

function FeaturedCard({ tool, delay, color }: { tool: ToolWithCategoryNames; delay: number; color: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.32, 0.72, 0, 1] }}
      className="card-bezel group h-full"
    >
      <div className="card-inner flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 gap-3">

          {/* Logo + name row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.1)" }}
              >
                <FeaturedLogo name={tool.name} website={tool.website} logoUrl={tool.logo_url} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="font-bold leading-tight"
                    style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", fontSize: "0.9375rem", color: "#1C1611" }}
                  >
                    {tool.name}
                  </h3>
                  {tool.is_made_in_india && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                      🇮🇳 India
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}15`, color: PRICING_COLOR[tool.pricing_model] }}
                  >
                    {PRICING_LABEL[tool.pricing_model]}
                  </span>
                  {tool.has_inr_billing && (
                    <span className="text-[10px] font-medium" style={{ color: "#C4B0A0" }}>₹ INR</span>
                  )}
                  {tool.has_upi && (
                    <span className="text-[10px] font-medium" style={{ color: "#C4B0A0" }}>· UPI</span>
                  )}
                  {tool.has_gst_invoice && (
                    <span className="text-[10px] font-medium" style={{ color: "#C4B0A0" }}>· GST</span>
                  )}
                </div>
              </div>
            </div>

            <Link href={`/tools/${tool.slug}`}
              className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
              style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.1)" }}>
              <ArrowUpRight size={13} style={{ color: "#7A6A57" }} />
            </Link>
          </div>

          {/* Tagline */}
          <p className="text-xs leading-relaxed flex-1 line-clamp-2" style={{ color: "#7A6A57" }}>
            {tool.tagline}
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{ borderTop: "1px solid rgba(140,110,80,0.07)" }}
        >
          {/* Accent dot + category */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="flex gap-1">
              {tool.categoryNames.slice(0, 1).map(c => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(140,110,80,0.06)", color: "#C4B0A0" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          <button
            className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200"
            style={{ border: "1px solid rgba(140,110,80,0.1)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <ChevronUp size={11} style={{ color: "#C4B0A0" }} />
            <span className="text-[11px] font-semibold tabular-nums" style={{ color: "#C4B0A0" }}>
              {tool.upvotes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface FeaturedToolsProps {
  tools: ToolWithCategoryNames[]
}

export function FeaturedTools({ tools }: FeaturedToolsProps) {
  return (
    <section className="relative z-10 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>Featured</span>
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
            </div>
            <h2
              className="font-black leading-tight"
              style={{ color: "#1C1611", fontFamily: "'Bricolage Grotesque Variable', sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              Editor&apos;s picks
            </h2>
          </div>
          <Link href="/tools?featured=true" className="btn-ghost !py-2 !px-4 !text-sm">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tools.map((tool, i) => (
            <FeaturedCard
              key={tool.slug}
              tool={tool}
              delay={i * 0.08}
              color={ACCENT_COLORS[i % ACCENT_COLORS.length]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
