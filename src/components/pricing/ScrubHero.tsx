"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ScrubSequence } from "./ScrubSequence"
import { BlurText } from "./BlurText"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ScrubHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 0, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -100])

  return (
    <section ref={containerRef} className="relative h-[180vh] bg-[#1C1611]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* The Scrubbing Canvas (Fallback to Gradient if no frames) */}
        <div className="absolute inset-0 z-0">
          <ScrubSequence 
            framesPath="/frames" 
            frameCount={120} 
            scrollTargetRef={containerRef}
            className="w-full h-full object-cover opacity-40"
          />
          {/* Stunning Background Fallback */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-[#1C1611] pointer-events-none" />
          <div className="absolute inset-0 noise opacity-20 pointer-events-none" />
        </div>

        {/* Cinematic Content */}
        <motion.div 
          style={{ opacity, y: textY }}
          className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-strong border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400"
          >
            <Zap size={11} className="fill-indigo-400" />
            Built for the Indian AI Founder
          </motion.div>

          <BlurText 
            text="Find your stack. Build your future."
            className="font-display text-5xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="max-w-2xl text-lg lg:text-xl text-stone-400 mb-8 leading-relaxed font-medium"
          >
            The definitive directory for Indian founders to discover AI tools, 
            optimize SaaS spend, and master managed billing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link 
              href="/playground" 
              className={cn(
                buttonVariants({ variant: "hero" }), 
                "bg-indigo-600 hover:bg-indigo-500 text-white border-none rounded-xl px-8 py-5 text-base font-black group shadow-2xl shadow-indigo-500/20 h-auto flex items-center gap-3"
              )}
            >
              Launch Playground <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/pricing" 
              className={cn(
                buttonVariants({ variant: "ghost" }), 
                "text-stone-400 hover:text-white px-8 py-5 text-base font-bold h-auto border border-white/5 rounded-xl hover:bg-white/5"
              )}
            >
              View Cost Calculator
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#1C1611] to-transparent z-20" />
      </div>
    </section>
  )
}
