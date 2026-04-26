"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

interface WelcomeIntroProps {
  onComplete: () => void
}

export function WelcomeIntro({ onComplete }: WelcomeIntroProps) {
  const [step, setStep] = useState(1) // Start directly at Logo Assembly

  useEffect(() => {
    // 1. Logo Assembly for 3s
    const timer1 = setTimeout(() => setStep(2), 3000)
    // 2. Complete
    const timer2 = setTimeout(onComplete, 4500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
      
      {/* 1. Logo & Energy Assembly (Simplified Cinematic) */}
      <div className="relative z-[204] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, filter: "blur(40px)" }}
          animate={step >= 1 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 2, ease: [0.32, 0.72, 0, 1] }}
          className="relative"
        >
          <div className="relative">
            {/* Logo Shockwave & Glow */}
            <motion.div
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-[-40px] bg-indigo-600/40 blur-[100px] rounded-full"
            />
            
            <Zap size={140} className="text-white fill-white/20 relative z-10 drop-shadow-[0_0_50px_rgba(99,102,241,0.6)]" />
          </div>
        </motion.div>

        {/* Textual Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="mt-16 text-center px-4"
        >
          <h1 className="font-display text-4xl md:text-6xl lg:text-9xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl italic">
            STACKFIND
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={step >= 1 ? { scaleX: 1 } : {}}
            transition={{ delay: 1.5, duration: 2.5, ease: "easeInOut" }}
            className="h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent max-w-lg mx-auto"
          />
          <p className="mt-8 text-[11px] font-black uppercase tracking-[0.9em] text-white/40">
            Constructing Future Ready Architectures
          </p>
        </motion.div>
      </div>

      {/* 2. Global Reveal Flash (Step 2) */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-[210] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Cinematic Film Grain */}
      <div className="absolute inset-0 grain opacity-40 pointer-events-none z-[205]" />
      
      {/* Subtle Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
    </div>
  )
}
