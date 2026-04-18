import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { getCategories } from "@/lib/queries"

export const dynamic = "force-dynamic"
export const metadata = { title: "Categories — StackFind" }

const ICON_FALLBACK: Record<string, string> = {
  "writing": "✍️", "image-generation": "🎨", "video": "🎬", "coding": "💻",
  "productivity": "⚡", "marketing": "📣", "seo": "🔍", "chatbots": "🤖",
  "automation": "⚙️", "made-in-india": "🇮🇳",
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-2">
            <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
              Browse
            </span>
          </div>
          <h1
            className="font-black leading-tight mb-4"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#1C1611",
            }}
          >
            Categories
          </h1>
          <p className="mb-12 max-w-lg" style={{ color: "#7A6A57", fontSize: "1.0625rem", lineHeight: "1.6" }}>
            {categories.length} curated categories covering every use case for Indian founders and developers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="card-bezel group">
                <div className="card-inner p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl leading-none">{cat.icon ?? ICON_FALLBACK[cat.slug] ?? "🔧"}</span>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full tabular-nums"
                      style={{ background: "rgba(140,110,80,0.06)", color: "#C4B0A0" }}
                    >
                      {cat.tool_count} tools
                    </span>
                  </div>
                  <div>
                    <h2
                      className="font-bold mb-1 transition-colors group-hover:text-indigo-600"
                      style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611" }}
                    >
                      {cat.name}
                    </h2>
                    <p className="text-xs leading-relaxed" style={{ color: "#7A6A57" }}>
                      {cat.description ?? `Browse ${cat.name.toLowerCase()} AI tools`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
