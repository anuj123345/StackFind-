import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { PricingModel } from "@/types/database"

function createServiceClient() {
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

// GET /api/admin/tools — list all tools (any status)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServiceClient()
  const status = req.nextUrl.searchParams.get("status")

  const query = supabase
    .from("tools")
    .select("*")
    .order("created_at", { ascending: false })

  const { data, error } = status
    ? await query.eq("status", status as "pending" | "approved" | "rejected")
    : await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tools: data })
}

// POST /api/admin/tools — add a new tool
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const {
    name,
    slug,
    tagline,
    description,
    website,
    logo_url,
    pricing_model = "freemium",
    starting_price_usd,
    starting_price_inr,
    has_inr_billing = false,
    has_gst_invoice = false,
    has_upi = false,
    has_india_support = false,
    is_made_in_india = false,
    status = "approved",
    featured_until = null,
    category_slugs = [] as string[],
  } = body

  if (!name || !slug || !tagline) {
    return NextResponse.json({ error: "name, slug, and tagline are required" }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: tool, error: toolErr } = await supabase
    .from("tools")
    .insert({
      name,
      slug,
      tagline,
      description: description ?? null,
      website: website ?? null,
      logo_url: logo_url ?? null,
      pricing_model: pricing_model as PricingModel,
      starting_price_usd: starting_price_usd ?? null,
      starting_price_inr: starting_price_inr ?? null,
      has_inr_billing,
      has_gst_invoice,
      has_upi,
      has_india_support,
      is_made_in_india,
      status,
      featured_until,
      submitted_by: null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      screenshots: [],
    })
    .select()
    .single()

  if (toolErr) return NextResponse.json({ error: toolErr.message }, { status: 500 })

  if (category_slugs.length > 0) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", category_slugs)

    if (cats && cats.length > 0) {
      await supabase
        .from("tool_categories")
        .insert(cats.map(c => ({ tool_id: tool.id, category_id: c.id })))
    }
  }

  return NextResponse.json({ tool }, { status: 201 })
}

// PATCH /api/admin/tools — update a tool by id or slug
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { id, slug, ...updates } = body

  if (!id && !slug) return NextResponse.json({ error: "id or slug required" }, { status: 400 })

  const supabase = createServiceClient()

  const baseQuery = supabase.from("tools").update(updates).select().single()

  const { data, error } = id
    ? await supabase.from("tools").update(updates).eq("id", id).select().single()
    : await supabase.from("tools").update(updates).eq("slug", slug).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tool: data })
}

// DELETE /api/admin/tools?slug=xxx
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const slug = req.nextUrl.searchParams.get("slug")
  const id   = req.nextUrl.searchParams.get("id")

  if (!slug && !id) return NextResponse.json({ error: "slug or id required" }, { status: 400 })

  const supabase = createServiceClient()

  const { error } = id
    ? await supabase.from("tools").delete().eq("id", id)
    : await supabase.from("tools").delete().eq("slug", slug!)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
