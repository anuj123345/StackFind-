import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { getToolBySlug, getRelatedTools } from "@/lib/queries"
import { ArrowUpRight, ChevronUp, Globe, Tag, MessageSquare, TrendingUp, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { DetailLogo } from "@/components/tools/detail-logo"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── Reddit fetcher ────────────────────────────────────────────────────────────

interface RedditPost {
  title: string
  score: number
  subreddit: string
  url: string
  numComments: number
  selftext: string
  createdUtc: number
}

async function fetchRedditPosts(toolName: string): Promise<RedditPost[]> {
  try {
    const query = encodeURIComponent(`${toolName} review OR tutorial OR experience OR project`)
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${query}&sort=top&t=year&limit=8&type=link`,
      {
        headers: { "User-Agent": "StackFind/1.0 (+https://stackfind.in) tool discovery" },
        next: { revalidate: 43200 }, // cache 12h
      }
    )
    if (!res.ok) return []
    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json?.data?.children ?? []).map((c: any) => ({
      title: c.data.title as string,
      score: c.data.score as number,
      subreddit: c.data.subreddit as string,
      url: `https://reddit.com${c.data.permalink}` as string,
      numComments: c.data.num_comments as number,
      selftext: ((c.data.selftext as string) || "").slice(0, 300),
      createdUtc: c.data.created_utc as number,
    }))
  } catch {
    return []
  }
}

function timeAgo(utc: number): string {
  const diff = Math.floor(Date.now() / 1000) - utc
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`
  return `${Math.floor(diff / 31536000)}y ago`
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) return { title: "Tool not found — StackFind" }
  return {
    title: `${tool.name} — StackFind`,
    description: tool.tagline,
  }
}

// ─── Pricing config ────────────────────────────────────────────────────────────

const PRICING_LABEL: Record<string, string> = {
  free: "Free", freemium: "Freemium", paid: "Paid", open_source: "Open Source",
}
const PRICING_COLOR: Record<string, { bg: string; color: string }> = {
  free:        { bg: "rgba(16,185,129,0.1)",  color: "#059669" },
  freemium:    { bg: "rgba(99,102,241,0.1)",  color: "#6366f1" },
  paid:        { bg: "rgba(217,119,6,0.1)",   color: "#D97706" },
  open_source: { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) notFound()

  const [related, redditPosts] = await Promise.all([
    getRelatedTools(slug, [], 4),
    fetchRedditPosts(tool.name),
  ])

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
                style={{ background: "rgba(140,110,80,0.06)", border: "1px solid rgba(140,110,80,0.12)" }}
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

            {/* Left: main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description / About */}
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
                {tool.description ? (
                  <p className="text-sm leading-relaxed" style={{ color: "#5A4A3A", lineHeight: "1.8" }}>
                    {tool.description}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ color: "#C4B0A0" }}>
                    No official description available. See community discussions below for real-world insights.
                  </p>
                )}
              </div>

              {/* Reddit Community Discussions */}
              {redditPosts.length > 0 && (
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2
                      className="font-bold text-sm tracking-wide uppercase"
                      style={{ color: "#C4B0A0", letterSpacing: "0.1em" }}
                    >
                      Community Discussions
                    </h2>
                    <a
                      href={`https://www.reddit.com/search/?q=${encodeURIComponent(tool.name)}&sort=top`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
                      style={{ color: "#FF4500" }}
                    >
                      View all on Reddit <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="space-y-3">
                    {redditPosts.map((post, i) => (
                      <a
                        key={i}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl p-4 transition-all duration-150 hover:scale-[1.01]"
                        style={{
                          background: "rgba(140,110,80,0.03)",
                          border: "1px solid rgba(140,110,80,0.08)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Score */}
                          <div
                            className="flex flex-col items-center flex-shrink-0 pt-0.5"
                            style={{ minWidth: 36 }}
                          >
                            <TrendingUp size={12} style={{ color: "#FF4500" }} />
                            <span
                              className="text-xs font-bold tabular-nums mt-0.5"
                              style={{ color: "#FF4500" }}
                            >
                              {post.score >= 1000
                                ? `${(post.score / 1000).toFixed(1)}k`
                                : post.score}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium leading-snug mb-1.5 line-clamp-2"
                              style={{ color: "#1C1611" }}
                            >
                              {post.title}
                            </p>
                            {post.selftext && (
                              <p
                                className="text-xs leading-relaxed mb-2 line-clamp-2"
                                style={{ color: "#7A6A57" }}
                              >
                                {post.selftext}
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(255,69,0,0.08)", color: "#FF4500" }}
                              >
                                r/{post.subreddit}
                              </span>
                              <span className="flex items-center gap-1 text-[10px]" style={{ color: "#C4B0A0" }}>
                                <MessageSquare size={9} />
                                {post.numComments} comments
                              </span>
                              <span className="text-[10px]" style={{ color: "#C4B0A0" }}>
                                {timeAgo(post.createdUtc)}
                              </span>
                            </div>
                          </div>

                          <ExternalLink size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#C4B0A0" }} />
                        </div>
                      </a>
                    ))}
                  </div>
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
                  {redditPosts.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "#C4B0A0" }}>Reddit posts</span>
                      <span className="font-semibold tabular-nums" style={{ color: "#1C1611" }}>
                        {redditPosts.length}
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
                        className="font-medium flex items-center gap-1 transition-colors hover:opacity-70"
                        style={{ color: "#6366f1" }}
                      >
                        Visit <ArrowUpRight size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Reddit summary stats */}
              {redditPosts.length > 0 && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(255,69,0,0.03)", border: "1px solid rgba(255,69,0,0.1)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="#FF4500">
                      <circle cx="10" cy="10" r="10"/>
                      <path fill="white" d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.08zM7.5 11a1 1 0 111 1 1 1 0 01-1-1zm5.6 2.71a3.58 3.58 0 01-2.1.52 3.58 3.58 0 01-2.1-.52.27.27 0 01.38-.38 3.27 3.27 0 001.72.4 3.27 3.27 0 001.72-.4.27.27 0 01.38.38zm-.1-1.71a1 1 0 111-1 1 1 0 01-1 1z"/>
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#FF4500" }}>
                      Reddit Buzz
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#7A6A57" }}>Top post score</span>
                      <span className="font-bold" style={{ color: "#FF4500" }}>
                        {Math.max(...redditPosts.map(p => p.score)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#7A6A57" }}>Total comments</span>
                      <span className="font-bold" style={{ color: "#1C1611" }}>
                        {redditPosts.reduce((a, p) => a + p.numComments, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "#7A6A57" }}>Subreddits</span>
                      <span className="font-bold" style={{ color: "#1C1611" }}>
                        {new Set(redditPosts.map(p => p.subreddit)).size}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
