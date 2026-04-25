"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, CreditCard, ShieldCheck, Zap, Info, CheckCircle2, ArrowUpRight, Loader2 } from "lucide-react"
import Link from "next/link"
import type { PlaygroundTool } from "@/lib/queries"
import { getLogoUrl } from "@/lib/logo"

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  tools: PlaygroundTool[]
  usdToInrRate: number
  userEmail?: string
}

export default function CheckoutClient({ tools, usdToInrRate, userEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { subtotal, platformFee, gstAmount, totalMonthlyInr } = useMemo(() => {
    let baseInr = 0
    tools.forEach(t => {
      if (t.starting_price_inr) baseInr += t.starting_price_inr
      else if (t.starting_price_usd) baseInr += t.starting_price_usd * usdToInrRate
    })

    const sub = Math.round(baseInr)
    const fee = Math.round(sub * 0.05)
    const gst = Math.round((sub + fee) * 0.18)
    
    return {
      subtotal: sub,
      platformFee: fee,
      gstAmount: gst,
      totalMonthlyInr: sub + fee + gst
    }
  }, [tools, usdToInrRate])

  const handleSubmitRequest = async () => {
    setLoading(true)
    // Simulate API call to save request
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-xl border border-stone-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-black mb-4" style={{ color: "#1C1611" }}>Request Submitted!</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            We've received your request for managed billing. Our team will review the stack and contact you within 24 hours to set up your accounts and provide payment instructions.
          </p>
          <Link 
            href="/playground"
            className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
          >
            Back to Playground
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
      <Link 
        href="/playground" 
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-8 transition-opacity hover:opacity-60"
        style={{ color: "#A0907E" }}
      >
        <ArrowLeft size={14} /> Back to Playground
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        {/* Left: Order Summary */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={18} style={{ color: "#6366f1" }} />
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "#1C1611" }}>
              Managed Billing Request
            </h1>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#7A6A57" }}>
            Submit your stack for managed INR billing. We'll verify availability and send you a formal invoice with UPI/Netbanking options.
          </p>

          <div className="space-y-3 pt-4">
            {tools.map(tool => {
              const logoSrc = getLogoUrl(tool.website, tool.logo_url)
              const priceInr = tool.starting_price_inr || (tool.starting_price_usd ? Math.round(tool.starting_price_usd * usdToInrRate) : 0)
              
              return (
                <div 
                  key={tool.slug} 
                  className="p-5 rounded-2xl transition-all"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(140,110,80,0.06)" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-black/5 overflow-hidden flex-shrink-0">
                      {logoSrc ? <img src={logoSrc} alt="" className="w-6 h-6 object-contain" /> : <span className="font-bold">{tool.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm" style={{ color: "#1C1611" }}>{tool.name}</h3>
                      <p className="text-[10px] truncate" style={{ color: "#C4B0A0" }}>{tool.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: "#1C1611" }}>₹{priceInr}</p>
                      <p className="text-[9px] opacity-50">/ month</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-6 rounded-[2rem] bg-stone-900 text-white shadow-xl shadow-stone-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative z-10 flex gap-4">
              <ShieldCheck size={32} className="text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="font-black text-lg mb-1">Secure Management</h3>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  We handle the international KYC and USD payments. Your accounts are managed securely with dedicated enterprise access where available.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div 
            className="rounded-3xl p-6 lg:p-8 sticky top-28 shadow-xl shadow-black/5"
            style={{ background: "#fff", border: "1px solid rgba(140,110,80,0.12)" }}
          >
            <h2 className="text-lg font-black mb-6" style={{ color: "#1C1611" }}>Estimated Billing</h2>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs font-medium" style={{ color: "#7A6A57" }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs font-medium" style={{ color: "#7A6A57" }}>
                <span className="flex items-center gap-1">Convenience Fee (5%) <span title="Covers international payment processing & currency exchange"><Info size={10} /></span></span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-xs font-medium" style={{ color: "#7A6A57" }}>
                <span>GST (18%)</span>
                <span>₹{gstAmount}</span>
              </div>
              
              <div className="h-px bg-black/5 my-4" />
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#A0907E" }}>Estimated Monthly</p>
                  <p className="text-3xl font-black leading-none" style={{ color: "#1C1611" }}>₹{totalMonthlyInr}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitRequest}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-50"
              style={{ background: "#1C1611", color: "#fff" }}
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Submitting...</>
              ) : (
                <><Zap size={18} className="text-yellow-400" /> Request Managed Billing</>
              )}
            </button>
            
            <p className="text-center text-[10px] mt-6" style={{ color: "#C4B0A0" }}>
              Our team will contact you to finalize the setup. <br/>
              Need help? <Link href="/contact" className="underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
