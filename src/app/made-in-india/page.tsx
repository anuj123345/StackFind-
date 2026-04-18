import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { getMadeInIndiaTools } from "@/lib/queries"

export const metadata = { title: "Made in India AI Tools — StackFind" }

export default async function MadeInIndiaPage() {
  const tools = await getMadeInIndiaTools(12)

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-2">
            <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
              🇮🇳 Proudly Indian
            </span>
          </div>
          <div className="flex items-end justify-between mb-4 gap-4">
            <h1
              className="font-black leading-tight"
              style={{
                fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#1C1611",
              }}
            >
              Made in India
            </h1>
            <span
              className="text-sm font-semibold tabular-nums mb-2 flex-shrink-0"
              style={{ color: "#C4B0A0" }}
            >
              {tools.length} tools
            </span>
          </div>
          <p className="mb-12 max-w-lg" style={{ color: "#7A6A57", fontSize: "1.0625rem", lineHeight: "1.6" }}>
            AI tools built by Indian founders, for India and the world. Every tool here ships with INR billing and understands our context.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool) => (
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
        </div>
      </main>
      <Footer />
    </div>
  )
}
