"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Zap } from "lucide-react"

const FOUNDING_TIPS = [
  "Tip: StackFind's Indian billing bridge can save you 18% GST.",
  "Tip: Use managed billing to simplify multi-tool procurement.",
  "Tip: The AI Playground helps you build a production-ready stack in minutes.",
  "Tip: High-performance startups prioritize dense, functional UI.",
  "Tip: Indian founders get special access to UPI-friendly billing leads."
]

export default function Loading() {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % FOUNDING_TIPS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="loading-container">
      {/* SVG Filter for Liquid Gooey Effect */}
      <svg className="hidden">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" 
              result="gooey" 
            />
          </filter>
        </defs>
      </svg>

      <div className="relative flex flex-col items-center">
        {/* The Liquid Ink Bloom */}
        <div className="gooey-filter">
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ 
              scale: [0, 1.2, 1],
              opacity: [0.8, 1, 0] 
            }}
            transition={{ 
              duration: 1.8, 
              ease: [0.22, 1, 0.36, 1],
              repeat: Infinity,
              repeatDelay: 0.5
            }}
            className="w-24 h-24 bg-[#1C1611] rounded-full"
          />
        </div>

        {/* The Crystallizing Glass Lens */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: "circOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="liquid-glass w-32 h-32 rounded-3xl relative overflow-hidden flex items-center justify-center">
            {/* Glass Shine Animation */}
            <div className="glass-shine" />
            
            {/* Pulsing Logo Inside Glass */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap size={40} className="text-[#6366f1] fill-[#6366f1]/20 chromatic-text" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Engaging Content */}
      <div className="absolute bottom-16 w-full text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-1 h-1 bg-indigo-500 rounded-full"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7A6A57] opacity-60">
              Synchronizing Stack
            </span>
          </div>

          <div className="h-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xs font-medium text-[#C4B0A0] px-4 italic"
              >
                {FOUNDING_TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Decorative Branding */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-10">
        <span className="font-display text-lg font-black tracking-widest uppercase">StackFind</span>
      </div>
    </div>
  )
}
