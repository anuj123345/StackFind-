import { createClient } from "@/lib/supabase/server"

/**
 * Gets the current admin status of the user, verifying against the ADMIN_EMAILS environment variable
 * and automatically elevating the user's profile if they match.
 */
export async function getServerAdminStatus(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return false

  // check if email is in whitelist
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

  // Fallback to database check for persistent admins not in current whitelist
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
