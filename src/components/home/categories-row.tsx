import Link from "next/link"
import type { Category } from "@/types/database"

// Icon map for categories (DB stores icon as emoji or null)
const ICON_FALLBACK: Record<string, string> = {
  "writing": "✍️", "image-generation": "🎨", "video": "🎬", "coding": "💻",
  "productivity": "⚡", "marketing": "📣", "seo": "🔍", "chatbots": "🤖",
  "automation": "⚙️", "made-in-india": "🇮🇳",
}

interface CategoriesRowProps {
  categories: Category[]
}

export function CategoriesRow({ categories }: CategoriesRowProps) {
  return (
    <section className="relative z-10 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
            Browse by Category
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(140,110,80,0.1)" }} />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="card-bezel flex-shrink-0 group cursor-pointer">
              <div className="card-inner flex flex-col items-center gap-2 px-5 py-4 min-w-[100px]">
                <span className="text-2xl leading-none">{cat.icon ?? ICON_FALLBACK[cat.slug] ?? "🔧"}</span>
                <span className="text-xs font-semibold text-center leading-tight transition-colors group-hover:text-[#1C1611]"
                  style={{ color: "#7A6A57" }}>
                  {cat.name}
                </span>
                <span className="text-[10px]" style={{ color: "#C4B0A0" }}>{cat.tool_count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
