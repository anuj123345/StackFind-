import { HeroSection } from "@/components/home/hero-section"
import { CategoriesRow } from "@/components/home/categories-row"
import { FeaturedTools } from "@/components/home/featured-tools"
import { WhySection } from "@/components/home/why-section"
import { LatestTools } from "@/components/home/latest-tools"
import { NewsletterBanner } from "@/components/home/newsletter-banner"
import { Footer } from "@/components/footer"
import { getFeaturedTools, getLatestTools, getCategories, getToolStats } from "@/lib/queries"

export default async function HomePage() {
  const [featuredTools, latestTools, categories, stats] = await Promise.all([
    getFeaturedTools(6),
    getLatestTools(8),
    getCategories(),
    getToolStats(),
  ])

  return (
    <>
      <HeroSection stats={stats} />
      <CategoriesRow categories={categories} />
      <FeaturedTools tools={featuredTools} />
      <WhySection />
      <LatestTools tools={latestTools} />
      <NewsletterBanner />
      <Footer />
    </>
  )
}
