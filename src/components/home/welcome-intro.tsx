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
    const timer1 = setTimeout(() => setStep(1), 4000)
    const timer2 = setTimeout(() => setStep(2), 6500)
    const timer3 = setTimeout(onComplete, 7800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  // Floating Dust Mote (Sunlight particles)
  const Mote = ({ delay, size, x, y, duration }: { delay: number; size: number; x: string; y: string; duration: number }) => (
    <motion.div
      initial={{ opacity: 0, x, y }}
      animate={{ 
        opacity: [0, 0.4, 0],
        y: [`calc(${y} - 100px)`, `calc(${y} + 100px)`],
        x: [`calc(${x} - 20px)`, `calc(${x} + 20px)`]
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
      className="absolute bg-white rounded-full blur-[1px]"
      style={{ width: size, height: size }}
    />
  )

  // Cinematic Bird with Motion Blur
  const Bird = ({ delay, y, duration, scale, blur }: { delay: number; y: string; duration: number; scale: number; blur?: string }) => (
    <motion.div
      initial={{ x: "-20vw", y, opacity: 0, scale }}
      animate={{ 
        x: "120vw", 
        opacity: [0, 1, 1, 0],
        y: [y, `calc(${y} - 15px)`, y] 
      }}
      transition={{ 
        duration, 
        delay, 
        ease: "linear",
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
      className="absolute pointer-events-none"
      style={{ 
        filter: `blur(${blur || "0.5px"})`,
        transform: "translateZ(0)" // Performance
      }}
    >
      <motion.svg 
        width="40" height="40" viewBox="0 0 24 24" fill="none" 
        className="text-[#1C1611]/30 drop-shadow-xl"
      >
        <motion.path 
          animate={{ d: ["M4 12C4 12 8 8 12 12C16 16 20 12 20 12", "M4 12C4 12 8 14 12 12C16 10 20 12 20 12"] }}
          transition={{ duration: 0.15, repeat: Infinity, ease: "easeInOut" }}
          d="M4 12C4 12 8 8 12 12C16 16 20 12 20 12" 
          stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" 
        />
      </motion.svg>
    </motion.div>
  )

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
      
      {/* 1. Cinematic Video Simulation (Handheld Motion) */}
      <motion.div 
        animate={{ 
          x: [-2, 2, -1],
          y: [-1, 1, 0],
          rotate: [-0.1, 0.1, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-[201]"
      >
        {/* Landscape with Ken Burns */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: step >= 1 ? 1.15 : 1.08,
            filter: step >= 1 ? "blur(40px) brightness(0.2) saturate(0.5)" : "blur(0px) brightness(0.9) saturate(1.1)"
          }}
          transition={{ duration: 3.5, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <img 
            src="/images/hero-bg.png" 
            alt="Nature Background" 
            className="w-full h-full object-cover"
          />
          
          {/* Dust Motes (Sunlight particles) */}
          {step === 0 && Array.from({ length: 20 }).map((_, i) => (
            <Mote 
              key={i}
              delay={i * 0.5}
              size={Math.random() * 3 + 1}
              x={`${Math.random() * 100}%`}
              y={`${Math.random() * 100}%`}
              duration={Math.random() * 10 + 5}
            />
          ))}

          {/* Masked Birds */}
          {step === 0 && (
            <div 
              className="absolute inset-0"
              style={{ clipPath: "polygon(0 0, 88% 0, 88% 75%, 0 75%)" }}
            >
              <Bird delay={0.2} y="30vh" duration={5} scale={0.8} blur="0.5px" />
              <Bird delay={0.8} y="35vh" duration={6} scale={0.5} blur="2px" />
              <Bird delay={1.5} y="22vh" duration={4.5} scale={0.9} />
              <Bird delay={2.5} y="40vh" duration={7} scale={0.4} blur="3px" />
            </div>
          )}
        </motion.div>

        {/* Light Leaks & Vignette */}
        <div className="absolute inset-0 vignette-hd opacity-80" />
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-amber-500/10"
        />
      </motion.div>

      {/* 2. Logo & Energy (Step 1+) */}
      <div className="relative z-[204] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, filter: "blur(50px)" }}
          animate={step >= 1 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 2, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="relative">
            {/* Logo Shockwave Bloom */}
            <motion.div
              animate={step >= 1 ? { 
                scale: [1, 1.5, 1.1],
                opacity: [0, 0.8, 0.4]
              } : {}}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="absolute inset-[-50px] bg-white blur-[80px] rounded-full z-0"
            />
            
            <motion.div
              animate={{ 
                opacity: [0.4, 1, 0.4],
                filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-indigo-500/40 blur-[100px] rounded-full"
            />
            
            <Zap size={140} className="text-white fill-white relative z-10 drop-shadow-[0_0_60px_rgba(255,255,255,0.4)]" />
          </div>
        </motion.div>

        {/* Textual Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="mt-16 text-center px-4"
        >
          <h1 className="font-display text-4xl md:text-6xl lg:text-9xl font-black text-white tracking-tighter mb-4 italic drop-shadow-2xl">
            STACKFIND
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={step >= 1 ? { scaleX: 1 } : {}}
            transition={{ delay: 1.5, duration: 2.5, ease: "easeInOut" }}
            className="h-[1px] bg-gradient-to-r from-transparent via-white to-transparent max-w-lg mx-auto"
          />
          <p className="mt-8 text-[11px] font-black uppercase tracking-[1em] text-white/40">
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
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-[210] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Film Grain & Chromatic Aberration Simulation */}
      <div className="absolute inset-0 grain opacity-50 pointer-events-none z-[205]" />
    </div>
  )
}
