"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

interface WelcomeIntroProps {
  onComplete: () => void
}

export function WelcomeIntro({ onComplete }: WelcomeIntroProps) {
  const [step, setStep] = useState(0) // 0: Nature & Birds, 1: Logo Assembly, 2: Final Reveal

  useEffect(() => {
    // 1. Nature & Birds for 3.5s (slightly longer for birds to pass window)
    const timer1 = setTimeout(() => setStep(1), 3500)
    // 2. Logo Assembly for 2.5s
    const timer2 = setTimeout(() => setStep(2), 6000)
    // 3. Complete
    const timer3 = setTimeout(onComplete, 7000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  // Refined Bird SVG with wing animation
  const Bird = ({ delay, y, duration, scale, blur }: { delay: number; y: string; duration: number; scale: number; blur?: string }) => (
    <motion.div
      initial={{ x: "-15vw", y, opacity: 0, scale }}
      animate={{ 
        x: "115vw", 
        opacity: [0, 1, 1, 0],
        y: [y, `calc(${y} - 40px)`, y] 
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "linear",
        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }}
      className="absolute z-[202] pointer-events-none"
      style={{ filter: blur ? `blur(${blur})` : "none" }}
    >
      <motion.svg 
        width="40" height="40" viewBox="0 0 24 24" fill="none" 
        className="text-[#1C1611]/50 drop-shadow-sm"
      >
        <motion.path 
          animate={{ d: ["M4 12C4 12 8 8 12 12C16 16 20 12 20 12", "M4 12C4 12 8 14 12 12C16 10 20 12 20 12"] }}
          transition={{ duration: 0.15, repeat: Infinity, ease: "easeInOut" }}
          d="M4 12C4 12 8 8 12 12C16 16 20 12 20 12" 
          stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" 
        />
      </motion.svg>
    </motion.div>
  )

  return (
    <div className="fixed inset-0 z-[200] bg-[#1C1611] flex items-center justify-center overflow-hidden">
      
      {/* 1. Continuous Nature Background (Landscape) */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ 
          opacity: step === 2 ? 0 : 1, 
          scale: step >= 1 ? 1.15 : 1.1,
          filter: step >= 1 ? "blur(30px) brightness(0.35)" : "blur(0px) brightness(0.85)"
        }}
        transition={{ duration: 2.5, ease: [0.32, 0.72, 0, 1] }}
        className="absolute inset-0 z-[201]"
      >
        <img 
          src="/images/hero-bg.png" 
          alt="Nature Background" 
          className="w-full h-full object-cover"
          style={{ filter: "contrast(1.08) saturate(1.15)" }}
        />
        {/* Cinematic HD Vignette & Overlays */}
        <div className="absolute inset-0 vignette-hd opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1C1611]/50" />
      </motion.div>

      {/* 2. Birds Flock (Flying outside the window) */}
      {step === 0 && (
        <div className="absolute inset-0 z-[202]">
          <Bird delay={0.2} y="32vh" duration={4.8} scale={0.7} blur="1px" />
          <Bird delay={0.6} y="38vh" duration={5.2} scale={0.5} blur="2px" />
          <Bird delay={1.0} y="25vh" duration={4.5} scale={0.8} />
          <Bird delay={1.5} y="42vh" duration={5.5} scale={0.4} blur="3px" />
          <Bird delay={0} y="48vh" duration={6} scale={0.3} blur="4px" />
        </div>
      )}

      {/* 3. Window Frame Overlay (Creating the "Through the Window" look) */}
      <motion.div 
        animate={{ 
          opacity: step === 2 ? 0 : 1,
          x: step >= 1 ? 50 : 0 
        }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute inset-0 z-[203] pointer-events-none"
      >
        {/* Right Window Bar */}
        <div className="absolute right-0 top-0 bottom-0 w-[12vw] bg-[#1C1611]/90 backdrop-blur-[1px] shadow-2xl border-l border-white/5" />
        {/* Bottom Window Sill (Out of focus) */}
        <div className="absolute bottom-0 left-0 right-0 h-[10vh] bg-[#1C1611]/95 border-t border-white/5" />
        {/* Sub-frame bar */}
        <div className="absolute right-[11.5vw] top-0 bottom-0 w-[1.5vw] bg-[#1C1611]/80" />
      </motion.div>

      {/* 4. Logo Assembly (Step 1+) */}
      <div className="relative z-[204] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
          animate={step >= 1 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.8, ease: [0.32, 0.72, 0, 1] }}
          className="relative"
        >
          <div className="relative">
            {/* Logo Glow */}
            <motion.div
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-indigo-600/50 blur-[100px] rounded-full"
            />
            
            {/* The Main Logo */}
            <Zap size={160} className="text-white fill-white/20 relative z-10 drop-shadow-[0_0_50px_rgba(99,102,241,0.6)]" />
          </div>
        </motion.div>

        {/* Textual Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="mt-14 text-center"
        >
          <h1 className="font-display text-5xl lg:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
            WELCOME TO STACKFIND
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={step >= 1 ? { width: "100%" } : {}}
            transition={{ delay: 1.5, duration: 2, ease: "easeInOut" }}
            className="h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto opacity-60"
          />
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.8em] text-white/50">
            Constructing Future Ready Architectures
          </p>
        </motion.div>
      </div>

      {/* 5. Global Reveal Flash (Step 2) */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-[210] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)] pointer-events-none z-[203]" />
    </div>
  )
}
