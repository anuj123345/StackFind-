"use client"

import Link from "next/link"
import { Search, Plus, Zap } from "lucide-react"
import { useState, useEffect } from "react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4">
      <nav
        className="nav-pill flex items-center gap-1 px-2 py-2 w-full max-w-3xl"
        style={{
          boxShadow: scrolled ? "0 8px 32px rgba(140,110,80,0.12)" : "none",
          transition: "box-shadow 400ms cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/[0.04] transition-colors mr-1">
          <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Zap size={13} className="text-white fill-white" />
          </div>
          <span className="font-bold text-[0.9375rem] tracking-tight text-[#1C1611]"
            style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif" }}>
            StackFind
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {[
            { label: "Tools",         href: "/tools" },
            { label: "Categories",    href: "/categories" },
            { label: "Made in India", href: "/made-in-india" },
            { label: "Founders",      href: "/founders" },
            { label: "Newsletter",    href: "/newsletter" },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-[#7A6A57] hover:text-[#1C1611] hover:bg-black/[0.04] transition-all duration-200">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4B0A0] hover:text-[#1C1611] hover:bg-black/[0.04] transition-all duration-200">
            <Search size={15} />
          </button>
          <Link href="/submit" className="btn-primary flex items-center gap-1.5 !py-2 !px-4 !text-sm">
            <Plus size={14} strokeWidth={2.5} />
            Submit Tool
          </Link>
        </div>
      </nav>
    </header>
  )
}
