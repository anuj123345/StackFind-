/**
 * GET /api/cron/discover
 *
 * Fetches Product Hunt AI launches, auto-categorises them via keyword
 * matching and inserts as status=approved directly (no manual review needed
 * since PH already curates quality).
 *
 * Vercel Cron: runs daily at 6 AM UTC  →  vercel.json schedule "0 6 * * *"
 * Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function serviceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Category detection ───────────────────────────────────────────────────────

// PH topic slug → our category slug
const TOPIC_MAP: Record<string, string> = {
  "artificial-intelligence":  "chatbots",
  "developer-tools":          "coding",
  "developer-tools-1":        "coding",
  "productivity":             "productivity",
  "marketing":                "marketing",
  "design-tools":             "image-generation",
  "video-editing":            "video",
  "video":                    "video",
  "writing-tools":            "writing",
  "writing":                  "writing",
  "seo":                      "seo",
  "no-code":                  "automation",
  "automation":               "automation",
  "task-management":          "productivity",
  "customer-success":         "marketing",
  "sales":                    "marketing",
  "social-media-tools":       "marketing",
  "email-marketing":          "marketing",
  "image-generation":         "image-generation",
  "text-to-image":            "image-generation",
  "photo-editing":            "image-generation",
  "text-to-video":            "video",
  "voice":                    "chatbots",
  "chatbots":                 "chatbots",
  "code-review":              "coding",
  "coding-assistant":         "coding",
  "analytics":                "analytics",
  "data-science":             "analytics",
  "research":                 "research",
  "education":                "education",
  "health-and-fitness":       "health",
  "finance":                  "finance",
  "legal":                    "legal",
  "human-resources":          "hr",
  "recruiting":               "hr",
  "customer-support":         "customer-support",
  "audio":                    "audio",
  "music":                    "audio",
  "podcasting":               "audio",
  "speech-recognition":       "audio",
  "3d":                       "3d",
  "gaming":                   "gaming",
  "security":                 "security",
  "translation":              "translation",
}

// Keyword → category (checked against name + tagline + description)
const KEYWORD_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["code", "coding", "developer", "github", "ide", "programming", "sql", "api", "debug", "copilot", "compiler"], category: "coding" },
  { keywords: ["image", "photo", "picture", "art", "design", "illustration", "stable diffusion", "text-to-image", "generate image", "midjourney"], category: "image-generation" },
  { keywords: ["video", "animation", "avatar", "talking head", "text-to-video", "film", "clip", "footage", "reel"], category: "video" },
  { keywords: ["write", "writing", "blog", "content", "copy", "article", "essay", "email", "newsletter", "paraphrase"], category: "writing" },
  { keywords: ["seo", "search engine", "rank", "keyword research", "backlink", "serp", "organic traffic"], category: "seo" },
  { keywords: ["automate", "automation", "workflow", "zapier", "no-code", "nocode", "integration", "trigger", "pipeline"], category: "automation" },
  { keywords: ["market", "ads", "advertising", "social media", "campaign", "brand", "growth", "lead", "funnel", "crm"], category: "marketing" },
  { keywords: ["productivity", "task", "calendar", "schedule", "focus", "notes", "meeting", "transcrib", "summary"], category: "productivity" },
  { keywords: ["chat", "chatbot", "assistant", "conversation", "llm", "language model", "gpt", "ai model", "talk"], category: "chatbots" },
  { keywords: ["india", "hindi", "bharat", "indian", "rupee", "upi", "desi", "vernacular", "regional language"], category: "made-in-india" },
]

function detectCategories(name: string, tagline: string, desc: string, phTopics: string[]): string[] {
  const cats = new Set<string>()
  const text = `${name} ${tagline} ${desc}`.toLowerCase()

  // 1. PH topic map
  for (const topic of phTopics) {
    const mapped = TOPIC_MAP[topic]
    if (mapped) cats.add(mapped)
  }

  // 2. Keyword rules
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      cats.add(rule.category)
    }
  }

  // 3. Default fallback
  if (cats.size === 0) cats.add("chatbots")

  // Max 3 categories per tool to keep directory clean
  return [...cats].slice(0, 3)
}

function detectIndia(name: string, tagline: string, desc: string): boolean {
  const text = `${name} ${tagline} ${desc}`.toLowerCase()
  return ["india", "hindi", "bharat", "indian", "rupee", "upi", "desi", "vernacular", "iit", "ola ", "jio", "tata "].some(kw => text.includes(kw))
}

// ─── Product Hunt fetcher ─────────────────────────────────────────────────────

interface PHPost {
  name: string
  tagline: string
  description: string
  website: string
  thumbnail?: string
  votesCount: number
  topics: string[]
}

async function fetchPH(daysBack = 1): Promise<PHPost[]> {
  const date = new Date()
  date.setDate(date.getDate() - daysBack)
  const dateStr = date.toISOString().split("T")[0]

  const query = `{
    posts(first: 50, order: VOTES, postedAfter: "${dateStr}T00:00:00Z", postedBefore: "${dateStr}T23:59:59Z", topic: "artificial-intelligence") {
      edges {
        node {
          name tagline description url website votesCount
          thumbnail { url }
          largeThumbnail: thumbnail { url }
          topics { edges { node { slug } } }
        }
      }
    }
  }`

  const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`,
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 0 },
  })

  if (!res.ok) return []
  const json = await res.json()

  return (json?.data?.posts?.edges ?? []).map((e: { node: Record<string, unknown> }) => {
    const n = e.node as {
      name: string; tagline: string; description: string;
      url: string; website: string; votesCount: number;
      thumbnail?: { url: string };
      topics: { edges: { node: { slug: string } }[] }
    }
    return {
      name: n.name,
      tagline: n.tagline ?? "",
      description: n.description ?? "",
      website: n.website || n.url,
      thumbnail: n.thumbnail?.url,
      votesCount: n.votesCount,
      topics: n.topics.edges.map((t: { node: { slug: string } }) => t.node.slug),
    }
  })
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Allow fetching multiple days back (default 1)
  const daysBack = Number(req.nextUrl.searchParams.get("days") ?? "1")

  try {
    const posts = await fetchPH(Math.min(daysBack, 7))

    if (!posts.length) {
      return NextResponse.json({ inserted: 0, message: "No posts from PH or API unavailable" })
    }

    const supabase = serviceClient()
    let inserted = 0
    const skipped: string[] = []

    // Pre-fetch all category IDs — we'll add missing ones on the fly
    const { data: allCats } = await supabase.from("categories").select("id, slug, name")
    const catMap: Record<string, string> = Object.fromEntries((allCats ?? []).map(c => [c.slug, c.id]))

    // Ensures a category exists, creates it if not
    async function ensureCategory(slug: string, name: string): Promise<string | null> {
      if (catMap[slug]) return catMap[slug]
      const { data, error } = await supabase
        .from("categories")
        .insert({ slug, name, description: `AI tools for ${name.toLowerCase()}`, icon: null })
        .select("id")
        .single()
      if (data) {
        catMap[slug] = data.id
        return data.id
      }
      if (error) {
        console.error(`[cron/discover] Failed to create category ${slug}:`, error)
      }
      return null
    }

    for (const post of posts) {
      const slug = slugify(post.name)
      if (!slug) continue

      // Skip duplicates
      const { data: existing } = await supabase.from("tools").select("id").eq("slug", slug).single()
      if (existing) { skipped.push(slug); continue }

      // Use PH thumbnail as logo — it's the actual product icon uploaded by the founder.
      // Fall back to Google S2 only if PH has no thumbnail.
      let logoUrl: string | null = post.thumbnail ?? null
      if (!logoUrl && post.website) {
        try {
          const host = new URL(post.website).hostname.replace(/^www\./, "")
          logoUrl = `https://www.google.com/s2/favicons?domain=${host}&sz=128`
        } catch { /* skip */ }
      }

      const isIndia = detectIndia(post.name, post.tagline, post.description)

      const { data: tool, error } = await supabase
        .from("tools")
        .insert({
          slug,
          name: post.name,
          tagline: post.tagline.slice(0, 160),
          description: post.description.slice(0, 2000) || null,
          website: post.website || null,
          logo_url: logoUrl,
          pricing_model: "freemium",
          has_inr_billing: isIndia,
          has_gst_invoice: false,
          has_upi: isIndia,
          has_india_support: isIndia,
          is_made_in_india: isIndia,
          status: "approved",
          approved_at: new Date().toISOString(),
          submitted_by: null,
          featured_until: null,
          screenshots: [],
        })
        .select("id")
        .single()

      if (error || !tool) {
        console.error(`[cron/discover] Failed to insert tool ${slug}:`, error)
        continue
      }

      // Link detected categories — auto-create any that don't exist yet
      const categories = detectCategories(post.name, post.tagline, post.description, post.topics)
      for (const catSlug of categories) {
        const catName = catSlug
          .split("-")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
        const catId = await ensureCategory(catSlug, catName)
        if (catId) {
          const { error: insertErr } = await supabase
            .from("tool_categories")
            .insert({ tool_id: tool.id, category_id: catId })
            
          if (insertErr) {
             console.error("[cron/discover] Failed to link category", { tool_id: tool.id, category_id: catId, error: insertErr })
          }
        }
      }

      inserted++
    }

    return NextResponse.json({
      inserted,
      skipped: skipped.length,
      total: posts.length,
      message: `${inserted} tools added, ${skipped.length} already existed`,
    })
  } catch (err) {
    console.error("[cron/discover]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
