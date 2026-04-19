/**
 * GET /api/logo/[domain]
 *
 * Server-side proxy that fetches a tool's logo/favicon.
 * Tries Clearbit (high-quality logo) then Google S2 (favicon).
 * Returns SVG letter avatar as final fallback — never 404s.
 * Cached 24h at CDN so first-load cost is amortized.
 */

import { NextRequest, NextResponse } from "next/server"

function logoSources(domain: string): string[] {
  return [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ]
}

function letterSvg(domain: string): string {
  const letter = domain.charAt(0).toUpperCase()
  const palettes = [
    ["#EEF2FF","#4338CA"],["#FEF3C7","#92400E"],["#D1FAE5","#065F46"],
    ["#FCE7F3","#9D174D"],["#E0F2FE","#075985"],["#F3E8FF","#6B21A8"],
    ["#FFF1F2","#9F1239"],["#ECFDF5","#14532D"],
  ]
  let h = 0
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0
  const [bg, text] = palettes[h % palettes.length]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="${bg}"/>
  <text x="64" y="64" dy=".35em" text-anchor="middle" font-size="58" font-weight="800"
    font-family="system-ui,sans-serif" fill="${text}">${letter}</text>
</svg>`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params
  // Basic sanity check — domain should look like a hostname
  if (!domain || domain.includes("/") || domain.length > 253) {
    return new NextResponse(letterSvg(domain ?? "?"), {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
    })
  }

  for (const url of logoSources(domain)) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "StackFind/1.0" },
        signal: AbortSignal.timeout(4000),
        redirect: "follow",
      })
      if (!res.ok) continue
      const contentType = res.headers.get("content-type") ?? "image/png"
      // Skip SVG placeholders returned by some services as their "not found" fallback
      if (contentType.includes("svg") && url.includes("clearbit")) continue
      const buffer = await res.arrayBuffer()
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      })
    } catch { /* try next */ }
  }

  // All sources failed — return SVG letter avatar
  return new NextResponse(letterSvg(domain), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
