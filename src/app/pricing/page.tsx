import { Navbar } from "@/components/navbar"
import { PricingSection } from "@/components/home/pricing-section"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Pricing | StackFind",
  description: "Transparent, India-first pricing for founders and teams.",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F9F5F1]">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
    </main>
  )
}
