"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight, ChevronUp } from "lucide-react"
import { getLogoSources } from "@/lib/logo"

// Deterministic color pair from a string — never random, always consistent per tool
const LETTER_PALETTES = [
  { bg: "#EEF2FF", text: "#4338CA" }, // indigo
  { bg: "#FEF3C7", text: "#92400E" }, // amber
  { bg: "#D1FAE5", text: "#065F46" }, // emerald
  { bg: "#FCE7F3", text: "#9D174D" }, // pink
  { bg: "#E0F2FE", text: "#075985" }, // sky
  { bg: "#F3E8FF", text: "#6B21A8" }, // purple
  { bg: "#FFF1F2", text: "#9F1239" }, // rose
  { bg: "#ECFDF5", text: "#14532D" }, // green
]
function letterPalette(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return LETTER_PALETTES[h % LETTER_PALETTES.length]
}

interface ToolCardProps {
  name: string
  slug: string
  tagline: string
  website?: string | null
  logoUrl?: string | null
  pricingModel: "free" | "freemium" | "paid" | "open_source"
  upvotes: number
  isMadeInIndia?: boolean
  hasInrBilling?: boolean
  hasUpi?: boolean
  categories?: string[]
}

const PRICING: Record<string, { label: string; bg: string; color: string }> = {
  free:        { label: "Free",        bg: "rgba(16,185,129,0.09)",  color: "#059669" },
  freemium:    { label: "Freemium",    bg: "rgba(99,102,241,0.09)",  color: "#6366f1" },
  paid:        { label: "Paid",        bg: "rgba(217,119,6,0.09)",   color: "#D97706" },
  open_source: { label: "Open Source", bg: "rgba(59,130,246,0.09)",  color: "#3b82f6" },
}

function ToolLogo({ name, website, logoUrl }: { name: string; website?: string | null; logoUrl?: string | null }) {
  const sources = getLogoSources(website, logoUrl)
  const [idx, setIdx] = useState(0)
  const palette = letterPalette(name)

  if (idx < sources.length) {
    return (
      <img
        key={sources[idx]}
        src={sources[idx]}
        alt={`${name} logo`}
        width={36}
        height={36}
        onError={() => setIdx(i => i + 1)}
        className="rounded-lg object-contain"
        style={{ width: 36, height: 36 }}
      />
    )
  }

  // All sources exhausted → styled letter avatar
  return (
    <span
      className="font-black text-base select-none flex items-center justify-center w-full h-full rounded-xl"
      style={{
        background: palette.bg,
        color: palette.text,
        fontFamily: "'Bricolage Grotesque Variable', sans-serif",
        fontSize: 15,
        letterSpacing: "-0.02em",
      }}
    >
      {name[0].toUpperCase()}
    </span>
  )
}

export function ToolCard({
  name, slug, tagline, website, logoUrl, pricingModel, upvotes,
  isMadeInIndia, hasInrBilling, hasUpi, categories = [],
}: ToolCardProps) {
  const p = PRICING[pricingModel] ?? PRICING.free

  return (
    <div className="card-bezel h-full group">
      <div className="card-inner flex flex-col h-full">

        {/* Top */}
        <div className="p-4 flex flex-col gap-3 flex-1">

          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  background: "rgba(140,110,80,0.06)",
                  border: "1px solid rgba(140,110,80,0.1)",
                }}
              >
                <ToolLogo name={name} website={website} logoUrl={logoUrl} />
              </div>

              {/* Name + India badge */}
              <div className="min-w-0">
                <h3
                  className="font-bold text-sm leading-tight truncate"
                  style={{ color: "#1C1611", fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}
                >
                  {name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {isMadeInIndia && (
                    <span className="text-[9px] font-bold tracking-wide" style={{ color: "#D97706" }}>
                      🇮🇳 INDIA
                    </span>
                  )}
                  {hasInrBilling && (
                    <span className="text-[9px] font-medium" style={{ color: "#C4B0A0" }}>₹ INR</span>
                  )}
                  {hasUpi && (
                    <span className="text-[9px] font-medium" style={{ color: "#C4B0A0" }}>· UPI</span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={`/tools/${slug}`}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.1)" }}
            >
              <ArrowUpRight size={13} style={{ color: "#7A6A57" }} />
            </Link>
          </div>

          {/* Tagline */}
          <p
            className="text-xs leading-relaxed flex-1 line-clamp-2"
            style={{ color: "#7A6A57" }}
          >
            {tagline}
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: "1px solid rgba(140,110,80,0.07)" }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: p.bg, color: p.color }}
            >
              {p.label}
            </span>
            {categories[0] && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full hidden sm:inline"
                style={{ background: "rgba(140,110,80,0.06)", color: "#C4B0A0" }}
              >
                {categories[0]}
              </span>
            )}
          </div>

          <button
            className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200"
            style={{ border: "1px solid rgba(140,110,80,0.1)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <ChevronUp size={11} style={{ color: "#C4B0A0" }} />
            <span className="text-[11px] font-semibold tabular-nums" style={{ color: "#C4B0A0" }}>
              {upvotes.toLocaleString()}
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}
