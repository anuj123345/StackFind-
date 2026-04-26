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
import { Sparkles, RotateCcw, ArrowRight } from "lucide-react"

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

      {/* 1. Replay Welcome Button (Minimal & Professional Arrow Button) */}
      <button 
        onClick={replayIntro}
        className="fixed top-24 left-6 md:top-8 md:left-8 z-[60] group flex items-center gap-3 px-1.5 py-1.5 pr-4 rounded-full bg-white/40 backdrop-blur-md border border-[rgba(140,110,80,0.12)] hover:bg-white/60 hover:border-[rgba(140,110,80,0.25)] transition-all duration-300 active:scale-95 shadow-sm"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
          <RotateCcw size={12} className="group-hover:rotate-[-90deg] transition-transform duration-500" />
        </div>
        <span className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-[#1C1611]/50 group-hover:text-[#1C1611] transition-colors">
          Replay
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
