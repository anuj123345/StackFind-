"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body style={{ background: "#FAF7F2", margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</p>
            <h2 style={{ fontWeight: 900, color: "#1C1611", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#7A6A57", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              {error.message || "A critical error occurred."}
            </p>
            <button
              onClick={reset}
              style={{ background: "#1C1611", color: "#FAF7F2", padding: "0.5rem 1.25rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
