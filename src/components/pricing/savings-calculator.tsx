"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, TrendingUp, Info, ShieldCheck, CreditCard, Landmark } from "lucide-react"

const USD_TO_INR = 84.45
const FOREX_MARKUP = 0.035 // 3.5% hidden bank fee

const TOOL_PRESETS = [
  { name: "Solo Dev", usd: 40, tools: ["Cursor", "OpenAI"] },
  { name: "Small Team", usd: 350, tools: ["Slack", "Linear", "AWS"] },
  { name: "Scaling AI", usd: 1200, tools: ["Perplexity", "Midjourney", "Vercel"] },
]

export function SavingsCalculator() {
  const [spendUsd, setSpendUsd] = useState(250)
  const [activePreset, setActivePreset] = useState<string | null>(null)

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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="liquid-glass rounded-[3rem] border border-white/5 p-8 lg:p-16 relative overflow-hidden group">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 opacity-[0.03] blur-[120px] rounded-full group-hover:opacity-[0.05] transition-opacity duration-1000" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Educational Controls */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Founder Compliance Bridge</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Turn your <span className="text-emerald-400">expenses</span> into <span className="text-indigo-400">tax credits.</span>
              </h2>
              <p className="text-stone-400 text-base leading-relaxed">
                Paying for Cursor or OpenAI with a personal card? You're losing 22% in dead costs. 
                Use our calculator to see the "hidden" leakage in your current stack.
              </p>
            </div>

            {/* Use Case Presets */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Select your scenario</p>
              <div className="flex flex-wrap gap-3">
                {TOOL_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setSpendUsd(p.usd)
                      setActivePreset(p.name)
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                      activePreset === p.name 
                      ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-white/5 border-white/10 text-stone-400 hover:border-white/20"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/5">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Custom Monthly Spend</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white transition-all">${spendUsd}</span>
                    <span className="text-stone-500 font-bold">/mo</span>
                  </div>
                </div>
              </div>

              <div className="relative h-12 flex items-center">
                <input 
                  type="range" 
                  min="20" 
                  max="5000" 
                  step="20"
                  value={spendUsd}
                  onChange={(e) => {
                    setSpendUsd(parseInt(e.target.value))
                    setActivePreset(null)
                  }}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[9px] font-bold text-indigo-400 uppercase mb-2">The Founder Reality</p>
                <p className="text-xs text-stone-300 leading-relaxed">
                  For a ${spendUsd} spend, you're currently paying <span className="text-white font-bold">₹{stats.totalTraditional.toLocaleString()}</span> with 0 tax benefits. 
                  We bring your effective cost down by <span className="text-emerald-400 font-black">₹{stats.monthlySavings.toLocaleString()}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Right: The Breakdown */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                layout
                className="p-8 rounded-[2rem] bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Money Back / Month</p>
                <div className="relative z-10">
                  <span className="text-5xl font-black tracking-tighter">₹{stats.monthlySavings.toLocaleString()}</span>
                  <p className="mt-2 text-[10px] font-medium opacity-80 uppercase tracking-wider">Total Compliance Savings</p>
                </div>
              </motion.div>

              <div className="p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Why this matters</p>
                <div className="space-y-3">
                  <BenefitTag text="18% GST Input Credit" />
                  <BenefitTag text="3.5% Forex Fee Saved" />
                  <BenefitTag text="Clean Audit Invoices" />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                <Landmark size={14} className="text-indigo-400" />
                Where your money goes
              </h4>
              
              <div className="space-y-6">
                <BreakdownRow 
                  icon={<CreditCard size={14}/>} 
                  label="GST ITC (18%)" 
                  value={`+ ₹${stats.gstCredit.toLocaleString()}`} 
                  desc="Claim this back against your output tax liability."
                  type="save"
                />
                <BreakdownRow 
                  icon={<TrendingUp size={14}/>} 
                  label="Forex Savings" 
                  value={`+ ₹${stats.bankHiddenFees.toLocaleString()}`} 
                  desc="Saved by paying in INR via UPI/Bank Transfer."
                  type="save"
                />
                <div className="h-px bg-white/5 my-4" />
                <BreakdownRow 
                  icon={<Info size={14}/>} 
                  label="StackFind Fee" 
                  value={`- ₹${stats.platformFee.toLocaleString()}`} 
                  desc="For handling procurement, compliance & invoicing."
                  type="cost"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function BenefitTag({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span className="text-xs font-bold text-white">{text}</span>
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
