"use client"

import Link from "next/link"
import { ArrowUpRight, ChevronUp, Plus, Check } from "lucide-react"
import { getLogoUrl } from "@/lib/logo"
import { useStack } from "@/hooks/use-stack"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Deterministic color pair from a string — never random, always consistent per tool
const LETTER_PALETTES = [
  { bg: "rgba(99, 102, 241, 0.1)", text: "#6366f1", border: "rgba(99, 102, 241, 0.2)" }, // indigo
  { bg: "rgba(217, 119, 6, 0.1)",  text: "#D97706", border: "rgba(217, 119, 6, 0.2)" },  // amber
  { bg: "rgba(16, 185, 129, 0.1)", text: "#059669", border: "rgba(16, 185, 129, 0.2)" }, // emerald
  { bg: "rgba(236, 72, 153, 0.1)", text: "#DB2777", border: "rgba(236, 72, 153, 0.2)" }, // pink
  { bg: "rgba(14, 165, 233, 0.1)", text: "#0284C7", border: "rgba(14, 165, 233, 0.2)" }, // sky
  { bg: "rgba(168, 85, 247, 0.1)", text: "#9333EA", border: "rgba(168, 85, 247, 0.2)" }, // purple
  { bg: "rgba(244, 63, 94, 0.1)",  text: "#E11D48", border: "rgba(244, 63, 94, 0.2)" },  // rose
  { bg: "rgba(34, 197, 94, 0.1)",  text: "#16A34A", border: "rgba(34, 197, 94, 0.2)" },  // green
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
  startingPriceUsd?: number | null
  startingPriceInr?: number | null
}

const PRICING: Record<string, { label: string; bg: string; color: string }> = {
  free:        { label: "Free",        bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  freemium:    { label: "Freemium",    bg: "rgba(99,102,241,0.1)",  color: "#6366f1" },
  paid:        { label: "Paid",        bg: "rgba(217,119,6,0.1)",   color: "#D97706" },
  open_source: { label: "Open Source", bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
}

function ToolLogo({ name, website, logoUrl }: { name: string; website?: string | null; logoUrl?: string | null }) {
  const src = getLogoUrl(website, logoUrl)

  if (src) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        width={36}
        height={36}
        className="rounded-lg object-contain"
        style={{ width: 36, height: 36 }}
      />
    )
  }

  const palette = letterPalette(name)
  return (
    <span
      className="font-black text-base select-none flex items-center justify-center w-full h-full rounded-xl backdrop-blur-[2px]"
      style={{
        background: palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        fontFamily: "'Bricolage Grotesque Variable', sans-serif",
        fontSize: 16,
        letterSpacing: "-0.02em",
      }}
    >
      {name[0].toUpperCase()}
    </span>
  )
}

export function ToolCard({
  name, slug, tagline, website, logoUrl, pricingModel, upvotes,
  isMadeInIndia,
  hasInrBilling,
  hasUpi,
  categories = [],
  startingPriceUsd = null,
  startingPriceInr = null,
}: ToolCardProps) {
  const p = PRICING[pricingModel] ?? PRICING.free
  const { toggle, isInStack } = useStack()
  const inStack = isInStack(slug)

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Link href={`/tools/${slug}`} className="block h-full group">
        <div className={cn(
          "relative h-full flex flex-col rounded-2xl transition-all duration-500",
          "bg-white/80 backdrop-blur-md border border-black/[0.06]",
          "hover:border-indigo-500/30 hover:shadow-[0_20px_50px_-12px_rgba(140,110,80,0.15)]"
        )}>
          {/* Shimmer & Background constraints */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4 flex-1">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                {/* Logo with Lens Effect */}
                <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-black/[0.02] border border-black/[0.04] group-hover:border-indigo-500/20 transition-colors">
                  <ToolLogo name={name} website={website} logoUrl={logoUrl} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold leading-tight truncate text-[#1C1611] tracking-tight group-hover:text-indigo-600 transition-colors">
                    {name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {isMadeInIndia && (
                      <span className="text-[9px] font-black tracking-widest text-[#D97706] uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                        🇮🇳 INDIA
                      </span>
                    )}
                    {(hasInrBilling || hasUpi) && (
                      <span className="text-[9px] font-bold text-[#7A6A57]/60 tracking-wider">
                        {hasInrBilling && <>&#8377; INR</>} {hasUpi && "· UPI"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggle({
                      slug, name, tagline,
                      website: website ?? null,
                      logoUrl: logoUrl ?? null,
                      pricingModel,
                      startingPriceUsd,
                      startingPriceInr,
                      categories
                    })
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    inStack 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                      : "bg-black/[0.04] text-[#7A6A57] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-transparent"
                  )}
                >
                  {inStack ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
                </button>
                
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] text-[#7A6A57] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 border border-transparent hover:bg-white hover:border-black/5 hover:shadow-sm">
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-xs leading-relaxed text-[#7A6A57] line-clamp-2 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              {tagline}
            </p>
          </div>

          {/* Footer Area */}
          <div className="mt-auto px-5 py-3.5 bg-black/[0.015] border-t border-black/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                style={{ background: p.bg, color: p.color, border: `1px solid ${p.color}20` }}
              >
                {p.label}
              </span>
              {categories[0] && (
                <span className="text-[10px] font-bold text-[#C4B0A0] uppercase tracking-wider hidden sm:inline">
                  {categories[0]}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/50 border border-black/[0.04] shadow-sm">
              <ChevronUp size={11} className="text-[#C4B0A0] group-hover:text-indigo-500 transition-colors" />
              <span className="text-[11px] font-black tabular-nums text-[#7A6A57]">
                {upvotes.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
