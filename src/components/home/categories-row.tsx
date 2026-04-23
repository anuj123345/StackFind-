import Link from "next/link"
import type { Category } from "@/types/database"

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

function getIcon(slug: string, dbIcon: string | null) {
  return dbIcon ?? ICONS[slug] ?? "◆"
}

interface CategoriesRowProps {
  categories: Category[]
}

export function CategoriesRow({ categories }: CategoriesRowProps) {
  return (
    <section className="relative z-10 px-4 pb-20">
      <div className="max-w-6xl mx-auto">

        {/* Section label + link */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "#C4B0A0" }}
            >
              Browse by Category
            </span>
            <div className="h-px w-16" style={{ background: "rgba(140,110,80,0.1)" }} />
          </div>
          <Link
            href="/categories"
            className="text-[0.75rem] font-semibold transition-colors duration-200 hover:text-[#1C1611]"
            style={{ color: "#C4B0A0" }}
          >
            All {categories.length} →
          </Link>
        </div>

        {/* Scrollable chip row */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex-shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl transition-all duration-200 hover:bg-[rgba(99,102,241,0.07)] hover:border-[rgba(99,102,241,0.2)]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="leading-none select-none"
                style={{ fontSize: "1rem" }}
                aria-hidden="true"
              >
                {getIcon(cat.slug, cat.icon)}
              </span>
              <span
                className="text-[0.8125rem] font-semibold whitespace-nowrap transition-colors duration-200 group-hover:text-indigo-400"
                style={{ color: "#F9F5F1" }}
              >
                {cat.name}
              </span>
              <span
                className="text-[0.6875rem] font-bold tabular-nums ml-0.5"
                style={{ color: "#8E8277" }}
              >
                {cat.tool_count}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
