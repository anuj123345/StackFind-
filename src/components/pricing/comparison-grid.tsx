"use client"

import { motion } from "framer-motion"
import { Check, X, CreditCard, Landmark, Receipt, Globe } from "lucide-react"

const COMPARISON = [
  {
    feature: "Payment Method",
    direct: { text: "Intl. Credit Card Only", icon: <X className="text-rose-500" />, sub: "Strict transaction limits" },
    managed: { text: "UPI, NetBanking, Debit", icon: <Check className="text-emerald-500" />, sub: "Use any Indian payment method" }
  },
  {
    feature: "GST Invoicing",
    direct: { text: "No GST/Input Credit", icon: <X className="text-rose-500" />, sub: "Lose 18% of spend" },
    managed: { text: "Valid B2B GST Invoice", icon: <Check className="text-emerald-500" />, sub: "Claim 18% input credit back" }
  },
  {
    feature: "Forex Charges",
    direct: { text: "3.5% + Markups", icon: <X className="text-rose-500" />, sub: "Hidden bank charges" },
    managed: { text: "Zero Forex Markup", icon: <Check className="text-emerald-500" />, sub: "Pay in fixed INR amount" }
  },
  {
    feature: "Multiple Tools",
    direct: { text: "10 Tools = 10 Invoices", icon: <X className="text-rose-500" />, sub: "Compliance nightmare" },
    managed: { text: "One Consolidated Bill", icon: <Check className="text-emerald-500" />, sub: "One vendor, 100+ tools" }
  },
  {
    feature: "Customer Support",
    direct: { text: "Global Email/Bot", icon: <X className="text-rose-500" />, sub: "Slow resolution" },
    managed: { text: "Dedicated IN Support", icon: <Check className="text-emerald-500" />, sub: "WhatsApp/Call assistance" }
  }
]

export function ComparisonGrid() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-stone-900 mb-6 tracking-tight">
          StackFind Managed <span className="text-indigo-600">vs</span> Direct Billing
        </h2>
        <p className="text-lg text-[#7A6A57] max-w-2xl mx-auto">
          We handle the complexity of international payments so you can focus on building.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-stone-200 rounded-[2.5rem] overflow-hidden bg-white shadow-sm">
        {/* Header */}
        <div className="p-8 bg-stone-50/50 border-b border-stone-100 hidden md:block">
          <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Capabilities</p>
        </div>
        <div className="p-8 bg-stone-50/50 border-b border-stone-100 border-x border-stone-100">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-stone-400" />
            <p className="font-bold text-stone-900">Direct Purchase</p>
          </div>
        </div>
        <div className="p-8 bg-indigo-600 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <Landmark size={18} className="text-indigo-100" />
            <p className="font-bold text-white">StackFind Managed</p>
          </div>
        </div>

        {/* Rows */}
        {COMPARISON.map((row, i) => (
          <div key={i} className="contents">
            <div className={`p-8 border-b border-stone-100 hidden md:block ${i === COMPARISON.length - 1 ? "border-b-0" : ""}`}>
              <p className="font-bold text-stone-900">{row.feature}</p>
            </div>
            
            <div className={`p-8 border-b border-stone-100 border-x border-stone-100 ${i === COMPARISON.length - 1 ? "border-b-0" : ""}`}>
              <div className="md:hidden mb-2 text-xs font-bold text-stone-400 uppercase tracking-wider">{row.feature} (Direct)</div>
              <div className="flex items-start gap-3">
                <div className="mt-1">{row.direct.icon}</div>
                <div>
                  <p className="font-medium text-stone-600">{row.direct.text}</p>
                  <p className="text-[0.625rem] text-stone-400 italic">{row.direct.sub}</p>
                </div>
              </div>
            </div>

            <div className={`p-8 border-b border-indigo-50 bg-indigo-50/30 ${i === COMPARISON.length - 1 ? "border-b-0" : ""}`}>
              <div className="md:hidden mb-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">{row.feature} (StackFind)</div>
              <div className="flex items-start gap-3">
                <div className="mt-1">{row.managed.icon}</div>
                <div>
                  <p className="font-bold text-indigo-900">{row.managed.text}</p>
                  <p className="text-[0.625rem] text-indigo-400 font-medium italic">{row.managed.sub}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
