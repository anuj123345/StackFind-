"use client"

import { useState, useEffect, useCallback } from "react"

export interface StackTool {
  slug: string
  name: string
  tagline: string
  website: string | null
  logoUrl: string | null
  pricingModel: string
  startingPriceUsd: number | null
  startingPriceInr: number | null
  managedBillingEnabled?: boolean
  convenienceFeePercent?: number
  categories: string[]
}

const STORAGE_KEY = "stackfind_playground"

function readStorage(): StackTool[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}

function writeStorage(tools: StackTool[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
}

export function useStack() {
  const [stack, setStack] = useState<StackTool[]>([])

  useEffect(() => {
    // Deduplicate any stale localStorage state on mount
    const raw = readStorage()
    const seen = new Set<string>()
    const clean = raw.filter(t => {
      if (seen.has(t.slug)) return false
      seen.add(t.slug)
      return true
    })
    if (clean.length !== raw.length) writeStorage(clean)
    setStack(clean)

    const handler = () => setStack(readStorage())
    window.addEventListener("stack-updated", handler)
    return () => window.removeEventListener("stack-updated", handler)
  }, [])

  const dispatch = useCallback((next: StackTool[]) => {
    writeStorage(next)
    setStack(next)
    window.dispatchEvent(new Event("stack-updated"))
  }, [])

  const add = useCallback((tool: StackTool) => {
    const current = readStorage()
    if (current.find(t => t.slug === tool.slug)) return
    dispatch([...current, tool])
  }, [dispatch])

  const remove = useCallback((slug: string) => {
    dispatch(readStorage().filter(t => t.slug !== slug))
  }, [dispatch])

  const toggle = useCallback((tool: StackTool) => {
    const current = readStorage()
    const exists = current.find(t => t.slug === tool.slug)
    if (exists) {
      dispatch(current.filter(t => t.slug !== tool.slug))
    } else {
      // Deduplicate existing entries before appending (guard against stale localStorage)
      const seen = new Set<string>()
      const clean = current.filter(t => {
        if (seen.has(t.slug)) return false
        seen.add(t.slug)
        return true
      })
      dispatch([...clean, tool])
    }
  }, [dispatch])

  const clear = useCallback(() => dispatch([]), [dispatch])

  const isInStack = useCallback((slug: string) => stack.some(t => t.slug === slug), [stack])

  const setFullStack = useCallback((tools: StackTool[]) => {
    // Deduplicate by slug before writing — multiple callers may overlap
    const seen = new Set<string>()
    const deduped = tools.filter(t => {
      if (seen.has(t.slug)) return false
      seen.add(t.slug)
      return true
    })
    dispatch(deduped)
  }, [dispatch])

  return { stack, add, remove, toggle, clear, isInStack, setFullStack }
}
