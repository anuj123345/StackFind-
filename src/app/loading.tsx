"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Zap } from "lucide-react"

const FOUNDING_TIPS = [
  "Building for the long haul? StackFind ensures your tax compliance.",
  "Managed Billing: One invoice in INR for all your USD tools.",
  "Architecture Tip: Start with a lean stack, scale with modular APIs.",
  "StackFind curators audit 50+ new tools every week.",
  "India Advantage: Claim GST input credits on your international SaaS."
]

export default function Loading() {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % FOUNDING_TIPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="monolith-container overflow-hidden">
      {/* Dynamic Background Particles */}
      <div className="particle-field">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* The 3D Glass Monolith */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -45 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="glass-shard">
             {/* Glowing Core */}
             <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(99,102,241,0.1)", 
                      "0 0 50px rgba(99,102,241,0.3)", 
                      "0 0 20px rgba(99,102,241,0.1)"
                    ] 
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-1 bg-indigo-500 rounded-full"
                />
             </div>
          </div>
          
          {/* Logo Branding atop the Shard */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap size={32} className="text-indigo-600 fill-indigo-500/10" />
            </motion.div>
          </div>
        </motion.div>

        {/* Textual Content */}
        <div className="mt-16 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            className="text-[10px] font-black uppercase text-[#7A6A57] opacity-40"
          >
            Constructing Environment
          </motion.div>

          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                className="text-xs font-semibold text-[#1C1611] max-w-xs leading-relaxed italic opacity-80"
              >
                "{FOUNDING_TIPS[tipIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Ground Reflection Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  )
}
