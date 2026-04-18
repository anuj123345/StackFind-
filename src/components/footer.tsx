"use client"

import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 px-4 py-12" style={{ borderTop: "1px solid rgba(140,110,80,0.1)" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Zap size={13} className="text-white fill-white" />
          </div>
          <span
            className="font-bold"
            style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611" }}
          >
            StackFind
          </span>
          <span className="text-xs ml-2" style={{ color: "#C4B0A0" }}>India&apos;s AI Tools Directory</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-6 text-xs" style={{ color: "#C4B0A0" }}>
          {[
            { label: "Tools", href: "/tools" },
            { label: "Categories", href: "/categories" },
            { label: "Made in India", href: "/made-in-india" },
            { label: "Submit a Tool", href: "/submit" },
            { label: "Newsletter", href: "/newsletter" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="transition-colors"
              style={{ color: "#C4B0A0" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#7A6A57")}
              onMouseLeave={e => (e.currentTarget.style.color = "#C4B0A0")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <p className="text-xs" style={{ color: "#C4B0A0" }}>
          🇮🇳 Made with love for Indian builders
        </p>
      </div>
    </footer>
  )
}
