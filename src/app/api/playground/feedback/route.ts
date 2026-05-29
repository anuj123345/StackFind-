import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { stack_id, signal, project_description, recommended_tools } =
    await req.json()

  if (!signal || !["positive", "negative"].includes(signal)) {
    return Response.json({ error: "Invalid signal" }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from("stack_feedback").insert({
    user_id: user.id,
    stack_id: stack_id || null,
    signal,
    project_description: project_description || null,
    recommended_tools: recommended_tools || null,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
