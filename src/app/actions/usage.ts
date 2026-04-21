"use server"

import { createClient } from "@/lib/supabase/server"

export async function incrementPlaygroundUsage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  // Fetch current usage
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('playground_usage_count')
    .eq('id', user.id)
    .single()

  if (fetchError) {
    return { success: false, error: fetchError.message }
  }

  // Increment usage count
  const { error: updateError } = await (supabase
    .from('profiles') as any)
    // @ts-ignore - Bypassing strict production type check for Supabase update
    .update({ 
      playground_usage_count: (profile.playground_usage_count || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}
