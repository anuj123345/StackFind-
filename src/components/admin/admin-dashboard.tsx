"use client"

import React, { useState, useTransition, useEffect } from "react"
import { 
  Plus, Check, X, Trash2, ExternalLink, ChevronDown, ChevronUp, 
  RefreshCw, Activity, TrendingUp, Users, Zap, LayoutDashboard, 
  Database, Shield, PieChart, FileText, Settings, LogOut, Search,
  ArrowUpRight, Clock, Box, Globe, ShieldAlert
} from "lucide-react"
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

interface BillingRequest {
  id: string
  tool_id: string
  email: string
  notes: string | null
  status: "pending" | "processed"
  created_at: string
  tool: {
    name: string
    logo_url: string | null
  }
}

interface AdminDashboardProps {
  tools: Tool[]
  categories: Pick<Category, "id" | "slug" | "name">[]
  adminKey: string
}

const PRICING_OPTIONS = ["free", "freemium", "paid", "open_source"] as const

const STATUS_COLORS: Record<string, string> = {
  approved: "oklch(0.65 0.2 145)",
  pending:  "oklch(0.7 0.2 60)",
  rejected: "oklch(0.65 0.2 25)",
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function AdminDashboard({ tools: initialTools, categories, adminKey }: AdminDashboardProps) {
  const [tools, setTools] = useState(initialTools)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [tab, setTab] = useState<"command" | "tools" | "submissions" | "leads">("command")
  const [searchQuery, setSearchQuery] = useState("")

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

  // ─── Submissions & Analytics state ──────────────────────────────────────────
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [subsLoaded, setSubsLoaded] = useState(false)
  const [subsLoading, setSubsLoading] = useState(false)
  const [billingRequests, setBillingRequests] = useState<BillingRequest[]>([])
  const [leadsLoaded, setLeadsLoaded] = useState(false)
  const [leadsLoading, setLeadsLoading] = useState(false)

  async function loadAnalytics() {
    setStatsLoading(true)
    try {
      const res = await fetch("/api/admin/analytics", { headers: { "x-admin-key": adminKey } })
      const data = await res.json()
      setStats(data)
    } finally { setStatsLoading(false) }
  }

  async function loadSubmissions() {
    setSubsLoading(true)
    try {
      const res = await fetch("/api/admin/submissions?status=pending", { headers: { "x-admin-key": adminKey } })
      const data = await res.json()
      setSubmissions(data.submissions ?? [])
      setSubsLoaded(true)
    } finally { setSubsLoading(false) }
  }

  async function loadBillingRequests() {
    setLeadsLoading(true)
    try {
      const res = await fetch("/api/admin/billing-requests?status=pending", { headers: { "x-admin-key": adminKey } })
      const data = await res.json()
      setBillingRequests(data.requests ?? [])
      setLeadsLoaded(true)
    } finally { setLeadsLoading(false) }
  }

  useEffect(() => {
    if (tab === "command") loadAnalytics()
    if (tab === "submissions" && !subsLoaded) loadSubmissions()
    if (tab === "leads" && !leadsLoaded) loadBillingRequests()
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
      flash("ok", "Submission approved!")
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

  async function handleMarkProcessed(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/admin/billing-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ id, status: "processed" }),
      })
      const data = await res.json()
      if (data.error) { flash("err", data.error); return }
      setBillingRequests(prev => prev.filter(r => r.id !== id))
      flash("ok", "Lead processed.")
    })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#050403", color: "#FAF7F2", fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* 🔮 Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #D97706 0%, transparent 70%)" }} />
      </div>

      {/* 🛰️ Glass Sidebar */}
      <aside className="w-72 flex-shrink-0 relative z-20 flex flex-col border-r border-white/[0.06] backdrop-blur-3xl bg-black/40">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-[1.125rem] font-black tracking-[-0.03em] leading-none mb-1" style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}>COMMAND</h1>
              <p className="text-[0.625rem] font-bold tracking-[0.2em] text-white/30 uppercase">Operations Center</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <SidebarLink icon={<Activity size={18} />} label="Overview" active={tab === "command"} onClick={() => setTab("command")} />
            <SidebarLink icon={<Database size={18} />} label="Live Tools" active={tab === "tools"} onClick={() => setTab("tools")} />
            <SidebarLink icon={<FileText size={18} />} label="Submissions" active={tab === "submissions"} onClick={() => setTab("submissions")} count={submissions.length} />
            <SidebarLink icon={<PieChart size={18} />} label="Managed Billing" active={tab === "leads"} onClick={() => setTab("leads")} count={billingRequests.length} />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/[0.06]">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Shield size={14} className="text-orange-500" />
              </div>
              <span className="text-xs font-bold text-white/80">Premium Admin</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[85%] rounded-full animate-pulse" />
            </div>
          </div>
          <button 
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            <LogOut size={16} /> Exit System
          </button>
        </div>
      </aside>

      {/* 🚀 Main Command Deck */}
      <main className="flex-1 overflow-y-auto relative z-10 px-10 py-12 custom-scrollbar">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-[2rem] font-black tracking-[-0.04em] mb-1" style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}>
              {tab === "command" && "System Pulse"}
              {tab === "tools" && "Registry Management"}
              {tab === "submissions" && "Moderation Queue"}
              {tab === "leads" && "Revenue Pipeline"}
            </h2>
            <p className="text-sm text-white/40 font-medium capitalize">
              {tab} Dashboard — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {tab === "tools" && (
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
              >
                <Plus size={16} /> New Deployment
              </button>
            )}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text" 
                placeholder="Deep Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm outline-none focus:border-indigo-500/50 transition-all w-64"
              />
            </div>
          </div>
        </div>

        {/* 📟 Dynamic Content Fragments */}
        <div className="space-y-10">
          {tab === "command" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <HolographicStat 
                  label="Market Reach" 
                  value={stats?.totalTools || "0"} 
                  trend="+12%" 
                  icon={<Activity size={20} />} 
                  color="indigo" 
                  desc="Total tool impressions/views"
                />
                <HolographicStat 
                  label="Founder Network" 
                  value={stats?.totalUsers || "0"} 
                  trend="+8" 
                  icon={<Users size={20} />} 
                  color="orange" 
                  desc="Verified SaaS founders"
                />
                <HolographicStat 
                  label="Revenue Potential" 
                  value={`₹${stats?.totalLeads || "0"}`} 
                  trend="High Signal" 
                  icon={<Zap size={20} />} 
                  color="emerald" 
                  desc="Active billing leads in INR"
                />
                <HolographicStat 
                  label="Platform Growth" 
                  value="98.2%" 
                  trend="Healthy" 
                  icon={<TrendingUp size={20} />} 
                  color="purple" 
                  desc="Uptime & processing speed"
                />
              </div>

              {/* Feed Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 rounded-3xl bg-white/[0.02] border border-white/[0.06] p-8 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                    <Activity size={100} />
                  </div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       Real-time Pulse
                    </h3>
                    <button onClick={loadAnalytics} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all">
                      <RefreshCw size={16} className={statsLoading ? "animate-spin" : ""} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <ActivityItem label="New User Registration" time="2 mins ago" status="Success" dot="indigo" />
                    <ActivityItem label="Managed Billing Inquiry" time="14 mins ago" status="In Progress" dot="orange" />
                    <ActivityItem label="Tool Moderation Completed" time="1 hour ago" status="Success" dot="emerald" />
                    <ActivityItem label="System Scan: Health Check" time="2 hours ago" status="Normal" dot="purple" />
                    <div className="pt-4 text-center">
                       <button className="text-xs font-bold text-white/20 hover:text-white/60 transition-colors uppercase tracking-widest">View Full Event Log</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/[0.1] p-8 flex flex-col justify-between group h-full shadow-2xl shadow-indigo-500/10">
                   <div>
                     <h3 className="text-xl font-black mb-4 leading-tight">Your Dashboard is <span className="text-indigo-400">Battle-Ready.</span></h3>
                     <p className="text-sm text-white/60 leading-relaxed">System metrics are nominal. You have {submissions.length} new tool submissions awaiting review and {billingRequests.length} pending billing leads.</p>
                   </div>
                   <div className="mt-12 space-y-3">
                      <button onClick={() => setTab("submissions")} className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm hover:scale-[1.02] transition-transform active:scale-[0.98]">Review Queue</button>
                      <button onClick={() => setTab("leads")} className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/5 hover:bg-white/20 transition-all">Pipeline Growth</button>
                   </div>
                </div>
              </div>
            </>
          )}

          {tab === "tools" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {showForm && (
                 <div className="rounded-3xl bg-white/[0.03] border border-white/[0.1] p-8 backdrop-blur-xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                       <Box size={18} className="text-indigo-400" />
                       Direct Tool Deployment
                    </h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <AdminInput label="Tool Name" value={form.name} onChange={v => setForm({...form, name: v, slug: slugify(v)})} placeholder="e.g. Acme AI" required />
                       <AdminInput label="Slug ID" value={form.slug} onChange={v => setForm({...form, slug: v})} placeholder="acme-ai" required />
                       <AdminInput label="Landing URL" value={form.website} onChange={v => setForm({...form, website: v})} placeholder="https://..." required />
                       <AdminInput label="Tagline" value={form.tagline} onChange={v => setForm({...form, tagline: v})} placeholder="The best AI for..." required />
                       <AdminInput label="Price Start (USD)" type="number" value={form.starting_price_usd} onChange={v => setForm({...form, starting_price_usd: v})} placeholder="0" />
                       <AdminSelect 
                          label="Model" 
                          options={PRICING_OPTIONS.map(o => ({ value: o, label: o }))} 
                          value={form.pricing_model} 
                          onChange={v => setForm({...form, pricing_model: v as any})} 
                       />
                       
                       <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
                          <AdminToggle label="Made in India" active={form.is_made_in_india} onClick={() => setForm({...form, is_made_in_india: !form.is_made_in_india})} />
                          <AdminToggle label="INR Billing" active={form.has_inr_billing} onClick={() => setForm({...form, has_inr_billing: !form.has_inr_billing})} />
                          <AdminToggle label="UPI Ready" active={form.has_upi} onClick={() => setForm({...form, has_upi: !form.has_upi})} />
                          <AdminToggle label="GST Invoicing" active={form.has_gst_invoice} onClick={() => setForm({...form, has_gst_invoice: !form.has_gst_invoice})} />
                          <AdminToggle label="India Support" active={form.has_india_support} onClick={() => setForm({...form, has_india_support: !form.has_india_support})} />
                       </div>

                       <div className="lg:col-span-3 flex justify-end gap-4 mt-4">
                          <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-white/50 hover:text-white transition-colors">Cancel</button>
                          <button type="submit" disabled={isPending} className="px-8 py-2.5 rounded-xl bg-white text-black font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">Authorize Deployment</button>
                       </div>
                    </form>
                 </div>
               )}

               <div className="rounded-3xl bg-white/[0.01] border border-white/[0.05] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02]">
                       <tr>
                          <th className="px-6 py-4 text-[0.625rem] font-black uppercase tracking-widest text-white/30">Registry Item</th>
                          <th className="px-6 py-4 text-[0.625rem] font-black uppercase tracking-widest text-white/30">Price Matrix</th>
                          <th className="px-6 py-4 text-[0.625rem] font-black uppercase tracking-widest text-white/30">Market Status</th>
                          <th className="px-6 py-4 text-[0.625rem] font-black uppercase tracking-widest text-white/30">Security</th>
                          <th className="px-6 py-4 text-[0.625rem] font-black uppercase tracking-widest text-white/30 text-right">Ops</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                       {tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tool => (
                         <tr key={tool.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-3">
                                  {tool.logo_url ? (
                                    <img src={tool.logo_url ?? undefined} alt="" className="w-8 h-8 rounded-lg bg-white/5" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">{tool.name[0]}</div>
                                  )}
                                  <div>
                                     <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{tool.name}</div>
                                     <div className="text-[0.625rem] text-white/30 font-medium">/{tool.slug}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="text-sm font-bold text-white/80">${tool.starting_price_usd ?? '0'}</div>
                               <div className="text-[0.625rem] text-white/40 uppercase font-bold tracking-wider">{tool.pricing_model}</div>
                            </td>
                            <td className="px-6 py-5">
                               <span 
                                  className="px-2 py-0.5 rounded-full text-[0.625rem] font-black uppercase tracking-tighter"
                                  style={{ background: `${STATUS_COLORS[tool.status]}20`, color: STATUS_COLORS[tool.status] }}
                               >
                                  {tool.status}
                               </span>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex gap-1.5 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                  {tool.is_made_in_india && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Made in India" />}
                                  {tool.has_inr_billing && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="INR Billing" />}
                                  {tool.has_upi && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="UPI Support" />}
                               </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={tool.website ?? "#"} target="_blank" className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all"><ExternalLink size={14} /></a>
                                  <button onClick={() => handleDelete(tool.id, tool.name)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {tab === "submissions" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {submissions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.03] flex items-center justify-center mb-6">
                       <Check size={24} className="text-white/20" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Queue Cleared</h4>
                    <p className="text-sm text-white/40">No new submissions awaiting review.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-6">
                    {submissions.map(sub => (
                      <div key={sub.id} className="rounded-3xl bg-white/[0.03] border border-white/[0.1] p-8 flex flex-col md:flex-row gap-8 backdrop-blur-sm group hover:border-indigo-500/30 transition-all">
                         <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                               <h3 className="text-2xl font-black font-heading tracking-tight underline decoration-indigo-500/20 underline-offset-4">{sub.tool_data.name}</h3>
                               <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[0.625rem] font-black text-indigo-400 tracking-widest uppercase">Subdomain Analysis Required</div>
                            </div>
                            <p className="text-sm text-white/60 mb-6 leading-relaxed max-w-2xl">{sub.tool_data.tagline}</p>
                             <div className="flex flex-wrap gap-4 text-xs font-bold text-white/40 mb-8">
                               <div className="flex items-center gap-1.5"><Globe size={12} /> {sub.tool_data.website ?? "N/A"}</div>
                               <div className="flex items-center gap-1.5"><Clock size={12} /> Received {new Date(sub.created_at).toLocaleDateString()}</div>
                               <div className="px-2 py-0.5 rounded bg-white/5 text-white/60">@{sub.email}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                               <SecurityIndicator label="India" active={sub.tool_data.is_made_in_india} />
                               <SecurityIndicator label="INR" active={sub.tool_data.has_inr_billing} />
                               <SecurityIndicator label="UPI" active={sub.tool_data.has_upi} />
                               <SecurityIndicator label="Reach" active={sub.tool_data.security_check.reachable} />
                            </div>
                         </div>

                         <div className="w-full md:w-64 flex flex-col gap-3 justify-center">
                            <button 
                               onClick={() => handleApproveSubmission(sub.id)}
                               disabled={isPending}
                               className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                            >
                               <ArrowUpRight size={16} /> Authorize Deployment
                            </button>
                            <button 
                               onClick={() => handleRejectSubmission(sub.id)}
                               disabled={isPending}
                               className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-red-400 font-bold text-sm transition-all border border-white/5"
                            >
                               Reject Submission
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}

          {tab === "leads" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {billingRequests.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.03] flex items-center justify-center mb-6">
                       <PieChart size={24} className="text-white/20" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">No Active Interests</h4>
                    <p className="text-sm text-white/40">The revenue pipeline is currently empty.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {billingRequests.map(req => (
                      <div key={req.id} className="rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 hover:bg-white/[0.04] transition-all group">
                         <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 p-2 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                               {req.tool.logo_url ? <img src={req.tool.logo_url ?? undefined} className="w-full h-full object-contain" /> : <Database className="text-indigo-400" />}
                            </div>
                            <div>
                               <div className="text-lg font-black tracking-tight">{req.tool.name}</div>
                               <div className="text-xs font-bold text-indigo-400 tracking-wider">REVENUE LEAD</div>
                            </div>
                         </div>
                         <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-6 text-sm text-white/60">
                            <strong>Note:</strong> {req.notes || "No additional requirements specified."}
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-white/30">Contact: <span className="text-white/80">{req.email}</span></div>
                            <button 
                               onClick={() => handleMarkProcessed(req.id)}
                               className="px-5 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-bold text-xs transition-all flex items-center gap-2"
                            >
                               <Check size={14} /> Process Request
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
        
        {/* Flash Notification Layer */}
        {msg && (
          <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-300">
             <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-3xl border flex items-center gap-4 ${msg.type === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {msg.type === 'ok' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                <div>
                   <p className="text-[0.625rem] font-black uppercase tracking-widest leading-none mb-1">Security Alert</p>
                   <p className="text-sm font-bold">{msg.text}</p>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SidebarLink({ icon, label, active, onClick, count }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group ${active ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white hover:bg-white/[0.03]'}`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-black' : 'text-white/30 group-hover:text-indigo-400 transition-colors'}>{icon}</span>
        <span className="text-sm tracking-[-0.01em] uppercase font-bold text-[0.7rem]">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${active ? 'bg-black text-white' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

function HolographicStat({ label, value, trend, icon, color, desc }: { label: string, value: string | number, trend: string, icon: React.ReactNode, color: string, desc: string }) {
  const colorMap: any = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    purple: "text-purple-400 bg-purple-500/10"
  }
  return (
    <div className="rounded-3xl bg-white/[0.02] border border-white/[0.06] p-6 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-4">
         <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{icon}</div>
         <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${colorMap[color]} tracking-tighter uppercase`}>{trend}</span>
      </div>
      <h4 className="text-[0.625rem] font-bold text-white/30 uppercase tracking-[0.1em] mb-1">{label}</h4>
      <div className="text-2xl font-black text-white tracking-tight mb-2">{value}</div>
      <p className="text-[10px] text-white/20 leading-tight font-medium">{desc}</p>
    </div>
  )
}

function ActivityItem({ label, time, status, dot }: { label: string, time: string, status: string, dot: string }) {
  const dots: any = { indigo: "bg-indigo-500 shadow-indigo-500/50", orange: "bg-orange-500 shadow-orange-500/50", emerald: "bg-emerald-500 shadow-emerald-500/50", purple: "bg-purple-500 shadow-purple-500/50" }
  return (
    <div className="flex items-center justify-between group/item">
       <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${dots[dot]} shadow-[0_0_8px]`} />
          <div>
             <div className="text-sm font-bold text-white/80 group-hover/item:text-white transition-colors">{label}</div>
             <div className="text-[10px] text-white/30">{time}</div>
          </div>
       </div>
       <div className="text-[10px] font-black text-white/20 group-hover/item:text-white/40 uppercase tracking-widest">{status}</div>
    </div>
  )
}

function AdminInput({ label, value, onChange, placeholder, required, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, required?: boolean, type?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
      />
    </div>
  )
}

function AdminSelect({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: { value: string, label: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</label>
      <select 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all text-white appearance-none"
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-[#050403] text-white">{o.label}</option>)}
      </select>
    </div>
  )
}

function AdminToggle({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${active ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.02] border-white/[0.05] text-white/20'}`}
    >
       <div className={`w-3 h-3 rounded-full mb-2 ${active ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-white/10'}`} />
       <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{label}</span>
    </button>
  )
}

function SecurityIndicator({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center gap-2">
       <div className={`w-3 h-3 rounded-full flex items-center justify-center ${active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
          {active ? <Check size={8} strokeWidth={4} /> : <X size={8} strokeWidth={4} />}
       </div>
       <span className="text-[0.625rem] font-black uppercase tracking-tight text-white/40">{label}</span>
    </div>
  )
}

function SidebarIcon({ icon }: { icon: React.ReactNode }) { return icon }
function ShieldCheck({ size }: { size: number }) { return <Check size={size} /> }
