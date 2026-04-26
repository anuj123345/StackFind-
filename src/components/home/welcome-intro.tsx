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
    // 1. Nature & Birds for 3s
    const timer1 = setTimeout(() => setStep(1), 3000)
    // 2. Logo Assembly for 2.5s
    const timer2 = setTimeout(() => setStep(2), 5500)
    // 3. Complete
    const timer3 = setTimeout(onComplete, 6500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  // Refined Bird SVG with wing animation
  const Bird = ({ delay, y, duration, scale }: { delay: number; y: string; duration: number; scale: number }) => (
    <motion.div
      initial={{ x: "-10vw", y, opacity: 0, scale }}
      animate={{ 
        x: "110vw", 
        opacity: [0, 1, 1, 0],
        y: [y, `calc(${y} - 30px)`, y] 
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "linear",
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className="absolute z-[205] pointer-events-none"
    >
      <motion.svg 
        width="32" height="32" viewBox="0 0 24 24" fill="none" 
        className="text-[#1C1611]/60 drop-shadow-sm"
      >
        <motion.path 
          animate={{ d: ["M4 12C4 12 8 8 12 12C16 16 20 12 20 12", "M4 12C4 12 8 14 12 12C16 10 20 12 20 12"] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: "easeInOut" }}
          d="M4 12C4 12 8 8 12 12C16 16 20 12 20 12" 
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
        />
      </motion.svg>
    </motion.div>
  )

  return (
    <div className="fixed inset-0 z-[200] bg-[#1C1611] flex items-center justify-center overflow-hidden">
      {/* 1. Nature Background Reveal (Step 0) */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(40px)", scale: 1.1, transition: { duration: 1.2 } }}
            className="absolute inset-0 z-[201]"
          >
            <img 
              src="/images/hero-bg.png" 
              alt="Nature Background" 
              className="w-full h-full object-cover"
              style={{ filter: "contrast(1.05) saturate(1.1)" }}
            />
            {/* Cinematic HD Vignette & Overlays */}
            <div className="absolute inset-0 vignette-hd opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1C1611]/20 via-transparent to-[#1C1611]/60" />
            
            {/* Birds Flock */}
            <Bird delay={0.5} y="30vh" duration={4} scale={0.8} />
            <Bird delay={0.8} y="35vh" duration={4.5} scale={0.6} />
            <Bird delay={1.1} y="28vh" duration={3.8} scale={0.7} />
            <Bird delay={1.4} y="40vh" duration={4.2} scale={0.5} />
            <Bird delay={0.2} y="45vh" duration={5} scale={0.4} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Logo Assembly (Step 1+) */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
          animate={step >= 1 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
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
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ willChange: "opacity" }}
            className="absolute inset-0 bg-white z-[210] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
    </div>
  )
}
