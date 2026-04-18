import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function serviceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return new NextResponse(unsubPage("Invalid link", false), {
      headers: { "Content-Type": "text/html" },
    })
  }

  const supabase = serviceClient()
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ active: false })
    .eq("unsubscribe_token", token)

  if (error) {
    return new NextResponse(unsubPage("Something went wrong. Please try again.", false), {
      headers: { "Content-Type": "text/html" },
    })
  }

  return new NextResponse(unsubPage("You've been unsubscribed.", true), {
    headers: { "Content-Type": "text/html" },
  })
}

function unsubPage(message: string, success: boolean): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stack-find.vercel.app"
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Unsubscribe — StackFind</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
<div style="text-align:center;padding:40px 24px;max-width:400px;margin:auto;">
  <div style="background:#1C1611;color:#FAF7F2;font-size:18px;font-weight:900;padding:10px 20px;border-radius:12px;display:inline-block;margin-bottom:32px;">StackFind</div>
  <div style="font-size:${success ? "48px" : "48px"};margin-bottom:16px;">${success ? "👋" : "⚠️"}</div>
  <h1 style="font-size:22px;font-weight:900;color:#1C1611;margin:0 0 12px;">${message}</h1>
  <p style="font-size:14px;color:#7A6A57;margin:0 0 28px;">
    ${success ? "We won't send you any more emails. You can always re-subscribe on the site." : ""}
  </p>
  <a href="${appUrl}" style="display:inline-block;background:#1C1611;color:#FAF7F2;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
    Back to StackFind
  </a>
</div>
</body>
</html>`
}
