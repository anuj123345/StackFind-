/**
 * POST /api/admin/fix-logos
 *
 * Re-fetches PH thumbnails for the past N days and patches logo_url
 * for any existing tools that currently have a Google S2 URL or NULL logo.
 *
 * Run once after the cron code fix to backfill real logos.
 * Usage: POST /api/admin/fix-logos  (with x-admin-key header)
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
}

async function fetchPHThumbnails(daysBack: number): Promise<Record<string, string>> {
  const results: Record<string, string> = {}

  for (let d = 1; d <= daysBack; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const dateStr = date.toISOString().split("T")[0]

    const query = `{
      posts(order: VOTES, postedAfter: "${dateStr}T00:00:00Z", postedBefore: "${dateStr}T23:59:59Z", topic: "artificial-intelligence") {
        edges {
          node { name thumbnail { url } }
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

    if (!res.ok) continue
    const json = await res.json()

    for (const { node } of (json?.data?.posts?.edges ?? [])) {
      if (node.name && node.thumbnail?.url) {
        const slug = slugify(node.name)
        results[slug] = node.thumbnail.url
      }
    }
  }

  return results
}

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key")
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const daysBack = Number((await req.json().catch(() => ({}))).days ?? 7)
  const thumbnails = await fetchPHThumbnails(Math.min(daysBack, 14))

  if (!Object.keys(thumbnails).length) {
    return NextResponse.json({ updated: 0, message: "No PH thumbnails found" })
  }

  const supabase = serviceClient()
  let updated = 0

  for (const [slug, thumbUrl] of Object.entries(thumbnails)) {
    const { data } = await supabase
      .from("tools")
      .update({ logo_url: thumbUrl })
      .eq("slug", slug)
      .select("id")
      .single()

    if (data) updated++
  }

  return NextResponse.json({
    updated,
    total: Object.keys(thumbnails).length,
    message: `Updated logos for ${updated} tools`,
  })
}
