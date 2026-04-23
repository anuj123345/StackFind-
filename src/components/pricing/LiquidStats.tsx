"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const stats = [
  { value: "18%", label: "GST Input Credit", desc: "Back in your pocket on every USD tool purchase." },
  { value: "5000+", label: "Curated Tools", desc: "Every AI tool vetted for Indian founder needs." },
  { value: "₹0", label: "Forex Markup", desc: "Pay in INR. Avoid hidden credit card conversion fees." },
  { value: "24/7", label: "Managed Support", desc: "We bridge the gap with international vendors." }
]

export function LiquidStats() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const x = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={containerRef} className="py-8 bg-[#1C1611] overflow-hidden relative border-y border-white/5">
      {/* Dynamic Background Text */}
      <motion.div 
        style={{ x }}
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[12vw] font-black opacity-[0.02] text-white pointer-events-none select-none"
      >
        OPTIMIZE YOUR SaaS SPEND OPTIMIZE YOUR SaaS SPEND
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center p-3"
            >
              <h3 className="text-4xl lg:text-6xl font-black text-indigo-500 mb-1 tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">{s.value}</h3>
              <p className="text-base lg:text-lg font-black text-white mb-1 tracking-tight">{s.label}</p>
              <p className="text-stone-500 text-[11px] font-medium leading-tight max-w-[180px] mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
