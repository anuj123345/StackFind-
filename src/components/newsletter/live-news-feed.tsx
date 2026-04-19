"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, ExternalLink, Clock } from "lucide-react"

interface NewsItem {
  title: string
  url: string
  source: string
  published: string
  summary: string
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  } catch {
    return ""
  }
}

function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.08)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 w-20 rounded-full" style={{ background: "rgba(140,110,80,0.1)" }} />
        <div className="h-4 w-12 rounded-full" style={{ background: "rgba(140,110,80,0.06)" }} />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 rounded" style={{ width: "95%", background: "rgba(140,110,80,0.08)" }} />
        <div className="h-3.5 rounded" style={{ width: "80%", background: "rgba(140,110,80,0.08)" }} />
        <div className="h-3.5 rounded" style={{ width: "60%", background: "rgba(140,110,80,0.06)" }} />
      </div>
    </div>
  )
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const age = timeAgo(item.published)

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl p-5 transition-all duration-200 hover:shadow-sm"
      style={{
        background: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(140,110,80,0.08)",
      }}
    >
      {/* Source + time row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full truncate max-w-[160px]"
          style={{ background: "rgba(140,110,80,0.06)", color: "#C4B0A0" }}
        >
          {item.source}
        </span>
        {age && (
          <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: "#C4B0A0" }}>
            <Clock size={9} />
            {age}
          </span>
        )}
      </div>

      {/* Headline */}
      <h3
        className="font-semibold text-sm leading-snug mb-2 group-hover:underline underline-offset-2"
        style={{ color: "#1C1611", lineHeight: "1.45" }}
      >
        {item.title}
      </h3>

      {/* Read more */}
      <div className="flex items-center gap-1 mt-3" style={{ color: "#C4B0A0" }}>
        <ExternalLink size={10} />
        <span className="text-[10px] font-medium">Read article</span>
      </div>

      {/* Subtle index number */}
      <div
        className="absolute top-4 right-4 text-[10px] font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "#C4B0A0" }}
      >
        #{index + 1}
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
    } catch {
      // keep existing news on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchNews(true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNews])

  function formatLastUpdated() {
    if (!lastUpdated) return ""
    const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60_000)
    if (mins < 1) return "just now"
    return `${mins}m ago`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "#C4B0A0" }}
          >
            Live Feed
          </span>
          <h2
            className="font-black mt-1"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              color: "#1C1611",
            }}
          >
            AI News Right Now
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && !loading && (
            <span className="text-xs hidden sm:block" style={{ color: "#C4B0A0" }}>
              Updated {formatLastUpdated()}
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

      {/* Live indicator */}
      {!loading && news.length > 0 && (
        <div className="flex items-center gap-2 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#10b981" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#10b981" }} />
          </span>
          <span className="text-xs font-medium" style={{ color: "#7A6A57" }}>
            {news.length} stories · refreshes every 5 minutes
          </span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <NewsCardSkeleton key={i} />)}
        </div>
      ) : news.length === 0 ? (
        <div
          className="rounded-2xl py-16 text-center"
          style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.08)" }}
        >
          <p className="text-3xl mb-3">📡</p>
          <p className="font-semibold mb-1" style={{ color: "#1C1611" }}>No stories fetched</p>
          <p className="text-sm mb-4" style={{ color: "#C4B0A0" }}>Google News RSS may be temporarily unavailable.</p>
          <button
            onClick={() => fetchNews()}
            className="text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: "#1C1611", color: "#FAF7F2" }}
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 relative">
          {news.map((item, i) => (
            <div key={`${item.url}-${i}`} className="relative">
              <NewsCard item={item} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
