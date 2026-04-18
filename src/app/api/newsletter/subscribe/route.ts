import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

function serviceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const supabase = serviceClient()

  // Upsert — re-activates if they previously unsubscribed
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, active: true }, { onConflict: "email" })
    .select("unsubscribe_token, subscribed_at")
    .single()

  if (error) {
    console.error("[newsletter/subscribe]", error)
    return NextResponse.json({ error: "Could not subscribe" }, { status: 500 })
  }

  // Send welcome email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const unsubUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?token=${data.unsubscribe_token}`

    await resend.emails.send({
      from: "StackFind <newsletter@stackfind.in>",
      to: email,
      subject: "Welcome to StackFind — Your AI tools weekly is live",
      html: welcomeEmail(unsubUrl),
    }).catch(e => console.error("[resend welcome]", e))
  }

  return NextResponse.json({ ok: true })
}

function welcomeEmail(unsubUrl: string): string {
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

      <!-- Header -->
      <tr><td style="padding-bottom:32px;text-align:center;">
        <div style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:18px;font-weight:900;letter-spacing:-0.5px;padding:10px 20px;border-radius:12px;">
          StackFind
        </div>
      </td></tr>

      <!-- Hero card -->
      <tr><td style="background:#FFFFFF;border-radius:20px;padding:48px 40px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#C4B0A0;">You&apos;re in</p>
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#1C1611;line-height:1.2;">
          Welcome to the AI tools weekly
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:#7A6A57;line-height:1.7;">
          Every week you&apos;ll get a curated digest straight to this inbox — new AI tools worth trying,
          the latest from AI founders, and what the builder community is actually saying on Reddit.
          No fluff, no spam.
        </p>

        <!-- What to expect -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${[
            ["🛠️", "New AI tools", "Freshly discovered tools, hand-picked for builders and creators"],
            ["📰", "AI news digest", "Top stories from the AI world — what actually matters"],
            ["💬", "Community buzz", "What builders are saying about tools on Reddit"],
          ].map(([icon, title, desc]) => `
          <tr><td style="padding:12px 0;border-bottom:1px solid #F0EAE2;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:12px;vertical-align:top;">${icon}</td>
              <td>
                <div style="font-size:14px;font-weight:700;color:#1C1611;margin-bottom:2px;">${title}</div>
                <div style="font-size:13px;color:#7A6A57;">${desc}</div>
              </td>
            </tr></table>
          </td></tr>`).join("")}
        </table>

        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://stack-find.vercel.app"}"
           style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
          Browse AI Tools →
        </a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:28px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:#C4B0A0;">
          You subscribed at <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://stack-find.vercel.app"}" style="color:#C4B0A0;">StackFind</a>
        </p>
        <p style="margin:0;font-size:12px;">
          <a href="${unsubUrl}" style="color:#C4B0A0;text-decoration:underline;">Unsubscribe</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}
