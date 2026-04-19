"use client"

import { useState, useEffect, useCallback } from "react"
import type { FounderProfile } from "@/app/founders/page"

interface NewsItem {
  title: string
  url: string
  source: string
  published: string
  summary: string
  image?: string | null
}

interface Props {
  founders: FounderProfile[]
}

const LETTER_PALETTES = [
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DCFCE7", text: "#166534" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#075985" },
  { bg: "#FEF9C3", text: "#713F12" },
  { bg: "#F3E8FF", text: "#6B21A8" },
  { bg: "#FFEDD5", text: "#9A3412" },
]

function palette(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return LETTER_PALETTES[h % LETTER_PALETTES.length]
}

function FounderAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  const [failed, setFailed] = useState(false)
  const p = palette(name)

  if (avatar && !failed) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setFailed(true)}
        className="w-14 h-14 rounded-full object-cover"
        style={{ border: "2px solid rgba(140,110,80,0.1)" }}
      />
    )
  }

  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
      style={{ background: p.bg, color: p.text }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function FounderCard({ founder }: { founder: FounderProfile }) {
  return (
    <div className="card-bezel group">
      <div className="card-inner p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <FounderAvatar name={founder.name} avatar={founder.avatar} />
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold leading-tight text-[0.9375rem]"
              style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611" }}
            >
              {founder.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#7A6A57" }}>
              {founder.role}
            </p>
            <a
              href={founder.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold hover:underline"
              style={{ color: "#C4B0A0" }}
            >
              {founder.company} →
            </a>
          </div>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ background: "rgba(140,110,80,0.06)", color: "#C4B0A0" }}
          >
            {founder.city}
          </span>
        </div>

        {/* Bio */}
        <p className="text-xs leading-relaxed" style={{ color: "#7A6A57" }}>
          {founder.bio}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {founder.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(79,70,229,0.06)", color: "#4338CA" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Social links */}
        <div className="flex gap-3 pt-1">
          {founder.twitter && (
            <a
              href={`https://twitter.com/${founder.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium hover:underline flex items-center gap-1"
              style={{ color: "#7A6A57" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @{founder.twitter}
            </a>
          )}
          {founder.linkedin && (
            <a
              href={`https://linkedin.com/in/${founder.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium hover:underline flex items-center gap-1"
              style={{ color: "#7A6A57" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    const diff = Date.now() - d.getTime()
    const hours = Math.floor(diff / 3_600_000)
    if (hours < 1) return "just now"
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  } catch {
    return ""
  }
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-bezel group block"
    >
      <div className="card-inner p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(140,110,80,0.06)", color: "#C4B0A0" }}
          >
            {item.source}
          </span>
          {item.published && (
            <span className="text-[10px]" style={{ color: "#C4B0A0" }}>
              {timeAgo(item.published)}
            </span>
          )}
        </div>
        <h4
          className="font-semibold text-sm leading-snug group-hover:underline"
          style={{ color: "#1C1611" }}
        >
          {item.title}
        </h4>
        {item.summary && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#7A6A57" }}>
            {item.summary}
          </p>
        )}
      </div>
    </a>
  )
}

function NewsSkeletonCard() {
  return (
    <div className="card-bezel animate-pulse">
      <div className="card-inner p-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded-full" style={{ background: "rgba(140,110,80,0.1)" }} />
          <div className="h-4 w-12 rounded-full" style={{ background: "rgba(140,110,80,0.08)" }} />
        </div>
        <div className="h-3.5 rounded" style={{ width: "95%", background: "rgba(140,110,80,0.08)" }} />
        <div className="h-3.5 rounded" style={{ width: "75%", background: "rgba(140,110,80,0.06)" }} />
        <div className="h-3 rounded mt-1" style={{ width: "85%", background: "rgba(140,110,80,0.06)" }} />
        <div className="h-3 rounded" style={{ width: "60%", background: "rgba(140,110,80,0.05)" }} />
      </div>
    </div>
  )
}

export function FoundersClient({ founders }: Props) {
  const [tab, setTab] = useState<"founders" | "news">("founders")
  const [region, setRegion] = useState<"all" | "india" | "global">("all")
  const [news, setNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsFetched, setNewsFetched] = useState(false)

  const filteredFounders = founders.filter(f =>
    region === "all" ? true : f.region === region
  )

  const fetchNews = useCallback(async () => {
    setNewsLoading(true)
    try {
      const res = await fetch("/api/founders/news", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setNews(data.items ?? [])
      }
    } catch { /* keep empty */ }
    finally {
      setNewsLoading(false)
      setNewsFetched(true)
    }
  }, [])

  useEffect(() => {
    if (tab === "news" && !newsFetched) {
      fetchNews()
    }
  }, [tab, newsFetched, fetchNews])

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "rgba(140,110,80,0.06)" }}>
        {(["founders", "news"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={
              tab === t
                ? { background: "#1C1611", color: "#FAF7F2" }
                : { background: "transparent", color: "#7A6A57" }
            }
          >
            {t === "founders" ? `Founders (${founders.length})` : `Latest News${news.length > 0 ? ` (${news.length})` : ""}`}
          </button>
        ))}
      </div>

      {tab === "founders" && (
        <>
          {/* Region filter */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {([
              { key: "all", label: "All Founders" },
              { key: "india", label: "🇮🇳 India" },
              { key: "global", label: "🌍 Global" },
            ] as const).map(r => (
              <button
                key={r.key}
                onClick={() => setRegion(r.key)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={
                  region === r.key
                    ? { background: "#1C1611", color: "#FAF7F2" }
                    : { background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.1)" }
                }
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFounders.map(f => (
              <FounderCard key={f.slug} founder={f} />
            ))}
          </div>
        </>
      )}

      {tab === "news" && (
        <>
          {newsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => <NewsSkeletonCard key={i} />)}
            </div>
          ) : news.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#10b981" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#10b981" }} />
                </span>
                <span className="text-xs font-medium" style={{ color: "#7A6A57" }}>
                  {news.length} live stories from Google News
                </span>
                <button
                  onClick={() => { setNewsFetched(false); fetchNews() }}
                  className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                  style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57" }}
                >
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {news.map((item, i) => (
                  <NewsCard key={`${item.url}-${i}`} item={item} />
                ))}
              </div>
            </>
          ) : (
            <div
              className="rounded-2xl py-16 text-center"
              style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.1)" }}
            >
              <p className="text-2xl mb-2">📰</p>
              <p className="font-semibold mb-1" style={{ color: "#1C1611" }}>No stories fetched</p>
              <p className="text-sm mb-4" style={{ color: "#C4B0A0" }}>
                Google News RSS may be temporarily unavailable.
              </p>
              <button
                onClick={() => { setNewsFetched(false); fetchNews() }}
                className="text-sm font-semibold px-4 py-2 rounded-xl"
                style={{ background: "#1C1611", color: "#FAF7F2" }}
              >
                Try again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
