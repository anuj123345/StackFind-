/**
 * GET /api/founders/news
 * Fetches live AI news using Bing News RSS.
 * Provides reliable thumbnails and clean article URLs.
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
  image: string | null
}

const BING_NEWS_QUERIES = [
  "artificial+intelligence+startup+2026",
  "LLM+foundation+model+launch",
  "India+AI+startup+funding",
  "OpenAI+Anthropic+Google+DeepMind+news",
]

const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

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

async function fetchBingNews(q: string): Promise<NewsItem[]> {
  try {
    const url = `https://www.bing.com/news/search?q=${q}&format=rss`
    const res = await fetch(url, {
      headers: { "User-Agent": CHROME_UA },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items: NewsItem[] = []
    const itemRe = /<item>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemRe.exec(xml)) !== null && items.length < 10) {
      const block = match[1]
      const title = decodeEntities(extractTag(block, "title"))
      const bingLink = extractTag(block, "link")
      const published = extractTag(block, "pubDate")
      const description = decodeEntities(extractTag(block, "description"))
      
      // Extract source name (Bing uses <News:Source>)
      const sourceMatch = /<News:Source>([^<]+)<\/News:Source>/i.exec(block)
      const source = sourceMatch ? sourceMatch[1].trim() : "Bing News"

      // Extract thumbnail
      const imageMatch = /<News:Image>([^<]+)<\/News:Image>/i.exec(block)
      const image = imageMatch ? imageMatch[1].trim().replace(/&amp;/g, "&") : null

      if (!title || !bingLink) continue

      // Extract real URL from Bing click link
      let realUrl = bingLink
      try {
        const u = new URL(bingLink.replace(/&amp;/g, "&"))
        const p = new URLSearchParams(u.search)
        if (p.has("url")) realUrl = p.get("url")!
      } catch {}

      items.push({ 
        title, 
        url: realUrl, 
        source, 
        published, 
        summary: description, 
        image 
      })
    }

    return items
  } catch {
    return []
  }
}

export async function GET() {
  // 1. Fetch all RSS feeds in parallel
  const feedResults = await Promise.allSettled(
    BING_NEWS_QUERIES.map(q => fetchBingNews(q))
  )

  // 2. Dedupe by title
  const seen = new Set<string>()
  const items = feedResults
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
    .slice(0, 16)

  return NextResponse.json({ items }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
  })
}
