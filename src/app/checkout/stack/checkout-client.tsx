"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, ShieldCheck, Zap, Info, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { PlaygroundTool } from "@/lib/queries"
import { getLogoUrl } from "@/lib/logo"

interface Props {
  tools: PlaygroundTool[]
  usdToInrRate: number
  userEmail?: string
}

export default function CheckoutClient({ tools, usdToInrRate, userEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { subtotal, fee, gst, total } = useMemo(() => {
    let baseInr = 0
    tools.forEach(t => {
      if (t.starting_price_inr) baseInr += t.starting_price_inr
      else if (t.starting_price_usd) baseInr += t.starting_price_usd * usdToInrRate
    })

    const feeAmt = baseInr * 0.05
    const gstAmt = (baseInr + feeAmt) * 0.18
    const totalAmt = baseInr + feeAmt + gstAmt

    return {
      subtotal: Math.round(baseInr),
      fee: Math.round(feeAmt),
      gst: Math.round(gstAmt),
      total: Math.round(totalAmt)
    }
  }, [tools, usdToInrRate])

  async function handlePayment() {
    setLoading(true)
    try {
      const response = await fetch("/api/billing/stack-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools: tools.map(t => ({
            slug: t.slug,
            name: t.name,
            priceInr: t.starting_price_inr || (t.starting_price_usd ? Math.round(t.starting_price_usd * usdToInrRate) : 0)
          })),
          total
        })
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(true)
      } else {
        alert(data.error || "Failed to submit request")
      }
    } catch (error) {
      console.error("Payment Error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center p-10 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(140,110,80,0.1)", backdropFilter: "blur(20px)" }}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-black mb-3" style={{ color: "#1C1611" }}>Payment Request Sent!</h1>
          <p className="text-sm mb-8" style={{ color: "#7A6A57" }}>
            We've received your request to purchase the **{tools.length} tool stack**. 
            An invoice with the payment link has been sent to **{userEmail}**.
          </p>
          <Link 
            href="/playground" 
            className="inline-block px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: "#6366f1", color: "#fff" }}
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
              Managed Stack Checkout
            </h1>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#7A6A57" }}>
            Pay for your entire AI stack in **INR via UPI/Netbanking**. 
            We handle the international USD payments for you and provide a single GST-compliant invoice.
          </p>

          <div className="space-y-3 pt-4">
            {tools.map(tool => {
              const logoSrc = getLogoUrl(tool.website, tool.logo_url)
              const priceInr = tool.starting_price_inr || (tool.starting_price_usd ? Math.round(tool.starting_price_usd * usdToInrRate) : 0)
              
              return (
                <div 
                  key={tool.slug} 
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(140,110,80,0.06)" }}
                >
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
              )
            })}
          </div>

          <div className="p-5 rounded-2xl border-2 border-dashed border-[#6366f1]/20 bg-[#6366f1]/5">
            <div className="flex gap-3">
              <ShieldCheck className="text-[#6366f1] flex-shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: "#1C1611" }}>Why pay via StackFind?</p>
                <ul className="text-[11px] space-y-1 list-disc pl-4" style={{ color: "#7A6A57" }}>
                  <li>No International Credit Card required</li>
                  <li>Get 18% GST Input Credit on every tool</li>
                  <li>Pay via UPI, GPay, or PhonePe</li>
                  <li>One place to manage all tool subscriptions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Breakdown */}
        <div className="lg:col-span-2">
          <div 
            className="rounded-3xl p-6 lg:p-8 sticky top-28 shadow-xl shadow-black/5"
            style={{ background: "#fff", border: "1px solid rgba(140,110,80,0.12)" }}
          >
            <h2 className="text-lg font-black mb-6" style={{ color: "#1C1611" }}>Billing Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span style={{ color: "#7A6A57" }}>Tool Subtotal</span>
                <span className="font-semibold" style={{ color: "#1C1611" }}>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1.5 group relative">
                  <span style={{ color: "#7A6A57" }}>Convenience Fee (5%)</span>
                  <Info size={12} className="text-[#C4B0A0] cursor-help" />
                </div>
                <span className="font-semibold" style={{ color: "#1C1611" }}>₹{fee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#7A6A57" }}>GST (18%)</span>
                <span className="font-semibold" style={{ color: "#1C1611" }}>₹{gst}</span>
              </div>
              
              <div className="h-px bg-black/5 my-4" />
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#A0907E" }}>Total to Pay</p>
                  <p className="text-3xl font-black leading-none" style={{ color: "#1C1611" }}>₹{total}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-green-600 mb-0.5">Save ₹{Math.round(total * 0.18)}</p>
                  <p className="text-[9px]" style={{ color: "#C4B0A0" }}>with GST Input Credit</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#6366f1]/20"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff" }}
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Processing...</>
              ) : (
                <><CreditCard size={18} /> Pay with UPI / Card</>
              )}
            </button>
            
            <p className="text-center text-[10px] mt-6" style={{ color: "#C4B0A0" }}>
              Secure checkout powered by Razorpay. <br/>
              By paying, you agree to StackFind's Managed Terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader2({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
