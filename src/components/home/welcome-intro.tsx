"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

interface WelcomeIntroProps {
  onComplete: () => void
}

export function WelcomeIntro({ onComplete }: WelcomeIntroProps) {
  const [step, setStep] = useState(0) // 0: Swarm, 1: Solid Logo + Text, 2: Exit

  useEffect(() => {
    // 1. Swarm for 1.5s
    const timer1 = setTimeout(() => setStep(1), 1500)
    // 2. Show Logo + Welcome for 2s
    const timer2 = setTimeout(() => setStep(2), 3500)
    // 3. Complete
    const timer3 = setTimeout(onComplete, 4500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[200] bg-[#1C1611] flex items-center justify-center overflow-hidden">
      {/* 1. Particle Swarm (Step 0) */}
      <AnimatePresence>
        {step === 0 && (
          <div className="absolute inset-0">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: (Math.random() - 0.5) * 1000, 
                  y: (Math.random() - 0.5) * 1000, 
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  x: 0, 
                  y: 0, 
                  opacity: [0, 1, 0.8],
                  scale: [0, 1.5, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  ease: [0.22, 1, 0.36, 1],
                  delay: Math.random() * 0.2
                }}
                className="absolute left-1/2 top-1/2 w-1 h-1 bg-indigo-500 rounded-full blur-[1px]"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 2. Logo Assembly (Step 1+) */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
          animate={step >= 1 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
          className="relative"
        >
          <div className="relative">
            {/* Logo Glow */}
            <motion.div
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-indigo-600/30 blur-[60px] rounded-full"
            />
            
            {/* The Main Logo */}
            <Zap size={160} className="text-white fill-white/10 relative z-10" />
          </div>
        </motion.div>

        {/* Textual Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-12 text-center"
        >
          <h1 className="font-display text-4xl lg:text-7xl font-black text-white tracking-tighter mb-2">
            WELCOME TO STACKFIND
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={step >= 1 ? { width: "100%" } : {}}
            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
            className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mx-auto"
          />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.6em] text-stone-500 opacity-60">
            Constructing Future Ready Architectures
          </p>
        </motion.div>
      </div>

      {/* 3. Global Reveal Flash (Step 2) */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-[210] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
    </div>
  )
}
