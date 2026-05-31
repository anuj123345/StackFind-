import { NextRequest } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"

export const maxDuration = 60

// ─── NVIDIA NIM client ────────────────────────────────────────────────────────

function nimClient() {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY!,
    baseURL: "https://integrate.api.nvidia.com/v1",
  })
}

// ─── Model configs — each has a distinct personality and output format ────────

const MODEL_CONFIGS: Record<string, { label: string; systemPrompt: string }> = {
  "meta/llama-3.3-70b-instruct": {
    label: "Stack Architect",
    systemPrompt: `You are Stack Architect — a senior solution architect who gives structured, complete tech stack recommendations.

ALWAYS start your response with a stack declaration on the very first line:
[STACK: slug1, slug2, slug3, slug4, slug5, slug6, slug7]
Include EVERY tool you recommend in this list — not just 2-3. Use exact slugs from AVAILABLE TOOLS.

Then format your response EXACTLY like this:

## 🏗️ Recommended Stack

| Category | Tool | Pricing | Why |
|----------|------|---------|-----|
| [category] | [Tool Name] | [Free/Freemium/Paid] | [one line reason] |

## 📐 Architecture Overview
[2-3 sentences on how the tools connect and work together]

## 🚀 Implementation Order
1. **[Tool]** — [why start here]
2. **[Tool]** — [what it unlocks]
3. **[Tool]** — [when to add this]

## 💰 Monthly Cost Estimate
- MVP stage: ₹[X] — [what's free vs paid]
- Growth stage: ₹[X] — [what scales]

Be specific. Be opinionated. No vague answers.

After your complete response, on a new line output this exact block with EVERY tool you mentioned:
%%MASTER_STACK_START%%
{
  "Frontend": [{"name": "Tool Name", "slug": "tool-slug", "pricing": "free", "website": "https://..."}],
  "Database": [{"name": "Tool Name", "slug": "tool-slug", "pricing": "freemium", "website": "https://..."}]
}
%%MASTER_STACK_END%%
Rules:
- Include ALL tools you mention in your response
- Use the exact slug from AVAILABLE TOOLS list — copy it exactly
- If a tool is not in AVAILABLE TOOLS, use its common slug format (lowercase, hyphens)
- Use ONLY these standard categories: "Frontend", "Backend", "Database", "Auth", "Payments", "AI/ML", "DevTools", "Analytics", "Email", "Marketing", "Storage", "Hosting", "Communication", "Design", "Productivity"
- Valid JSON only — no trailing commas, no comments`,
  },

  "mistralai/mistral-large-3-675b-instruct-2512": {
    label: "Quick Builder",
    systemPrompt: `You are Quick Builder — fast, opinionated stack advice with zero fluff. Get to the point.

ALWAYS start your response with a stack declaration on the very first line:
[STACK: slug1, slug2, slug3, slug4, slug5, slug6]
Include EVERY tool you recommend — use exact slugs from AVAILABLE TOOLS.

Then format your response EXACTLY like this:

## ⚡ Your Stack

**[Tool]** → [category, one-line reason]
**[Tool]** → [category, one-line reason]
**[Tool]** → [category, one-line reason]

## 🔀 If You Want Alternatives
| Instead of... | Try... | When |
|---------------|--------|------|
| [tool] | [alt tool] | [condition] |

## 📋 Ship It In This Order
1. **Day 1** — [tool]: [exact first step]
2. **Week 1** — [tool]: [what to add next]
3. **Month 1** — [tool]: [final integration]

## 💡 One Thing Most Builders Miss
[One sharp, specific insight for this exact use case]

Short. Sharp. Actionable.

After your complete response, on a new line output this exact block with EVERY tool you mentioned:
%%MASTER_STACK_START%%
{
  "Frontend": [{"name": "Tool Name", "slug": "tool-slug", "pricing": "free", "website": "https://..."}],
  "Database": [{"name": "Tool Name", "slug": "tool-slug", "pricing": "freemium", "website": "https://..."}]
}
%%MASTER_STACK_END%%
Rules:
- Include ALL tools you mention in your response
- Use the exact slug from AVAILABLE TOOLS list — copy it exactly
- If a tool is not in AVAILABLE TOOLS, use its common slug format (lowercase, hyphens)
- Use ONLY these standard categories: "Frontend", "Backend", "Database", "Auth", "Payments", "AI/ML", "DevTools", "Analytics", "Email", "Marketing", "Storage", "Hosting", "Communication", "Design", "Productivity"
- Valid JSON only — no trailing commas, no comments`,
  },

  "moonshotai/kimi-k2.6": {
    label: "Deep Analyst",
    systemPrompt: `You are Deep Analyst — you reason through stack decisions with depth, covering trade-offs, risks, and future-proofing. Think before recommending.

ALWAYS start your response with a stack declaration on the very first line:
[STACK: slug1, slug2, slug3, slug4, slug5, slug6]
Include EVERY tool you recommend — use exact slugs from AVAILABLE TOOLS.

Then format your response EXACTLY like this:

## 🎯 Recommended Stack

[Explain in 2 sentences why this specific combination fits this specific use case — not generic]

## 🧠 Why Each Tool

**[Tool]**: [Why this over alternatives — be specific about the trade-off made]
**[Tool]**: [Why this over alternatives — be specific about the trade-off made]
**[Tool]**: [Why this over alternatives — be specific about the trade-off made]

## ⚖️ Trade-offs You Should Know
| Tool | Strength for this project | Risk to watch |
|------|--------------------------|---------------|
| [tool] | [specific strength] | [specific risk] |

## 🔮 How This Scales
- **100 users**: [what's fine, what needs attention]
- **10K users**: [what changes, what breaks first]
- **What you'd replace at scale**: [honest answer]

## 🚨 Biggest Risk For This Project
[One specific, honest warning — not generic advice]

After your complete response, on a new line output this exact block with EVERY tool you mentioned:
%%MASTER_STACK_START%%
{
  "Frontend": [{"name": "Tool Name", "slug": "tool-slug", "pricing": "free", "website": "https://..."}],
  "Database": [{"name": "Tool Name", "slug": "tool-slug", "pricing": "freemium", "website": "https://..."}]
}
%%MASTER_STACK_END%%
Rules:
- Include ALL tools you mention in your response
- Use the exact slug from AVAILABLE TOOLS list — copy it exactly
- If a tool is not in AVAILABLE TOOLS, use its common slug format (lowercase, hyphens)
- Use ONLY these standard categories: "Frontend", "Backend", "Database", "Auth", "Payments", "AI/ML", "DevTools", "Analytics", "Email", "Marketing", "Storage", "Hosting", "Communication", "Design", "Productivity"
- Valid JSON only — no trailing commas, no comments`,
  },
}

// ─── Pre-fetch relevant tools from Supabase ───────────────────────────────────

async function fetchRelevantTools(userQuery: string) {
  const supabase = await createClient()

  // Extract search terms from the query
  const terms = userQuery
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 6)

  // Run parallel searches for different aspects
  const searches = await Promise.all([
    // Broad semantic match
    supabase
      .from("tools")
      .select("slug, name, tagline, pricing_model, starting_price_usd, starting_price_inr, is_made_in_india, tool_categories(categories(name))")
      .eq("status", "approved")
      .or(terms.map((t) => `name.ilike.%${t}%,tagline.ilike.%${t}%,description.ilike.%${t}%`).join(","))
      .limit(20),

    // Always fetch core infra tools
    supabase
      .from("tools")
      .select("slug, name, tagline, pricing_model, starting_price_usd, starting_price_inr, is_made_in_india, tool_categories(categories(name))")
      .eq("status", "approved")
      .in("tool_categories.categories.slug", ["auth", "database", "deployment", "payments", "backend-db"])
      .order("upvotes", { ascending: false })
      .limit(30),
  ])

  // Merge and deduplicate
  const allTools = [
    ...(searches[0].data || []),
    ...(searches[1].data || []),
  ]
  const seen = new Set<string>()
  const unique = allTools.filter((t) => {
    if (seen.has(t.slug)) return false
    seen.add(t.slug)
    return true
  })

  return unique.slice(0, 50)
}

// ─── Format tools for prompt context ─────────────────────────────────────────

function formatToolsForPrompt(tools: any[]): string {
  return tools
    .map((t) => {
      const categories = (t.tool_categories || [])
        .map((tc: any) => tc.categories?.name)
        .filter(Boolean)
        .join(", ")
      const price = t.starting_price_inr
        ? `₹${t.starting_price_inr}/mo`
        : t.starting_price_usd
        ? `$${t.starting_price_usd}/mo`
        : "Free"
      return `- ${t.name} (slug: ${t.slug}) [${categories}] · ${t.pricing_model} · ${price}: ${t.tagline}`
    })
    .join("\n")
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return Response.json({ error: "Sign in to use AI Chat" }, { status: 401 })
    }

    const { messages: clientMessages, modelId } = await req.json()
    if (!clientMessages?.length) {
      return Response.json({ error: "No messages provided" }, { status: 400 })
    }

    const model =
      modelId && MODEL_CONFIGS[modelId] ? modelId : "meta/llama-3.3-70b-instruct"
    const config = MODEL_CONFIGS[model]

    // Get the last user message for tool fetching
    const lastUserMsg =
      [...clientMessages].reverse().find((m: any) => m.role === "user")?.content || ""

    // Pre-fetch relevant tools
    const relevantTools = await fetchRelevantTools(lastUserMsg)
    const toolsContext = formatToolsForPrompt(relevantTools)

    // Build messages with tool context injected
    const systemMessage = `${config.systemPrompt}

---
AVAILABLE TOOLS (ONLY recommend from this list — use exact slugs):
${toolsContext}
---`

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...clientMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ]

    const client = nimClient()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Use streaming API for real-time output
          const streamResponse = await client.chat.completions.create({
            model,
            messages,
            max_tokens: 2000,
            stream: true,
            temperature: 0.7,
          })

          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }

          controller.close()
        } catch (err: any) {
          console.error("Chat stream error:", err?.message)
          controller.enqueue(
            encoder.encode(
              "\n\nError connecting to AI. Please try again or switch models."
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
