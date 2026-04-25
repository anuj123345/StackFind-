"use client"

import { motion } from "framer-motion"

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div 
        animate={{ 
          x: [0, 150, 0], 
          y: [0, 80, 0],
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
        className="absolute -top-[15%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[80px] md:blur-[140px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          x: [0, -120, 0], 
          y: [0, 180, 0],
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.12, 0.1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
        className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-violet-600/15 blur-[80px] md:blur-[140px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          x: [0, 60, 0], 
          y: [0, -100, 0],
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
        className="absolute -bottom-[20%] left-[10%] w-[70%] h-[70%] bg-emerald-400/10 blur-[80px] md:blur-[140px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
        className="absolute top-[10%] left-[30%] w-[30%] h-[30%] bg-amber-400/10 blur-[60px] md:blur-[100px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
        className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-rose-500/10 blur-[80px] md:blur-[120px] rounded-full" 
      />
    </div>
  )
}
