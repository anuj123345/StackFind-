"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { ServicesBento } from "@/components/pricing/ServicesBento"
import { FAQ } from "@/components/home/faq"
import { CategoriesRow } from "@/components/home/categories-row"
import { PricingSection } from "@/components/home/pricing-section"
import { AmbientBackground } from "@/components/home/ambient-background"
import { WelcomeIntro } from "@/components/home/welcome-intro"
import { AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function HomePage() {
  const [showIntro, setShowIntro] = useState<boolean | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Check session storage
    const hasSeenIntro = sessionStorage.getItem("stackfind-intro-seen")
    if (hasSeenIntro) {
      setShowIntro(false)
    } else {
      setShowIntro(true)
    }

    // Fetch categories client-side to keep it reactive with the intro
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("categories")
        .select("*, tools(count)")
        .order("name")
      
      const mapped = (data || []).map((cat: any) => ({
        ...cat,
        tool_count: cat.tools?.[0]?.count || 0
      }))
      setCategories(mapped)
    }
    fetchCategories()

    // Fetch stats
    const fetchStats = async () => {
      const supabase = createClient()
      const [totalRes, indiaRes, catRes, freeRes] = await Promise.all([
        supabase.from('tools').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('tools').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('is_made_in_india', true),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('tools').select('id', { count: 'exact', head: true }).eq('status', 'approved').in('pricing_model', ['free', 'freemium']),
      ])
      const total = totalRes.count ?? 0
      setStats({
        total,
        madeInIndia: indiaRes.count ?? 0,
        categories: catRes.count ?? 0,
        freeOrFreemium: total > 0 ? Math.round(((freeRes.count ?? 0) / total) * 100) : 0,
      })
    }
    fetchStats()
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem("stackfind-intro-seen", "true")
    setShowIntro(false)
  }

  if (showIntro === null) return null

  const replayIntro = () => {
    setShowIntro(true)
  }

  return (
    <div className="relative overflow-hidden bg-[#FAF7F2] min-h-screen">
      <AnimatePresence>
        {showIntro && <WelcomeIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* 1. Replay Welcome Button (Top Left - Adjusted for Mobile) */}
      <button 
        onClick={replayIntro}
        className="fixed top-24 left-6 md:top-8 md:left-8 z-[60] group flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-xl liquid-glass border border-white/20 hover:border-white/40 transition-all active:scale-95 shadow-lg shadow-black/5"
      >
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
          <Sparkles size={12} className="text-indigo-600 md:w-[14px] md:h-[14px]" />
        </div>
        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#1C1611]/70 group-hover:text-[#1C1611] transition-colors">
          Welcome
        </span>
      </button>

      {/* Dynamic Background Elements (Client Side) */}
      <AmbientBackground />

      <div className="relative z-10">
        {/* 1. Cinematic Hero (Nature Vibe) */}
        <HeroSection stats={stats} />

        {/* 2. Features Bento Grid */}
        <ServicesBento />

        {/* 3. Tool Categories (Restyled) */}
        <div className="py-4">
          <CategoriesRow categories={categories} />
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
