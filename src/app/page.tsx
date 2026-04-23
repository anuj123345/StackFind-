import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ScrubHero } from "@/components/pricing/ScrubHero"
import { ServicesBento } from "@/components/pricing/ServicesBento"
import { LiquidStats } from "@/components/pricing/LiquidStats"
import { SavingsCalculator } from "@/components/pricing/savings-calculator"
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
    <main className="min-h-screen bg-[#1C1611] relative overflow-hidden">
      <Navbar />
      
      {/* Dynamic Background Elements (Client Side) */}
      <AmbientBackground />

      <div className="relative z-10">
        {/* 1. Cinematic Hero (Scroll-Scrub) */}
        <ScrubHero />

        {/* 2. Features Bento Grid */}
        <ServicesBento />

        {/* 3. Dynamic Stats Section */}
        <LiquidStats />

        {/* 4. GST Savings Deep Dive */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <div>
                <h2 className="font-display text-4xl lg:text-7xl font-black mb-4 text-white leading-[1.1] tracking-tight">
                  Stop burning 18% <br/> on every tool.
                </h2>
                <p className="text-stone-400 max-w-2xl mx-auto text-lg lg:text-xl opacity-80 leading-snug">
                  Most Indian founders don't realize they can claim GST back on global SaaS. 
                  We show you exactly how much you're leaving on the table.
                </p>
              </div>
            </div>
            <SavingsCalculator />
          </div>
        </section>

        {/* 5. Tool Categories (Restyled) */}
        <div className="py-8">
          <CategoriesRow categories={mappedCategories} />
        </div>

        {/* 6. Pricing & Membership */}
        <div className="py-8">
          <PricingSection />
        </div>

        {/* 7. FAQ */}
        <div className="py-8 border-t border-white/5">
          <FAQ />
        </div>

        <Footer />
      </div>
    </main>
  )
}
