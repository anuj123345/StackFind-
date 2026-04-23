import { Navbar } from "@/components/navbar"
import { PricingSection } from "@/components/home/pricing-section"
import { Footer } from "@/components/footer"
import { SavingsCalculator } from "@/components/pricing/savings-calculator"
import { ComparisonGrid } from "@/components/pricing/comparison-grid"
import { PricingHero } from "@/components/pricing/pricing-hero"

export const metadata = {
  title: "Pricing & Managed Billing | StackFind",
  description: "Save 18% on global SaaS tools with Indian GST invoicing and INR payments.",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F9F5F1]">
      <Navbar />
      
      {/* Managed Billing Intro Hero */}
      <PricingHero />

      {/* Calculator Section */}
      <section className="bg-white/40 border-y border-stone-200">
        <SavingsCalculator />
      </section>

      {/* Main Plans Section */}
      <div className="py-12">
        <PricingSection />
      </div>

      {/* Comparison Grid */}
      <section className="bg-[#1C1611] text-white overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <ComparisonGrid />
        </div>
      </section>

      <Footer />
    </main>
  )
}
