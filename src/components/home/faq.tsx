"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "What is the AI Playground?",
    answer: "The AI Playground is our flagship tool that helps you architect your entire SaaS stack in seconds. Just describe your project, and our AI will recommend the best tools, estimating costs and compatibility."
  },
  {
    question: "How accurate are the build plans?",
    answer: "Our plans are based on real-time data from 5,000+ curated AI tools. We factor in pricing, API capabilities, and market fit for Indian startups."
  },
  {
    question: "Can I export my stack?",
    answer: "Yes, Pro members can export their entire build plan as a production-ready roadmap, including GTM strategies and tool integration guides."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-black text-white mb-6 tracking-tight">Common Questions</h2>
      <div className="space-y-1">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-white/5">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between text-white hover:text-indigo-400 transition-colors text-left py-3 focus:outline-none group"
            >
              <span className="text-base font-semibold">{faq.question}</span>
              {openIndex === i ? (
                <Minus size={18} className="text-indigo-500" />
              ) : (
                <Plus size={18} className="text-stone-500 group-hover:text-indigo-400 transition-colors" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-stone-400 text-sm leading-relaxed pb-3 max-w-xl">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
