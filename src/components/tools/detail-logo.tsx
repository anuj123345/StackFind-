"use client"

import { getLogoUrl } from "@/lib/logo"

const LETTER_PALETTES = [
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#075985" },
  { bg: "#F3E8FF", text: "#6B21A8" },
  { bg: "#FFF1F2", text: "#9F1239" },
  { bg: "#ECFDF5", text: "#14532D" },
]
function letterPalette(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return LETTER_PALETTES[h % LETTER_PALETTES.length]
}

interface DetailLogoProps {
  name: string
  website?: string | null
  logoUrl?: string | null
}

export function DetailLogo({ name, website, logoUrl }: DetailLogoProps) {
  const src = getLogoUrl(website, logoUrl)

  if (src) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        width={48}
        height={48}
        className="rounded-xl object-contain"
        style={{ width: 48, height: 48 }}
      />
    )
  }

  const palette = letterPalette(name)
  return (
    <span
      className="font-black flex items-center justify-center w-full h-full rounded-xl"
      style={{
        background: palette.bg,
        color: palette.text,
        fontFamily: "'Bricolage Grotesque Variable', sans-serif",
        fontSize: 22,
        letterSpacing: "-0.02em",
      }}
    >
      {name[0].toUpperCase()}
    </span>
  )
}
