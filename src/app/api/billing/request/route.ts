import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return new Response(JSON.stringify({ error: "Please sign in to request billing support." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { toolId, notes } = await req.json()
    if (!toolId) {
      return new Response(JSON.stringify({ error: "Tool ID is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Capture the request
    const { error } = await supabase
      .from("billing_requests")
      .insert({
        user_id: user.id,
        tool_id: toolId as string,
        email: user.email,
        notes: (notes as string | null) || `Request for managed INR billing.`,
        status: "pending"
      })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, message: "Request received! We will get back to you shortly." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("[billing/request]", err)
    return new Response(JSON.stringify({ error: err.message || "Failed to submit request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
