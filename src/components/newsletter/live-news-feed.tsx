"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, ExternalLink, Clock } from "lucide-react"

interface NewsItem {
  title: string
  url: string
  source: string
  published: string
  summary: string
  image: string | null
}

// Deterministic gradient per source name
function sourcePalette(source: string) {
  const palettes = [
    { from: "#667eea", to: "#764ba2" },
    { from: "#f093fb", to: "#f5576c" },
    { from: "#4facfe", to: "#00f2fe" },
    { from: "#43e97b", to: "#38f9d7" },
    { from: "#fa709a", to: "#fee140" },
    { from: "#a18cd1", to: "#fbc2eb" },
    { from: "#fccb90", to: "#d57eeb" },
    { from: "#a1c4fd", to: "#c2e9fb" },
  ]
  let h = 0
  for (let i = 0; i < source.length; i++) h = (h * 31 + source.charCodeAt(i)) >>> 0
  return palettes[h % palettes.length]
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

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.08)" }}>
      <div className="h-44" style={{ background: "rgba(140,110,80,0.08)" }} />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-20 rounded-full" style={{ background: "rgba(140,110,80,0.1)" }} />
        <div className="h-3.5 rounded" style={{ width: "95%", background: "rgba(140,110,80,0.08)" }} />
        <div className="h-3.5 rounded" style={{ width: "80%", background: "rgba(140,110,80,0.08)" }} />
        <div className="h-3.5 rounded" style={{ width: "55%", background: "rgba(140,110,80,0.06)" }} />
      </div>
    </div>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false)
  const age = timeAgo(item.published)
  const pal = sourcePalette(item.source)
  const showImg = item.image && !imgError

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(140,110,80,0.08)" }}
    >
      {/* Image / placeholder */}
      <div className="relative h-44 overflow-hidden shrink-0">
        {showImg ? (
          <img
            src={item.image!}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-end p-3"
            style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.to})` }}
          >
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)" }}
            >
              {item.source}
            </span>
          </div>
        )}

        {/* Source badge overlay on real images */}
        {showImg && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}>
            <span className="text-[10px] font-semibold text-white/90">{item.source}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Time */}
        {age && (
          <div className="flex items-center gap-1" style={{ color: "#C4B0A0" }}>
            <Clock size={9} />
            <span className="text-[10px]">{age}</span>
          </div>
        )}

        {/* Headline */}
        <h3
          className="font-bold text-sm leading-snug flex-1 group-hover:text-indigo-600 transition-colors"
          style={{ color: "#1C1611", lineHeight: "1.4" }}
        >
          {item.title}
        </h3>

        {/* Read link */}
        <div className="flex items-center gap-1 mt-1 pt-2" style={{ borderTop: "1px solid rgba(140,110,80,0.08)", color: "#C4B0A0" }}>
          <ExternalLink size={10} />
          <span className="text-[10px] font-medium group-hover:text-indigo-500 transition-colors">Read article</span>
        </div>
      </div>
    </a>
  )
}

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
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
            Live Feed
          </span>
          <h2
            className="font-black mt-0.5"
            style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", fontSize: "clamp(1.25rem, 3vw, 1.75rem)", color: "#1C1611" }}
          >
            AI News Right Now
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && !loading && (
            <span className="text-xs hidden sm:block" style={{ color: "#C4B0A0" }}>
              Updated {lastUpdatedLabel}
            </span>
          )}
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
      </div>

      {/* Live dot */}
      {!loading && news.length > 0 && (
        <div className="flex items-center gap-2 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#10b981" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#10b981" }} />
          </span>
          <span className="text-xs font-medium" style={{ color: "#7A6A57" }}>
            {news.length} stories · auto-refreshes every 5 min
          </span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : news.length === 0 ? (
        <div className="rounded-2xl py-16 text-center" style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.08)" }}>
          <p className="text-3xl mb-3">📡</p>
          <p className="font-semibold mb-1" style={{ color: "#1C1611" }}>No stories fetched</p>
          <p className="text-sm mb-4" style={{ color: "#C4B0A0" }}>Google News RSS may be temporarily unavailable.</p>
          <button onClick={() => fetchNews()} className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: "#1C1611", color: "#FAF7F2" }}>
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {news.map((item, i) => <NewsCard key={`${item.url}-${i}`} item={item} />)}
        </div>
      )}
    </div>
  )
}
