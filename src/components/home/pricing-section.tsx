"use client"

import { motion } from "framer-motion"
import { Check, Zap, Users, ArrowRight, ShieldCheck, Infinity } from "lucide-react"
import Link from "next/link"

const PLANS = [
  {
    name: "Founder Explorer",
    price: "₹0",
    period: "Free forever",
    description: "Perfect for exploring the local ecosystem.",
    features: [
      "Browse 100+ curated tools",
      "Detailed India-market breakdown",
      "10 Playground generations",
      "Community newsletter",
    ],
    cta: "Start browsing",
    href: "/tools",
    highlight: false,
    icon: <Zap className="w-5 h-5 text-white" />,
    bgImage: "/pricing-explorer.png"
  },
  {
    name: "Product Pro",
    price: "₹499",
    period: "One-time investment",
    description: "Launch faster with AI-optimized stacks.",
    features: [
      "Everything in Free",
      "100 generations per month",
      "AI GTM strategies for India",
      "Global tool database with INR context",
      "Early access to new tools",
    ],
    cta: "Unlock Pro",
    href: "/playground?unlock=pro",
    highlight: true,
    icon: <Sparkles className="w-5 h-5 text-white" />,
    bgImage: "/pricing-pro.png"
  },
  {
    name: "Startup Squad",
    price: "₹1,999",
    period: "Team access",
    description: "Collaborative building for your team.",
    features: [
      "Everything in Pro",
      "Shared team playgrounds",
      "Team stack audits",
      "Stack optimization reports",
      "Priority concierge support",
    ],
    cta: "Get Started",
    href: "/login",
    highlight: false,
    icon: <Users className="w-5 h-5 text-white" />,
    bgImage: "/pricing-squad.png"
  },
]

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  )
}

export function PricingSection() {
  return (
    <section className="relative z-10 px-6 py-24 lg:py-32 bg-[#FAF7F2]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <ShieldCheck size={14} className="text-indigo-600" />
            <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-indigo-600">
              Fair Pricing
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-black leading-none mb-6"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              color: "#1C1611",
              letterSpacing: "-0.02em",
            }}
          >
            Build your stack,<br />
            <span className="text-indigo-600">minus the guesswork.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-[1.0625rem] leading-relaxed text-[#7A6A57]"
          >
            Transparent pricing for Indian founders. No recurring subscriptions that bleed your bank account — just value.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`relative flex flex-col p-10 rounded-[2.5rem] border transition-all duration-500 ${
                plan.highlight 
                  ? "border-indigo-300/30 shadow-2xl shadow-indigo-200/20 scale-105 z-20" 
                  : "border-stone-200/10 hover:border-white/20"
              }`}
            >
              {/* Background Container (with overflow-hidden) */}
              <div className="absolute inset-0 z-0 rounded-[2.5rem] overflow-hidden">
                <img 
                  src={plan.bgImage} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
              </div>

              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-[0.625rem] font-black uppercase tracking-widest rounded-full shadow-lg z-30 whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div className="relative z-10 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    {plan.icon}
                  </div>
                  <h3 className="font-bold text-xl text-white drop-shadow-md">{plan.name}</h3>
                </div>
                
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-white drop-shadow-md" style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}>
                    {plan.price}
                  </span>
                  <span className="text-sm font-medium text-white/70">{plan.period}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="relative z-10 flex-grow space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                        <div className={`mt-1 p-0.5 rounded-full text-white`}>
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-white/90 font-medium leading-tight">{feature}</span>
                    </div>
                ))}
              </div>

              <Link 
                href={plan.href}
                className={`relative z-10 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                    plan.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                    : "bg-white text-black hover:bg-stone-100"
                }`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
        >
            <p className="text-sm text-[#A29485]">
                Need a custom plan for your incubator or college community?{" "}
                <Link href="#contact" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                    Contact our growth team
                </Link>
            </p>
        </motion.div>
      </div>
    </section>
  )
}
