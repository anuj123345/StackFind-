import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use anon key — allow_public_insert RLS policy covers upserts without service role
function anonClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string }
    const email = body.email?.trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const supabase = anonClient()

    // Insert — if email exists, update active flag
    const { error: upsertError } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, active: true }, { onConflict: "email" })

    if (upsertError) {
      console.error("[newsletter/subscribe] upsert error:", JSON.stringify(upsertError))
      return NextResponse.json({ error: "Could not subscribe: " + upsertError.message }, { status: 500 })
    }

    // Fetch the token separately — more reliable than chaining select on upsert
    const { data: row, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("unsubscribe_token")
      .eq("email", email)
      .single()

    if (fetchError) {
      console.error("[newsletter/subscribe] fetch error:", JSON.stringify(fetchError))
      // Still return success — email was saved
      return NextResponse.json({ ok: true })
    }

    // Send welcome email if Resend is configured
    if (process.env.RESEND_API_KEY && row?.unsubscribe_token) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stack-find.vercel.app"
      const unsubUrl = `${appUrl}/api/newsletter/unsubscribe?token=${row.unsubscribe_token}`
      try {
        const { Resend } = await import("resend")
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: "StackFind <onboarding@resend.dev>",
          to: email,
          subject: "Welcome to StackFind — Your AI tools weekly is live",
          html: welcomeEmail(unsubUrl, appUrl),
        })
      } catch (emailErr) {
        console.error("[newsletter/subscribe] email error:", emailErr)
        // Don't fail the request — subscription was saved
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[newsletter/subscribe] unexpected error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

function welcomeEmail(unsubUrl: string, appUrl: string): string {
  const features = [
    { icon: "🛠️", title: "New AI tools", desc: "Freshly discovered tools, hand-picked for builders and creators" },
    { icon: "📰", title: "AI news digest", desc: "Top stories from the AI world — what actually matters" },
    { icon: "💬", title: "Community buzz", desc: "What builders are saying about tools on Reddit" },
  ]

  const featureRows = features.map(f => `
  <tr><td style="padding:12px 0;border-bottom:1px solid #F0EAE2;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:20px;padding-right:12px;vertical-align:top;">${f.icon}</td>
      <td>
        <div style="font-size:14px;font-weight:700;color:#1C1611;margin-bottom:2px;">${f.title}</div>
        <div style="font-size:13px;color:#7A6A57;">${f.desc}</div>
      </td>
    </tr></table>
  </td></tr>`).join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to StackFind</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <tr><td style="padding-bottom:32px;text-align:center;">
        <div style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:18px;font-weight:900;padding:10px 20px;border-radius:12px;">
          StackFind
        </div>
      </td></tr>

      <tr><td style="background:#FFFFFF;border-radius:20px;padding:48px 40px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#C4B0A0;">You're in</p>
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#1C1611;line-height:1.2;">
          Welcome to the AI tools weekly
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:#7A6A57;line-height:1.7;">
          Every week — new AI tools worth trying, the latest from AI founders, and what builders are actually saying. No fluff, no spam.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${featureRows}
        </table>
        <a href="${appUrl}" style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
          Browse AI Tools &rarr;
        </a>
      </td></tr>

      <tr><td style="padding:28px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#C4B0A0;">
          You subscribed at <a href="${appUrl}" style="color:#C4B0A0;">StackFind</a>
        </p>
        <a href="${unsubUrl}" style="font-size:12px;color:#C4B0A0;text-decoration:underline;">Unsubscribe</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}
