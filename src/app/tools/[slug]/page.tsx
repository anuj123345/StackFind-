import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { getToolBySlug, getRelatedTools } from "@/lib/queries"
import { ArrowUpRight, ChevronUp, Globe, Tag } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { DetailLogo } from "@/components/tools/detail-logo"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) return { title: "Tool not found — StackFind" }
  return {
    title: `${tool.name} — StackFind`,
    description: tool.tagline,
  }
}

const PRICING_LABEL: Record<string, string> = {
  free: "Free", freemium: "Freemium", paid: "Paid", open_source: "Open Source",
}
const PRICING_COLOR: Record<string, { bg: string; color: string }> = {
  free:        { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  freemium:    { bg: "rgba(99,102,241,0.1)",  color: "#6366f1" },
  paid:        { bg: "rgba(217,119,6,0.1)",   color: "#D97706" },
  open_source: { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
}


export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) notFound()

  const related = await getRelatedTools(slug, [], 4)

  const pricing = PRICING_COLOR[tool.pricing_model] ?? PRICING_COLOR.free

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />
      <main className="pt-28 pb-24 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-xs" style={{ color: "#C4B0A0" }}>
            <Link href="/" className="hover:text-[#7A6A57] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-[#7A6A57] transition-colors">Tools</Link>
            <span>/</span>
            <span style={{ color: "#7A6A57" }}>{tool.name}</span>
          </div>

          {/* Hero */}
          <div
            className="rounded-2xl p-8 mb-6"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">

              {/* Logo */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  background: "rgba(140,110,80,0.06)",
                  border: "1px solid rgba(140,110,80,0.12)",
                }}
              >
                <DetailLogo name={tool.name} website={tool.website} logoUrl={tool.logo_url} />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1
                    className="font-black leading-tight"
                    style={{
                      fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                      fontSize: "clamp(1.5rem, 3vw, 2rem)",
                      color: "#1C1611",
                    }}
                  >
                    {tool.name}
                  </h1>
                  {tool.is_made_in_india && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: "rgba(217,119,6,0.1)", color: "#D97706" }}
                    >
                      🇮🇳 Made in India
                    </span>
                  )}
                </div>
                <p className="text-base mb-4 max-w-2xl" style={{ color: "#7A6A57", lineHeight: "1.6" }}>
                  {tool.tagline}
                </p>

                {/* Category tags */}
                <div className="flex flex-wrap gap-2">
                  {tool.categoryNames.map(cat => (
                    <Link
                      key={cat}
                      href={`/tools?category=${cat.toLowerCase().replace(/\s+/g, "-")}`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
                      style={{ background: "rgba(140,110,80,0.06)", color: "#7A6A57", border: "1px solid rgba(140,110,80,0.1)" }}
                    >
                      <Tag size={10} />
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                {tool.website && (
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-80"
                    style={{ background: "#1C1611", color: "#FAF7F2" }}
                  >
                    <Globe size={14} />
                    Visit site
                    <ArrowUpRight size={13} />
                  </a>
                )}
                <div
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                  style={{ border: "1px solid rgba(140,110,80,0.2)", color: "#7A6A57" }}
                >
                  <ChevronUp size={15} />
                  {tool.upvotes.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: description */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              {tool.description && (
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
                >
                  <h2
                    className="font-bold mb-3 text-sm tracking-wide uppercase"
                    style={{ color: "#C4B0A0", letterSpacing: "0.1em" }}
                  >
                    About
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#7A6A57", lineHeight: "1.75" }}>
                    {tool.description}
                  </p>
                </div>
              )}


            </div>

            {/* Right: sidebar */}
            <div className="space-y-4">

              {/* Pricing card */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
              >
                <h2
                  className="font-bold mb-3 text-sm tracking-wide uppercase"
                  style={{ color: "#C4B0A0", letterSpacing: "0.1em" }}
                >
                  Pricing
                </h2>
                <div
                  className="inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm mb-3"
                  style={{ background: pricing.bg, color: pricing.color }}
                >
                  {PRICING_LABEL[tool.pricing_model]}
                </div>
                {tool.starting_price_inr && (
                  <p className="text-sm" style={{ color: "#7A6A57" }}>
                    Starting from{" "}
                    <span className="font-semibold" style={{ color: "#1C1611" }}>
                      ₹{tool.starting_price_inr.toLocaleString("en-IN")}/mo
                    </span>
                  </p>
                )}
                {tool.starting_price_usd && !tool.starting_price_inr && (
                  <p className="text-sm" style={{ color: "#7A6A57" }}>
                    Starting from{" "}
                    <span className="font-semibold" style={{ color: "#1C1611" }}>
                      ${tool.starting_price_usd}/mo
                    </span>
                  </p>
                )}
              </div>

              {/* Quick facts */}
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
              >
                <h2
                  className="font-bold text-sm tracking-wide uppercase"
                  style={{ color: "#C4B0A0", letterSpacing: "0.1em" }}
                >
                  Details
                </h2>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "#C4B0A0" }}>Upvotes</span>
                    <span className="font-semibold tabular-nums" style={{ color: "#1C1611" }}>
                      {tool.upvotes.toLocaleString()}
                    </span>
                  </div>
                  {tool.categoryNames.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "#C4B0A0" }}>Category</span>
                      <span className="font-medium" style={{ color: "#7A6A57" }}>
                        {tool.categoryNames[0]}
                      </span>
                    </div>
                  )}
                  {tool.website && (
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "#C4B0A0" }}>Website</span>
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium flex items-center gap-1 transition-colors"
                        style={{ color: "#6366f1" }}
                      >
                        Visit <ArrowUpRight size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Related tools */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: "#C4B0A0" }}
                >
                  Related Tools
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(140,110,80,0.1)" }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {related.map(t => (
                  <ToolCard
                    key={t.slug}
                    name={t.name}
                    slug={t.slug}
                    tagline={t.tagline}
                    website={t.website}
                    logoUrl={t.logo_url ?? undefined}
                    pricingModel={t.pricing_model}
                    upvotes={t.upvotes}
                    isMadeInIndia={t.is_made_in_india}
                    hasInrBilling={t.has_inr_billing}
                    hasUpi={t.has_upi}
                    categories={t.categoryNames}
                  />
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
