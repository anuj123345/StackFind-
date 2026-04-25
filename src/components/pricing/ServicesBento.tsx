"use client"

import { motion } from "framer-motion"
import { Search, FlaskConical, Globe, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"

const features = [
  {
    title: "AI Playground",
    description: "Design your entire stack in seconds with our high-fidelity AI architect. Built for Indian founders.",
    icon: FlaskConical,
    href: "/playground",
    color: "bg-indigo-500",
    size: "lg:col-span-1"
  },
  {
    title: "Global Directory",
    description: "5,000+ AI tools meticulously curated for the Indian ecosystem.",
    icon: Search,
    href: "/tools",
    color: "bg-amber-500",
    size: "lg:col-span-1"
  }
]

export function ServicesBento() {
  return (
    <section className="py-4 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="font-display text-4xl lg:text-6xl font-black text-[#1C1611] mb-2 leading-tight tracking-tight">Built for Founders.</h2>
        <p className="text-[#7A6A57] max-w-xl mx-auto text-lg lg:text-xl opacity-90 leading-snug">
          The definitive platform to discover, design, and deploy your AI infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            viewport={{ once: true }}
            className={`${f.size} group relative p-8 rounded-3xl bg-white border border-[#8C6E50]/10 overflow-hidden transition-all duration-500 hover:border-[#8C6E50]/20 hover:shadow-xl hover:shadow-[#8C6E50]/5`}
          >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${f.color} opacity-[0.03] blur-[100px] group-hover:opacity-[0.15] transition-opacity duration-700`} />
            
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className={`w-10 h-10 rounded-xl ${f.color}/10 flex items-center justify-center mb-6 border border-indigo-500/10 group-hover:scale-110 transition-transform duration-500`}>
                <f.icon className="text-indigo-600" size={18} />
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-[#1C1611] mb-3 tracking-tighter">{f.title}</h3>
              <p className="text-[#7A6A57] text-base lg:text-lg font-medium leading-relaxed opacity-90 max-w-md">{f.description}</p>
              
            <Link href={f.href} className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-600 group/link transition-all hover:text-indigo-800">
                Launch Now <Zap size={12} className="transition-transform duration-500 group-hover/link:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

