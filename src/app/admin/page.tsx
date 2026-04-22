import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getServerAdminStatus } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

async function getAllTools() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from("tools")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

async function getAllCategories() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("name")
  return data ?? []
}

export default async function AdminPage() {
  // STRICT SECURITY: Check if user is admin via session/email/cookie first
  const isAdmin = await getServerAdminStatus()
  if (!isAdmin) {
     redirect("/login?next=/admin")
  }

  const [tools, categories] = await Promise.all([getAllTools(), getAllCategories()])
  const adminKey = process.env.ADMIN_KEY ?? ""

  return <AdminDashboard tools={tools} categories={categories} adminKey={adminKey} />
}
