"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, ShieldCheck, Zap, Info, CheckCircle2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { PlaygroundTool } from "@/lib/queries"
import { getLogoUrl } from "@/lib/logo"

interface Props {
  tools: PlaygroundTool[]
  usdToInrRate: number
  userEmail?: string
}

export default function CheckoutClient({ tools, usdToInrRate, userEmail }: Props) {
  const { totalMonthlyInr } = useMemo(() => {
    let baseInr = 0
    tools.forEach(t => {
      if (t.starting_price_inr) baseInr += t.starting_price_inr
      else if (t.starting_price_usd) baseInr += t.starting_price_usd * usdToInrRate
    })

    return {
      totalMonthlyInr: Math.round(baseInr)
    }
  }, [tools, usdToInrRate])

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
              Stack Cost Preview
            </h1>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#7A6A57" }}>
            Review the estimated monthly cost for your selected tools. Use the official links below to purchase each tool directly from the vendor.
          </p>

          <div className="space-y-3 pt-4">
            {tools.map(tool => {
              const logoSrc = getLogoUrl(tool.website, tool.logo_url)
              const priceInr = tool.starting_price_inr || (tool.starting_price_usd ? Math.round(tool.starting_price_usd * usdToInrRate) : 0)
              
              // Extract pricing modelling metrics
              const plans = Array.isArray(tool.pricing_modelling) ? tool.pricing_modelling : []
              const pricingLink = tool.website ? (tool.website.endsWith('/') ? tool.website + 'pricing' : tool.website + '/pricing') : null

              return (
                <div 
                  key={tool.slug} 
                  className="p-5 rounded-2xl transition-all"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(140,110,80,0.06)" }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-black/5 overflow-hidden flex-shrink-0">
                      {logoSrc ? <img src={logoSrc} alt="" className="w-6 h-6 object-contain" /> : <span className="font-bold">{tool.name[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm" style={{ color: "#1C1611" }}>{tool.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] truncate" style={{ color: "#C4B0A0" }}>{tool.tagline}</p>
                        {pricingLink && (
                          <a 
                            href={pricingLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            Pricing <ArrowUpRight size={8} />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: "#1C1611" }}>₹{priceInr}</p>
                      <p className="text-[9px] opacity-50">/ month</p>
                    </div>
                  </div>

                  {/* Plan Details */}
                  {plans.length > 0 && (
                    <div className="pl-14 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-stone-100 pt-3">
                      {plans.map((plan: any, i: number) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#C4B0A0]">{plan.label}</span>
                          <span className="text-[10px] font-medium text-[#7A6A57]">{plan.value} {plan.unit && <span className="text-[8px] opacity-60">/ {plan.unit}</span>}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="p-6 rounded-[2rem] bg-stone-900 text-white shadow-xl shadow-stone-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Info size={24} />
                <h3 className="font-black text-lg">Direct Purchase Guide</h3>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                StackFind provides estimated pricing to help you plan your budget. Always verify the final price on the official vendor website before purchasing.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div 
            className="rounded-3xl p-6 lg:p-8 sticky top-28 shadow-xl shadow-black/5"
            style={{ background: "#fff", border: "1px solid rgba(140,110,80,0.12)" }}
          >
            <h2 className="text-lg font-black mb-6" style={{ color: "#1C1611" }}>Stack Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#A0907E" }}>Estimated Monthly Total</p>
                  <p className="text-3xl font-black leading-none" style={{ color: "#1C1611" }}>₹{totalMonthlyInr}</p>
                </div>
              </div>
              
              <div className="h-px bg-black/5 my-4" />
              
              <p className="text-[10px] leading-relaxed italic" style={{ color: "#7A6A57" }}>
                This is an estimated cost based on current exchange rates and vendor starting plans. Prices may vary based on your specific usage and local taxes.
              </p>
            </div>

            <Link
              href="/tools"
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all hover:bg-stone-100 border border-stone-200"
              style={{ color: "#1C1611" }}
            >
              Add More Tools
            </Link>
            
            <p className="text-center text-[10px] mt-6" style={{ color: "#C4B0A0" }}>
              Pricing data is updated weekly. <br/>
              Report an error in pricing? <Link href="/contact" className="underline">Click here</Link>
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
