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
    // 1. Nature & Birds for 4s
    const timer1 = setTimeout(() => setStep(1), 4000)
    // 2. Logo Assembly for 2.5s
    const timer2 = setTimeout(() => setStep(2), 6500)
    // 3. Complete
    const timer3 = setTimeout(onComplete, 7500)

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
        y: [y, `calc(${y} - 20px)`, y] 
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "linear",
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
      className="absolute pointer-events-none"
      style={{ filter: blur ? `blur(${blur})` : "none" }}
    >
      <motion.svg 
        width="40" height="40" viewBox="0 0 24 24" fill="none" 
        className="text-[#1C1611]/40 drop-shadow-sm"
      >
        <motion.path 
          animate={{ d: ["M4 12C4 12 8 8 12 12C16 16 20 12 20 12", "M4 12C4 12 8 14 12 12C16 10 20 12 20 12"] }}
          transition={{ duration: 0.18, repeat: Infinity, ease: "easeInOut" }}
          d="M4 12C4 12 8 8 12 12C16 16 20 12 20 12" 
          stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" 
        />
      </motion.svg>
    </motion.div>
  )

  return (
    <div className="fixed inset-0 z-[200] bg-[#1C1611] flex items-center justify-center overflow-hidden">
      
      {/* 1. Continuous Nature Background (Landscape) */}
      <motion.div 
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: step === 2 ? 0 : 1, 
          scale: step >= 1 ? 1.1 : 1.05,
          filter: step >= 1 ? "blur(30px) brightness(0.3)" : "blur(0px) brightness(0.9)"
        }}
        transition={{ duration: 3, ease: [0.32, 0.72, 0, 1] }}
        className="absolute inset-0 z-[201]"
      >
        <img 
          src="/images/hero-bg.png" 
          alt="Nature Background" 
          className="w-full h-full object-cover"
          style={{ filter: "contrast(1.05) saturate(1.1)" }}
        />
        
        {/* Cinematic Light Leak (Amber Glow) */}
        <motion.div 
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            x: ["-10%", "10%", "-10%"]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent pointer-events-none"
        />

        {/* Cinematic HD Vignette */}
        <div className="absolute inset-0 vignette-hd opacity-50" />
        
        {/* Birds Flock (Masked to the sky area) */}
        {step === 0 && (
          <div 
            className="absolute inset-0 z-[202]"
            style={{ 
              clipPath: "polygon(0 0, 88% 0, 88% 75%, 0 75%)", // Keeps birds in the 'sky/view' area
            }}
          >
            <Bird delay={0.2} y="25vh" duration={6} scale={0.6} blur="1px" />
            <Bird delay={0.8} y="32vh" duration={7} scale={0.4} blur="2px" />
            <Bird delay={1.5} y="20vh" duration={5.5} scale={0.7} />
            <Bird delay={2.2} y="38vh" duration={8} scale={0.3} blur="3px" />
            <Bird delay={0.5} y="42vh" duration={7.5} scale={0.5} blur="1.5px" />
          </div>
        )}
      </motion.div>

      {/* 2. Logo Assembly (Step 1+) */}
      <div className="relative z-[204] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, filter: "blur(40px)" }}
          animate={step >= 1 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 2, ease: [0.32, 0.72, 0, 1] }}
          className="relative"
        >
          <div className="relative">
            {/* Logo Glow */}
            <motion.div
              animate={{ 
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-indigo-600/40 blur-[120px] rounded-full"
            />
            
            {/* The Main Logo */}
            <Zap size={140} className="text-white fill-white/10 relative z-10 drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]" />
          </div>
        </motion.div>

        {/* Textual Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="mt-16 text-center px-4"
        >
          <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
            STACKFIND
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={step >= 1 ? { scaleX: 1 } : {}}
            transition={{ delay: 1.5, duration: 2, ease: "easeInOut" }}
            className="h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent max-w-sm mx-auto"
          />
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.8em] text-white/30">
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
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-[210] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Grain Overlay for that film look */}
      <div className="absolute inset-0 grain opacity-40 pointer-events-none z-[205]" />
    </div>
  )
}
