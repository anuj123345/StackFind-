import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerAdminStatus } from "@/lib/auth"
import type { Database } from "@/types/database"

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function checkKeyAuth(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key") || req.nextUrl.searchParams.get("key")
  return key === process.env.ADMIN_KEY
}

export async function GET(req: NextRequest) {
  // Dual Auth: Check session via getServerAdminStatus (OAuth) OR x-admin-key (Legacy)
  const isAdminSession = await getServerAdminStatus()
  const isKeyAuthorized = checkKeyAuth(req)

  if (!isAdminSession && !isKeyAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = serviceClient()
  const { searchParams } = req.nextUrl
  const sort = searchParams.get("sort") || "updated_at"
  const limit = parseInt(searchParams.get("limit") || "100")

  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order(sort as any, { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users })
}
