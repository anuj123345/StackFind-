"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ToolCard } from "@/components/tool-card"
import { Clock } from "lucide-react"
import Link from "next/link"
import type { ToolWithCategoryNames } from "@/lib/queries"

interface LatestToolsProps {
  tools: ToolWithCategoryNames[]
}

export function LatestTools({ tools }: LatestToolsProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative z-10 px-4 pb-24">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>Latest</span>
              <Clock size={10} style={{ color: "#C4B0A0" }} />
            </div>
            <h2
              className="font-black leading-tight"
              style={{
                fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "#1C1611",
              }}
            >
              Just added
            </h2>
          </div>
          <Link href="/tools" className="btn-ghost !py-2 !px-4 !text-sm">
            Browse all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.slug}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
            >
              <ToolCard
                name={tool.name}
                slug={tool.slug}
                tagline={tool.tagline}
                website={tool.website}
                logoUrl={tool.logo_url ?? undefined}
                pricingModel={tool.pricing_model}
                upvotes={tool.upvotes}
                isMadeInIndia={tool.is_made_in_india}
                hasInrBilling={tool.has_inr_billing}
                hasUpi={tool.has_upi}
                hasGstInvoice={tool.has_gst_invoice}
                categories={tool.categoryNames}
                startingPriceInr={tool.starting_price_inr}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
