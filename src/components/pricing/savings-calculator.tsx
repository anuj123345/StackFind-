"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, TrendingUp, Info, ShieldCheck, CreditCard, Landmark } from "lucide-react"

const USD_TO_INR = 84.45
const FOREX_MARKUP = 0.035 // 3.5% hidden bank fee

export function SavingsCalculator() {
  const [spendUsd, setSpendUsd] = useState(250)
  const [count, setCount] = useState(spendUsd)

  useEffect(() => {
    setCount(spendUsd)
  }, [spendUsd])

  const stats = useMemo(() => {
    const rawInr = spendUsd * USD_TO_INR
    const bankHiddenFees = rawInr * FOREX_MARKUP
    const totalTraditional = rawInr + bankHiddenFees
    
    const stackfindFee = rawInr * 0.05
    const gstAmount = (rawInr + stackfindFee) * 0.18
    
    // Monthly savings = GST Credit (18%) + Bank Forex Markup (3.5%) - StackFind Fee (5%)
    const monthlySavings = gstAmount + bankHiddenFees - stackfindFee
    const yearlySavings = monthlySavings * 12

    return {
      rawInr: Math.round(rawInr),
      bankHiddenFees: Math.round(bankHiddenFees),
      totalTraditional: Math.round(totalTraditional),
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(yearlySavings),
      gstCredit: Math.round(gstAmount),
      platformFee: Math.round(stackfindFee)
    }
  }, [spendUsd])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="liquid-glass rounded-[3rem] border border-white/5 p-8 lg:p-16 relative overflow-hidden group">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 opacity-[0.03] blur-[120px] rounded-full group-hover:opacity-[0.05] transition-opacity duration-1000" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500 opacity-[0.02] blur-[100px] rounded-full group-hover:opacity-[0.04] transition-opacity duration-1000" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Interactive Controls */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <Calculator size={12} className="text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Precision Engine v2.0</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                Stop leaking <span className="text-indigo-500">22%</span> on every dollar.
              </h2>
              <p className="text-stone-400 text-base leading-relaxed">
                Most founders ignore the 18% GST loss and 3.5% hidden forex markups. 
                Our bridge fixes both instantly.
              </p>
            </div>

            <div className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/5">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Monthly Tool Spend</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">${spendUsd}</span>
                    <span className="text-stone-500 font-bold">/mo</span>
                  </div>
                </div>
              </div>

              <div className="relative h-20 flex items-center">
                <input 
                  type="range" 
                  min="50" 
                  max="5000" 
                  step="50"
                  value={spendUsd}
                  onChange={(e) => setSpendUsd(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
                <div className="absolute -bottom-2 w-full flex justify-between text-[10px] font-bold text-stone-600 uppercase">
                  <span>$50</span>
                  <span>$2.5k</span>
                  <span>$5k</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[9px] font-bold text-stone-500 uppercase mb-2">Traditional Bank Cost</p>
                  <p className="text-lg font-bold text-white">₹{stats.totalTraditional.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase mb-2">StackFind Managed</p>
                  <p className="text-lg font-bold text-white">₹{(stats.rawInr + stats.platformFee).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Results Visualization */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Monthly Savings Card */}
              <motion.div 
                layout
                className="p-8 rounded-[2rem] bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-20">
                  <TrendingUp size={64} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Monthly Net Benefit</p>
                <div className="relative z-10">
                  <span className="text-5xl font-black tracking-tighter">₹{stats.monthlySavings.toLocaleString()}</span>
                  <p className="mt-2 text-xs font-medium opacity-80">Credited & saved monthly</p>
                </div>
              </motion.div>

              {/* Yearly ROI Card */}
              <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Projected Annual ROI</p>
                <div className="space-y-4">
                  <span className="text-4xl font-black text-white tracking-tighter">₹{stats.yearlySavings.toLocaleString()}</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">18% GST Back</span>
                    <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold">3.5% Forex Saved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Robust Logic Breakdown */}
            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                Robust Financial Breakdown
              </h4>
              
              <div className="space-y-6">
                <BreakdownRow 
                  icon={<CreditCard size={14}/>} 
                  label="GST Input Tax Credit (ITC)" 
                  value={`₹${stats.gstCredit.toLocaleString()}`} 
                  desc="Valid GST invoice provided for local tax filing."
                  type="save"
                />
                <BreakdownRow 
                  icon={<Landmark size={14}/>} 
                  label="Forex Markup Avoided" 
                  value={`₹${stats.bankHiddenFees.toLocaleString()}`} 
                  desc="Traditional banks charge 2-4% on USD swipes."
                  type="save"
                />
                <div className="h-px bg-white/5 my-4" />
                <BreakdownRow 
                  icon={<Info size={14}/>} 
                  label="Platform Convenience Fee" 
                  value={`- ₹${stats.platformFee.toLocaleString()}`} 
                  desc="Transparent 5% fee for full compliance bridge."
                  type="cost"
                />
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Info size={18} className="text-indigo-400" />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed italic">
                  *Calculations based on fixed exchange rate of ₹{USD_TO_INR} / USD. 
                  Actual savings may vary based on bank-specific markup policies and GST eligibility.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function BreakdownRow({ icon, label, value, desc, type }: { icon: any, label: string, value: string, desc: string, type: "save" | "cost" }) {
  return (
    <div className="flex items-center justify-between group/row">
      <div className="flex items-start gap-4">
        <div className={`mt-1 p-2 rounded-lg bg-white/5 text-stone-400 group-hover/row:text-white transition-colors`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-white mb-1">{label}</p>
          <p className="text-[11px] text-stone-500">{desc}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-base font-black ${type === 'save' ? 'text-emerald-400' : 'text-stone-400'}`}>{value}</p>
        <p className="text-[9px] font-bold text-stone-600 uppercase tracking-tighter">per month</p>
      </div>
    </div>
  )
}
