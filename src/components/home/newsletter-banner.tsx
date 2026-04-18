"use client"

import { useState } from "react"
import { ArrowRight, Mail } from "lucide-react"

export function NewsletterBanner() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="relative z-10 px-4 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="card-bezel">
          <div className="card-inner px-8 py-12 text-center relative overflow-hidden">
            {/* Glow */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)"
              }}
            />

            <div className="relative z-10">
              <div className="eyebrow mx-auto w-fit mb-5">
                <Mail size={10} />
                Weekly Newsletter
              </div>

              <h2
                className="text-2xl md:text-3xl font-bold mb-3 tracking-tight"
                style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611" }}
              >
                Stay ahead of the AI curve
              </h2>
              <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: "#7A6A57" }}>
                Every week — the best new AI tools, India pricing updates, and founder stories. No fluff.
              </p>

              {submitted ? (
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                  <span>🎉</span>
                  <span>You&apos;re in! Check your inbox.</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <div className="search-wrap flex items-center gap-2 px-4 flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent text-sm outline-none py-3"
                      style={{ color: "#1C1611" }}
                    />
                  </div>
                  <button
                    className="btn-primary flex items-center gap-2 justify-center"
                    onClick={() => email && setSubmitted(true)}
                  >
                    Subscribe
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
