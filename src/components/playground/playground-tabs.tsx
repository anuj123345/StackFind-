"use client"

import { useState } from "react"
import { FlaskConical, Sparkles } from "lucide-react"

interface PlaygroundTabsProps {
  stackBuilder: React.ReactNode
  aiChat: React.ReactNode
}

export function PlaygroundTabs({ stackBuilder, aiChat }: PlaygroundTabsProps) {
  const [active, setActive] = useState<"builder" | "chat">("builder")

  return (
    <div>
      {/* Tab selector */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setActive("builder")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          style={{
            background:
              active === "builder" ? "#1C1611" : "rgba(140,110,80,0.06)",
            color: active === "builder" ? "#fff" : "#7A6A57",
          }}
        >
          <FlaskConical size={13} />
          Stack Builder
        </button>
        <button
          onClick={() => setActive("chat")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          style={{
            background:
              active === "chat" ? "#1C1611" : "rgba(140,110,80,0.06)",
            color: active === "chat" ? "#fff" : "#7A6A57",
          }}
        >
          <Sparkles size={13} />
          AI Chat
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tight"
            style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
          >
            New
          </span>
        </button>
      </div>

      {/* Content */}
      {active === "builder" ? stackBuilder : aiChat}
    </div>
  )
}
