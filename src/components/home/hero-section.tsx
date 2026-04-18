"use client"

import { Search, ArrowRight } from "lucide-react"
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

const TRENDING = ["ChatGPT", "Cursor", "Midjourney", "Perplexity", "Sarvam AI"]

interface HeroSectionProps {
  stats?: { total: number; madeInIndia: number; categories: number; freeOrFreemium: number }
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [query, setQuery] = useState("")

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-28 pb-20 overflow-hidden">

      {/* Warm glow orb */}
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(217,119,6,0.07) 0%, transparent 65%)" }} />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

        {/* Oversized ghost number */}
        <div aria-hidden className="absolute -top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none leading-none font-black tabular-nums"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "clamp(8rem, 28vw, 22rem)",
            letterSpacing: "-0.04em",
            color: "rgba(140,110,80,0.06)",
          }}>
          500+
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="eyebrow mb-8"
        >
          🇮🇳 India&apos;s AI Tools Directory
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          className="text-center font-black leading-[1.04] tracking-tight mb-8"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
            color: "#1C1611",
          }}
        >
          The AI stack
          <br />
          <span style={{ color: "#6366f1" }}>built for India.</span>
        </motion.h1>

        {/* Sub-statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="text-center max-w-lg leading-relaxed mb-12"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)", color: "#7A6A57" }}
        >
          INR pricing. UPI billing. GST invoices. Made‑in‑India tools.
          <br />
          <span style={{ color: "#1C1611", fontWeight: 600 }}>No dollar conversion. No surprises.</span>
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="w-full max-w-2xl mb-6"
        >
          <div className="card-bezel !p-[3px]">
            <div className="card-inner flex items-center gap-3 px-5 py-3.5">
              <Search size={17} className="flex-shrink-0" style={{ color: "#C4B0A0" }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search 500+ AI tools…"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "0.9375rem", color: "#1C1611" }}
              />
              <button className="btn-primary !py-2 !px-5 !text-sm flex items-center gap-1.5 flex-shrink-0">
                Find tools <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trending */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-16"
        >
          <span className="text-[11px] font-medium" style={{ color: "#C4B0A0" }}>Trending:</span>
          {TRENDING.map((tag, i) => (
            <motion.div key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}>
              <Link href={`/tools?q=${tag.toLowerCase()}`}
                className="text-[11px] px-3 py-1 rounded-full transition-all duration-200"
                style={{ border: "1px solid rgba(140,110,80,0.15)", color: "#7A6A57" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#1C1611"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,110,80,0.3)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#7A6A57"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(140,110,80,0.15)" }}
              >
                {tag}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Proof strip — editorial, not dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-wrap items-center justify-center gap-0"
          style={{
            borderTop: "1px solid rgba(140,110,80,0.1)",
            borderBottom: "1px solid rgba(140,110,80,0.1)",
            paddingTop: "1.25rem",
            paddingBottom: "1.25rem",
          }}
        >
          {[
            { value: stats?.total       ?? 500, suffix: "+", label: "AI tools" },
            { value: stats?.madeInIndia ?? 47,  suffix: "+", label: "made in India" },
            { value: stats?.categories  ?? 10,  suffix: "",  label: "categories" },
            { value: stats?.freeOrFreemium ?? 89, suffix: "%", label: "free or freemium" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.07 }}
              className="flex items-center"
            >
              <div className="px-6 md:px-8 text-center">
                <span
                  className="font-black tabular-nums"
                  style={{
                    fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                    fontSize: "clamp(1.375rem, 2.5vw, 1.75rem)",
                    letterSpacing: "-0.02em",
                    color: "#1C1611",
                  }}
                >
                  <Counter to={stat.value} />{stat.suffix}
                </span>
                <span className="ml-1.5 text-sm" style={{ color: "#7A6A57" }}>{stat.label}</span>
              </div>
              {i < 3 && (
                <div className="w-px h-7 flex-shrink-0" style={{ background: "rgba(140,110,80,0.12)" }} />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
