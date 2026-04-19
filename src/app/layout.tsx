import type { Metadata } from "next"
import { Onest } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { SearchModal } from "@/components/search/search-modal"
import "./globals.css"

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
})

export const metadata: Metadata = {
  title: "StackFind — Discover the Best AI Tools",
  description: "The most curated directory of AI tools. Find the right stack for your workflow. India-first pricing, INR billing, and Made-in-India tools.",
  keywords: ["AI tools", "AI directory", "artificial intelligence", "productivity", "Made in India"],
  openGraph: {
    title: "StackFind — Discover the Best AI Tools",
    description: "The most curated directory of AI tools. India-first pricing & INR billing.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={onest.variable}>
      <body className="mesh-bg grain">
        <div className="relative z-10">
          <Navbar />
          <main>{children}</main>
        </div>
        <SearchModal />
      </body>
    </html>
  )
}
