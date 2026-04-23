"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  return (
    <div className="max-w-3xl mx-auto px-6">
      <h2 className="text-3xl font-black text-white mb-10 tracking-tight">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
            <AccordionTrigger className="text-white hover:text-indigo-400 transition-colors text-left py-6">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-stone-400 text-lg leading-relaxed pb-6">
              {faq.answer}
            </AccordionContent>
            <div className="h-px w-full bg-white/5" />
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
