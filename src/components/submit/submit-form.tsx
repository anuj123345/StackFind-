"use client"

import { useState, useId } from "react"

type Pricing = "free" | "freemium" | "paid" | "open_source"

const PRICING_OPTIONS: { value: Pricing; label: string }[] = [
  { value: "free",        label: "Free"        },
  { value: "freemium",    label: "Freemium"    },
  { value: "paid",        label: "Paid"        },
  { value: "open_source", label: "Open source" },
]

const INDIA_OPTIONS: { key: "is_made_in_india" | "has_inr_billing" | "has_upi" | "has_gst_invoice"; label: string }[] = [
  { key: "is_made_in_india", label: "Made in India 🇮🇳" },
  { key: "has_inr_billing",  label: "₹ INR billing"     },
  { key: "has_upi",          label: "UPI payments"       },
  { key: "has_gst_invoice",  label: "GST invoice"        },
]

// ─── Shared input styles ──────────────────────────────────────────────────────

const field: React.CSSProperties = {
  width: "100%",
  padding: "0.6875rem 0.875rem",
  borderRadius: "0.625rem",
  border: "1px solid rgba(140,110,80,0.2)",
  background: "#FFFFFF",
  color: "#1C1611",
  fontSize: "0.9375rem",
  lineHeight: "1.5",
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
}

function useFieldFocus() {
  return {
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      const t = e.target as HTMLElement
      t.style.borderColor = "rgba(99,102,241,0.45)"
      t.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.07)"
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const t = e.target as HTMLElement
      t.style.borderColor = "rgba(140,110,80,0.2)"
      t.style.boxShadow = "none"
    },
  }
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block mb-1.5 text-sm font-medium"
      style={{ color: "#7A6A57" }}
    >
      {children}
    </label>
  )
}

function SectionMark({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[0.625rem] font-semibold tracking-[0.16em] uppercase mb-3"
      style={{ color: "#C4B0A0" }}
    >
      {children}
    </p>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SubmitForm() {
  const uid = useId()
  const focus = useFieldFocus()

  const [form, setForm] = useState({
    name:             "",
    website:          "",
    tagline:          "",
    description:      "",
    pricing_model:    "freemium" as Pricing,
    email:            "",
    is_made_in_india: false,
    has_inr_billing:  false,
    has_upi:          false,
    has_gst_invoice:  false,
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [submissionId, setSubmissionId] = useState("")

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.")
        setStatus("error")
        return
      }
      setSubmissionId(data.submissionId)
      setStatus("success")
    } catch {
      setErrorMsg("Network error. Please check your connection.")
      setStatus("error")
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <div className="py-12">
        <p
          className="font-black mb-2 leading-tight"
          style={{
            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            color: "#1C1611",
            letterSpacing: "-0.02em",
          }}
        >
          Submitted.
        </p>
        <p style={{ color: "#7A6A57", lineHeight: "1.6", marginBottom: "1.5rem", maxWidth: "36ch" }}>
          We'll review <strong style={{ color: "#1C1611" }}>{form.name}</strong> and send
          an update to <strong style={{ color: "#1C1611" }}>{form.email}</strong> within 24–48 hours.
        </p>
        {submissionId && (
          <p className="text-xs font-mono" style={{ color: "#C4B0A0" }}>
            ref: {submissionId.slice(0, 8)}
          </p>
        )}
        <button
          onClick={() => {
            setStatus("idle")
            setForm({
              name: "", website: "", tagline: "", description: "",
              pricing_model: "freemium", email: "",
              is_made_in_india: false, has_inr_billing: false,
              has_upi: false, has_gst_invoice: false,
            })
          }}
          className="mt-8 text-sm font-medium underline underline-offset-2"
          style={{ color: "#7A6A57" }}
        >
          Submit another tool
        </button>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "1.5rem" }}>

      {/* Row: Name + Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${uid}-name`}>Tool name *</Label>
          <input
            id={`${uid}-name`}
            type="text"
            required
            placeholder="e.g. Notion AI"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            style={field}
            {...focus}
          />
        </div>
        <div>
          <Label htmlFor={`${uid}-website`}>Website *</Label>
          <input
            id={`${uid}-website`}
            type="text"
            required
            placeholder="https://yourtool.com"
            value={form.website}
            onChange={e => set("website", e.target.value)}
            style={field}
            {...focus}
          />
        </div>
      </div>

      {/* Tagline */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <Label htmlFor={`${uid}-tagline`}>Tagline *</Label>
          <span
            className="text-xs tabular-nums"
            style={{ color: form.tagline.length > 140 ? "#EF4444" : "#C4B0A0" }}
          >
            {form.tagline.length}/160
          </span>
        </div>
        <input
          id={`${uid}-tagline`}
          type="text"
          required
          maxLength={160}
          placeholder="One sentence — what does it do and for whom?"
          value={form.tagline}
          onChange={e => set("tagline", e.target.value)}
          style={field}
          {...focus}
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor={`${uid}-desc`}>Description <span style={{ color: "#C4B0A0", fontWeight: 400 }}>(optional)</span></Label>
        <textarea
          id={`${uid}-desc`}
          rows={3}
          maxLength={2000}
          placeholder="More detail about features, use cases, and what makes it different…"
          value={form.description}
          onChange={e => set("description", e.target.value)}
          style={{ ...field, resize: "vertical", minHeight: "80px" }}
          {...focus}
        />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(140,110,80,0.1)" }} />

      {/* Pricing */}
      <div>
        <SectionMark>Pricing</SectionMark>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(140,110,80,0.2)", background: "#fff" }}
        >
          {PRICING_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("pricing_model", opt.value)}
              className="flex-1 py-2.5 text-sm font-medium transition-all"
              style={{
                background: form.pricing_model === opt.value ? "#1C1611" : "transparent",
                color: form.pricing_model === opt.value ? "#FAF7F2" : "#7A6A57",
                borderRight: i < PRICING_OPTIONS.length - 1 ? "1px solid rgba(140,110,80,0.15)" : "none",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* India features */}
      <div>
        <SectionMark>India features</SectionMark>
        <div className="grid grid-cols-2 gap-2">
          {INDIA_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer select-none rounded-lg px-3 py-2.5 transition-colors"
              style={{
                background: form[key] ? "rgba(99,102,241,0.06)" : "rgba(140,110,80,0.04)",
                border: `1px solid ${form[key] ? "rgba(99,102,241,0.2)" : "rgba(140,110,80,0.12)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={form[key]}
                onChange={e => set(key, e.target.checked)}
                className="sr-only"
              />
              {/* Custom checkbox */}
              <span
                className="shrink-0 flex items-center justify-center rounded"
                style={{
                  width: "16px",
                  height: "16px",
                  background: form[key] ? "#6366f1" : "#fff",
                  border: `1.5px solid ${form[key] ? "#6366f1" : "rgba(140,110,80,0.3)"}`,
                  transition: "all 150ms",
                }}
              >
                {form[key] && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className="text-sm leading-tight"
                style={{ color: form[key] ? "#1C1611" : "#7A6A57", fontWeight: form[key] ? 500 : 400 }}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(140,110,80,0.1)" }} />

      {/* Email */}
      <div>
        <Label htmlFor={`${uid}-email`}>Your email *</Label>
        <input
          id={`${uid}-email`}
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={e => set("email", e.target.value)}
          style={field}
          {...focus}
        />
        <p className="mt-1.5 text-xs" style={{ color: "#C4B0A0" }}>
          For review updates only. Not shown publicly.
        </p>
      </div>

      {/* Error */}
      {status === "error" && errorMsg && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.18)",
            color: "#DC2626",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full !py-3.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        style={{ fontSize: "0.9375rem", letterSpacing: "-0.01em" }}
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
            </svg>
            Verifying website…
          </span>
        ) : (
          "Submit for review →"
        )}
      </button>

      <p className="text-xs text-center" style={{ color: "#C4B0A0" }}>
        Free listing. No payment required.
      </p>

    </form>
  )
}
