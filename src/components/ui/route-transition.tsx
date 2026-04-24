"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

export function RouteTransition() {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Start transition
    setIsTransitioning(true)
    
    // Auto-finish after a short delay to give the "Cinematic" feel
    // without blocking the user for too long.
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="monolith-container fixed inset-0 z-[100] pointer-events-none"
        >
          <div className="relative flex flex-col items-center">
            <div className="glass-shard !w-16 !h-24">
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={16} className="text-indigo-600 fill-indigo-500/10" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
