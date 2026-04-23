"use client"

import { motion } from "framer-motion"
import { ArrowRight, Receipt, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function PricingHero() {
  return (
    <section className="pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6"
        >
          <ShieldCheck size={14} />
          <span className="text-[0.625rem] font-black uppercase tracking-widest">New: Managed Billing Bridge</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-7xl font-black text-stone-900 mb-8 leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}
        >
          Pay for Global Tools <br />
          <span className="text-indigo-600">in INR with GST.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-[#7A6A57] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Stop losing 18% in GST credit and 3.5% in forex markups. StackFind lets Indian founders buy any USD-only tool using UPI and get a valid tax invoice.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            href="/tools" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Explore Tools
            <ArrowRight size={18} />
          </Link>
          <div className="flex items-center gap-3 text-stone-400 font-medium">
            <Receipt size={18} />
            <span className="text-sm">Consolidated B2B Invoices</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
