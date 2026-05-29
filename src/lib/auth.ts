import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * Gets the current admin status of the user, verifying against:
 * 1. The ADMIN_EMAILS environment variable (OAuth)
 * 2. A secure admin_token cookie (Direct Key)
 */
export async function getServerAdminStatus(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("sf_admin_token")?.value

  // 1. Check for valid Admin Token Cookie (Direct Key)
  if (adminToken && adminToken === process.env.ADMIN_KEY) {
    return true
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return false

  // 2. Check if email is in whitelist (OAuth)
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase())
  const isWhitelisted = adminEmails.includes(user.email.toLowerCase())

  if (isWhitelisted) {
    return true
  }

  // Fallback: use is_admin() RPC function
  const { data: isAdmin } = await supabase.rpc('is_admin')
  return !!isAdmin
}

export async function getIsAuthenticated(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

export async function getServerUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
