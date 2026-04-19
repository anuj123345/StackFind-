import Link from "next/link"
import { Lock } from "lucide-react"

interface GuestWallProps {
  lockedCount?: number
  label?: string // e.g. "tools", "founders"
  message?: string // custom headline, overrides count+label
}

export function GuestWall({ lockedCount, label = "results", message }: GuestWallProps) {
  const headline = message ?? `${lockedCount?.toLocaleString()} ${label} locked`
  return (
    <div className="relative mt-3" style={{ minHeight: 280 }}>
      {/* Ghost rows — give the wall depth */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        style={{ filter: "blur(10px)", pointerEvents: "none", userSelect: "none", opacity: 0.45 }}
        aria-hidden
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card-bezel">
            <div className="card-inner p-4" style={{ height: 148 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: "rgba(140,110,80,0.15)" }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded-full" style={{ background: "rgba(140,110,80,0.15)", width: `${55 + (i * 13) % 35}%` }} />
                  <div className="h-2.5 rounded-full" style={{ background: "rgba(140,110,80,0.1)", width: `${30 + (i * 17) % 30}%` }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 rounded-full" style={{ background: "rgba(140,110,80,0.08)", width: "92%" }} />
                <div className="h-2.5 rounded-full" style={{ background: "rgba(140,110,80,0.08)", width: "75%" }} />
                <div className="h-2.5 rounded-full" style={{ background: "rgba(140,110,80,0.08)", width: "60%" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient + CTA */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-4"
        style={{
          background: "linear-gradient(to bottom, rgba(250,247,242,0) 0%, rgba(250,247,242,0.9) 35%, rgba(250,247,242,1) 60%)",
        }}
      >
        <div
          className="rounded-2xl px-8 py-7 text-center w-full max-w-sm"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(140,110,80,0.14)",
            boxShadow: "0 8px 48px rgba(140,110,80,0.14), 0 2px 12px rgba(140,110,80,0.08)",
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(99,102,241,0.08)" }}
          >
            <Lock size={18} style={{ color: "#6366f1" }} />
          </div>
          <p
            className="font-black mb-2 leading-tight"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "1.375rem",
              color: "#1C1611",
              letterSpacing: "-0.02em",
            }}
          >
            {headline}
          </p>
          <p className="text-[0.8125rem] mb-5 leading-relaxed" style={{ color: "#7A6A57" }}>
            Sign in free to unlock the full directory — INR pricing, UPI billing &amp; Made‑in‑India picks.
          </p>
          <Link
            href="/login"
            className="block w-full py-3 rounded-xl font-bold text-[0.9375rem] text-center transition-all duration-200 hover:opacity-90"
            style={{ background: "#6366f1", color: "#fff" }}
          >
            Unlock everything →
          </Link>
          <p className="text-[0.75rem] mt-3" style={{ color: "#C4B0A0" }}>
            Free forever · No credit card
          </p>
        </div>
      </div>
    </div>
  )
}
