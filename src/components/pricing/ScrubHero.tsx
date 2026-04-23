"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ScrubSequence } from "./ScrubSequence"
import { BlurText } from "./BlurText"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { GetStartedButton } from "@/components/ui/get-started-button"

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
            className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400"
          >
            <Zap size={10} className="fill-indigo-400" />
            AI-Native Stack Architect
          </motion.div>

          <h1 className="font-display text-6xl lg:text-9xl font-black leading-[0.85] tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-indigo-400/50">
            Find your stack. <br/> Build the future.
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="max-w-2xl text-lg lg:text-2xl text-stone-300 opacity-90 mb-8 leading-relaxed font-medium"
          >
            The ultimate playground for Indian founders to discover curated AI tools, 
            design production-ready stacks, and launch in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <GetStartedButton 
              text="Launch Playground"
              href="/playground"
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-2xl shadow-indigo-500/30"
            />
          </motion.div>
        </motion.div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#1C1611] to-transparent z-20" />
      </div>
    </section>
  )
}
