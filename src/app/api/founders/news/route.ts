/**
 * GET /api/founders/news
 * Fetches live AI news using Google News RSS search — always reachable from Vercel.
 * Cached for 1 hour.
 */

import { NextResponse } from "next/server"

export const revalidate = 3600

export interface NewsItem {
  title: string
  url: string
  source: string
  published: string
  summary: string
}

// Google News RSS — reliable from any server, no API key needed
const GOOGLE_NEWS_QUERIES = [
  { q: "artificial+intelligence+startup+2025", label: "AI Startups" },
  { q: "LLM+foundation+model+launch", label: "AI Models" },
  { q: "India+AI+startup+funding", label: "India AI" },
  { q: "OpenAI+Anthropic+Google+DeepMind+news", label: "AI Labs" },
]

function googleNewsUrl(q: string) {
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/<[^>]+>/g, "").trim()
}

function extractTag(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, "i").exec(xml)
  if (cdata) return cdata[1].trim()
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml)
  if (plain) return plain[1].trim()
  return ""
}

// Google News wraps source in <source url="...">Source Name</source>
function extractSource(block: string): string {
  const m = /<source[^>]*>([^<]+)<\/source>/i.exec(block)
  return m ? m[1].trim() : "Google News"
}

// Google News links are redirects — extract the real URL from the href
function extractGoogleLink(block: string): string {
  // <link> tag in Google News RSS comes right after </title> as plain text
  const linkTag = /<link>([^<]+)<\/link>/i.exec(block)
  if (linkTag) return linkTag[1].trim()
  // fallback: guid
  const guid = extractTag(block, "guid")
  return guid || ""
}

async function fetchGoogleNews(q: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(googleNewsUrl(q), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StackFind/1.0)" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items: NewsItem[] = []
    const itemRe = /<item>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemRe.exec(xml)) !== null && items.length < 8) {
      const block = match[1]
      const title = decodeEntities(extractTag(block, "title"))
      const url = extractGoogleLink(block)
      const published = extractTag(block, "pubDate")
      const source = extractSource(block)

      if (!title || !url) continue
      items.push({ title, url, source, published, summary: "" })
    }

    return items
  } catch {
    return []
  }
}

export async function GET() {
  const results = await Promise.allSettled(
    GOOGLE_NEWS_QUERIES.map(({ q }) => fetchGoogleNews(q))
  )

  // Dedupe by title
  const seen = new Set<string>()
  const all: NewsItem[] = results
    .flatMap(r => r.status === "fulfilled" ? r.value : [])
    .filter(item => {
      const key = item.title.toLowerCase().slice(0, 60)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => {
      const da = a.published ? new Date(a.published).getTime() : 0
      const db = b.published ? new Date(b.published).getTime() : 0
      return db - da
    })
    .slice(0, 20)

  return NextResponse.json({ items: all }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
  })
}
