"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "What exactly is StackFind?",
    answer: "StackFind is India's most curated AI tools directory — 2,500+ tools organised by category, with INR pricing, UPI support flags, and a Made in India filter. It's built for Indian founders, developers, and builders who want to find the right AI tools without wading through generic listicles."
  },
  {
    question: "What is the AI Stack Playground?",
    answer: "The Playground is an AI-powered stack architect. Describe what you're building — an MVP SaaS, an AI app, a logistics tool — and it recommends a complete, layered tech stack covering development, database, auth, AI/LLM, payments, deployment, monitoring, analytics, and marketing. You get a full build plan with costs in INR, a ship-it order, and specific warnings for your project type. It uses three different AI models (Llama, Mistral, Kimi) each with a different reasoning style."
  },
  {
    question: "How is StackFind different from Product Hunt or G2?",
    answer: "Product Hunt is global and discovery-first. G2 is enterprise and review-heavy. StackFind is India-first and builder-first. We show INR pricing, flag which tools accept UPI, highlight Indian-built tools, and have the only AI that recommends stacks specifically optimised for the Indian market — Razorpay over Stripe, India-region hosting, WhatsApp-first notification flows."
  },
  {
    question: "Are the tool recommendations accurate or AI-hallucinated?",
    answer: "Every tool recommended by the AI is resolved against our live database before being shown to you. If the AI mentions a tool that isn't in our directory, it shows up as an external link rather than a fake entry. We also run the AI at low temperature (0.4) to reduce creative but wrong suggestions, and constrain it to only recommend from our curated catalogue."
  },
  {
    question: "How many free Playground generations do I get?",
    answer: "10 free stack generations — enough to explore the tool and generate stacks for a couple of projects. After that, Pro access is ₹499 one-time, lifetime. No subscription, no monthly renewal. Pay once, generate forever."
  },
  {
    question: "What does Pro access include?",
    answer: "Unlimited AI stack generations across all three models, the ability to save stacks to your history, the full starter stack library with pre-built rich prompts, and stack export. All for ₹499 one-time — less than one month of a single paid SaaS tool."
  },
  {
    question: "Can I submit my own AI tool?",
    answer: "Yes. Use the Submit button in the navigation. We review every submission manually before it goes live — no auto-approvals. If you're an Indian founder, we'll specifically flag your tool in the Made in India section."
  },
  {
    question: "How do you decide which tools make the directory?",
    answer: "We manually curate every tool. It must be genuinely AI-powered (not just AI in the marketing), actively maintained, and have a working product. We reject tools that are vaporware, duplicates, or purely promotional. Quality over quantity — although at 2,500+ tools we have both."
  },
  {
    question: "Do you have a newsletter?",
    answer: "Yes. The StackFind newsletter covers new AI tools launched that week, Indian AI startup news, and practical stack breakdowns for specific use cases. Subscribe from the Newsletter page. No spam — one email a week maximum."
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-black text-[#1C1611] mb-2 tracking-tight">Common Questions</h2>
      <p className="text-[#7A6A57] text-sm mb-8">Everything you need to know about StackFind and the AI Playground.</p>
      <div className="space-y-1">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-[#8C6E50]/10">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between text-[#1C1611] hover:text-indigo-600 transition-colors text-left py-3.5 focus:outline-none group"
            >
              <span className="text-base font-semibold pr-8">{faq.question}</span>
              {openIndex === i ? (
                <Minus size={16} className="text-indigo-500 flex-shrink-0" />
              ) : (
                <Plus size={16} className="text-stone-400 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-[#7A6A57] text-sm leading-relaxed pb-4 max-w-2xl">
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
