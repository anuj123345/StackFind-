"use client"

import { useEffect, useState } from "react"

interface Props {
  slug: string
  initialDescription: string | null
}

export function ToolDescription({ slug, initialDescription }: Props) {
  const [description, setDescription] = useState<string | null>(initialDescription)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Skip if already fetched this session for this slug
    const cacheKey = `enrich:${slug}`
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(cacheKey)) return

    setLoading(true)
    fetch("/api/enrich-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.description) {
          setDescription(data.description)
          if (typeof sessionStorage !== "undefined") sessionStorage.setItem(cacheKey, "1")
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          className="font-bold text-sm tracking-wide uppercase"
          style={{ color: "#C4B0A0", letterSpacing: "0.1em" }}
        >
          About
        </h2>
        {loading && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full animate-pulse"
            style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
            AI writing...
          </span>
        )}
      </div>

      {loading && !description ? (
        // Skeleton while generating
        <div className="space-y-2 animate-pulse">
          {[100, 90, 95, 80, 85].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded"
              style={{ width: `${w}%`, background: "rgba(140,110,80,0.08)" }}
            />
          ))}
          <div className="pt-2 space-y-2">
            {[92, 88, 70].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded"
                style={{ width: `${w}%`, background: "rgba(140,110,80,0.06)" }}
              />
            ))}
          </div>
        </div>
      ) : description ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#5A4A3A", lineHeight: "1.8" }}>
          {description}
        </p>
      ) : (
        <p className="text-sm italic" style={{ color: "#C4B0A0" }}>
          No description available. See community discussions below.
        </p>
      )}
    </div>
  )
}
