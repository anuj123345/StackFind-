"use client"

import { ArrowRight, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, useInView, animate } from "framer-motion"
import Link from "next/link"

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
      style={{ background: "#1C1611" }}
    >
      {/* Warm amber glow — off-center for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 55% at 55% 30%, rgba(217,119,6,0.16) 0%, transparent 65%)",
            "radial-gradient(ellipse 45% 40% at 30% 70%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Ghost number watermark */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] select-none pointer-events-none font-black tabular-nums leading-none"
        style={{
          fontFamily: "'Bricolage Grotesque Variable', sans-serif",
          fontSize: "clamp(12rem, 38vw, 30rem)",
          letterSpacing: "-0.05em",
          color: "rgba(255,255,255,0.022)",
        }}
      >
        {stats?.total ?? 500}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.6875rem] font-bold tracking-[0.1em] uppercase"
          style={{
            background: "rgba(217,119,6,0.1)",
            border: "1px solid rgba(217,119,6,0.25)",
            color: "#F59E0B",
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
          }}
        >
          <span style={{ color: "#FAF7F2" }}>The AI stack</span>
          <br />
          <span style={{ color: "#6366f1" }}>built for India.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="text-center max-w-[34rem] leading-relaxed mb-12"
          style={{ fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", color: "rgba(250,247,242,0.5)" }}
        >
          INR pricing. UPI billing. GST invoices. Made‑in‑India tools.{" "}
          <span style={{ color: "rgba(250,247,242,0.82)", fontWeight: 600 }}>
            No dollar conversion. No surprises.
          </span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-16"
        >
          <Link
            href="/login"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-[0.9375rem] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#6366f1", color: "#fff", boxShadow: "0 0 32px rgba(99,102,241,0.35)" }}
          >
            Explore the stack
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/tools"
            className="flex items-center gap-1.5 px-6 py-3.5 rounded-full font-medium text-[0.875rem] transition-all duration-200 hover:border-white/25"
            style={{ border: "1px solid rgba(250,247,242,0.12)", color: "rgba(250,247,242,0.45)" }}
          >
            Browse without account
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
            { value: stats?.total ?? 500, suffix: "+", label: "AI tools" },
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
                    color: "#FAF7F2",
                  }}
                >
                  <Counter to={stat.value} />{stat.suffix}
                </span>
                <span className="ml-1.5 text-[0.8125rem]" style={{ color: "rgba(250,247,242,0.38)" }}>
                  {stat.label}
                </span>
              </div>
              {i < 3 && (
                <div className="w-px h-6 flex-shrink-0" style={{ background: "rgba(250,247,242,0.07)" }} />
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
        style={{ color: "rgba(250,247,242,0.18)" }}
        aria-hidden
      >
        <span className="text-[9px] font-semibold tracking-[0.18em] uppercase">Scroll</span>
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
