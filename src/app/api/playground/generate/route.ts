import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getIsAuthenticated } from "@/lib/auth"

function jsonError(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const isAuthenticated = await getIsAuthenticated()
    if (!isAuthenticated) {
      return jsonError("Sign in to use the Playground", 401)
    }

    // API key check
    if (!process.env.ANTHROPIC_API_KEY) {
      return jsonError("ANTHROPIC_API_KEY is not configured on the server", 500)
    }

    // Parse body
    let tools: any[], productIdea: string
    try {
      const body = await req.json()
      tools = body.tools
      productIdea = body.productIdea
    } catch {
      return jsonError("Invalid request body")
    }

    if (!tools?.length) return jsonError("Add at least one tool to your stack")
    if (!productIdea?.trim()) return jsonError("Describe what you want to build")

    // Build prompt
    const toolLines = tools.map((t: any) => {
      const price = t.startingPriceUsd
        ? `$${t.startingPriceUsd}/mo`
        : t.pricingModel === "free" || t.pricingModel === "open_source"
        ? "Free"
        : "Paid (variable)"
      return `- ${t.name} (${price}): ${t.tagline}`
    }).join("\n")

    const totalMin = tools.reduce((s: number, t: any) => s + (t.startingPriceUsd ?? 0), 0)

    const prompt = `You are a senior technical co-founder helping a founder plan their product.

The founder wants to build: "${productIdea.trim()}"

Their chosen tech stack (${tools.length} tools):
${toolLines}

Stack minimum monthly cost: $${totalMin}/mo

Write a complete, practical build plan in this EXACT markdown format. Do not skip any section. Be specific to the product idea above — not generic advice.

## Product Overview
3 sentences: what it is, who it's for, what makes it valuable.

## Your Stack in Action
For EACH tool listed above, write one focused paragraph explaining exactly what role it plays in THIS product. Use this format:

### [Tool Name]
[One paragraph: what it does in this product, why it's the right choice, any key config or integration details to know.]

## Cost Breakdown

| Tool | Recommended Plan | Monthly Cost |
|------|-----------------|--------------|
[One row per tool. Use exact tool names from the stack. For free/open-source tools write "Free tier".]
| **Total** | | **$${totalMin === 0 ? "0" : totalMin}/mo** |

## Launch Timeline

- **Week 1–2:** [What to build first — scaffolding, auth, core data model]
- **Week 3–4:** [Core feature implementation]
- **Week 5–6:** [Polish, payments, emails, production deploy]
- **Week 7–8:** [Beta launch and iteration]

## First 3 Steps
The exact three things to do tomorrow:
1. [Specific, actionable step with tool name]
2. [Specific, actionable step with tool name]
3. [Specific, actionable step with tool name]

Write like a senior engineer who has built this exact type of product before. Be direct and opinionated. No filler sentences.`

    // Stream from Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    })

    // Convert to a proper ReadableStream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (err: any) {
    console.error("[playground/generate]", err)
    const msg = err?.message ?? "Something went wrong generating your plan"
    return jsonError(msg, 500)
  }
}
