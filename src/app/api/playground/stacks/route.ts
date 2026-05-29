import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"

// GET: fetch user's stack history
export async function GET() {
  const user = await getServerUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_stacks")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ stacks: data || [] })
}

// POST: save or auto-log a stack
export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { project_description, tool_slugs, ai_reasoning, source, is_saved } =
    await req.json()

  if (!project_description?.trim() || !tool_slugs?.length) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_stacks")
    .insert({
      user_id: user.id,
      project_description: project_description.trim(),
      tool_slugs,
      ai_reasoning: ai_reasoning || null,
      source: source || "playground",
      is_saved: is_saved || false,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ stack: data })
}

// PATCH: toggle saved / archive a stack
export async function PATCH(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, is_saved, is_archived } = await req.json()
  if (!id) return Response.json({ error: "Missing stack id" }, { status: 400 })

  const supabase = await createClient()
  const updates: Record<string, boolean> = {}
  if (typeof is_saved === "boolean") updates.is_saved = is_saved
  if (typeof is_archived === "boolean") updates.is_archived = is_archived

  const { error } = await supabase
    .from("user_stacks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id) // RLS guard

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
