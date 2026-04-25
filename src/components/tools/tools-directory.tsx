"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, SlidersHorizontal, X, Lock, Sparkles } from "lucide-react"
import { ToolCard } from "@/components/tool-card"
import type { ToolWithCategoryNames } from "@/lib/queries"
import type { Category } from "@/types/database"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ToolsDirectoryProps {
  tools: ToolWithCategoryNames[]
  categories: Category[]
  initialSearch?: string
  initialCategory?: string
  initialPricing?: string
  initialIndia?: boolean
  isAuthenticated?: boolean
  totalCount?: number
}

const PRICING_OPTIONS = [
  { value: "",            label: "Any Price" },
  { value: "free",        label: "Free" },
  { value: "freemium",    label: "Freemium" },
  { value: "paid",        label: "Paid" },
  { value: "open_source", label: "Open Source" },
]

export function ToolsDirectory({
  tools,
  categories,
  initialSearch = "",
  initialCategory = "",
  initialPricing = "",
  initialIndia = false,
  isAuthenticated = false,
  totalCount = 0,
}: ToolsDirectoryProps) {
  const [search, setSearch]     = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [pricing, setPricing]   = useState(initialPricing)
  const [indiaOnly, setIndia]   = useState(initialIndia)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search)    params.set("q", search)
    if (category)  params.set("category", category)
    if (pricing)   params.set("pricing", pricing)
    if (indiaOnly) params.set("india", "1")
    const qs = params.toString()
    window.history.replaceState(null, "", qs ? `/tools?${qs}` : "/tools")
  }, [search, category, pricing, indiaOnly])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return tools.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) && !t.tagline.toLowerCase().includes(q)) return false
      if (category && !t.categoryNames.some(c => {
        const asSlug = c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        return asSlug === category
      })) return false
      if (pricing && t.pricing_model !== pricing) return false
      if (indiaOnly && !t.is_made_in_india) return false
      return true
    })
  }, [tools, search, category, pricing, indiaOnly])

  const hasFilters = !!(search || category || pricing || indiaOnly)
  const activeFilterCount = [search, category, pricing, indiaOnly].filter(Boolean).length
  const VISIBLE_COUNT = 8
  const lockedCount = totalCount - VISIBLE_COUNT

  function clearAll() {
    setSearch("")
    setCategory("")
    setPricing("")
    setIndia(false)
  }

  return (
    <div className="space-y-10">
      {/* ── Cinematic Command Strip ────────────────────────────────────── */}
      <div className="sticky top-24 z-40 px-2 sm:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Outer Glass Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-indigo-500/20 rounded-[28px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className={cn(
              "relative flex flex-col gap-2 p-2 rounded-[24px]",
              "bg-white/80 backdrop-blur-xl border border-black/[0.08] shadow-2xl shadow-black/[0.05]",
              "transition-all duration-500"
            )}>
              <div className="flex items-center gap-2">
                {/* Search Interaction */}
                <div className="flex-1 flex items-center gap-3 px-4 h-12 rounded-2xl bg-black/[0.03] border border-black/[0.03] focus-within:bg-white focus-within:border-indigo-500/30 focus-within:shadow-sm transition-all duration-300">
                  <Search size={16} className={cn("transition-colors duration-300", search ? "text-indigo-500" : "text-[#C4B0A0]")} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Discover AI native tools..."
                    className="flex-1 bg-transparent outline-none text-[0.9375rem] font-medium text-[#1C1611] placeholder:text-[#C4B0A0]"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                      <X size={14} className="text-[#C4B0A0]" />
                    </button>
                  )}
                </div>

                {/* Filter Trigger */}
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  className={cn(
                    "flex items-center gap-2.5 px-5 h-12 rounded-2xl font-bold text-[0.875rem] transition-all duration-300",
                    filtersOpen 
                      ? "bg-[#1C1611] text-white shadow-lg" 
                      : hasFilters 
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        : "bg-black/[0.03] text-[#7A6A57] hover:bg-black/[0.06]"
                  )}
                >
                  <SlidersHorizontal size={14} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Refine</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center -mr-1 shadow-sm">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Expanded Filter Panel */}
              <AnimatePresence>
                {filtersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-2 space-y-6">
                      <div className="h-[1px] bg-black/[0.06]" />
                      
                      {/* Categories section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4B0A0]">Directory Categories</h4>
                          {category && (
                            <button onClick={() => setCategory("")} className="text-[10px] font-bold text-indigo-500 hover:underline">Reset</button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {categories.map(cat => {
                            const val = cat.slug
                            const active = category === val
                            return (
                              <button
                                key={cat.slug}
                                onClick={() => setCategory(active ? "" : val)}
                                className={cn(
                                  "text-[0.8125rem] px-4 py-2 rounded-xl font-bold transition-all duration-300",
                                  active 
                                    ? "bg-indigo-600 text-white shadow-md scale-[1.05]" 
                                    : "bg-black/[0.03] text-[#7A6A57] hover:bg-black/[0.06] hover:text-[#1C1611]"
                                )}
                              >
                                {cat.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Pricing & India Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4B0A0] mb-3">Pricing Models</h4>
                          <div className="flex flex-wrap gap-2">
                            {PRICING_OPTIONS.map(opt => {
                              const active = pricing === opt.value
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => setPricing(opt.value)}
                                  className={cn(
                                    "text-[0.8125rem] px-4 py-2 rounded-xl font-bold transition-all duration-300",
                                    active 
                                      ? "bg-indigo-600 text-white shadow-md" 
                                      : "bg-black/[0.03] text-[#7A6A57] hover:bg-black/[0.06]"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col justify-end">
                          <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">🇮🇳</div>
                              <div>
                                <p className="text-sm font-bold text-[#1C1611]">Made in India</p>
                                <p className="text-[10px] text-[#7A6A57]">Tools built by Indian founders</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setIndia(v => !v)}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-500 flex items-center p-1",
                                indiaOnly ? "bg-amber-500" : "bg-black/[0.08]"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform duration-500 shadow-sm",
                                indiaOnly ? "translate-x-6" : "translate-x-0"
                              )} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center pt-2">
                        <button
                          onClick={clearAll}
                          className="text-[11px] font-bold text-[#C4B0A0] hover:text-indigo-500 transition-colors uppercase tracking-widest flex items-center gap-2"
                        >
                          <RotateCcw size={10} /> Clear all filters
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results Summary ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-sm font-medium text-[#7A6A57]">
            Showing <span className="text-[#1C1611] font-black">{isAuthenticated ? filtered.length : totalCount}</span> tools
            {hasFilters && " matching your criteria"}
          </p>
        </div>
        {!isAuthenticated && (
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
            <Lock size={10} /> {lockedCount} EXCLUSIVE TOOLS
          </div>
        )}
      </div>

      {/* ── The Refractive Grid ─────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(isAuthenticated ? filtered : filtered.slice(0, VISIBLE_COUNT)).map(tool => (
              <ToolCard
                key={tool.slug}
                name={tool.name}
                slug={tool.slug}
                tagline={tool.tagline}
                website={tool.website}
                logoUrl={tool.logo_url ?? undefined}
                pricingModel={tool.pricing_model}
                upvotes={tool.upvotes}
                isMadeInIndia={tool.is_made_in_india}
                hasInrBilling={tool.has_inr_billing}
                hasUpi={tool.has_upi}
                categories={tool.categoryNames}
                startingPriceUsd={tool.starting_price_usd}
                startingPriceInr={tool.starting_price_inr}
              />
            ))}
          </div>

          {/* Cinematic Unlock Wall */}
          {!isAuthenticated && lockedCount > 0 && (
            <div className="relative mt-8">
              {/* Blurred Background Preview */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-40 blur-xl pointer-events-none select-none grayscale-[0.5]"
                aria-hidden
              >
                {filtered.slice(VISIBLE_COUNT, VISIBLE_COUNT + 4).map(tool => (
                  <div key={tool.slug} className="h-48 bg-white/20 rounded-2xl border border-white" />
                ))}
              </div>

              {/* Glassmorphic CTA Card */}
              <div className="absolute inset-0 flex items-center justify-center -top-20 z-[60]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-md w-full mx-4 p-8 rounded-[32px] bg-white border border-black/[0.08] shadow-[0_32px_120px_-20px_rgba(140,110,80,0.3)] text-center relative overflow-hidden"
                >
                  {/* Decorative background glow */}
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
                      <Lock size={24} className="text-white" />
                    </div>
                    
                    <h2 className="font-display text-2xl font-black text-[#1C1611] mb-3 leading-tight tracking-tight">
                      Access {lockedCount}+ Curated Tools
                    </h2>
                    <p className="text-[0.9375rem] text-[#7A6A57] mb-8 leading-relaxed px-4">
                      Join 2,500+ Indian founders unlocking tax-compliant SaaS stacks with INR pricing and GST inputs.
                    </p>

                    <div className="space-y-4">
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-[1rem] bg-[#1C1611] text-white hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      >
                        Unlock Directory <Sparkles size={16} className="text-indigo-400" />
                      </Link>
                      <p className="text-[10px] font-bold text-[#C4B0A0] uppercase tracking-widest">
                        Free access forever · 60s setup
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center mx-auto mb-6">
            <Search size={24} className="text-[#C4B0A0]" />
          </div>
          <h3 className="font-display text-xl font-black text-[#1C1611] mb-2">No matching tools</h3>
          <p className="text-[#7A6A57] mb-8 max-w-xs mx-auto">We couldn't find anything matching your current filters. Try broader terms.</p>
          <button
            onClick={clearAll}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  )
}

function RotateCcw({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}
