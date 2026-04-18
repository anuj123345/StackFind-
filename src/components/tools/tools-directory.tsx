"use client"
// v2
import { useState, useMemo, useEffect } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { ToolCard } from "@/components/tool-card"
import type { ToolWithCategoryNames } from "@/lib/queries"
import type { Category } from "@/types/database"

interface ToolsDirectoryProps {
  tools: ToolWithCategoryNames[]
  categories: Category[]
  initialSearch?: string
  initialCategory?: string
  initialPricing?: string
  initialIndia?: boolean
}

const PRICING_OPTIONS = [
  { value: "",            label: "Any price" },
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
}: ToolsDirectoryProps) {
  const [search, setSearch]     = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [pricing, setPricing]   = useState(initialPricing)
  const [indiaOnly, setIndia]   = useState(initialIndia)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Sync state → URL without triggering a Next.js navigation
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
        // Match by slug: "Made in India" → "made-in-india", or direct slug match
        const asSlug = c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        return asSlug === category
      })) return false
      if (pricing && t.pricing_model !== pricing) return false
      if (indiaOnly && !t.is_made_in_india) return false
      return true
    })
  }, [tools, search, category, pricing, indiaOnly])

  const hasFilters = !!(search || category || pricing || indiaOnly)

  function clearAll() {
    setSearch("")
    setCategory("")
    setPricing("")
    setIndia(false)
  }

  return (
    <div>
      {/* Search + filter bar */}
      <div className="mb-8 space-y-3">

        {/* Search row */}
        <div className="flex gap-2">
          <div className="card-bezel flex-1 !p-[2px]">
            <div className="card-inner flex items-center gap-2.5 px-4 py-2.5">
              <Search size={15} style={{ color: "#C4B0A0" }} className="flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools…"
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "#1C1611" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="flex-shrink-0">
                  <X size={13} style={{ color: "#C4B0A0" }} />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="card-bezel flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
            style={{
              background: (filtersOpen || hasFilters) ? "rgba(99,102,241,0.06)" : undefined,
              outline: (filtersOpen || hasFilters) ? "1.5px solid rgba(99,102,241,0.2)" : undefined,
            }}
          >
            <SlidersHorizontal size={14} style={{ color: hasFilters ? "#6366f1" : "#7A6A57" }} />
            <span className="text-sm font-medium hidden sm:inline" style={{ color: hasFilters ? "#6366f1" : "#7A6A57" }}>
              Filters{hasFilters ? " ·" : ""}
            </span>
            {hasFilters && (
              <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: "#6366f1", color: "#fff" }}>
                {[search, category, pricing, indiaOnly].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div
            className="rounded-2xl p-4 space-y-4"
            style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            {/* Categories */}
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2.5" style={{ color: "#C4B0A0" }}>
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory("")}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-150 font-medium"
                  style={{
                    background: !category ? "rgba(99,102,241,0.1)" : "rgba(140,110,80,0.06)",
                    color: !category ? "#6366f1" : "#7A6A57",
                    outline: !category ? "1px solid rgba(99,102,241,0.2)" : "none",
                  }}
                >
                  All
                </button>
                {categories.map(cat => {
                  const val = cat.slug
                  const active = category === val
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => setCategory(active ? "" : val)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all duration-150 font-medium"
                      style={{
                        background: active ? "rgba(99,102,241,0.1)" : "rgba(140,110,80,0.06)",
                        color: active ? "#6366f1" : "#7A6A57",
                        outline: active ? "1px solid rgba(99,102,241,0.2)" : "none",
                      }}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-2.5" style={{ color: "#C4B0A0" }}>
                Pricing
              </p>
              <div className="flex flex-wrap gap-2">
                {PRICING_OPTIONS.map(opt => {
                  const active = pricing === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setPricing(opt.value)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all duration-150 font-medium"
                      style={{
                        background: active ? "rgba(99,102,241,0.1)" : "rgba(140,110,80,0.06)",
                        color: active ? "#6366f1" : "#7A6A57",
                        outline: active ? "1px solid rgba(99,102,241,0.2)" : "none",
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* India toggle + clear */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setIndia(v => !v)}
                className="flex items-center gap-2.5 text-sm font-medium transition-all duration-150"
                style={{ color: indiaOnly ? "#D97706" : "#7A6A57" }}
              >
                <div
                  className="w-8 rounded-full relative transition-all duration-200 flex items-center"
                  style={{ height: "18px",
                    background: indiaOnly ? "rgba(217,119,6,0.15)" : "rgba(140,110,80,0.12)",
                    padding: "2px",
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full transition-all duration-200 flex-shrink-0"
                    style={{
                      background: indiaOnly ? "#D97706" : "#C4B0A0",
                      transform: indiaOnly ? "translateX(14px)" : "translateX(0)",
                    }}
                  />
                </div>
                🇮🇳 Made in India only
              </button>

              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-xs font-medium flex items-center gap-1 transition-colors"
                  style={{ color: "#C4B0A0" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#7A6A57")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#C4B0A0")}
                >
                  <X size={11} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active filter chips (collapsed state) */}
        {!filtersOpen && hasFilters && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
                "{search}"
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
                {categories.find(c => c.slug === category)?.name ?? category}
                <button onClick={() => setCategory("")}><X size={10} /></button>
              </span>
            )}
            {pricing && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
                {PRICING_OPTIONS.find(p => p.value === pricing)?.label}
                <button onClick={() => setPricing("")}><X size={10} /></button>
              </span>
            )}
            {indiaOnly && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: "rgba(217,119,6,0.08)", color: "#D97706" }}>
                🇮🇳 Made in India
                <button onClick={() => setIndia(false)}><X size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm" style={{ color: "#C4B0A0" }}>
          <span className="font-semibold tabular-nums" style={{ color: "#7A6A57" }}>{filtered.length}</span>
          {" "}tool{filtered.length !== 1 ? "s" : ""}
          {hasFilters && " found"}
        </p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filtered.map(tool => (
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
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl py-16 text-center"
          style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.1)" }}
        >
          <p className="font-semibold mb-1" style={{ color: "#1C1611" }}>No tools found</p>
          <p className="text-sm mb-5" style={{ color: "#C4B0A0" }}>Try adjusting your filters or search term.</p>
          <button
            onClick={clearAll}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-150"
            style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
