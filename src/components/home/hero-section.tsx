"use client"

import { ArrowRight, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, useInView, animate } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

function Counter({ from = 0, to, duration = 1.8 }: { from?: number; to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(from, to, {
      duration,
      ease: [0.32, 0.72, 0, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString()
      },
    })
    return () => controls.stop()
  }, [inView, from, to, duration])

  return <span ref={ref}>{from}</span>
}

interface HeroSectionProps {
  stats?: { total: number; madeInIndia: number; categories: number; freeOrFreemium: number }
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [ghostHovered, setGhostHovered] = useState(false)

  return (
    <section
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-24 overflow-hidden"
    >
      {/* Nature Background - HD Optimized */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero-bg.png" 
          alt="Serene nature workspace" 
          fill
          priority
          quality={100}
          className="object-cover"
        />
        {/* Cinematic HD Overlays */}
        <div className="absolute inset-0 vignette-hd opacity-40" />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#FAF7F2]" 
          style={{ backdropFilter: "blur(2px) saturate(1.1)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.6875rem] font-bold tracking-[0.1em] uppercase backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(140,110,80,0.15)",
            color: "#8C6E50",
          }}
        >
          🇮🇳 India&apos;s AI Tools Directory
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          className="text-center font-black leading-[0.97] tracking-tight mb-8"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "clamp(3.25rem, 8.5vw, 7.5rem)",
            letterSpacing: "-0.035em",
            color: "#1C1611",
          }}
        >
          Find your stack.
          <br />
          <span className="text-indigo-600">Build the future.</span>
        </motion.h1>


        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-16"
        >
          <Link
            href="/login"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-[0.9375rem] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20"
            style={{ background: "#6366f1", color: "#fff" }}
          >
            Launch Playground
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/tools"
            className="flex items-center gap-1.5 px-6 py-3.5 rounded-full font-bold text-[0.875rem] transition-all duration-300 glass-hd hover:bg-white/60 text-[#1C1611] active:scale-[0.98]"
          >
            Browse Directory
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.48 }}
          className="flex flex-wrap items-center justify-center gap-0 w-full max-w-3xl"
          style={{
            borderTop: "1px solid rgba(250,247,242,0.07)",
            paddingTop: "1.25rem",
            paddingBottom: "2.5rem",
          }}
        >
          {[
            { value: stats?.total ?? 992, suffix: "+", label: "AI tools" },
            { value: stats?.madeInIndia ?? 47, suffix: "+", label: "made in India" },
            { value: stats?.categories ?? 27, suffix: "", label: "categories" },
            { value: stats?.freeOrFreemium ?? 89, suffix: "%", label: "free or freemium" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.54 + i * 0.07 }}
              className="flex items-center"
            >
              <div className="px-5 md:px-7 text-center">
                <span
                  className="font-black tabular-nums"
                  style={{
                    fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                    fontSize: "clamp(1.25rem, 2.3vw, 1.625rem)",
                    letterSpacing: "-0.025em",
                    color: "#1C1611",
                  }}
                >
                  <Counter to={stat.value} />{stat.suffix}
                </span>
                <span className="ml-1.5 text-[0.8125rem] font-bold" style={{ color: "#7A6A57" }}>
                  {stat.label}
                </span>
              </div>
              {i < 3 && (
                <div className="w-px h-6 flex-shrink-0" style={{ background: "rgba(140,110,80,0.1)" }} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ color: "#7A6A57" }}
        aria-hidden
      >
        <span className="text-[9px] font-black tracking-[0.18em] uppercase">Explore Directory</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={13} />
        </motion.div>
      </motion.div>

      {/* Dark → parchment gradient transition */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "120px",
          background: "linear-gradient(to bottom, transparent 0%, #FAF7F2 100%)",
        }}
      />
    </section>
  )
}
