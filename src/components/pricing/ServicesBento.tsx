"use client"

import { motion } from "framer-motion"
import { Search, FlaskConical, Calculator, Globe, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"

const features = [
  {
    title: "AI Playground",
    description: "Design your entire stack in seconds with our AI-powered architect.",
    icon: FlaskConical,
    href: "/playground",
    color: "bg-indigo-500",
    size: "lg:col-span-3 lg:row-span-2"
  },
  {
    title: "GST Calculator",
    description: "Claim your 18% tax credit. Calculate savings instantly.",
    icon: Calculator,
    href: "/pricing",
    color: "bg-emerald-500",
    size: "lg:col-span-2 lg:row-span-1"
  },
  {
    title: "Global Directory",
    description: "5,000+ AI tools curated for the Indian ecosystem.",
    icon: Search,
    href: "/tools",
    color: "bg-amber-500",
    size: "lg:col-span-2 lg:row-span-1"
  },
  {
    title: "Managed Billing",
    description: "Pay for global tools in INR via UPI. No international card needed.",
    icon: ShieldCheck,
    href: "/pricing",
    color: "bg-rose-500",
    size: "lg:col-span-5 lg:row-span-1"
  }
]

export function ServicesBento() {
  return (
    <section className="py-12 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">Designed for Founders.</h2>
        <p className="text-stone-400 max-w-xl mx-auto text-lg opacity-80">
          The infrastructure you need to scale your AI startup without the international billing friction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            viewport={{ once: true }}
            className={`${f.size} group relative p-6 rounded-3xl liquid-glass border border-white/5 overflow-hidden transition-all hover:bg-white/[0.02]`}
          >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 ${f.color} opacity-[0.03] blur-[80px] group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className={`w-11 h-11 rounded-xl ${f.color}/10 flex items-center justify-center mb-4 border border-white/10`}>
                  <f.icon className="text-white" size={20} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{f.title}</h3>
                <p className="text-stone-400 text-base leading-snug opacity-90">{f.description}</p>
              </div>
              
              <Link href={f.href} className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-400 group/link transition-all hover:text-white">
                Learn more <Zap size={11} className="transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
