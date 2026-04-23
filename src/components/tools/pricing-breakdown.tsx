"use client"

import { useState } from "react"
import { Check, Info, IndianRupee, FileText, CreditCard, ArrowRight, Loader2, Sparkles } from "lucide-react"

interface PricingMetric {
  label: string
  value: string
  unit?: string
}

interface PricingBreakdownProps {
  toolId: string
  modelling?: PricingMetric[]
  hasGstInvoice?: boolean
  hasUpi?: boolean
  hasInrBilling?: boolean
  startingPriceInr?: number | null
  startingPriceUsd?: number | null
  managedBillingEnabled?: boolean
  inrPurchaseLink?: string | null
  convenienceFeePercent?: number
}

export function PricingBreakdown({ 
  toolId,
  modelling = [], 
  hasUpi, 
  hasInrBilling,
  startingPriceInr,
  startingPriceUsd,
  managedBillingEnabled,
  inrPurchaseLink,
  convenienceFeePercent = 5
}: PricingBreakdownProps) {
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState("")

  const handleRequestBilling = async () => {
    setRequesting(true)
    setError("")
    try {
      const res = await fetch("/api/billing/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit request")
      setRequested(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRequesting(false)
    }
  }

  // transparency calculations
  const usdToInrFallback = 84.0 // In detail page we usually pass from server
  const baseInr = startingPriceInr || (startingPriceUsd ? Math.round(startingPriceUsd * usdToInrFallback) : 0)
  
  const fee = Math.round((baseInr * convenienceFeePercent) / 100)
  const taxableAmount = baseInr + fee
  const gst = Math.round(taxableAmount * 0.18)
  const total = taxableAmount + gst

  return (
    <div className="space-y-6">
      {/* ── India Billing Verification ── */}
      <div 
        className="rounded-2xl p-6 border"
        style={{ background: "#FFFFFF", borderColor: "rgba(140,110,80,0.12)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee size={16} className="text-indigo-600" />
          <h3 
            className="font-bold text-sm uppercase tracking-wider"
            style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611" }}
          >
            India Support
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1 rounded-full ${hasInrBilling ? "bg-emerald-50 text-emerald-600" : "bg-stone-50 text-stone-300"}`}>
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1611]">INR Billing</p>
              <p className="text-[0.8125rem]" style={{ color: "#7A6A57" }}>
                {hasInrBilling ? "Verified support for Indian Rupee." : "May require USD conversion."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1 rounded-full ${hasUpi ? "bg-emerald-50 text-emerald-600" : "bg-stone-50 text-stone-300"}`}>
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1611]">UPI Payments</p>
              <p className="text-[0.8125rem]" style={{ color: "#7A6A57" }}>
                {hasUpi ? "Pay via GPay, PhonePe, or Paytm." : "Credit card only."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1 rounded-full bg-emerald-50 text-emerald-600">
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1611]">Local Support</p>
              <p className="text-[0.8125rem]" style={{ color: "#7A6A57" }}>
                Dedicated help for Indian entities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Price Modelling ── */}
      {modelling.length > 0 && (
        <div 
          className="rounded-2xl p-6 border"
          style={{ background: "rgba(255,255,255,0.4)", borderColor: "rgba(140,110,80,0.12)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={16} className="text-amber-600" />
            <h3 
              className="font-bold text-sm uppercase tracking-wider"
              style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611" }}
            >
              Cost Modelling
            </h3>
          </div>

          <div className="space-y-3">
            {modelling.map((item, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C4B0A0]">{item.label}</p>
                  <p className="text-sm text-[#7A6A57] mt-0.5">{item.unit || "Flat fee"}</p>
                </div>
                <p className="text-lg font-black text-[#1C1611]" style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex gap-3">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-amber-800/80">
              Pricing shown above is for India region and may include exclusive founder discounts.
            </p>
          </div>
        </div>
      )}

      {/* ── Starting Price Callout (if no modelling) ── */}
      {modelling.length === 0 && startingPriceInr && (
         <div 
            className="rounded-2xl p-5 border flex items-center justify-between"
            style={{ background: "rgba(140,110,80,0.04)", borderColor: "rgba(140,110,80,0.1)" }}
         >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-stone-100">
                    <IndianRupee size={16} className="text-[#1C1611]" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-[#1C1611]">Starting Price</h4>
                    <p className="text-xs text-[#7A6A57]">Monthly billing (INR)</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-2xl font-black text-[#1C1611]" style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}>
                    ₹{startingPriceInr.toLocaleString("en-IN")}
                </p>
            </div>
         </div>
      )}
    </div>
  )
}
