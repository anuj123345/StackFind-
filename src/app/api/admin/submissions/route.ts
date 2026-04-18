/**
 * Admin API for managing tool submissions.
 *
 * GET  /api/admin/submissions          — list all submissions
 * POST /api/admin/submissions/approve  — approve: move to tools table
 * POST /api/admin/submissions/reject   — reject submission
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

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key")
  return key === process.env.ADMIN_KEY
}

// GET — list submissions
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = serviceClient()
  const status = req.nextUrl.searchParams.get("status") ?? "pending"

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", status as "pending" | "approved" | "rejected")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submissions: data })
}

// POST — approve or reject
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action, submissionId } = await req.json() as { action: "approve" | "reject"; submissionId: string }

  if (!submissionId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "submissionId and action (approve|reject) required" }, { status: 400 })
  }

  const supabase = serviceClient()

  // Fetch submission
  const { data: sub, error: fetchErr } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single()

  if (fetchErr || !sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 })

  if (action === "reject") {
    await supabase.from("submissions").update({ status: "rejected" }).eq("id", submissionId)
    return NextResponse.json({ success: true, action: "rejected" })
  }

  // APPROVE — insert into tools table
  const td = sub.tool_data as Record<string, unknown>

  const slug = td.slug as string
  const categories: string[] = Array.isArray(td.auto_categories) ? td.auto_categories as string[] : []

  // Check not already approved
  const { data: existing } = await supabase.from("tools").select("id").eq("slug", slug).single()
  if (existing) {
    // Mark submission approved anyway (duplicate edge case)
    await supabase.from("submissions").update({ status: "approved" }).eq("id", submissionId)
    return NextResponse.json({ success: true, action: "approved", note: "Tool already existed in directory" })
  }

  const { data: tool, error: toolErr } = await supabase
    .from("tools")
    .insert({
      slug,
      name: td.name as string,
      tagline: td.tagline as string,
      description: (td.description as string | null) ?? null,
      website: (td.website as string | null) ?? null,
      logo_url: (td.logo_url as string | null) ?? null,
      pricing_model: (td.pricing_model as "free" | "freemium" | "paid" | "open_source") ?? "freemium",
      has_inr_billing: Boolean(td.has_inr_billing),
      has_gst_invoice: Boolean(td.has_gst_invoice),
      has_upi: Boolean(td.has_upi),
      has_india_support: Boolean(td.has_india_support),
      is_made_in_india: Boolean(td.is_made_in_india),
      status: "approved",
      approved_at: new Date().toISOString(),
      submitted_by: sub.email,
      featured_until: null,
      screenshots: [],
    })
    .select("id")
    .single()

  if (toolErr || !tool) {
    return NextResponse.json({ error: toolErr?.message ?? "Failed to create tool" }, { status: 500 })
  }

  // Auto-assign categories
  if (categories.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", categories)

    if (cats && cats.length > 0) {
      await supabase
        .from("tool_categories")
        .insert(cats.map(c => ({ tool_id: tool.id, category_id: c.id })))
    }

    // Auto-create missing categories
    const foundSlugs = new Set((cats ?? []).map(c => c.slug))
    for (const catSlug of categories) {
      if (!foundSlugs.has(catSlug)) {
        const catName = catSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        const { data: newCat } = await supabase
          .from("categories")
          .insert({ slug: catSlug, name: catName, description: `AI tools for ${catName.toLowerCase()}`, icon: null })
          .select("id")
          .single()
        if (newCat) {
          await supabase.from("tool_categories").insert({ tool_id: tool.id, category_id: newCat.id })
        }
      }
    }
  }

  // Mark submission as approved
  await supabase.from("submissions").update({ status: "approved" }).eq("id", submissionId)

  return NextResponse.json({ success: true, action: "approved", toolId: tool.id, slug })
}
