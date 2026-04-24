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
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { subtotal, platformFee, gstAmount, totalMonthlyInr } = useMemo(() => {
    let baseInr = 0
    tools.forEach(t => {
      if (t.starting_price_inr) baseInr += t.starting_price_inr
      else if (t.starting_price_usd) baseInr += t.starting_price_usd * usdToInrRate
    })

    const sub = Math.round(baseInr)
    // 5% Platform Convenience Fee
    const fee = Math.round(sub * 0.05)
    // 18% GST on (Subtotal + Fee)
    const gst = Math.round((sub + fee) * 0.18)
    
    return {
      subtotal: sub,
      platformFee: fee,
      gstAmount: gst,
      totalMonthlyInr: sub + fee + gst
    }
  }, [tools, usdToInrRate])

  const handlePayment = async () => {
    if (loading) return
    setLoading(true)
    setErrorMessage("")

    try {
      // 1. Create Order on Backend
      const res = await fetch("/api/billing/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalMonthlyInr * 100, // to paise
          receipt: `stack_${Date.now()}`,
        }),
      })

      const orderData = await res.json()
      if (!res.ok) throw new Error(orderData.error || "Failed to create order")

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StackFind",
        description: `Purchase for ${tools.length} AI Tools`,
        image: "/logo.png",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // 3. Verify Payment on Backend
          try {
            const verifyRes = await fetch("/api/billing/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              setPaymentStatus("success")
            } else {
              throw new Error(verifyData.message || "Payment verification failed")
            }
          } catch (err: any) {
            setPaymentStatus("failed")
            setErrorMessage(err.message)
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: userEmail?.split("@")[0] || "",
          email: userEmail || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        setPaymentStatus("failed")
        setErrorMessage(response.error.description)
        setLoading(false)
      })
      rzp.open()
    } catch (err: any) {
      setErrorMessage(err.message)
      setLoading(false)
    }
  }

  if (paymentStatus === "success") {
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
          <h1 className="text-3xl font-black mb-4" style={{ color: "#1C1611" }}>Payment Successful!</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Your stack request has been verified. We are now setting up your managed accounts. You will receive an email with further instructions shortly.
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
              Secure Checkout
            </h1>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#7A6A57" }}>
            Review your stack and complete the purchase in INR. We'll handle the international USD payments for you.
          </p>

          <div className="space-y-3 pt-4">
            {tools.map(tool => {
              const logoSrc = getLogoUrl(tool.website, tool.logo_url)
              const priceInr = tool.starting_price_inr || (tool.starting_price_usd ? Math.round(tool.starting_price_usd * usdToInrRate) : 0)
              
              const pricingLink = tool.website ? (tool.website.endsWith('/') ? tool.website + 'pricing' : tool.website + '/pricing') : null

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
                <h3 className="font-black text-lg mb-1">Razorpay Secure Payment</h3>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  Your transaction is protected by 256-bit SSL encryption. We never store your card or bank details.
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
            <h2 className="text-lg font-black mb-6" style={{ color: "#1C1611" }}>Billing Details</h2>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs font-medium" style={{ color: "#7A6A57" }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs font-medium" style={{ color: "#7A6A57" }}>
                <span className="flex items-center gap-1">Convenience Fee (5%) <Info size={10} title="Covers international payment processing & currency exchange" /></span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-xs font-medium" style={{ color: "#7A6A57" }}>
                <span>GST (18%)</span>
                <span>₹{gstAmount}</span>
              </div>
              
              <div className="h-px bg-black/5 my-4" />
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#A0907E" }}>Total Amount</p>
                  <p className="text-3xl font-black leading-none" style={{ color: "#1C1611" }}>₹{totalMonthlyInr}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", color: "#fff" }}
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Initializing...</>
              ) : (
                <><CreditCard size={18} /> Pay ₹{totalMonthlyInr} Now</>
              )}
            </button>
            
            {errorMessage && (
              <p className="text-[10px] text-red-500 mt-4 text-center font-medium">
                {errorMessage}
              </p>
            )}

            <p className="text-center text-[10px] mt-6" style={{ color: "#C4B0A0" }}>
              By clicking pay, you agree to our Terms of Service. <br/>
              Need help? <Link href="/contact" className="underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
