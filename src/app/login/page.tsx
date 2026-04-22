"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { ArrowRight, Key, ShieldCheck } from "lucide-react"

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState<"google" | "github" | "email" | "admin" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get("error") === "auth_failed") {
      setError("Authentication failed. Please try again.")
    }
  }, [searchParams])

  const supabase = createClient()

  function callbackUrl() {
    return `${window.location.origin}/auth/callback`
  }

  async function signInWithGoogle() {
    setError(null)
    setLoading("google")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    })
    if (error) { setError(error.message); setLoading(null) }
  }

  async function signInWithGitHub() {
    setError(null)
    setLoading("github")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: callbackUrl() },
    })
    if (error) { setError(error.message); setLoading(null) }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading("email")
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: callbackUrl() },
    })
    setLoading(null)
    if (error) { setError(error.message) } else { setEmailSent(true) }
  }

  async function handleAdminKeyLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!adminKey.trim()) return
    setError(null)
    setLoading("admin")

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: adminKey.trim() }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push("/admin")
      } else {
        setError(data.error || "Invalid Admin Key")
        setLoading(null)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(null)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#1C1611" }}
    >
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(99,102,241,0.09) 0%, transparent 65%)",
            "radial-gradient(ellipse 50% 45% at 80% 80%, rgba(217,119,6,0.08) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Center card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-[400px]">

          {/* Eyebrow */}
          <div
            className="mb-5 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.625rem] font-bold tracking-[0.1em] uppercase"
            style={{
              background: "rgba(217,119,6,0.1)",
              border: "1px solid rgba(217,119,6,0.2)",
              color: "#F59E0B",
            }}
          >
            🇮🇳 India&apos;s AI Stack
          </div>

          {/* Headline */}
          <h1
            className="font-black leading-[0.97] mb-3"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              letterSpacing: "-0.03em",
              color: "#FAF7F2",
            }}
          >
            Sign in to
            <br />
            <span style={{ color: "#6366f1" }}>explore the stack.</span>
          </h1>

          <p
            className="mb-10 text-[0.875rem] leading-relaxed"
            style={{ color: "rgba(250,247,242,0.42)" }}
          >
            Save tools, build your stack, get weekly AI picks.
          </p>

          {emailSent ? (
            <div
              className="rounded-2xl px-6 py-8 text-center"
              style={{ background: "rgba(250,247,242,0.04)", border: "1px solid rgba(250,247,242,0.08)" }}
            >
              <div className="text-4xl mb-4">📬</div>
              <p className="font-bold text-[0.9375rem] mb-2" style={{ color: "#FAF7F2" }}>
                Check your inbox
              </p>
              <p className="text-[0.8125rem]" style={{ color: "rgba(250,247,242,0.45)" }}>
                We sent a magic link to{" "}
                <span style={{ color: "rgba(250,247,242,0.75)" }}>{email}</span>.
                Click it to sign in.
              </p>
              <button
                onClick={() => { setEmailSent(false); setEmail("") }}
                className="mt-5 text-[0.8125rem] font-medium transition-colors duration-200"
                style={{ color: "rgba(250,247,242,0.35)" }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Google */}
              <button
                onClick={signInWithGoogle}
                disabled={loading !== null}
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-[0.9375rem] transition-all duration-200 disabled:opacity-60"
                style={{
                  background: "rgba(250,247,242,0.07)",
                  border: "1px solid rgba(250,247,242,0.1)",
                  color: "#FAF7F2",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(250,247,242,0.11)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(250,247,242,0.07)" }}
              >
                {loading === "google" ? (
                  <Spinner />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                onClick={signInWithGitHub}
                disabled={loading !== null}
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl font-semibold text-[0.9375rem] transition-all duration-200 disabled:opacity-60"
                style={{
                  background: "rgba(250,247,242,0.07)",
                  border: "1px solid rgba(250,247,242,0.1)",
                  color: "#FAF7F2",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(250,247,242,0.11)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(250,247,242,0.07)" }}
              >
                {loading === "github" ? (
                  <Spinner />
                ) : (
                  <GitHubIcon />
                )}
                Continue with GitHub
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px" style={{ background: "rgba(250,247,242,0.08)" }} />
                <span className="text-[0.75rem] font-medium" style={{ color: "rgba(250,247,242,0.22)" }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(250,247,242,0.08)" }} />
              </div>

              {/* Email magic link */}
              <form onSubmit={sendMagicLink} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-[0.9375rem] font-medium outline-none transition-all duration-200"
                  style={{
                    background: "rgba(250,247,242,0.05)",
                    border: "1px solid rgba(250,247,242,0.1)",
                    color: "#FAF7F2",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(250,247,242,0.1)")}
                <button
                  type="submit"
                  disabled={loading !== null || !email.trim()}
                  className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[0.9375rem] transition-all duration-200 disabled:opacity-50"
                  style={{ background: "#6366f1", color: "#fff" }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#5558e8" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#6366f1" }}
                >
                  {loading === "email" ? (
                    <Spinner white />
                  ) : (
                    <>
                      Send magic link
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Admin Portal Toggle */}
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                {isAdminMode ? (
                  <form onSubmit={handleAdminKeyLogin} className="flex flex-col gap-2.5">
                    <div className="relative">
                      <input
                        type="password"
                        value={adminKey}
                        onChange={e => setAdminKey(e.target.value)}
                        placeholder="Enter Admin Access Key"
                        required
                        className="w-full px-4 py-3.5 pl-10 rounded-xl text-[0.9375rem] font-medium outline-none transition-all duration-200"
                        style={{
                          background: "rgba(217,119,6,0.05)",
                          border: "1px solid rgba(217,119,6,0.15)",
                          color: "#FAF7F2",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(217,119,6,0.5)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(217,119,6,0.15)")}
                      />
                      <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500/50" />
                    </div>
                    <button
                      type="submit"
                      disabled={loading !== null || !adminKey.trim()}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[0.9375rem] transition-all duration-200 disabled:opacity-50"
                      style={{ background: "#D97706", color: "#fff" }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#B45309" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#D97706" }}
                    >
                      {loading === "admin" ? <Spinner white /> : "Access Command Center"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdminMode(false)}
                      className="text-[0.75rem] font-medium text-center opacity-40 hover:opacity-100 transition-opacity"
                      style={{ color: "#FAF7F2" }}
                    >
                      Back to regular sign in
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAdminMode(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[0.75rem] font-bold tracking-wide uppercase transition-all duration-200"
                    style={{ 
                      background: "rgba(217,119,6,0.05)", 
                      border: "1px solid rgba(217,119,6,0.1)",
                      color: "#F59E0B" 
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(217,119,6,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(217,119,6,0.05)")}
                  >
                    <ShieldCheck size={14} />
                    Admin Access Portal
                  </button>
                )}
              </div>

              {error && (
                <p
                  className="text-center text-[0.8125rem] mt-1"
                  style={{ color: "rgba(239,68,68,0.85)" }}
                >
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Footer note */}
          <p
            className="mt-8 text-center text-[0.75rem] leading-relaxed"
            style={{ color: "rgba(250,247,242,0.2)" }}
          >
            By signing in you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 transition-colors duration-200 hover:text-[rgba(250,247,242,0.5)]"
            >
              terms
            </Link>
            {" "}and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 transition-colors duration-200 hover:text-[rgba(250,247,242,0.5)]"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

function Spinner({ white }: { white?: boolean }) {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle
        cx="8" cy="8" r="6"
        stroke={white ? "rgba(255,255,255,0.3)" : "rgba(250,247,242,0.2)"}
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke={white ? "#fff" : "#FAF7F2"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(250,247,242,0.85)">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
