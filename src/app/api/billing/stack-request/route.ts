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
    
    // We fire and forget these
    sendStackBillingLeadNotification({
      userEmail: user.email,
      tools: tools.map((t: any) => ({ name: t.name, priceInr: t.priceInr })),
      total
    }).catch(err => console.error("Admin Email failed", err))

    sendUserStackBillingConfirmation({
      userEmail: user.email,
      tools: tools.map((t: any) => t.name),
      total
    }).catch(err => console.error("User Email failed", err))

    // ─── Razorpay Payment Link Generation ──────────────────────────────────────
    let paymentLink = null
    try {
      const Razorpay = (await import("razorpay")).default
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      })

      const link: any = await razorpay.paymentLink.create({
        amount: total * 100, // in paise
        currency: "INR",
        accept_partial: false,
        description: `Stack Purchase: ${tools.length} AI Tools`,
        customer: {
          name: user.email.split("@")[0],
          email: user.email,
        },
        notify: {
          sms: false,
          email: true,
        },
        reminder_enable: true,
        notes: {
          stack_purchase: "true",
          tools: tools.map((t: any) => t.slug).join(",")
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/playground?payment=success`,
        callback_method: "get"
      })
      paymentLink = link.short_url
    } catch (rzpError) {
      console.error("Razorpay Link Error:", rzpError)
      // We still return success:true because the lead was captured and email sent
    }

    return new Response(JSON.stringify({ 
      success: true, 
      paymentLink,
      message: paymentLink ? "Payment link generated!" : "Request received! We'll send the link via email." 
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
