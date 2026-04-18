/**
 * POST /api/enrich-description
 *
 * Called client-side when a tool has a short/missing description.
 * 1. Fetches the tool's website to extract real content
 * 2. Calls Claude to write a rich 2-3 paragraph description
 * 3. Saves to DB so future visits serve it instantly
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

function serviceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Extract readable text from HTML
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000)
}

function ogMeta(html: string, prop: string): string | null {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"))
  return m ? m[1].trim() : null
}

export async function POST(req: NextRequest) {
  const { slug } = await req.json() as { slug: string }
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const supabase = serviceClient()

  // Fetch tool from DB
  const { data: tool } = await supabase
    .from("tools")
    .select("id, name, tagline, description, website, pricing_model")
    .eq("slug", slug)
    .single()

  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 })

  // Already has a rich description — return it
  if (tool.description && tool.description.length > 600) {
    return NextResponse.json({ description: tool.description, cached: true })
  }

  // Fetch website content
  let websiteText = ""
  let ogDescription = ""
  if (tool.website) {
    try {
      const res = await fetch(tool.website, {
        headers: { "User-Agent": "StackFind-Bot/1.0" },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = (await res.text()).slice(0, 80_000)
        websiteText = extractText(html)
        ogDescription = ogMeta(html, "og:description") ?? ogMeta(html, "description") ?? ""
      }
    } catch { /* skip */ }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `Write a detailed product description for an AI tool. You MUST write exactly 3 full paragraphs separated by blank lines. Each paragraph must be 3-5 sentences. Total length: 200-300 words minimum.

Tool: ${tool.name}
Tagline: ${tool.tagline}
Pricing: ${tool.pricing_model}
${ogDescription ? `Official description: ${ogDescription}` : ""}
${websiteText ? `Website content: ${websiteText.slice(0, 2500)}` : ""}

Paragraph 1: What this tool is, what problem it solves, and who it is built for.
Paragraph 2: The main features, capabilities, and how people use it day-to-day.
Paragraph 3: What makes it stand out, pricing model, and who gets the most value from it.

Rules:
- Write in plain prose, no bullet points, no headers, no markdown
- Do not start with the tool name
- Do not use phrases like "In conclusion" or "Overall"
- Be specific and concrete, not vague marketing language
- Write all 3 paragraphs even if information is limited — use what you know about this tool`

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    })

    const generated = (message.content[0] as { type: string; text: string }).text.trim()

    // Save to DB
    await supabase
      .from("tools")
      .update({ description: generated })
      .eq("slug", slug)

    return NextResponse.json({ description: generated, cached: false })
  } catch (err) {
    console.error("[enrich-description]", err)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}
