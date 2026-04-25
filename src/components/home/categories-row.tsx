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
    <section className="relative z-10 px-4 py-4">
      <div className="max-w-7xl mx-auto">

        {/* Section label + link */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className="text-[0.65rem] font-bold tracking-[0.2em] uppercase opacity-60"
              style={{ color: "#1C1611" }}
            >
              Browse by Category
            </span>
            <div className="h-px w-12 bg-[#8C6E50]/10" />
          </div>
          <Link
            href="/categories"
            className="text-[0.7rem] font-bold transition-colors duration-200 hover:text-indigo-600 opacity-60 hover:opacity-100"
            style={{ color: "#1C1611" }}
          >
            All {categories.length} →
          </Link>
        </div>

        {/* Scrollable chip row */}
        <div className="relative -mx-4 overflow-hidden group">
          <div
            className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar scroll-smooth"
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-white border border-[#8C6E50]/10 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
                style={{
                  background: "rgba(255,255,255,0.6)",
                }}
              >
                <span className="text-base select-none leading-none" aria-hidden="true">
                  {getIcon(cat.slug, cat.icon)}
                </span>
                <span
                  className="text-[0.8rem] font-semibold whitespace-nowrap"
                  style={{ color: "#1C1611" }}
                >
                  {cat.name}
                </span>
                <span
                  className="text-[0.65rem] font-bold tabular-nums opacity-40 group-hover:opacity-100 group-hover:text-indigo-600 transition-all"
                  style={{ color: "#7A6A57" }}
                >
                  {cat.tool_count}
                </span>
              </Link>
            ))}
          </div>
          
          {/* Edge Fades */}
          <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-[#FAF7F2] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 bottom-4 w-12 bg-gradient-to-r from-[#FAF7F2] to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  )
}
