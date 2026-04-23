/**
 * POST /api/submit
 *
 * Public endpoint — anyone can submit a tool.
 * Runs a security check (URL reachability, basic fraud signals),
 * then saves to the submissions table for admin review.
 * On approval by admin, the tool is moved to the tools table.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { detectCategories, detectIndia, slugify } from "@/lib/categorize"

function serviceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Security / fraud check ───────────────────────────────────────────────────

interface SiteCheck {
  reachable: boolean
  statusCode: number | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  flags: string[]   // suspicious signals for admin review
}

const SUSPICIOUS_TLDS = [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".buzz", ".click"]
const SPAM_PATTERNS = [/free.*money/i, /earn.*\$/i, /casino/i, /adult/i, /porn/i, /crypto.*pump/i]

async function checkSite(url: string): Promise<SiteCheck> {
  const flags: string[] = []

  // Check TLD
  try {
    const host = new URL(url).hostname
    if (SUSPICIOUS_TLDS.some(t => host.endsWith(t))) {
      flags.push(`Suspicious TLD: ${host}`)
    }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      flags.push("URL is a raw IP address")
    }
  } catch {
    return { reachable: false, statusCode: null, ogTitle: null, ogDescription: null, ogImage: null, flags: ["Invalid URL"] }
  }

  // Fetch page
  let html = ""
  let statusCode: number | null = null
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "StackFind-Bot/1.0 (+https://stackfind.in)" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    })
    statusCode = res.status
    if (!res.ok) {
      flags.push(`Site returned HTTP ${res.status}`)
      return { reachable: false, statusCode, ogTitle: null, ogDescription: null, ogImage: null, flags }
    }
    const ct = res.headers.get("content-type") ?? ""
    if (ct.includes("text/html")) {
      html = (await res.text()).slice(0, 50_000) // only first 50KB
    }
  } catch (err) {
    flags.push(`Could not reach site: ${String(err).slice(0, 100)}`)
    return { reachable: false, statusCode, ogTitle: null, ogDescription: null, ogImage: null, flags }
  }

  // Extract OG tags
  function ogMeta(prop: string): string | null {
    const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"))
      ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"))
    return m ? m[1].trim() : null
  }

  const ogTitle = ogMeta("og:title") ?? ogMeta("twitter:title")
  const ogDescription = ogMeta("og:description") ?? ogMeta("twitter:description")
  const ogImage = ogMeta("og:image") ?? ogMeta("twitter:image")

  if (!ogTitle && !ogDescription) {
    flags.push("No OG tags found — site may be a placeholder or parked domain")
  }

  // Spam keyword check
  const textContent = html.replace(/<[^>]+>/g, " ").slice(0, 5000)
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(textContent)) {
      flags.push(`Spam pattern detected: ${pattern.source}`)
    }
  }

  return { reachable: true, statusCode, ogTitle, ogDescription, ogImage, flags }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Apply Rate Limiting (3 submissions per hour per IP)
  try {
    const { submissionRateLimit, getIP } = await import("@/lib/ratelimit")
    const ip = getIP(req)
    const { success } = await submissionRateLimit.limit(ip)
    
    if (!success) {
      return NextResponse.json({ 
        error: "Too many submissions. Please wait an hour before submitting more tools." 
      }, { status: 429 })
    }
  } catch (e) {
    console.error("Rate limit error:", e)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    name,
    website,
    tagline,
    description,
    pricing_model,
    email,
    is_made_in_india,
    has_inr_billing,
    has_upi,
    has_gst_invoice,
    starting_price_inr,
    pricing_modelling,
  } = body as Record<string, string | boolean | undefined | any[]>

  // Basic validation
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Tool name is required (min 2 chars)" }, { status: 400 })
  }
  if (!website || typeof website !== "string") {
    return NextResponse.json({ error: "Website URL is required" }, { status: 400 })
  }
  if (!tagline || typeof tagline !== "string" || tagline.trim().length < 10) {
    return NextResponse.json({ error: "Tagline is required (min 10 chars)" }, { status: 400 })
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
  }

  // Normalise URL
  let normalUrl = website.trim()
  if (!/^https?:\/\//i.test(normalUrl)) normalUrl = "https://" + normalUrl

  try { new URL(normalUrl) } catch {
    return NextResponse.json({ error: "Invalid website URL" }, { status: 400 })
  }

  const supabase = serviceClient()
  const slug = slugify(name as string)

  // Duplicate check
  const { data: existing } = await supabase.from("tools").select("id").eq("slug", slug).single()
  if (existing) {
    return NextResponse.json({ error: "A tool with this name already exists in our directory" }, { status: 409 })
  }
  const { data: existingSub } = await supabase
    .from("submissions")
    .select("id")
    .eq("tool_data->website" as "email", normalUrl)  // approximate check
    .neq("status", "rejected")
    .limit(1)
  if (existingSub && existingSub.length > 0) {
    return NextResponse.json({ error: "This tool has already been submitted and is awaiting review" }, { status: 409 })
  }

  // Security check
  const check = await checkSite(normalUrl)

  // Hard block: completely unreachable with no flags possibility of legit
  if (!check.reachable && check.flags.some(f => f.startsWith("Invalid URL") || f.startsWith("Suspicious TLD") || f.startsWith("URL is a raw IP"))) {
    return NextResponse.json({
      error: "We could not verify this website. Please check the URL and try again.",
      details: check.flags,
    }, { status: 422 })
  }

  // Auto-detect categories and India
  const desc = typeof description === "string" ? description : ""
  const autoIndia = detectIndia(name as string, tagline as string, desc) || Boolean(is_made_in_india)
  const categories = detectCategories(name as string, tagline as string, desc)

  // Determine review status
  // If site is unreachable OR has fraud flags → needs_review (admin decides)
  // If clean → still pending (admin approves)
  const reviewNote = check.flags.length > 0
    ? `Security flags: ${check.flags.join("; ")}`
    : "Passed automated checks"

  // Save submission
  const toolData = {
    name: (name as string).trim(),
    slug,
    website: normalUrl,
    tagline: (tagline as string).trim().slice(0, 160),
    description: desc.slice(0, 2000) || null,
    pricing_model: pricing_model ?? "freemium",
    logo_url: check.ogImage ?? null,
    is_made_in_india: autoIndia,
    has_inr_billing: Boolean(has_inr_billing) || autoIndia,
    has_upi: Boolean(has_upi) || autoIndia,
    has_gst_invoice: Boolean(has_gst_invoice),
    starting_price_inr: starting_price_inr ? Number(starting_price_inr) : null,
    pricing_modelling: Array.isArray(pricing_modelling) ? pricing_modelling : [],
    has_india_support: autoIndia,
    auto_categories: categories,
    security_check: {
      reachable: check.reachable,
      status_code: check.statusCode,
      og_title: check.ogTitle,
      og_description: check.ogDescription,
      flags: check.flags,
    },
    review_note: reviewNote,
  }

  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .insert({
      email: email as string,
      tool_data: toolData as unknown as Record<string, unknown>,
      plan: "free",
      payment_status: "pending",
      status: "pending",
    })
    .select("id")
    .single()

  if (subErr) {
    console.error("[submit]", subErr)
    return NextResponse.json({ error: "Failed to save submission. Please try again." }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    submissionId: sub.id,
    message: "Your tool has been submitted! We'll review it and get back to you within 24–48 hours.",
    securityPassed: check.flags.length === 0,
  })
}
