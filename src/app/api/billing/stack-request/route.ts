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

    const { tools, total } = await req.json()
    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return new Response(JSON.stringify({ error: "At least one tool is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Capture the request in DB - one row per tool to respect schema
    const { error } = await supabase
      .from("billing_requests")
      .insert(tools.map((t: any) => ({
        user_id: user.id,
        tool_id: t.id || "", // Fallback if ID is missing, but should be there
        email: user.email as string,
        notes: `STACK PURCHASE: ${tools.map((st: any) => st.name).join(", ")}. Total INR: ₹${total}.`,
        status: "pending"
      })))

    if (error) {
      console.error("DB Insert Error:", error)
      // We continue even if DB fails because email is more important for immediate lead capture
    }

    // Send notifications
    const { sendStackBillingLeadNotification, sendUserStackBillingConfirmation } = await import("@/lib/email")
    
    await Promise.all([
      sendStackBillingLeadNotification({
        userEmail: user.email,
        tools: tools.map((t: any) => ({ name: t.name, priceInr: t.priceInr })),
        total
      }),
      sendUserStackBillingConfirmation({
        userEmail: user.email,
        tools: tools.map((t: any) => t.name),
        total
      })
    ])

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Stack request received! Confirmation email sent." 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("[billing/stack-request]", err)
    return new Response(JSON.stringify({ error: err.message || "Failed to submit stack request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
