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
    setStack(readStorage())
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
    if (current.find(t => t.slug === tool.slug)) {
      dispatch(current.filter(t => t.slug !== tool.slug))
    } else {
      dispatch([...current, tool])
    }
  }, [dispatch])

  const clear = useCallback(() => dispatch([]), [dispatch])

  const isInStack = useCallback((slug: string) => stack.some(t => t.slug === slug), [stack])

  return { stack, add, remove, toggle, clear, isInStack }
}
