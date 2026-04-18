/**
 * GET /api/founders/news
 * Fetches AI/startup news from Indian tech RSS feeds.
 * Cached for 1 hour on Vercel edge.
 */

import { NextResponse } from "next/server"

export const revalidate = 3600 // 1 hour cache

interface NewsItem {
  title: string
  url: string
  source: string
  published: string
  summary: string
}

const FEEDS = [
  { url: "https://yourstory.com/feed", source: "YourStory" },
  { url: "https://inc42.com/feed/", source: "Inc42" },
  { url: "https://entrackr.com/feed/", source: "Entrackr" },
]

// Keywords to filter relevant AI/startup news
const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "deep learning",
  "llm", "chatbot", "startup", "funding", "raises", "series",
  "sarvam", "krutrim", "yellow.ai", "haptik", "sprinklr", "zoho",
  "observe.ai", "uniphore", "leena", "vernacular", "skit",
  "bhavish", "vivek", "raghu", "ragy", "aakrit", "sridhar",
  "generative", "foundation model", "language model",
]

async function parseFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "StackFind/1.0 RSS Reader" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const xml = await res.text()

    // Simple XML parsing — extract <item> blocks
    const items: NewsItem[] = []
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(xml)) !== null && items.length < 30) {
      const block = match[1]
      const title = decode(extract(block, "title"))
      const link = extract(block, "link") || extract(block, "guid")
      const pubDate = extract(block, "pubDate") || extract(block, "dc:date") || ""
      const desc = decode(
        extract(block, "description") ||
        extract(block, "content:encoded") || ""
      ).slice(0, 300)

      if (!title || !link) continue

      // Filter for AI-related content
      const combined = `${title} ${desc}`.toLowerCase()
      if (!AI_KEYWORDS.some(kw => combined.includes(kw))) continue

      items.push({
        title,
        url: link.trim(),
        source,
        published: pubDate,
        summary: desc.replace(/<[^>]+>/g, "").trim().slice(0, 200),
      })
    }

    return items
  } catch {
    return []
  }
}

function extract(xml: string, tag: string): string {
  // Try CDATA first
  const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i")
  const cdataMatch = cdataRe.exec(xml)
  if (cdataMatch) return cdataMatch[1].trim()

  // Plain content
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
  const plainMatch = plainRe.exec(xml)
  if (plainMatch) return plainMatch[1].trim()

  // Self-closing / just after tag (for <link>)
  const afterRe = new RegExp(`<${tag}[^/]*\\/?>([^<]+)`, "i")
  const afterMatch = afterRe.exec(xml)
  if (afterMatch) return afterMatch[1].trim()

  return ""
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/<[^>]+>/g, "")
}

export async function GET() {
  const results = await Promise.allSettled(
    FEEDS.map(f => parseFeed(f.url, f.source))
  )

  const all: NewsItem[] = results
    .flatMap(r => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => {
      const da = a.published ? new Date(a.published).getTime() : 0
      const db_ = b.published ? new Date(b.published).getTime() : 0
      return db_ - da
    })
    .slice(0, 20)

  return NextResponse.json({ items: all }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" }
  })
}
