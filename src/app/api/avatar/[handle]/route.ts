/**
 * GET /api/avatar/[handle]
 *
 * Server-side proxy that fetches a Twitter/X profile picture.
 * Tries multiple sources in order, returns SVG letter avatar as final fallback.
 * Cached for 24 hours via Cache-Control.
 */

import { NextRequest, NextResponse } from "next/server"

const SOURCES = (handle: string) => [
  `https://unavatar.io/twitter/${handle}`,
  `https://unavatar.io/${handle}`,
  `https://github.com/${handle}.png?size=200`,
]

function letterSvg(handle: string): string {
  const letter = handle.charAt(0).toUpperCase()
  const colors = [
    ["#EEF2FF","#4338CA"],["#FEF3C7","#92400E"],["#DCFCE7","#166534"],
    ["#FCE7F3","#9D174D"],["#E0F2FE","#075985"],["#F3E8FF","#6B21A8"],
    ["#FFEDD5","#9A3412"],["#FEF9C3","#713F12"],
  ]
  let h = 0
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0
  const [bg, text] = colors[h % colors.length]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="100" fill="${bg}"/>
  <text x="100" y="100" dy=".35em" text-anchor="middle" font-size="90" font-weight="800"
    font-family="system-ui,sans-serif" fill="${text}">${letter}</text>
</svg>`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  for (const url of SOURCES(handle)) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "StackFind/1.0" },
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
      })
      if (res.ok) {
        const contentType = res.headers.get("content-type") ?? "image/jpeg"
        // Skip if it's an SVG placeholder (unavatar fallback)
        if (contentType.includes("svg") && !url.includes("github")) continue
        const buffer = await res.arrayBuffer()
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        })
      }
    } catch { /* try next */ }
  }

  // All sources failed — return SVG letter avatar
  return new NextResponse(letterSvg(handle), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
