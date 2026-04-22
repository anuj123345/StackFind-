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

    // Fetch tool name for the email
    const { data: tool } = await supabase
      .from("tools")
      .select("name")
      .eq("id", toolId)
      .single()

    const toolName = tool?.name || "Unknown Tool"

    // Capture the request
    const { error } = await supabase
      .from("billing_requests")
      .insert({
        user_id: user.id,
        tool_id: toolId as string,
        email: user.email,
        notes: (notes as string | null) || `Request for managed INR billing for ${toolName}.`,
        status: "pending"
      })

    if (error) throw error

    // Send notifications (async, don't block the response)
    const { sendBillingLeadNotification, sendUserBillingConfirmation } = await import("@/lib/email")
    
    // We fire and forget these to keep the API fast
    sendBillingLeadNotification({
      userEmail: user.email,
      toolName,
      notes: notes as string
    }).catch(err => console.error("Admin Email failed", err))

    sendUserBillingConfirmation({
      userEmail: user.email,
      toolName
    }).catch(err => console.error("User Email failed", err))

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Request received! We've sent a confirmation email to you." 
    }), {
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
