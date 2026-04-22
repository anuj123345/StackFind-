"use client"

import Link from "next/link"
import { Search, Plus, Zap, LogOut, Menu, X, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { StackIndicator } from "@/components/stack-indicator"

const NAV_LINKS = [
  { label: "Tools",       href: "/tools" },
  { label: "Categories",  href: "/categories" },
  { label: "🇮🇳 India",   href: "/made-in-india" },
  { label: "Founders",    href: "/founders" },
  { label: "Playground",  href: "/playground" },
  { label: "Pricing",     href: "/pricing" },
  { label: "Newsletter",  href: "/newsletter" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
       setUser(data.user)
       if (data.user) {
          supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single()
            .then(({ data: profile }) => setIsAdmin(!!profile?.is_admin))
       }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
          supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => setIsAdmin(!!profile?.is_admin))
      } else {
          setIsAdmin(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4">
        <nav
          className="nav-pill flex items-center gap-1 px-2 py-2 w-full max-w-4xl"
          style={{
            boxShadow: scrolled ? "0 8px 32px rgba(140,110,80,0.12)" : "none",
            transition: "box-shadow 400ms cubic-bezier(0.32,0.72,0,1)",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-colors mr-1"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Zap size={13} className="text-white fill-white" />
            </div>
            <span
              className="font-bold text-[0.9375rem] tracking-tight text-[#1C1611]"
              style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}
            >
              StackFind
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.filter(link => link.href !== '/playground' || !!user).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2.5 py-1.5 rounded-full text-[0.8125rem] font-medium text-[#7A6A57] hover:text-[#1C1611] hover:bg-black/[0.04] transition-all duration-200 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 ml-auto">
            <StackIndicator />

            {/* Search — desktop */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[#C4B0A0] hover:text-[#1C1611] hover:bg-black/[0.04] transition-all duration-200"
              aria-label="Search tools"
            >
              <Search size={13} />
              <span className="text-[0.8125rem] font-medium">Search</span>
            </button>

            {/* Search — mobile icon */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
              className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#C4B0A0] hover:text-[#1C1611] hover:bg-black/[0.04] transition-all duration-200"
              aria-label="Search tools"
            >
              <Search size={15} />
            </button>

            {/* Auth — desktop only */}
            {user ? (
              <button
                onClick={signOut}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[0.8125rem] font-medium transition-all duration-200 hover:bg-black/[0.04] whitespace-nowrap"
                style={{ color: "#7A6A57" }}
                title={`Sign out (${user.email})`}
              >
                <LogOut size={13} />
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex btn-primary items-center gap-1.5 !py-2 !px-3.5 !text-[0.8125rem]"
              >
                Sign in
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[0.8125rem] font-bold transition-all duration-200 bg-orange-50 text-orange-600 hover:bg-orange-100 whitespace-nowrap border border-orange-200"
              >
                <LayoutDashboard size={13} />
                Admin
              </Link>
            )}

            <Link
              href="/submit"
              className="hidden md:flex btn-primary items-center gap-1.5 !py-2 !px-3.5 !text-[0.8125rem]"
            >
              <Plus size={13} strokeWidth={2.5} />
              Submit
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/[0.04]"
              style={{ color: "#7A6A57" }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(28,22,17,0.3)", backdropFilter: "blur(2px)" }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-40 md:hidden flex flex-col"
        style={{
          width: "min(80vw, 300px)",
          background: "#FAF7F2",
          borderLeft: "1px solid rgba(140,110,80,0.12)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.32,0.72,0,1)",
          boxShadow: menuOpen ? "-8px 0 32px rgba(140,110,80,0.1)" : "none",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 pt-6 pb-4"
          style={{ borderBottom: "1px solid rgba(140,110,80,0.08)" }}
        >
          <span
            className="font-black text-[0.9375rem]"
            style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611" }}
          >
            Menu
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.05] transition-colors"
            style={{ color: "#7A6A57" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-3 py-4 gap-1 flex-1 overflow-y-auto">
          {NAV_LINKS.filter(link => link.href !== '/playground' || !!user).map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-4 py-3 rounded-xl text-[0.9375rem] font-medium transition-all duration-150 hover:bg-black/[0.04]"
              style={{
                color: pathname === link.href ? "#6366f1" : "#1C1611",
                fontWeight: pathname === link.href ? 700 : 500,
                background: pathname === link.href ? "rgba(99,102,241,0.06)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Bottom auth actions */}
        <div
          className="px-3 py-4 space-y-2"
          style={{ borderTop: "1px solid rgba(140,110,80,0.08)" }}
        >
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-colors bg-orange-50 text-orange-600 border border-orange-100"
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={13} />
              Admin Dashboard
            </Link>
          )}
          <Link
            href="/submit"
            className="btn-primary flex items-center justify-center gap-2 w-full !py-2.5 !text-[0.875rem]"
            onClick={() => setMenuOpen(false)}
          >
            <Plus size={13} strokeWidth={2.5} />
            Submit a tool
          </Link>
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); signOut() }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-black/[0.04]"
              style={{ color: "#7A6A57" }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-black/[0.04]"
              style={{ color: "#7A6A57" }}
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
