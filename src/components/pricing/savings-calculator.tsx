"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Calculator, IndianRupee, TrendingUp, Info } from "lucide-react"

const USD_TO_INR = 84.0

export function SavingsCalculator() {
  const [spendUsd, setSpendUsd] = useState(200)

  const stats = useMemo(() => {
    const baseInr = spendUsd * USD_TO_INR
    const stackfindFee = baseInr * 0.05
    const gstAmount = (baseInr + stackfindFee) * 0.18
    const totalWithGst = baseInr + stackfindFee + gstAmount
    
    // Savings is the 18% GST input credit you get back
    const monthlySavings = gstAmount
    const yearlySavings = monthlySavings * 12

    return {
      baseInr: Math.round(baseInr),
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(yearlySavings),
      totalWithGst: Math.round(totalWithGst)
    }
  }, [spendUsd])

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-[2.5rem] border border-stone-200 p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                <Calculator size={20} />
              </div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">GST Savings Calculator</h2>
            </div>
            
            <p className="text-[#7A6A57] mb-10 leading-relaxed">
              Most SaaS tools don't give you a GST invoice, meaning you lose 18% on every dollar spent. 
              With StackFind, you get a valid GST invoice for every tool in your stack.
            </p>

            <div className="space-y-6">
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-bold text-stone-900 uppercase tracking-wider">Monthly Tool Spend (USD)</label>
                <span className="text-2xl font-black text-indigo-600">${spendUsd}</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="2000" 
                step="20"
                value={spendUsd}
                onChange={(e) => setSpendUsd(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[0.625rem] font-bold text-stone-400 uppercase tracking-widest">
                <span>$20</span>
                <span>$1,000</span>
                <span>$2,000</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-[2rem] p-8 border border-stone-100">
            <div className="space-y-8">
              <div>
                <p className="text-[0.625rem] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Monthly GST Credit</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-stone-900 tracking-tighter">₹{stats.monthlySavings.toLocaleString()}</span>
                  <span className="text-sm font-bold text-emerald-600">Saved</span>
                </div>
              </div>

              <div className="h-px bg-stone-200" />

              <div>
                <p className="text-[0.625rem] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Annual Benefit</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-2xl font-black text-stone-900">₹{stats.yearlySavings.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-indigo-600/5 rounded-2xl p-4 flex gap-3 items-start">
                <Info size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-900/70 leading-relaxed italic">
                  Calculated at 18% GST Input Credit on Base + 5% platform fee. Save more by consolidating invoices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
