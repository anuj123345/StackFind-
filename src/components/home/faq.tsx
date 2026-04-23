"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "What is Managed Billing?",
    answer: "Managed Billing allows Indian founders to pay for international SaaS tools (like Cursor, Midjourney, etc.) in INR via UPI or Net Banking. We provide a consolidated GST invoice so you can claim 18% input credit."
  },
  {
    question: "How do I claim 18% GST back?",
    answer: "When you purchase a stack or tool through StackFind, we generate an Indian tax invoice with your GSTIN. You can use this invoice to claim input tax credit (ITC) during your monthly GST filings."
  },
  {
    question: "Is there a platform fee?",
    answer: "No, we don't charge any platform fees for the directory. For Managed Billing, we charge a transparent 5% convenience fee to cover forex conversion and compliance costs."
  },
  {
    question: "Can I use StackFind for free?",
    answer: "Yes! The AI Playground, Tool Directory, and Cost Calculator are completely free to use. You only pay if you choose to use our Managed Billing bridge."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto px-6">
      <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-white/5">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between text-white hover:text-indigo-400 transition-colors text-left py-5 focus:outline-none group"
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
                  <p className="text-stone-400 text-sm leading-relaxed pb-5 max-w-xl">
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
