"use client"

import { Sparkles, Check, ArrowRight, Zap, Globe, Landmark } from "lucide-react"

interface Props {
  onUnlock?: () => void
}

export function PlaygroundPaywall({ onUnlock }: Props) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Background decoration */}
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
              PRO FEATURE
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
            Unlock the Full <br />
            <span className="text-indigo-500">Playground Experience</span>
          </h2>
          
          <p className="text-lg text-[#7A6A57] mb-10 max-w-md mx-auto leading-relaxed">
            You've reached your free limit. Upgrade to Pro for unlimited builds and premium Indian stack intelligence.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10">
            {[
              { icon: Zap, text: "Unlimited Build Plans", sub: "Perfect for repeated iterations" },
              { icon: Landmark, text: "Build Plan Intelligence", sub: "Optimized tool selection logic" },
              { icon: Sparkles, text: "Advanced AI Plans", sub: "Powered by Sonnet 3.5 & GPT-4o" },
              { icon: Globe, text: "GTM Strategies", sub: "Custom go-to-market roadmaps" },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF7F2]/50 border border-black/[0.03]"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-black/[0.05]">
                  <feature.icon size={16} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1611]">{feature.text}</p>
                  <p className="text-[11px] text-[#C4B0A0]">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Sparkles size={100} className="text-indigo-500" />
            </div>
            
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
              Limited Time Lifetime Offer
            </p>
            <div className="flex items-baseline justify-center gap-1.5 mb-1">
              <span className="text-4xl font-black text-[#1C1611]">₹499</span>
              <span className="text-sm font-medium text-[#7A6A57]">one-time</span>
            </div>
            <p className="text-[10px] text-[#A0907E]">
              Save 80% compared to international tool directories
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={onUnlock}
              className="btn-primary w-full !py-4 !text-base flex items-center justify-center gap-2"
            >
              Unlock Pro Access <ArrowRight size={18} />
            </button>
            <p className="text-[11px] text-[#C4B0A0] flex items-center justify-center gap-1.5">
              <Check size={12} className="text-emerald-500" /> 100% Secure via Razorpay
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-10 pt-8 border-t border-black/[0.05]">
            <p className="text-[10px] font-bold text-[#A0907E] uppercase tracking-widest mb-4">
              Trusted by 500+ Indian Builders
            </p>
            <div className="flex justify-center gap-4 grayscale opacity-40">
              <div className="text-sm font-bold">STARTUP HUB</div>
              <div className="text-sm font-bold">INDIA BUILDERS</div>
              <div className="text-sm font-bold">SAAS FOUNDERS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
