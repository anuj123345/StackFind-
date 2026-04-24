"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

const FOUNDING_TIPS = [
  "Managed Billing: One invoice in INR for all your USD tools.",
  "Architecture Tip: Start with a lean stack, scale with modular APIs.",
  "India Advantage: Claim GST input credits on your international SaaS.",
  "StackFind curators audit 50+ new tools every week.",
  "Building for the long haul? StackFind ensures your tax compliance."
]

export function RouteTransition() {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    // Start transition
    setIsTransitioning(true)
    setTipIndex(Math.floor(Math.random() * FOUNDING_TIPS.length))
    
    // Smooth transition timing
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && (
        <motion.div
          key="portal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="portal-container fixed inset-0 z-[100]"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [-20, 20], 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute w-1 h-1 bg-indigo-500 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
             ))}
          </div>

          <div className="relative flex flex-col items-center">
            {/* The Recursive Portal Iris */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="portal-iris"
            >
              {/* Spinning Rings */}
              <div className="portal-ring" />
              <div className="portal-ring-inner" />
              
              {/* The Large Branding Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    filter: ["drop-shadow(0 0 20px rgba(99,102,241,0.2))", "drop-shadow(0 0 40px rgba(99,102,241,0.4))", "drop-shadow(0 0 20px rgba(99,102,241,0.2))"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Zap size={96} className="text-indigo-600 fill-indigo-500/10" />
                </motion.div>
              </div>

              {/* Portal Depth Effect */}
              <div className="absolute inset-0 rounded-full border border-white/10 backdrop-blur-[2px]" />
            </motion.div>

            {/* Transitional Metadata */}
            <div className="mt-20 text-center space-y-8 max-w-sm px-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-[#7A6A57] opacity-40">
                  Initializing Stack
                </div>
                <div className="h-12 flex items-center justify-center">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    className="text-xs font-medium text-[#1C1611] leading-relaxed italic"
                  >
                    "{FOUNDING_TIPS[tipIndex]}"
                  </motion.p>
                </div>
              </motion.div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
