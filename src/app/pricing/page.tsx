import { PricingSection } from "@/components/home/pricing-section"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Pricing | StackFind",
  description: "Simple, transparent pricing for Indian founders. Unlock unlimited playground generations and GTM strategies.",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F9F5F1]">
      {/* General Pricing Hero */}
      <section className="pt-24 pb-8 px-6 text-center">
        <h1 className="text-4xl lg:text-7xl font-black tracking-tight mb-4" style={{ color: "#1C1611" }}>
          Fair <span className="text-indigo-600">Pricing.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base lg:text-lg opacity-80" style={{ color: "#7A6A57" }}>
          Access the full power of the AI Playground and our curated tool directory. 
          No hidden fees, just value for Indian builders.
        </p>
      </section>

      {/* Main Plans Section */}
      <div className="py-8">
        <PricingSection />
      </div>

      <Footer />
    </main>
  )
}
