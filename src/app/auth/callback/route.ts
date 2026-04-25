import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/tools"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Ensure profile exists and track login (using Admin Client to bypass RLS)
      if (user?.email) {
        const adminSupabase = await createAdminClient()
        const { error: upsertError } = await adminSupabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })
        
        if (upsertError) {
          console.error("[auth/callback] profile upsert error:", upsertError)
        } else {
          console.log("[auth/callback] tracked login for:", user.email)
        }
      }

      // 2. Check if this is a brand-new user and send welcome email
      if (user?.email) {
        const createdAt = new Date(user.created_at).getTime()
        const isNewUser = Date.now() - createdAt < 60_000 // created within last 60s
        if (isNewUser && process.env.RESEND_API_KEY) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stack-find.vercel.app"
          try {
            const { Resend } = await import("resend")
            const resend = new Resend(process.env.RESEND_API_KEY)
            const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email.split("@")[0]
            await resend.emails.send({
              from: "StackFind <onboarding@resend.dev>",
              to: user.email,
              subject: "Welcome to StackFind 🇮🇳",
              html: welcomeEmail(name, appUrl),
            })
          } catch (e) {
            console.error("[auth/callback] welcome email error:", e)
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

function welcomeEmail(name: string, appUrl: string): string {
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
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#C4B0A0;">You're in 🇮🇳</p>
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#1C1611;line-height:1.2;">
          Welcome, ${name}
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:#7A6A57;line-height:1.7;">
          Your account is ready. You now have full access to every AI tool in the directory — INR pricing, UPI billing, and Made-in-India picks included.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="padding:12px 0;border-bottom:1px solid #F0EAE2;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:12px;vertical-align:top;">🛠️</td>
              <td>
                <div style="font-size:14px;font-weight:700;color:#1C1611;margin-bottom:2px;">1,000+ AI tools</div>
                <div style="font-size:13px;color:#7A6A57;">Curated and categorised, updated weekly</div>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid #F0EAE2;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:12px;vertical-align:top;">🇮🇳</td>
              <td>
                <div style="font-size:14px;font-weight:700;color:#1C1611;margin-bottom:2px;">Made-in-India tools</div>
                <div style="font-size:13px;color:#7A6A57;">Support Indian founders building world-class AI</div>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:12px 0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:20px;padding-right:12px;vertical-align:top;">📰</td>
              <td>
                <div style="font-size:14px;font-weight:700;color:#1C1611;margin-bottom:2px;">Weekly AI digest</div>
                <div style="font-size:13px;color:#7A6A57;">New tools, top stories, community buzz — every week</div>
              </td>
            </tr></table>
          </td></tr>
        </table>

        <a href="${appUrl}/tools" style="display:inline-block;background:#6366f1;color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
          Explore all tools &rarr;
        </a>
      </td></tr>

      <tr><td style="padding:28px 0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#C4B0A0;">
          You signed up at <a href="${appUrl}" style="color:#C4B0A0;">StackFind</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}
