/**
 * GET /api/newsletter/send
 *
 * Weekly digest cron — fetches real AI news + newest tools, emails all active subscribers.
 * Vercel Cron: every Monday at 9 AM UTC
 * Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

function serviceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── News fetching ────────────────────────────────────────────────────────────

const AI_NEWS_FEEDS = [
  { url: "https://feeds.feedburner.com/venturebeat/SZYF", source: "VentureBeat AI" },
  { url: "https://techcrunch.com/feed/", source: "TechCrunch" },
  { url: "https://www.technologyreview.com/feed/", source: "MIT Tech Review" },
  { url: "https://yourstory.com/feed", source: "YourStory" },
  { url: "https://inc42.com/feed/", source: "Inc42" },
]

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "llm", "chatgpt", "claude",
  "gemini", "gpt", "openai", "anthropic", "deepmind", "meta ai", "mistral",
  "generative", "foundation model", "language model", "neural", "startup", "funding",
]

interface NewsItem {
  title: string
  url: string
  source: string
  summary: string
}

function extractXml(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, "i").exec(xml)
  if (cdata) return cdata[1].trim()
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml)
  if (plain) return plain[1].replace(/<[^>]+>/g, "").trim()
  return ""
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/<[^>]+>/g, "").trim()
}

async function fetchFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "StackFind-Newsletter/1.0" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const xml = await res.text()
    const items: NewsItem[] = []
    const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi
    let match: RegExpExecArray | null

    while ((match = itemRe.exec(xml)) !== null && items.length < 15) {
      const block = match[1]
      const title = decodeEntities(extractXml(block, "title"))
      const link = extractXml(block, "link") || extractXml(block, "guid")
      const desc = decodeEntities(extractXml(block, "description") || extractXml(block, "content:encoded"))

      if (!title || !link) continue

      const combined = `${title} ${desc}`.toLowerCase()
      if (!AI_KEYWORDS.some(kw => combined.includes(kw))) continue

      items.push({ title, url: link.trim(), source, summary: desc.slice(0, 160) })
    }
    return items
  } catch {
    return []
  }
}

async function getAINews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    AI_NEWS_FEEDS.map(f => fetchFeed(f.url, f.source))
  )
  return results
    .flatMap(r => r.status === "fulfilled" ? r.value : [])
    .slice(0, 8)
}

// ─── Tools fetching ───────────────────────────────────────────────────────────

interface ToolItem {
  name: string
  tagline: string
  slug: string
  website: string | null
  pricing_model: string
  upvotes: number
}

async function getNewTools(supabase: ReturnType<typeof serviceClient>): Promise<ToolItem[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from("tools")
    .select("name, tagline, slug, website, pricing_model, upvotes")
    .eq("status", "approved")
    .gte("approved_at", since)
    .order("upvotes", { ascending: false })
    .limit(6)
  return (data ?? []) as ToolItem[]
}

async function getTopTools(supabase: ReturnType<typeof serviceClient>): Promise<ToolItem[]> {
  const { data } = await supabase
    .from("tools")
    .select("name, tagline, slug, website, pricing_model, upvotes")
    .eq("status", "approved")
    .order("upvotes", { ascending: false })
    .limit(5)
  return (data ?? []) as ToolItem[]
}

// ─── Email template ───────────────────────────────────────────────────────────

const PRICING_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  free:        { label: "Free",        bg: "#DCFCE7", color: "#166534" },
  freemium:    { label: "Freemium",    bg: "#EEF2FF", color: "#4338CA" },
  paid:        { label: "Paid",        bg: "#FEF3C7", color: "#92400E" },
  open_source: { label: "Open Source", bg: "#E0F2FE", color: "#075985" },
}

function weekLabel(): string {
  const d = new Date()
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function buildEmail(
  tools: ToolItem[],
  news: NewsItem[],
  unsubUrl: string,
  appUrl: string
): string {
  const hasNewTools = tools.length > 0
  const displayTools = hasNewTools ? tools : []

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>StackFind Weekly — ${weekLabel()}</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Logo bar -->
  <tr><td style="padding-bottom:24px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <a href="${appUrl}" style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:16px;font-weight:900;letter-spacing:-0.3px;padding:8px 18px;border-radius:10px;text-decoration:none;">StackFind</a>
      </td>
      <td align="right" style="font-size:12px;color:#C4B0A0;">
        AI Tools Weekly &middot; ${weekLabel()}
      </td>
    </tr></table>
  </td></tr>

  <!-- Hero -->
  <tr><td style="background:#1C1611;border-radius:20px;padding:40px;margin-bottom:16px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#C4B0A0;">Weekly Digest</p>
    <h1 style="margin:0 0 14px;font-size:26px;font-weight:900;color:#FAF7F2;line-height:1.25;">
      Your AI tools update<br/>for the week
    </h1>
    <p style="margin:0;font-size:14px;color:#A89880;line-height:1.6;">
      ${hasNewTools ? `${tools.length} new tools discovered` : "Top tools this week"} · ${news.length} AI news stories · curated for builders
    </p>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>

  <!-- New Tools section -->
  ${displayTools.length > 0 ? `
  <tr><td style="background:#FFFFFF;border-radius:20px;padding:32px;margin-bottom:16px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#C4B0A0;">
      ${hasNewTools ? "🛠️ New This Week" : "🏆 Top Tools"}
    </p>
    <h2 style="margin:0 0 24px;font-size:18px;font-weight:900;color:#1C1611;">
      ${hasNewTools ? "Fresh AI tools just added" : "Most upvoted AI tools"}
    </h2>
    <table width="100%" cellpadding="0" cellspacing="0">
    ${displayTools.map((t, i) => {
      const badge = PRICING_BADGE[t.pricing_model] ?? PRICING_BADGE.freemium
      const toolUrl = `${appUrl}/tools/${t.slug}`
      return `
      <tr>
        <td style="padding:${i === 0 ? "0" : "16px"} 0 16px;${i > 0 ? "border-top:1px solid #F0EAE2;" : ""}">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-top:${i > 0 ? "16px" : "0"};">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle;">
                  <a href="${toolUrl}" style="font-size:15px;font-weight:800;color:#1C1611;text-decoration:none;">${t.name}</a>
                  &nbsp;
                  <span style="display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${badge.bg};color:${badge.color};">${badge.label}</span>
                </td>
              </tr></table>
              <p style="margin:4px 0 8px;font-size:13px;color:#7A6A57;line-height:1.5;">${t.tagline}</p>
              <a href="${toolUrl}" style="font-size:12px;font-weight:600;color:#6366f1;text-decoration:none;">View tool →</a>
            </td>
            <td align="right" style="vertical-align:top;padding-top:${i > 0 ? "16px" : "0"};white-space:nowrap;">
              <span style="font-size:12px;color:#C4B0A0;">▲ ${t.upvotes}</span>
            </td>
          </tr></table>
        </td>
      </tr>`
    }).join("")}
    </table>
    <div style="margin-top:24px;">
      <a href="${appUrl}/tools" style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:13px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
        Browse all tools →
      </a>
    </div>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>
  ` : ""}

  <!-- AI News section -->
  ${news.length > 0 ? `
  <tr><td style="background:#FFFFFF;border-radius:20px;padding:32px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#C4B0A0;">📰 AI News</p>
    <h2 style="margin:0 0 24px;font-size:18px;font-weight:900;color:#1C1611;">What happened in AI this week</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
    ${news.map((item, i) => `
      <tr>
        <td style="padding:${i === 0 ? "0" : "16px"} 0 16px;${i > 0 ? "border-top:1px solid #F0EAE2;" : ""}">
          <span style="display:inline-block;font-size:10px;font-weight:600;color:#C4B0A0;background:#F5F0EA;padding:2px 8px;border-radius:20px;margin-bottom:6px;margin-top:${i > 0 ? "16px" : "0"};">${item.source}</span>
          <div>
            <a href="${item.url}" style="font-size:14px;font-weight:700;color:#1C1611;text-decoration:none;line-height:1.4;">${item.title}</a>
          </div>
          ${item.summary ? `<p style="margin:6px 0 0;font-size:12px;color:#7A6A57;line-height:1.5;">${item.summary.slice(0, 140)}${item.summary.length > 140 ? "…" : ""}</p>` : ""}
        </td>
      </tr>
    `).join("")}
    </table>
  </td></tr>

  <tr><td style="height:16px;"></td></tr>
  ` : ""}

  <!-- CTA -->
  <tr><td style="background:#F5F0EA;border-radius:20px;padding:32px;text-align:center;">
    <p style="margin:0 0 8px;font-size:22px;">🚀</p>
    <h3 style="margin:0 0 8px;font-size:16px;font-weight:800;color:#1C1611;">Know a great AI tool?</h3>
    <p style="margin:0 0 20px;font-size:13px;color:#7A6A57;">Submit it to StackFind and help the community discover it.</p>
    <a href="${appUrl}/submit" style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:13px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
      Submit a tool
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:28px 0;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:#C4B0A0;">
      You&apos;re receiving this because you subscribed at
      <a href="${appUrl}" style="color:#C4B0A0;text-decoration:underline;">StackFind</a>
    </p>
    <p style="margin:0;font-size:12px;">
      <a href="${unsubUrl}" style="color:#C4B0A0;text-decoration:underline;">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 })
  }

  const supabase = serviceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stack-find.vercel.app"

  // Fetch subscribers
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .eq("active", true)

  if (!subscribers?.length) {
    return NextResponse.json({ sent: 0, message: "No active subscribers" })
  }

  // Fetch content in parallel
  const [news, newTools, topTools] = await Promise.all([
    getAINews(),
    getNewTools(supabase),
    getTopTools(supabase),
  ])

  const tools = newTools.length >= 3 ? newTools : topTools
  const subject = `StackFind Weekly — ${weekLabel()} ${newTools.length > 0 ? `· ${newTools.length} new tools` : ""}`

  let sent = 0
  const errors: string[] = []

  // Send in batches of 10 to stay within rate limits
  for (let i = 0; i < subscribers.length; i += 10) {
    const batch = subscribers.slice(i, i + 10)
    await Promise.all(
      batch.map(async sub => {
        const unsubUrl = `${appUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`
        const html = buildEmail(tools, news, unsubUrl, appUrl)
        const result = await resend.emails.send({
          from: "StackFind <newsletter@stackfind.in>",
          to: sub.email,
          subject,
          html,
        }).catch(e => { errors.push(String(e)); return null })
        if (result) sent++
      })
    )
  }

  // Update last_sent_at for all subscribers
  await supabase
    .from("newsletter_subscribers")
    .update({ last_sent_at: new Date().toISOString() })
    .eq("active", true)

  return NextResponse.json({
    sent,
    total: subscribers.length,
    errors: errors.length,
    subject,
    newsCount: news.length,
    toolsCount: tools.length,
  })
}
