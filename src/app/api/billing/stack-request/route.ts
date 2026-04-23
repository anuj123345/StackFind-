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

    const { tools: clientTools } = await req.json()
    if (!clientTools || !Array.isArray(clientTools) || clientTools.length === 0) {
      return new Response(JSON.stringify({ error: "At least one tool is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // ─── Server-Side Price Verification ────────────────────────────────────────
    const { getUsdInrRate } = await import("@/lib/exchange")
    const usdToInrRate = await getUsdInrRate()
    
    // Fetch fresh data for these tools to prevent price manipulation
    const toolIds = clientTools.map((t: any) => t.id).filter(Boolean)
    const { data: dbTools, error: fetchError } = await supabase
      .from("tools")
      .select("id, name, slug, starting_price_usd, starting_price_inr, convenience_fee_percent")
      .in("id", toolIds)

    if (fetchError || !dbTools || dbTools.length === 0) {
      return new Response(JSON.stringify({ error: "Could not verify tool pricing." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Recalculate Subtotal
    const subtotal = dbTools.reduce((sum, tool) => {
      const priceInr = tool.starting_price_inr || (tool.starting_price_usd ? Math.round(tool.starting_price_usd * usdToInrRate) : 0)
      return sum + priceInr
    }, 0)

    // Calculate Fees (using the highest convenience fee from the selection or a default 5%)
    const maxFeePercent = Math.max(...dbTools.map(t => t.convenience_fee_percent || 5))
    const platformFee = Math.round(subtotal * (maxFeePercent / 100))
    const gstAmount = Math.round((subtotal + platformFee) * 0.18)
    const serverTotal = subtotal + platformFee + gstAmount

    // Capture the request in DB - one row per tool to respect schema
    const { error: insertError } = await supabase
      .from("billing_requests")
      .insert(dbTools.map((t: any) => ({
        user_id: user.id,
        tool_id: t.id,
        email: user.email as string,
        notes: `STACK PURCHASE (VERIFIED): ${dbTools.map((st: any) => st.name).join(", ")}. Server Total INR: ₹${serverTotal}.`,
        status: "pending"
      })))

    if (insertError) {
      console.error("DB Insert Error:", insertError)
    }

    // Send notifications
    const { sendStackBillingLeadNotification, sendUserStackBillingConfirmation } = await import("@/lib/email")
    
    // We fire and forget these
    sendStackBillingLeadNotification({
      userEmail: user.email,
      tools: dbTools.map((t: any) => ({ 
        name: t.name, 
        priceInr: t.starting_price_inr || (t.starting_price_usd ? Math.round(t.starting_price_usd * usdToInrRate) : 0) 
      })),
      total: serverTotal
    }).catch(err => console.error("Admin Email failed", err))

    sendUserStackBillingConfirmation({
      userEmail: user.email,
      tools: dbTools.map((t: any) => t.name),
      total: serverTotal
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
        amount: serverTotal * 100, // in paise
        currency: "INR",
        accept_partial: false,
        description: `Stack Purchase: ${dbTools.length} AI Tools (Verified)`,
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
          tools: dbTools.map((t: any) => t.slug).join(",")
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
