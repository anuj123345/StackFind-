import { createClient } from "@/lib/supabase/server"
import { Footer } from "@/components/footer"
import { ScrubHero } from "@/components/pricing/ScrubHero"
import { ServicesBento } from "@/components/pricing/ServicesBento"
import { FAQ } from "@/components/home/faq"
import { CategoriesRow } from "@/components/home/categories-row"
import { PricingSection } from "@/components/home/pricing-section"
import { AmbientBackground } from "@/components/home/ambient-background"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*, tools(count)")
    .order("name")

  // Map tool count correctly
  const mappedCategories = (categories || []).map((cat: any) => ({
    ...cat,
    tool_count: cat.tools?.[0]?.count || 0
  }))

  return (
    <div className="relative overflow-hidden bg-[#1C1611] min-h-screen">
      {/* Dynamic Background Elements (Client Side) */}
      <AmbientBackground />

      <div className="relative z-10">
        {/* 1. Cinematic Hero (Scroll-Scrub) */}
        <ScrubHero />

        {/* 2. Features Bento Grid */}
        <ServicesBento />

        {/* 3. Tool Categories (Restyled) */}
        <div className="py-4">
          <CategoriesRow categories={mappedCategories} />
        </div>

        {/* 4. Pricing & Membership */}
        <div className="py-6">
          <PricingSection />
        </div>

        {/* 5. FAQ */}
        <div className="py-6 border-t border-white/5">
          <FAQ />
        </div>

        <Footer />
      </div>
    </div>
  )
}
