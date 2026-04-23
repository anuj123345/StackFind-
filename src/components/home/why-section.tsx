"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const PILLARS = [
  {
    num: "01",
    title: "India-first pricing.",
    body: "Every tool listed shows INR pricing and UPI support. No more guessing what ₹ your dollar bill becomes.",
    accent: "#6366f1",
  },
  {
    num: "02",
    title: "Ruthlessly curated.",
    body: "Every tool is reviewed before it goes live. No spam, no ghost projects, no 'coming soon'. If it's here, it works.",
    accent: "#D97706",
  },
  {
    num: "03",
    title: "Built by builders.",
    body: "We're Indian founders building for Indian founders. We know what it takes to ship with limited budgets and maximum ambition.",
    accent: "#059669",
  },
]

function Pillar({ num, title, body, accent, i }: typeof PILLARS[0] & { i: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.12, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col md:flex-row gap-8 items-start py-12"
      style={{ borderTop: "1px solid rgba(140,110,80,0.1)" }}
    >
      {/* Oversized number */}
      <div className="font-black leading-none flex-shrink-0 tabular-nums select-none"
        style={{
          fontFamily: "'Bricolage Grotesque Variable', sans-serif",
          fontSize: "clamp(4rem, 10vw, 7rem)",
          color: "rgba(140,110,80,0.08)",
          letterSpacing: "-0.04em",
        }}>
        {num}
      </div>

      <div className="flex flex-col gap-3 pt-2 md:pt-4">
        <div className="w-8 h-[2px] rounded-full" style={{ background: accent }} />
        <h3 className="font-bold leading-tight" style={{
          fontFamily: "'Bricolage Grotesque Variable', sans-serif",
          fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
          color: "#1C1611",
        }}>
          {title}
        </h3>
        <p className="leading-relaxed max-w-lg" style={{ fontSize: "1.0625rem", color: "#7A6A57" }}>
          {body}
        </p>
      </div>
    </motion.div>
  )
}

export function WhySection() {
  return (
    <section className="relative z-10 px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-2">
          <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
            Why StackFind
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="font-black leading-tight mb-0"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.75rem)",
            color: "#1C1611",
          }}
        >
          Other directories were not
          <br />
          <span style={{ color: "#C4B0A0" }}>built for you.</span>
        </motion.p>

        {PILLARS.map((p, i) => (
          <Pillar key={p.num} {...p} i={i} />
        ))}
      </div>
    </section>
  )
}
