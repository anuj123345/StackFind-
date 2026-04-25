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
    bgImage: "ghibli_forest_bg_1777143257569.png",
    size: "lg:col-span-1"
  },
  {
    title: "Global Directory",
    description: "5,000+ AI tools meticulously curated for the Indian ecosystem.",
    icon: Search,
    href: "/tools",
    bgImage: "ghibli_sky_bg_1777143272687.png",
    size: "lg:col-span-1"
  }
]

export function ServicesBento() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
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
            transition={{ delay: i * 0.1, duration: 0.7 }}
            viewport={{ once: true }}
            className={`${f.size} group relative min-h-[400px] p-10 rounded-[3rem] border border-[#8C6E50]/10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#8C6E50]/10`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src={f.bgImage} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                <f.icon className="text-white" size={24} />
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tighter drop-shadow-md" style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}>
                {f.title}
              </h3>
              <p className="text-white/90 text-lg font-medium leading-relaxed max-w-md drop-shadow-sm">
                {f.description}
              </p>
              
              <Link href={f.href} className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-white group/link">
                <span className="relative">
                  Launch Now
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover/link:w-full" />
                </span>
                <Zap size={14} className="transition-transform duration-500 group-hover/link:rotate-12" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

