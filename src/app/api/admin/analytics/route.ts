import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerAdminStatus } from "@/lib/auth"

function serviceClient() {
  return createClient(
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

  // 1. Total Tool Reach (Impressions/Views)
  const { data: viewsData } = await supabase
    .from("tools")
    .select("views")
    .eq("status", "approved")

  const totalReach = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0

  // 2. Total Registered Founders (Users)
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // 3. Billing Lead Volume
  const { count: pendingLeads } = await supabase
    .from("billing_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // 4. Submissions Reach
  const { count: pendingSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // 5. Growth (Last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const dateStr = sevenDaysAgo.toISOString()

  const { count: newUsersWeek } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateStr)

  const { count: newLeadsWeek } = await supabase
    .from("billing_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateStr)

  // 6. Recent Activity Stream
  const { data: recentLeads } = await supabase
    .from("billing_requests")
    .select("id, email, created_at, tool:tools(name)")
    .order("created_at", { ascending: false })
    .limit(3)

  return NextResponse.json({
    stats: {
      totalReach,
      totalUsers,
      pendingLeads,
      pendingSubmissions,
      growth: {
        newUsersWeek,
        newLeadsWeek
      }
    },
    recentActivity: recentLeads
  })
}
