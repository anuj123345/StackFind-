/**
 * GET /api/founders/news
 * Fetches live AI news using Google News RSS.
 * Follows redirects + extracts og:image for each article.
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

const GOOGLE_NEWS_QUERIES = [
  "artificial+intelligence+startup+2025",
  "LLM+foundation+model+launch",
  "India+AI+startup+funding",
  "OpenAI+Anthropic+Google+DeepMind+news",
]

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

function extractSource(block: string): string {
  const m = /<source[^>]*>([^<]+)<\/source>/i.exec(block)
  return m ? m[1].trim() : "Google News"
}

function extractGoogleLink(block: string): string {
  const linkTag = /<link>([^<]+)<\/link>/i.exec(block)
  if (linkTag) return linkTag[1].trim()
  return extractTag(block, "guid")
}

// Follow Google News redirect → get real article URL
async function resolveUrl(googleUrl: string): Promise<string> {
  try {
    const res = await fetch(googleUrl, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StackFind/1.0)" },
      signal: AbortSignal.timeout(4000),
    })
    return res.url !== googleUrl ? res.url : googleUrl
  } catch {
    return googleUrl
  }
}

// Detect Google News / Google app icon URLs — these are not article images
function isGoogleIcon(url: string): boolean {
  return (
    url.includes("news.google.com") ||
    url.includes("lh3.googleusercontent.com") ||
    url.includes("googleusercontent.com/news") ||
    url.includes("/news-icon") ||
    url.includes("google.com/images")
  )
}

// Fetch first 12KB of article, extract og:image
async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const res = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StackFind/1.0)",
        "Range": "bytes=0-12288",
      },
      signal: AbortSignal.timeout(4000),
      redirect: "follow",
    })
    if (!res.ok) return null
    const html = await res.text()

    // og:image
    const og = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)
      ?? /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i.exec(html)
    if (og?.[1] && og[1].startsWith("http") && !isGoogleIcon(og[1])) return og[1]

    // twitter:image fallback
    const tw = /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i.exec(html)
      ?? /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i.exec(html)
    if (tw?.[1] && tw[1].startsWith("http") && !isGoogleIcon(tw[1])) return tw[1]

    return null
  } catch {
    return null
  }
}

async function fetchGoogleNews(q: string): Promise<Omit<NewsItem, "image">[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StackFind/1.0)" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items: Omit<NewsItem, "image">[] = []
    const itemRe = /<item>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemRe.exec(xml)) !== null && items.length < 6) {
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
  // 1. Fetch all RSS feeds in parallel
  const feedResults = await Promise.allSettled(
    GOOGLE_NEWS_QUERIES.map(q => fetchGoogleNews(q))
  )

  // 2. Dedupe by title
  const seen = new Set<string>()
  const raw = feedResults
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

  // 3. Resolve real URLs + fetch og:images in parallel (2s window each)
  const withImages: NewsItem[] = await Promise.all(
    raw.map(async (item) => {
      try {
        const realUrl = await resolveUrl(item.url)
        // If redirect didn't leave Google's domain, don't bother scraping — it'll return the Google News app icon
        const isStillGoogle = new URL(realUrl).hostname.includes("google.com")
        const image = isStillGoogle ? null : await fetchOgImage(realUrl)
        return { ...item, url: isStillGoogle ? item.url : realUrl, image }
      } catch {
        return { ...item, image: null }
      }
    })
  )

  return NextResponse.json({ items: withImages }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" },
  })
}
