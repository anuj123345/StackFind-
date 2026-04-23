"use client"

import { motion } from "framer-motion"

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, 50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          x: [0, -80, 0], 
          y: [0, 120, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          x: [0, 40, 0], 
          y: [0, -60, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full" 
      />
    </div>
  )
}
