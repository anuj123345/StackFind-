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
    // Automatically elevate profile in DB if matches whitelist
    await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id)
      .eq('is_admin', false) // Only update if not already admin
    
    return true
  }

  // Fallback to database check for persistent admins
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return !!profile?.is_admin
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
