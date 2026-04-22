import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function checkAuth(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key") || req.nextUrl.searchParams.get("key")
  return key === process.env.ADMIN_KEY
}

// GET — list billing requests
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = serviceClient()
  const status = req.nextUrl.searchParams.get("status") || "pending"

  const { data, error } = await supabase
    .from("billing_requests")
    .select(`
      *,
      tool:tools(name, logo_url)
    `)
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ requests: data })
}

// PATCH — update status
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })

  const supabase = serviceClient()
  const { data, error } = await supabase
    .from("billing_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ request: data })
}
