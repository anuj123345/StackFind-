"use client"

import React, { useState, useTransition, useEffect } from "react"
import { Plus, Check, X, Trash2, ExternalLink, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import type { Tool, Category } from "@/types/database"

// ─── Submission types ─────────────────────────────────────────────────────────

interface ToolData {
  name: string
  slug: string
  website: string
  tagline: string
  description: string | null
  pricing_model: string
  logo_url: string | null
  is_made_in_india: boolean
  has_inr_billing: boolean
  has_upi: boolean
  has_gst_invoice: boolean
  auto_categories: string[]
  security_check: {
    reachable: boolean
    status_code: number | null
    og_title: string | null
    og_description: string | null
    flags: string[]
  }
  review_note: string
}

interface Submission {
  id: string
  email: string
  tool_data: ToolData
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface AdminDashboardProps {
  tools: Tool[]
  categories: Pick<Category, "id" | "slug" | "name">[]
  adminKey: string
}

const PRICING_OPTIONS = ["free", "freemium", "paid", "open_source"] as const

const STATUS_COLORS: Record<string, string> = {
  approved: "oklch(0.55 0.15 145)",
  pending:  "oklch(0.6 0.15 60)",
  rejected: "oklch(0.55 0.15 25)",
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function AdminDashboard({ tools: initialTools, categories, adminKey }: AdminDashboardProps) {
  const [tools, setTools] = useState(initialTools)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    website: "",
    logo_url: "",
    pricing_model: "freemium" as typeof PRICING_OPTIONS[number],
    starting_price_usd: "",
    starting_price_inr: "",
    has_inr_billing: false,
    has_gst_invoice: false,
    has_upi: false,
    has_india_support: false,
    is_made_in_india: false,
    status: "approved" as "pending" | "approved" | "rejected",
    category_slugs: [] as string[],
  })

  function flash(type: "ok" | "err", text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  async function apiFetch(method: string, path: string, body?: object) {
    const res = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      starting_price_usd: form.starting_price_usd ? Number(form.starting_price_usd) : null,
      starting_price_inr: form.starting_price_inr ? Number(form.starting_price_inr) : null,
    }
    startTransition(async () => {
      const json = await apiFetch("POST", "/api/admin/tools", payload)
      if (json.error) {
        flash("err", json.error)
      } else {
        setTools(prev => [json.tool, ...prev])
        setShowForm(false)
        setForm({
          name: "", slug: "", tagline: "", description: "", website: "",
          logo_url: "", pricing_model: "freemium", starting_price_usd: "",
          starting_price_inr: "", has_inr_billing: false, has_gst_invoice: false,
          has_upi: false, has_india_support: false, is_made_in_india: false,
          status: "approved", category_slugs: [],
        })
        flash("ok", `"${json.tool.name}" added successfully!`)
      }
    })
  }

  async function handleApprove(id: string) {
    startTransition(async () => {
      const json = await apiFetch("PATCH", "/api/admin/tools", {
        id,
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      if (json.error) { flash("err", json.error); return }
      setTools(prev => prev.map(t => t.id === id ? json.tool : t))
      flash("ok", "Tool approved.")
    })
  }

  async function handleReject(id: string) {
    startTransition(async () => {
      const json = await apiFetch("PATCH", "/api/admin/tools", { id, status: "rejected" })
      if (json.error) { flash("err", json.error); return }
      setTools(prev => prev.map(t => t.id === id ? json.tool : t))
      flash("ok", "Tool rejected.")
    })
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const json = await apiFetch("DELETE", `/api/admin/tools?id=${id}`, undefined)
      if (json.error) { flash("err", json.error); return }
      setTools(prev => prev.filter(t => t.id !== id))
      flash("ok", `"${name}" deleted.`)
    })
  }

  const pending  = tools.filter(t => t.status === "pending")
  const approved = tools.filter(t => t.status === "approved")
  const rejected = tools.filter(t => t.status === "rejected")

  // ─── Submissions state ──────────────────────────────────────────────────────
  const [tab, setTab] = useState<"tools" | "submissions">("tools")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [subsLoaded, setSubsLoaded] = useState(false)
  const [subsLoading, setSubsLoading] = useState(false)

  async function loadSubmissions() {
    setSubsLoading(true)
    try {
      const res = await fetch("/api/admin/submissions?status=pending", {
        headers: { "x-admin-key": adminKey },
      })
      const data = await res.json()
      setSubmissions(data.submissions ?? [])
      setSubsLoaded(true)
    } finally {
      setSubsLoading(false)
    }
  }

  useEffect(() => {
    if (tab === "submissions" && !subsLoaded) loadSubmissions()
  }, [tab])

  async function handleApproveSubmission(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ action: "approve", submissionId: id }),
      })
      const data = await res.json()
      if (data.error) { flash("err", data.error); return }
      setSubmissions(prev => prev.filter(s => s.id !== id))
      flash("ok", `Approved! Tool is now live as "${data.slug}".`)
    })
  }

  async function handleRejectSubmission(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ action: "reject", submissionId: id }),
      })
      const data = await res.json()
      if (data.error) { flash("err", data.error); return }
      setSubmissions(prev => prev.filter(s => s.id !== id))
      flash("ok", "Submission rejected.")
    })
  }

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.005 60)", fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ background: "oklch(0.15 0.02 60)", borderBottom: "1px solid oklch(0.25 0.02 60)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono tracking-widest mb-1" style={{ color: "oklch(0.55 0.12 60)" }}>STACKFIND</div>
            <h1 className="text-lg font-semibold" style={{ color: "oklch(0.95 0.01 60)" }}>Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "oklch(0.25 0.02 60)" }}>
              {(["tools", "submissions"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={
                    tab === t
                      ? { background: "oklch(0.97 0.01 60)", color: "oklch(0.15 0.02 60)" }
                      : { background: "transparent", color: "oklch(0.65 0.02 60)" }
                  }
                >
                  {t === "tools" ? "Tools" : `Submissions`}
                </button>
              ))}
            </div>
            {tab === "tools" && (
              <button
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: showForm ? "oklch(0.35 0.02 60)" : "oklch(0.55 0.15 145)",
                  color: "oklch(0.97 0.01 60)",
                }}
              >
                {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Tool</>}
              </button>
            )}
            {tab === "submissions" && (
              <button
                onClick={loadSubmissions}
                disabled={subsLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: "oklch(0.35 0.02 60)", color: "oklch(0.97 0.01 60)" }}
              >
                <RefreshCw size={13} className={subsLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Flash message */}
        {msg && (
          <div
            className="px-4 py-3 rounded-lg text-sm font-medium"
            style={{
              background: msg.type === "ok" ? "oklch(0.92 0.08 145)" : "oklch(0.92 0.08 25)",
              color: msg.type === "ok" ? "oklch(0.35 0.15 145)" : "oklch(0.35 0.15 25)",
            }}
          >
            {msg.text}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Tools", value: tools.length, color: "oklch(0.5 0.12 250)" },
            { label: "Tools Pending", value: pending.length, color: "oklch(0.5 0.15 60)" },
            { label: "Approved", value: approved.length, color: "oklch(0.45 0.15 145)" },
            { label: "Submissions", value: subsLoaded ? submissions.length : "—", color: "oklch(0.5 0.15 25)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-5" style={{ background: "#fff", border: "1px solid oklch(0.88 0.01 60)" }}>
              <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "oklch(0.55 0.02 60)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Submissions panel ─── */}
        {tab === "submissions" && (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.88 0.01 60)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: "oklch(0.96 0.06 25)" }}>
              <span className="text-sm font-semibold" style={{ color: "oklch(0.4 0.12 25)" }}>
                Pending Submissions ({submissions.length})
              </span>
            </div>
            {subsLoading ? (
              <div className="py-10 text-center text-sm" style={{ background: "#fff", color: "oklch(0.55 0.02 60)" }}>
                Loading submissions…
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center" style={{ background: "#fff" }}>
                <p className="text-sm" style={{ color: "oklch(0.55 0.02 60)" }}>
                  {subsLoaded ? "No pending submissions. All clear!" : "Click Refresh to load submissions."}
                </p>
              </div>
            ) : (
              <div style={{ background: "#fff" }}>
                {submissions.map((sub, i) => {
                  const td = sub.tool_data
                  const hasFlags = td.security_check?.flags?.length > 0
                  return (
                    <div
                      key={sub.id}
                      className="px-5 py-4"
                      style={{ borderTop: i === 0 ? "1px solid oklch(0.92 0.01 60)" : "1px solid oklch(0.94 0.005 60)" }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden"
                          style={{ background: "oklch(0.92 0.01 60)", color: "oklch(0.45 0.05 60)" }}
                        >
                          {td.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={td.logo_url} alt={td.name} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                          ) : (
                            td.name?.[0]?.toUpperCase()
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-semibold" style={{ color: "oklch(0.15 0.02 60)" }}>{td.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "oklch(0.93 0.01 60)", color: "oklch(0.5 0.02 60)" }}>
                              {td.pricing_model}
                            </span>
                            {td.is_made_in_india && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "oklch(0.93 0.06 145)", color: "oklch(0.4 0.12 145)" }}>
                                🇮🇳 Made in India
                              </span>
                            )}
                            {hasFlags && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "oklch(0.93 0.08 25)", color: "oklch(0.45 0.15 25)" }}>
                                ⚠ {td.security_check.flags.length} flag{td.security_check.flags.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {!hasFlags && td.security_check?.reachable && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "oklch(0.93 0.06 145)", color: "oklch(0.4 0.12 145)" }}>
                                ✓ Site verified
                              </span>
                            )}
                          </div>

                          <p className="text-xs mb-1 truncate" style={{ color: "oklch(0.5 0.02 60)" }}>{td.tagline}</p>

                          <div className="flex flex-wrap gap-3 text-xs" style={{ color: "oklch(0.6 0.02 60)" }}>
                            <span>{sub.email}</span>
                            {td.website && (
                              <a href={td.website} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline" style={{ color: "oklch(0.5 0.12 250)" }}>
                                <ExternalLink size={11} /> {td.website.replace(/^https?:\/\//, "").slice(0, 40)}
                              </a>
                            )}
                          </div>

                          {/* Auto-detected categories */}
                          {td.auto_categories?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="text-[10px]" style={{ color: "oklch(0.6 0.02 60)" }}>Auto-categories:</span>
                              {td.auto_categories.map(c => (
                                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "oklch(0.92 0.06 250)", color: "oklch(0.4 0.12 250)" }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Security flags */}
                          {hasFlags && (
                            <div className="mt-2 flex flex-col gap-1">
                              {td.security_check.flags.map((f, fi) => (
                                <p key={fi} className="text-[11px]" style={{ color: "oklch(0.5 0.15 25)" }}>⚠ {f}</p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveSubmission(sub.id)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                            style={{ background: "oklch(0.92 0.08 145)", color: "oklch(0.4 0.15 145)" }}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectSubmission(sub.id)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                            style={{ background: "oklch(0.93 0.06 25)", color: "oklch(0.45 0.15 25)" }}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Tools tab content ─── */}
        {tab === "tools" && <>

        {/* Add Tool Form */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="rounded-2xl p-6 space-y-5"
            style={{ background: "#fff", border: "1px solid oklch(0.88 0.01 60)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "oklch(0.2 0.02 60)" }}>Add New Tool</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tool Name *">
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="e.g. ChatGPT"
                />
              </Field>
              <Field label="Slug *">
                <input
                  required
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="e.g. chatgpt"
                />
              </Field>
              <Field label="Tagline *" className="sm:col-span-2">
                <input
                  required
                  value={form.tagline}
                  onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  placeholder="One-line description"
                />
              </Field>
              <Field label="Website">
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Logo URL — paste a direct image URL and verify the preview looks correct">
                <input
                  type="url"
                  value={form.logo_url}
                  onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png  (required — paste a real image URL)"
                />
                <LogoPreview logoUrl={form.logo_url} website={form.website} name={form.name} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Detailed description of the tool..."
                  style={{ resize: "vertical" }}
                />
              </Field>
              <Field label="Pricing Model">
                <select
                  value={form.pricing_model}
                  onChange={e => setForm(f => ({ ...f, pricing_model: e.target.value as typeof PRICING_OPTIONS[number] }))}
                >
                  {PRICING_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as "pending" | "approved" | "rejected" }))}
                >
                  <option value="approved">Approved (live)</option>
                  <option value="pending">Pending (review)</option>
                </select>
              </Field>
              <Field label="Price (USD)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.starting_price_usd}
                  onChange={e => setForm(f => ({ ...f, starting_price_usd: e.target.value }))}
                  placeholder="0"
                />
              </Field>
              <Field label="Price (INR)">
                <input
                  type="number"
                  min="0"
                  value={form.starting_price_inr}
                  onChange={e => setForm(f => ({ ...f, starting_price_inr: e.target.value }))}
                  placeholder="0"
                />
              </Field>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "oklch(0.45 0.02 60)" }}>Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const active = form.category_slugs.includes(cat.slug)
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        category_slugs: active
                          ? f.category_slugs.filter(s => s !== cat.slug)
                          : [...f.category_slugs, cat.slug]
                      }))}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: active ? "oklch(0.9 0.1 250)" : "oklch(0.93 0.005 60)",
                        color: active ? "oklch(0.35 0.18 250)" : "oklch(0.5 0.02 60)",
                        outline: active ? "1px solid oklch(0.7 0.1 250)" : "none",
                      }}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* India checkboxes */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "oklch(0.45 0.02 60)" }}>India Features</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { key: "is_made_in_india", label: "🇮🇳 Made in India" },
                  { key: "has_inr_billing", label: "INR Billing" },
                  { key: "has_gst_invoice", label: "GST Invoice" },
                  { key: "has_upi", label: "UPI Payment" },
                  { key: "has_india_support", label: "India Support" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "oklch(0.4 0.02 60)" }}>
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "oklch(0.5 0.18 145)", color: "#fff" }}
              >
                {isPending ? "Adding…" : "Add Tool"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: "oklch(0.93 0.005 60)", color: "oklch(0.45 0.02 60)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Pending tools */}
        {pending.length > 0 && (
          <ToolSection
            title="Pending Review"
            tools={pending}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            isPending={isPending}
            showActions
          />
        )}

        {/* Approved tools */}
        <ToolSection
          title={`Live Tools (${approved.length})`}
          tools={approved}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          isPending={isPending}
        />

        {/* API info */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: "oklch(0.13 0.02 60)", color: "oklch(0.8 0.02 60)" }}>
          <h3 className="text-sm font-semibold text-white">API Access</h3>
          <p className="text-xs" style={{ color: "oklch(0.6 0.02 60)" }}>
            Use the API to programmatically add tools (e.g. from Zapier, Make.com, or your own scripts).
          </p>
          <div className="space-y-2 font-mono text-xs" style={{ color: "oklch(0.75 0.08 145)" }}>
            <div>POST /api/admin/tools — add a tool</div>
            <div>GET  /api/admin/tools — list all tools</div>
            <div>PATCH /api/admin/tools — update a tool</div>
            <div>DELETE /api/admin/tools?slug=xxx — delete</div>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.55 0.02 60)" }}>
            Include header: <span className="font-mono" style={{ color: "oklch(0.7 0.1 250)" }}>x-admin-key: {adminKey.slice(0, 16)}…</span>
          </p>
        </div>

        </> /* end tab === "tools" */}
      </div>
    </div>
  )
}

// Logo preview shown in the admin form so you can verify before saving
function LogoPreview({ logoUrl, website, name }: { logoUrl: string; website: string; name: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle")

  // Derive a preview src: prefer explicit logoUrl, else DuckDuckGo
  let src = logoUrl.trim()
  if (!src && website.trim()) {
    try {
      const host = new URL(website.trim()).hostname.replace(/^www\./, "")
      src = `https://icons.duckduckgo.com/ip3/${host}.ico`
    } catch { src = "" }
  }

  React.useEffect(() => { setState("idle") }, [src])

  if (!src) return null

  return (
    <div className="flex items-center gap-3 mt-2">
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ border: "1px solid oklch(0.88 0.01 60)", background: "oklch(0.96 0.005 60)" }}
      >
        {state !== "fail" ? (
          <img
            src={src}
            alt="logo preview"
            width={40}
            height={40}
            className="w-full h-full object-contain"
            onLoad={() => setState("ok")}
            onError={() => setState("fail")}
          />
        ) : (
          <span className="text-sm font-bold" style={{ color: "oklch(0.5 0.02 60)" }}>
            {name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>
      <p className="text-xs" style={{ color: state === "fail" ? "oklch(0.5 0.15 25)" : state === "ok" ? "oklch(0.45 0.15 145)" : "oklch(0.6 0.02 60)" }}>
        {state === "fail"
          ? "Logo not found — a letter avatar will show. Paste a direct image URL above to fix."
          : state === "ok"
          ? "Logo preview looks good. If it's a generic globe icon, paste a better URL."
          : "Loading preview…"}
      </p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid oklch(0.85 0.01 60)",
  background: "oklch(0.98 0.005 60)",
  fontSize: "13px",
  color: "oklch(0.2 0.02 60)",
  outline: "none",
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  // Clone child element and inject inputStyle
  const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>
  const styledChild = child ? React.cloneElement(child, {
    style: { ...inputStyle, ...(child.props.style ?? {}) },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      (e.target as HTMLElement).style.borderColor = "oklch(0.6 0.15 250)"
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      (e.target as HTMLElement).style.borderColor = "oklch(0.85 0.01 60)"
    },
  }) : children

  return (
    <div className={className}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "oklch(0.45 0.02 60)" }}>{label}</label>
      {styledChild}
    </div>
  )
}

function ToolSection({
  title, tools, onApprove, onReject, onDelete, isPending, showActions = false,
}: {
  title: string
  tools: Tool[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string, name: string) => void
  isPending: boolean
  showActions?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.88 0.01 60)" }}>
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5"
        style={{ background: showActions ? "oklch(0.96 0.06 60)" : "#fff" }}
      >
        <span className="text-sm font-semibold" style={{ color: showActions ? "oklch(0.4 0.12 60)" : "oklch(0.2 0.02 60)" }}>
          {showActions && "⚠ "}{title}
        </span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!collapsed && (
        <div style={{ background: "#fff" }}>
          {tools.map((tool, i) => (
            <div
              key={tool.id}
              className="flex items-center gap-4 px-5 py-3.5"
              style={{
                borderTop: i === 0 ? "1px solid oklch(0.92 0.01 60)" : "1px solid oklch(0.94 0.005 60)",
              }}
            >
              {/* Logo */}
              <div
                className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden"
                style={{ background: "oklch(0.92 0.01 60)", color: "oklch(0.45 0.05 60)" }}
              >
                {tool.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain" />
                ) : (
                  tool.name[0]?.toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate" style={{ color: "oklch(0.15 0.02 60)" }}>{tool.name}</span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: `${STATUS_COLORS[tool.status]}22`,
                      color: STATUS_COLORS[tool.status],
                    }}
                  >
                    {tool.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "oklch(0.93 0.01 60)", color: "oklch(0.5 0.02 60)" }}>
                    {tool.pricing_model}
                  </span>
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: "oklch(0.55 0.02 60)" }}>{tool.tagline}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {tool.website && (
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: "oklch(0.6 0.02 60)" }}
                    title="Visit site"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
                {showActions && (
                  <>
                    <button
                      onClick={() => onApprove(tool.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-md transition-colors disabled:opacity-40"
                      style={{ background: "oklch(0.92 0.08 145)", color: "oklch(0.4 0.15 145)" }}
                      title="Approve"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => onReject(tool.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-md transition-colors disabled:opacity-40"
                      style={{ background: "oklch(0.93 0.06 60)", color: "oklch(0.5 0.15 60)" }}
                      title="Reject"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(tool.id, tool.name)}
                  disabled={isPending}
                  className="p-1.5 rounded-md transition-colors disabled:opacity-40"
                  style={{ color: "oklch(0.6 0.12 25)" }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
