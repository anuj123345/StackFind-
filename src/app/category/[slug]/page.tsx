import { notFound } from "next/navigation"
// Navbar rendered by global layout
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { getCategoryBySlug, getToolsByCategory } from "@/lib/queries"
import type { Metadata } from "next"

// Always fetch fresh — new tools appear immediately without a rebuild
export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategoryBySlug(slug)
  if (!cat) return {}
  return {
    title: `${cat.name} AI Tools — StackFind`,
    description: cat.description ?? `Browse the best ${cat.name} AI tools curated for Indian users.`,
  }
}

const ICON_FALLBACK: Record<string, string> = {
  "writing": "✍️", "image-generation": "🎨", "video": "🎬", "coding": "💻",
  "productivity": "⚡", "marketing": "📣", "seo": "🔍", "chatbots": "🤖",
  "automation": "⚙️", "made-in-india": "🇮🇳",
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [cat, tools] = await Promise.all([
    getCategoryBySlug(slug),
    getToolsByCategory(slug),
  ])

  if (!cat) notFound()

  const icon = cat.icon ?? ICON_FALLBACK[slug] ?? "🔧"

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase mb-2 block" style={{ color: "#C4B0A0" }}>
              Category
            </span>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl leading-none">{icon}</span>
              <h1
                className="font-black leading-tight"
                style={{
                  fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                  fontSize: "clamp(1.75rem, 4vw, 3rem)",
                  color: "#1C1611",
                }}
              >
                {cat.name}
              </h1>
            </div>
            {cat.description && (
              <p className="max-w-lg" style={{ color: "#7A6A57", fontSize: "1.0625rem", lineHeight: "1.6" }}>
                {cat.description}
              </p>
            )}
            <p className="mt-2 text-sm font-medium" style={{ color: "#C4B0A0" }}>
              {tools.length} tool{tools.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Grid */}
          {tools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tools.map(tool => (
                <ToolCard
                  key={tool.slug}
                  name={tool.name}
                  slug={tool.slug}
                  tagline={tool.tagline}
                  website={tool.website}
                  logoUrl={tool.logo_url ?? undefined}
                  pricingModel={tool.pricing_model}
                  upvotes={tool.upvotes}
                  isMadeInIndia={tool.is_made_in_india}
                  hasInrBilling={tool.has_inr_billing}
                  hasUpi={tool.has_upi}
                  categories={tool.categoryNames}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl py-16 text-center"
              style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.1)" }}
            >
              <p className="text-2xl mb-2">{icon}</p>
              <p className="font-semibold mb-1" style={{ color: "#1C1611" }}>No tools yet</p>
              <p className="text-sm" style={{ color: "#C4B0A0" }}>Check back soon — we add new tools daily.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
