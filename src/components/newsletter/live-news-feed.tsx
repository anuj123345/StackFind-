"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw } from "lucide-react"

interface NewsItem {
  title: string
  url: string
  source: string
  published: string
  summary: string
  image: string | null
}

// Solid warm-tinted palette for placeholder backgrounds — no gradients
const PLACEHOLDER_PALETTES = [
  { bg: "#EDE8E1", text: "#8C7B6A" },
  { bg: "#E4E8EF", text: "#6A7A8C" },
  { bg: "#E3EDE5", text: "#6A8C72" },
  { bg: "#EDE3E1", text: "#8C6A6A" },
  { bg: "#E9E3ED", text: "#7A6A8C" },
  { bg: "#EDEBE1", text: "#8C8A6A" },
]
function placeholderPalette(source: string) {
  let h = 0
  for (let i = 0; i < source.length; i++) h = (h * 31 + source.charCodeAt(i)) >>> 0
  return PLACEHOLDER_PALETTES[h % PLACEHOLDER_PALETTES.length]
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch { return "" }
}

// ─── Placeholder (no gradient, no glassmorphism) ──────────────────────────────

function Placeholder({ source }: { source: string }) {
  const pal = placeholderPalette(source)
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: pal.bg }}>
      <span
        style={{
          fontFamily: "'Bricolage Grotesque Variable', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          color: pal.text,
          opacity: 0.35,
          letterSpacing: "-0.04em",
          userSelect: "none",
        }}
      >
        {source.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

// ─── Hero card (first story) ──────────────────────────────────────────────────

function HeroCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false)
  const age = timeAgo(item.published)
  const showImg = item.image && !imgError

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl overflow-hidden h-full"
      style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(140,110,80,0.1)" }}
    >
      <div className="overflow-hidden flex-shrink-0" style={{ height: 240 }}>
        {showImg ? (
          <img
            src={item.image!}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <Placeholder source={item.source} />
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#6366f1" }}
          >
            {item.source}
          </span>
          {age && (
            <>
              <span style={{ color: "rgba(196,176,160,0.5)" }}>·</span>
              <span className="text-[10px]" style={{ color: "#C4B0A0" }}>{age}</span>
            </>
          )}
        </div>
        <h2
          className="font-black leading-tight group-hover:text-[#6366f1] transition-colors duration-150"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "1.1875rem",
            color: "#1C1611",
            lineHeight: "1.3",
          }}
        >
          {item.title}
        </h2>
        {item.summary && (
          <p className="text-sm leading-relaxed line-clamp-2 flex-1" style={{ color: "#7A6A57" }}>
            {item.summary}
          </p>
        )}
      </div>
    </a>
  )
}

// ─── Side card (items 1 & 2, stacked) ────────────────────────────────────────

function SideCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false)
  const age = timeAgo(item.published)
  const showImg = item.image && !imgError

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3.5 rounded-xl p-3.5 transition-colors hover:bg-black/[0.02] flex-1"
      style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(140,110,80,0.1)" }}
    >
      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0">
        {showImg ? (
          <img
            src={item.image!}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Placeholder source={item.source} />
        )}
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: "#6366f1" }}>
            {item.source}
          </span>
          {age && (
            <span className="text-[9px] flex-shrink-0" style={{ color: "#C4B0A0" }}>{age}</span>
          )}
        </div>
        <h3
          className="text-[0.8125rem] font-bold leading-snug line-clamp-3 group-hover:text-[#6366f1] transition-colors"
          style={{ color: "#1C1611" }}
        >
          {item.title}
        </h3>
      </div>
    </a>
  )
}

// ─── Grid card (items 3+) ─────────────────────────────────────────────────────

function GridCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false)
  const age = timeAgo(item.published)
  const showImg = item.image && !imgError

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(140,110,80,0.1)" }}
    >
      <div className="overflow-hidden flex-shrink-0" style={{ height: 150 }}>
        {showImg ? (
          <img
            src={item.image!}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <Placeholder source={item.source} />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: "#6366f1" }}>
            {item.source}
          </span>
          {age && (
            <>
              <span style={{ color: "rgba(196,176,160,0.4)" }}>·</span>
              <span className="text-[9px] flex-shrink-0" style={{ color: "#C4B0A0" }}>{age}</span>
            </>
          )}
        </div>
        <h3
          className="font-bold text-sm leading-snug group-hover:text-[#6366f1] transition-colors"
          style={{ color: "#1C1611", lineHeight: "1.4" }}
        >
          {item.title}
        </h3>
      </div>
    </a>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.08)" }}>
      <div style={{ height: 240, background: "rgba(140,110,80,0.07)" }} />
      <div className="p-5 space-y-3">
        <div className="h-2.5 w-24 rounded-full" style={{ background: "rgba(140,110,80,0.08)" }} />
        <div className="h-5 rounded" style={{ width: "90%", background: "rgba(140,110,80,0.08)" }} />
        <div className="h-5 rounded" style={{ width: "70%", background: "rgba(140,110,80,0.06)" }} />
        <div className="h-3.5 rounded mt-2" style={{ width: "95%", background: "rgba(140,110,80,0.05)" }} />
        <div className="h-3.5 rounded" style={{ width: "80%", background: "rgba(140,110,80,0.05)" }} />
      </div>
    </div>
  )
}

function SideSkeleton() {
  return (
    <div className="rounded-xl p-3.5 flex gap-3.5 animate-pulse flex-1" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.08)" }}>
      <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0" style={{ background: "rgba(140,110,80,0.07)" }} />
      <div className="flex-1 space-y-2 justify-center flex flex-col">
        <div className="h-2 w-16 rounded-full" style={{ background: "rgba(140,110,80,0.08)" }} />
        <div className="h-3 rounded" style={{ width: "95%", background: "rgba(140,110,80,0.07)" }} />
        <div className="h-3 rounded" style={{ width: "75%", background: "rgba(140,110,80,0.06)" }} />
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.08)" }}>
      <div style={{ height: 150, background: "rgba(140,110,80,0.07)" }} />
      <div className="p-4 space-y-2">
        <div className="h-2.5 w-20 rounded-full" style={{ background: "rgba(140,110,80,0.08)" }} />
        <div className="h-3.5 rounded" style={{ width: "95%", background: "rgba(140,110,80,0.07)" }} />
        <div className="h-3.5 rounded" style={{ width: "75%", background: "rgba(140,110,80,0.06)" }} />
      </div>
    </div>
  )
}

// ─── Main feed ────────────────────────────────────────────────────────────────

export function LiveNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchNews = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch("/api/founders/news", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setNews(data.items ?? [])
        setLastUpdated(new Date())
      }
    } catch { /* keep existing */ }
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
    const id = setInterval(() => fetchNews(true), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchNews])

  const lastUpdatedLabel = lastUpdated
    ? (() => {
        const m = Math.floor((Date.now() - lastUpdated.getTime()) / 60_000)
        return m < 1 ? "just now" : `${m}m ago`
      })()
    : ""

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">

      {/* Feed header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {!loading && news.length > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#10b981" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#10b981" }} />
            </span>
          )}
          <span className="text-xs font-medium" style={{ color: "#7A6A57" }}>
            {loading ? "Loading stories…" : `${news.length} stories`}
          </span>
          {lastUpdated && !loading && (
            <span className="text-xs hidden sm:block" style={{ color: "#C4B0A0" }}>
              · updated {lastUpdatedLabel}
            </span>
          )}
        </div>
        <button
          onClick={() => fetchNews(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40"
          style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.1)" }}
        >
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2"><HeroSkeleton /></div>
            <div className="flex flex-col gap-4">
              <SideSkeleton />
              <SideSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <GridSkeleton key={i} />)}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && news.length === 0 && (
        <div
          className="rounded-2xl py-16 text-center"
          style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.08)" }}
        >
          <p className="text-3xl mb-3">📡</p>
          <p className="font-semibold mb-1" style={{ color: "#1C1611" }}>No stories right now</p>
          <p className="text-sm mb-4" style={{ color: "#C4B0A0" }}>Google News RSS may be temporarily unavailable.</p>
          <button
            onClick={() => fetchNews()}
            className="text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: "#1C1611", color: "#FAF7F2" }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Editorial layout */}
      {!loading && news.length > 0 && (
        <>
          {/* Row 1: hero (2/3) + 2 side cards (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <HeroCard item={news[0]} />
            </div>
            <div className="flex flex-col gap-4">
              {news[1] && <SideCard item={news[1]} />}
              {news[2] && <SideCard item={news[2]} />}
            </div>
          </div>

          {/* Section label */}
          {news.length > 3 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[0.6875rem] font-semibold tracking-[0.13em] uppercase" style={{ color: "#C4B0A0" }}>
                More stories
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(140,110,80,0.1)" }} />
            </div>
          )}

          {/* Row 2+: standard grid */}
          {news.length > 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {news.slice(3).map((item, i) => (
                <GridCard key={`${item.url}-${i}`} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
