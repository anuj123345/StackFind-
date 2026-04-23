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
      
      {/* General Pricing Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6" style={{ color: "#1C1611" }}>
          SaaS Cost <span className="text-indigo-600">Calculator</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg" style={{ color: "#7A6A57" }}>
          Estimate your stack costs and learn how to optimize your SaaS spend with GST invoices and local payment methods.
        </p>
      </section>

      {/* Calculator Section */}
      <section className="bg-white/40 border-y border-stone-200">
        <SavingsCalculator />
      </section>

      {/* Main Plans Section */}
      <div className="py-12">
        <PricingSection />
      </div>

      <Footer />
    </main>
  )
}
