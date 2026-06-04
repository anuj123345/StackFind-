"use client"

import { Sparkles, Check, ArrowRight, Zap, Brain, Repeat, Shield } from "lucide-react"

interface Props {
  onUnlock?: () => void
}

export function PlaygroundPaywall({ onUnlock }: Props) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className="card-bezel overflow-hidden relative"
        style={{ boxShadow: "0 24px 64px rgba(140,110,80,0.15)" }}
      >
        <div className="card-inner p-8 md:p-12 text-center">

          {/* Badge */}
          <div className="mb-6">
            <span
              className="eyebrow !text-indigo-500 !bg-indigo-500/10 !border-indigo-500/20"
              style={{ padding: "0.4rem 1rem", fontSize: "0.75rem" }}
            >
              10 FREE GENERATIONS USED
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-3xl md:text-4xl font-black mb-4 leading-tight"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              color: "#1C1611",
              letterSpacing: "-0.03em"
            }}
          >
            Unlock Unlimited <br />
            <span className="text-indigo-500">Stack Recommendations</span>
          </h2>

          <p className="text-base text-[#7A6A57] mb-10 max-w-md mx-auto leading-relaxed">
            You've used your 10 free generations. Upgrade once and generate as many stacks as you need — forever.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10">
            {[
              { icon: Repeat,   text: "Unlimited Generations",       sub: "No daily or monthly caps" },
              { icon: Brain,    text: "All 3 AI Models",             sub: "Llama, Mistral & Kimi K2" },
              { icon: Zap,      text: "Full Starter Stack Library",  sub: "Pre-built prompts for every use case" },
              { icon: Shield,   text: "Lifetime Access",             sub: "Pay once, use forever" },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF7F2]/50 border border-black/[0.03]"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-black/[0.05]">
                  <f.icon size={16} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1611]">{f.text}</p>
                  <p className="text-[11px] text-[#C4B0A0]">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 mb-8 relative overflow-hidden">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
              Lifetime — One-Time Payment
            </p>
            <div className="flex items-baseline justify-center gap-1.5 mb-1">
              <span className="text-4xl font-black text-[#1C1611]">₹499</span>
              <span className="text-sm font-medium text-[#7A6A57]">one-time · no subscription</span>
            </div>
            <p className="text-[10px] text-[#A0907E]">
              Equivalent to 1 month of a single paid AI tool
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onUnlock}
              className="btn-primary w-full !py-4 !text-base flex items-center justify-center gap-2"
            >
              Get Lifetime Access — ₹499 <ArrowRight size={18} />
            </button>
            <p className="text-[11px] text-[#C4B0A0] flex items-center justify-center gap-1.5">
              <Check size={12} className="text-emerald-500" />
              Secure payment via Razorpay · UPI, cards & netbanking accepted
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
