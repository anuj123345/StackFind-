"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"

export default function Loading() {
  return (
    <div className="portal-container">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* The Portal Iris */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="portal-iris"
        >
          <div className="portal-ring" />
          <div className="portal-ring-inner" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ["drop-shadow(0 0 20px rgba(99,102,241,0.2))", "drop-shadow(0 0 40px rgba(99,102,241,0.4))", "drop-shadow(0 0 20px rgba(99,102,241,0.2))"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap size={112} className="text-indigo-600 fill-indigo-500/10" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="text-[12px] font-black uppercase tracking-[0.6em] text-[#7A6A57] opacity-50 mb-2">
            Optimizing Workspace
          </div>
          <p className="text-xs font-medium text-[#1C1611]/60 italic">
            Preparing your curated stack experience...
          </p>
        </motion.div>
      </div>
    </div>
  )
}
