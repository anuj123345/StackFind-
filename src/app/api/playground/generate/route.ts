import { NextRequest } from "next/server"
import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { getIsAuthenticated } from "@/lib/auth"
import { getUsdInrRate } from "@/lib/exchange"

// Increase Vercel function timeout
export const maxDuration = 60

// Version: 1.0.1-final-clean-sdk


function jsonError(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function POST(req: NextRequest) {
  console.log("DEBUG: /api/playground/generate hit")
  try {
    const usdToInrRate = await getUsdInrRate()
    // 1. Auth & Rate Limiting
    const { getServerUser } = await import("@/lib/auth")
    const user = await getServerUser()
    
    if (!user) {
      return jsonError("Sign in to use the Playground", 401)
    }

    // Rate limiting using User ID
    try {
      const { playgroundRateLimit } = await import("@/lib/ratelimit")
      const { success } = await playgroundRateLimit.limit(user.id)
      
      if (!success) {
        return jsonError("You're building too fast! Please wait a minute before generating another plan.", 429)
      }
    } catch (e) {
      console.error("Rate limit error (likely missing env vars):", e)
      // We continue if ratelimit fails (e.g. missing keys) to avoid blocking users
    }

    let tools: any[], productIdea: string, budget: number = 0, modelId: string = "meta/llama-3.3-70b-instruct"
    try {
      const body = await req.json()
      tools = body.tools || []
      productIdea = body.productIdea
      budget = body.budget || 0
      if (body.modelId) modelId = body.modelId
    } catch {
      return jsonError("Invalid request body")
    }

    if (!productIdea?.trim()) return jsonError("Describe what you want to build")
    
    // If no tools selected, suggest a stack from all available tools
    let suggestionContext = ""
    if (tools.length === 0) {
      const { getPlaygroundTools } = await import("@/lib/queries")
      const allTools = await getPlaygroundTools()
      // Limit to ~40 popular tools to keep context manageable
      suggestionContext = allTools.slice(0, 40).map(t => 
        `- ${t.name}: ${t.tagline} (Est: ₹${t.starting_price_inr || Math.round((t.starting_price_usd || 0) * usdToInrRate)}/mo)`
      ).join("\n")
    }

    const toolLines = tools.map((t: any) => {
      let effectiveInr = 0
      if (t.startingPriceInr) effectiveInr = t.startingPriceInr
      else if (t.startingPriceUsd) effectiveInr = Math.round(t.startingPriceUsd * usdToInrRate)

      const billingContext = t.managedBillingEnabled 
        ? "INR Billing Available via UPI" 
        : "Standard USD Billing"

      return `- ${t.name}: Price: ${t.startingPriceInr ? `₹${t.startingPriceInr}/mo` : "N/A"} / ${t.startingPriceUsd ? `$${t.startingPriceUsd}/mo` : "N/A"}, (ESTIMATED TOTAL: ₹${effectiveInr}/mo). Billing: ${billingContext}. Tagline: ${t.tagline}`
    }).join("\n")

    const totalSelectedCost = tools.reduce((sum, t) => {
      let effectiveInr = 0
      if (t.startingPriceInr) effectiveInr = t.startingPriceInr
      else if (t.startingPriceUsd) effectiveInr = Math.round(t.startingPriceUsd * usdToInrRate)
      return sum + effectiveInr
    }, 0)

    const budgetDisplay = budget === 0 ? "0 (Free/Freemium Only)" : `₹${budget}`

    const prompt = `You are a senior technical co-founder. 
Founder's Idea: "${productIdea.trim()}"
Monthly Budget: ${budgetDisplay}

${tools.length > 0 ? `Selected Stack (${tools.length} tools):
${toolLines}
(STACK TOTAL: ₹${totalSelectedCost}/mo)` : `The founder has NOT selected any tools. Suggest a robust stack from these tools that fits the budget:
${suggestionContext}`}

Write a practical build plan. Use this EXACT format:
## Product Overview
[3 sentences max]

## Suggested Stack / Analysis
[If tools were suggested, explain why they fit the ${budgetDisplay} budget. If tools were provided, analyze if they are the most cost-effective for the idea.]

## How Each Tool Is Used
[One paragraph per tool]

## Cost Breakdown & Budget Validation
[Markdown Table: Tool | Plan | Monthly Cost (₹) | Billing Status]
[Check if the total fits the ${budgetDisplay} budget. If it exceeds, suggest specific cost-cutting measures or a phased approach.]

## Managed Stack Advantage
[Explain how StackFind's managed billing (UPI/INR) simplifies these specific tools]

## Launch Timeline
[8 weeks breakdown]

## First 3 Steps
[3 direct actions]`

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial heartbeat to prevent gateway timeouts
        controller.enqueue(encoder.encode(" "))
        
        try {
          console.log("DEBUG: Playground Model:", modelId)
          
          if (modelId.startsWith("anthropic/") || (!process.env.NVIDIA_API_KEY && process.env.ANTHROPIC_API_KEY)) {
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
            const actualModel = modelId.startsWith("anthropic/") ? modelId.replace("anthropic/", "") : "claude-3-5-haiku-20241022"
            const anthropicStream = await anthropic.messages.create({
              model: actualModel,
              max_tokens: 1800,
              messages: [{ role: "user", content: prompt }],
              stream: true,
            })
            for await (const chunk of anthropicStream) {
              if (chunk.type === 'content_block_delta' && (chunk.delta as any).text) {
                controller.enqueue(encoder.encode((chunk.delta as any).text))
              }
            }
          } 
          else {
            if (!process.env.NVIDIA_API_KEY) throw new Error("No NVIDIA API key configured")
            
            const nimClient = new OpenAI({
              apiKey: process.env.NVIDIA_API_KEY,
              baseURL: "https://integrate.api.nvidia.com/v1"
            })

            const nimStream: any = await nimClient.chat.completions.create({
              model: modelId.includes("/") ? modelId : "meta/llama-3.3-70b-instruct",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.2,
              top_p: 1.0,
              max_tokens: 1800,
              stream: true,
            } as any)

            for await (const chunk of nimStream) {
              const delta = chunk.choices[0]?.delta as any
              const reasoning = delta?.reasoning_content
              const content = delta?.content

              if (reasoning) {
                controller.enqueue(encoder.encode(reasoning))
              } 
              else if (content) {
                controller.enqueue(encoder.encode(content))
              }
            }
          }
          controller.close()
        } catch (err: any) {
          console.error("DEBUG: Stream Error:", err)
          controller.enqueue(encoder.encode(`\n\n[Error: ${err.message}]`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      }
    })
  } catch (err: any) {
    console.error("[playground/generate]", err)
    return jsonError(err.message || "Internal server error", 500)
  }
}
