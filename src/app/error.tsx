"use client"

import { useEffect } from "react"

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAF7F2" }}>
      <div className="text-center max-w-md">
        <p className="text-4xl mb-4">⚠️</p>
        <h2
          className="font-black mb-2"
          style={{ fontFamily: "'Bricolage Grotesque Variable', sans-serif", color: "#1C1611", fontSize: "1.5rem" }}
        >
          Something went wrong
        </h2>
        <p className="text-sm mb-6" style={{ color: "#7A6A57" }}>
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="btn-primary !py-2 !px-5 !text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
