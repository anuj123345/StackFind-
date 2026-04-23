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
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 120, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, 40, 0], 
            y: [0, -60, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full" 
        />
      </div>

      <div className="relative z-10">
        {/* 1. Cinematic Hero (Scroll-Scrub) */}
        <ScrubHero />

        {/* 2. Features Bento Grid */}
        <ServicesBento />

        {/* 3. Dynamic Stats Section */}
        <LiquidStats />

        {/* 4. GST Savings Deep Dive */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-4xl lg:text-7xl font-black mb-6 text-white leading-[1.1] tracking-tight">
                  Stop burning 18% <br/> on every tool.
                </h2>
                <p className="text-stone-400 max-w-2xl mx-auto text-lg lg:text-xl">
                  Most Indian founders don't realize they can claim GST back on global SaaS. 
                  We've built the calculator to show you exactly how much you're leaving on the table.
                </p>
              </motion.div>
            </div>
            <SavingsCalculator />
          </div>
        </section>

        {/* 5. Tool Categories (Restyled) */}
        <div className="py-12">
          <CategoriesRow categories={mappedCategories} />
        </div>

        {/* 6. Pricing & Membership */}
        <div className="py-12">
          <PricingSection />
        </div>

        {/* 7. FAQ */}
        <div className="py-12 border-t border-white/5">
          <FAQ />
        </div>

        <Footer />
      </div>
    </main>
  )
}
