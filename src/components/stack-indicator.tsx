"use client"

import Link from "next/link"
import { FlaskConical } from "lucide-react"
import { useStack } from "@/hooks/use-stack"

export function StackIndicator() {
  const { stack } = useStack()

  if (stack.length === 0) return null

  return (
    <Link
      href="/playground"
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.8125rem] font-semibold transition-all duration-200"
      style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
    >
      <FlaskConical size={13} />
      <span className="hidden sm:inline">Playground</span>
      <span
        className="flex items-center justify-center rounded-full text-[10px] font-bold min-w-[18px] h-[18px] px-1"
        style={{ background: "#6366f1", color: "#fff" }}
      >
        {stack.length}
      </span>
    </Link>
  )
}
