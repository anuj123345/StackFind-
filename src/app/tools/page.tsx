// Navbar rendered by global layout
import { Footer } from "@/components/footer"
import { ToolsDirectory } from "@/components/tools/tools-directory"
import { getAllTools, getCategories } from "@/lib/queries"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const metadata = { title: "AI Tools Directory — StackFind" }

const GUEST_LIMIT = 16

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; pricing?: string; india?: string }>
}

async function Directory({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const [allTools, categories] = await Promise.all([getAllTools(), getCategories()])
  const tools = isAuthenticated ? allTools : allTools.slice(0, GUEST_LIMIT)

  return (
    <ToolsDirectory
      tools={tools}
      categories={categories}
      initialSearch={params.q ?? ""}
      initialCategory={params.category ?? ""}
      initialPricing={params.pricing ?? ""}
      initialIndia={params.india === "1"}
      isAuthenticated={isAuthenticated}
      totalCount={allTools.length}
    />
  )
}

export default async function ToolsPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="mb-2 flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium transition-colors duration-200 hover:text-[#1C1611]"
              style={{ color: "#C4B0A0" }}
            >
              ← Home
            </Link>
            <span style={{ color: "rgba(140,110,80,0.25)" }}>·</span>
            <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
              Directory
            </span>
          </div>
          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#1C1611",
            }}
          >
            All AI Tools
          </h1>
          <p className="mb-10 max-w-lg" style={{ color: "#7A6A57", fontSize: "1.0625rem", lineHeight: "1.6" }}>
            Curated AI tools with INR pricing and UPI billing support.
          </p>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card-bezel">
                  <div className="card-inner p-4 h-36 animate-pulse" style={{ background: "rgba(140,110,80,0.04)" }} />
                </div>
              ))}
            </div>
          }>
            <Directory searchParams={searchParams} />
          </Suspense>

        </div>
      </main>
      <Footer />
    </div>
  )
}
