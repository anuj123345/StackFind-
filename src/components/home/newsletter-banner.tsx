"use client"

import { useState } from "react"
import { ArrowRight, Mail, CheckCircle2, Loader2 } from "lucide-react"

type State = "idle" | "loading" | "success" | "error"

export function NewsletterBanner() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<State>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubscribe() {
    if (!email || state === "loading") return
    setState("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setState("success")
      } else {
        setErrorMsg(data.error ?? "Something went wrong. Try again.")
        setState("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setState("error")
    }
  }

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
                Every week — new AI tools, top news stories, and what builders are buzzing about. Straight to your inbox.
              </p>

              {state === "success" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                    <CheckCircle2 size={18} />
                    You&apos;re subscribed! Check your inbox for a welcome email.
                  </div>
                  <p className="text-xs" style={{ color: "#C4B0A0" }}>
                    You&apos;ll get the digest every Monday morning.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full mx-auto">
                    <div className="search-wrap flex items-center gap-2 px-4 flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (state === "error") setState("idle") }}
                        onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                        placeholder="you@example.com"
                        className="flex-1 bg-transparent text-sm outline-none py-3"
                        style={{ color: "#1C1611" }}
                        disabled={state === "loading"}
                      />
                    </div>
                    <button
                      className="btn-primary flex items-center gap-2 justify-center disabled:opacity-60"
                      onClick={handleSubscribe}
                      disabled={!email || state === "loading"}
                    >
                      {state === "loading" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>Subscribe <ArrowRight size={14} /></>
                      )}
                    </button>
                  </div>
                  {state === "error" && (
                    <p className="text-xs text-red-500">{errorMsg}</p>
                  )}
                  <p className="text-xs" style={{ color: "#C4B0A0" }}>
                    No spam. Unsubscribe any time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
