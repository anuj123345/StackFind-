import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ToolNotFound() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />
      <main className="pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p
            className="font-black mb-2 tabular-nums"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(4rem, 12vw, 8rem)",
              color: "rgba(140,110,80,0.1)",
              lineHeight: 1,
            }}
          >
            404
          </p>
          <h1
            className="font-black mb-3"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "1.5rem",
              color: "#1C1611",
            }}
          >
            Tool not found
          </h1>
          <p className="text-sm mb-8" style={{ color: "#7A6A57" }}>
            This tool doesn&apos;t exist or hasn&apos;t been approved yet.
          </p>
          <Link href="/tools" className="btn-primary !py-2.5 !px-6 !text-sm">
            Browse all tools →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
