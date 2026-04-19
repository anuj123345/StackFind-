// Navbar rendered by global layout
import { Footer } from "@/components/footer"
import Link from "next/link"
import { getCategories } from "@/lib/queries"

export const dynamic = "force-dynamic"
export const metadata = { title: "Categories — StackFind" }

// Full icon map — every slug covered, no 🔧 fallbacks
const ICONS: Record<string, string> = {
  "engineering":       "🛠️",
  "chatbots":          "🤖",
  "image-generation":  "🖼️",
  "productivity":      "🎯",
  "made-in-india":     "🇮🇳",
  "writing":           "✍️",
  "marketing":         "📣",
  "coding":            "💻",
  "video":             "🎬",
  "audio":             "🎙️",
  "automation":        "⚙️",
  "note-taking":       "📝",
  "vibe-coding":       "🪄",
  "design":            "✏️",
  "analytics":         "📊",
  "research":          "🔬",
  "customer-support":  "💬",
  "healthcare":        "🏥",
  "education":         "📚",
  "finance":           "💰",
  "code-editors":      "🖥️",
  "dictation":         "🎤",
  "seo":               "🔍",
  "legal":             "⚖️",
  "hr":                "👥",
  "3d":                "🎲",
  "translation":       "🌐",
}

// Domain cluster → very subtle warm tint
// 60-30-10 discipline: these are < 5% opacity, barely perceptible
const TINTS: Record<string, string> = {
  "engineering":       "rgba(99,102,241,0.05)",
  "coding":            "rgba(99,102,241,0.05)",
  "code-editors":      "rgba(99,102,241,0.05)",
  "analytics":         "rgba(99,102,241,0.05)",
  "automation":        "rgba(99,102,241,0.05)",
  "vibe-coding":       "rgba(99,102,241,0.05)",
  "image-generation":  "rgba(236,72,153,0.04)",
  "video":             "rgba(236,72,153,0.04)",
  "audio":             "rgba(236,72,153,0.04)",
  "design":            "rgba(236,72,153,0.04)",
  "writing":           "rgba(236,72,153,0.04)",
  "marketing":         "rgba(217,119,6,0.045)",
  "productivity":      "rgba(217,119,6,0.045)",
  "seo":               "rgba(217,119,6,0.045)",
  "finance":           "rgba(217,119,6,0.045)",
  "hr":                "rgba(217,119,6,0.045)",
  "research":          "rgba(20,184,166,0.04)",
  "education":         "rgba(20,184,166,0.04)",
  "healthcare":        "rgba(20,184,166,0.04)",
  "legal":             "rgba(20,184,166,0.04)",
  "note-taking":       "rgba(20,184,166,0.04)",
  "chatbots":          "rgba(20,184,166,0.04)",
  "customer-support":  "rgba(20,184,166,0.04)",
  "dictation":         "rgba(20,184,166,0.04)",
  "translation":       "rgba(20,184,166,0.04)",
  "3d":                "rgba(236,72,153,0.04)",
  "made-in-india":     "rgba(217,119,6,0.06)",
}

function icon(slug: string, dbIcon: string | null): string {
  return dbIcon ?? ICONS[slug] ?? "◆"
}

function tint(slug: string): string {
  return TINTS[slug] ?? "transparent"
}

export default async function CategoriesPage() {
  const categories = await getCategories()
  const totalTools = categories.reduce((s, c) => s + (c.tool_count ?? 0), 0)
  const featured = categories.slice(0, 6)
  const rest = categories.slice(6)

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────── */}
          <div className="mb-2">
            <span
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "#C4B0A0" }}
            >
              Browse
            </span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap mb-12">
            <h1
              className="font-black leading-[0.95]"
              style={{
                fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                color: "#1C1611",
                letterSpacing: "-0.03em",
              }}
            >
              Categories
            </h1>
            <p className="text-sm font-medium pb-1" style={{ color: "#C4B0A0" }}>
              {categories.length} categories&nbsp;&middot;&nbsp;
              <span style={{ color: "#7A6A57" }}>{totalTools.toLocaleString()}</span> tools
            </p>
          </div>

          {/* ── Featured — top 6 by tool_count ────────────── */}
          <div className="mb-3">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase mb-3"
              style={{ color: "#C4B0A0" }}
            >
              Most popular
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {featured.map((cat) => {
                const bg = tint(cat.slug)
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="card-bezel group block"
                  >
                    <div
                      className="card-inner flex flex-col p-5 gap-0"
                      style={{
                        minHeight: 164,
                        background: bg !== "transparent" ? bg : "#FFFFFF",
                      }}
                    >
                      {/* Icon row + ghost count */}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="leading-none select-none"
                          style={{ fontSize: "1.625rem" }}
                          aria-hidden="true"
                        >
                          {icon(cat.slug, cat.icon)}
                        </span>
                        {/* Ghost watermark number */}
                        <span
                          className="font-black tabular-nums select-none leading-none"
                          style={{
                            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                            fontSize: "clamp(2.75rem, 5vw, 3.5rem)",
                            letterSpacing: "-0.05em",
                            lineHeight: 0.85,
                            color: "#1C1611",
                            opacity: 0.07,
                          }}
                          aria-hidden="true"
                        >
                          {cat.tool_count}
                        </span>
                      </div>

                      {/* Name + description pushed to bottom */}
                      <div className="mt-auto pt-5">
                        <h2
                          className="font-bold mb-1.5 leading-snug transition-colors duration-200 group-hover:text-indigo-600"
                          style={{
                            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                            fontSize: "1.0625rem",
                            color: "#1C1611",
                          }}
                        >
                          {cat.name}
                        </h2>
                        <p
                          className="text-[0.8125rem] leading-relaxed line-clamp-2"
                          style={{ color: "#7A6A57" }}
                        >
                          {cat.description ?? `Browse ${cat.name.toLowerCase()} AI tools`}
                        </p>
                      </div>

                      {/* Hover footer */}
                      <div className="mt-3 flex items-center gap-1 overflow-hidden" style={{ height: 16 }}>
                        <span
                          className="text-[0.75rem] font-semibold transition-all duration-200 opacity-0 group-hover:opacity-100"
                          style={{ color: "#6366f1" }}
                        >
                          Browse {cat.tool_count} tools
                        </span>
                        <span
                          className="text-[0.75rem] font-bold transition-all duration-200 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5"
                          style={{ color: "#6366f1" }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── All other categories ───────────────────────── */}
          {rest.length > 0 && (
            <div>
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase mb-3 mt-8"
                style={{ color: "#C4B0A0" }}
              >
                All categories
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rest.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="card-bezel group block"
                  >
                    <div className="card-inner flex items-center gap-3 px-4 py-3.5">
                      {/* Icon */}
                      <span
                        className="leading-none select-none flex-shrink-0"
                        style={{ fontSize: "1.25rem", width: 24, textAlign: "center" }}
                        aria-hidden="true"
                      >
                        {icon(cat.slug, cat.icon)}
                      </span>

                      {/* Name + description */}
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-semibold text-sm block transition-colors duration-200 group-hover:text-indigo-600 truncate"
                          style={{
                            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                            color: "#1C1611",
                          }}
                        >
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span
                            className="text-[0.75rem] truncate block mt-0.5"
                            style={{ color: "#C4B0A0" }}
                          >
                            {cat.description}
                          </span>
                        )}
                      </div>

                      {/* Count + arrow */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[0.75rem] font-semibold tabular-nums px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(140,110,80,0.06)",
                            color: "#7A6A57",
                          }}
                        >
                          {cat.tool_count}
                        </span>
                        <span
                          className="text-xs transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
                          style={{ color: "#6366f1" }}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
