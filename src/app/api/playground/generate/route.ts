import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getIsAuthenticated } from "@/lib/auth"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const isAuthenticated = await getIsAuthenticated()
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: "Sign in to use the Playground" }), { status: 401 })
  }

  const { tools, productIdea } = await req.json()

  if (!tools?.length || !productIdea?.trim()) {
    return new Response(JSON.stringify({ error: "Add tools and describe your product" }), { status: 400 })
  }

  const toolList = tools.map((t: any) => {
    const price = t.startingPriceUsd ? `$${t.startingPriceUsd}/mo` : t.pricingModel === "free" ? "Free" : t.pricingModel === "open_source" ? "Open Source / Free" : "Paid (variable)"
    return `- **${t.name}** (${t.categories?.[0] ?? t.pricingModel}, ${price}): ${t.tagline}`
  }).join("\n")

  const totalMinCost = tools.reduce((sum: number, t: any) => sum + (t.startingPriceUsd ?? 0), 0)

  const prompt = `You are a senior technical co-founder helping a founder plan their product using a specific set of tools.

The founder wants to build: "${productIdea}"

Their chosen tech stack (${tools.length} tools):
${toolList}

Estimated minimum monthly cost if all paid plans used: $${totalMinCost}/mo

Respond with a detailed, practical plan in this exact Markdown format:

## Product Overview
2-3 sentences describing what this product is, who it's for, and what makes it valuable.

## Your Stack in Action
For each tool in their stack, explain exactly what role it plays in THIS product. Be specific — not generic. One paragraph per tool. Format each as:

### [Tool Name]
What it does in this specific product and why it's the right choice here.

## Cost Breakdown

| Tool | Plan | Monthly Cost |
|------|------|-------------|
[List each tool with recommended plan tier and monthly cost. Use "Free tier" for free tools.]
| **Total** | | **$X/mo** |

## Time to Launch
Realistic estimate to get an MVP live, broken into phases:
- **Phase 1 (Week 1-2):** [what to build first]
- **Phase 2 (Week 3-4):** [what to build next]
- **Phase 3 (Week 5-6):** [polish and launch]

## First 3 Steps
The exact first three things to do tomorrow morning to start building this:
1. [Specific actionable step]
2. [Specific actionable step]
3. [Specific actionable step]

Be direct, opinionated, and practical. No filler. Write like a senior engineer who has built this before.`

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
