import { NextRequest } from "next/server"
import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { getIsAuthenticated } from "@/lib/auth"
import { getUsdInrRate } from "@/lib/exchange"

// Increase Vercel function timeout
export const maxDuration = 60

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
    const isAuthenticated = await getIsAuthenticated()
    if (!isAuthenticated) return jsonError("Sign in to use the Playground", 401)

    let tools: any[], productIdea: string, modelId: string = "meta/llama-3.3-70b-instruct"
    try {
      const body = await req.json()
      tools = body.tools
      productIdea = body.productIdea
      if (body.modelId) modelId = body.modelId
    } catch {
      return jsonError("Invalid request body")
    }

    if (!tools?.length) return jsonError("Add at least one tool to your stack")
    if (!productIdea?.trim()) return jsonError("Describe what you want to build")

    const toolLines = tools.map((t: any) => {
      let effectiveInr = 0
      if (t.startingPriceInr) effectiveInr = t.startingPriceInr
      else if (t.startingPriceUsd) effectiveInr = Math.round(t.startingPriceUsd * usdToInrRate)

      const billingContext = t.managed_billing_enabled 
        ? "Managed INR Billing Available (UPI/GST)" 
        : (t.startingPriceInr ? "Native INR/UPI support" : "USD/International Only")

      return `- ${t.name}: Price: ${t.startingPriceInr ? `₹${t.startingPriceInr}/mo` : "N/A"} / ${t.startingPriceUsd ? `$${t.startingPriceUsd}/mo` : "N/A"}, (ESTIMATED TOTAL: ₹${effectiveInr}/mo). Billing: ${billingContext}. Tagline: ${t.tagline}`
    }).join("\n")

    const prompt = `You are a senior technical co-founder. A founder wants to build: "${productIdea.trim()}"
Their stack (${tools.length} tools):
${toolLines}

Write a practical build plan. Use this EXACT format:
## Product Overview
[3 sentences max]

## How Each Tool Is Used
[One paragraph per tool]

## Cost Breakdown
[Markdown Table: Tool | Plan | Monthly Cost (₹) | Billing Status]

## Managed Stack Advantage
[Savings calculation]

## Launch Timeline
[8 weeks breakdown]

## First 3 Steps
[3 direct actions]`

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial heartbeat to prevent gateway timeouts
        controller.enqueue(encoder.encode("Thinking... \n\n"))
        
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
          else if (modelId.startsWith("openai/") && process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            const openaiStream = await openai.chat.completions.create({
              model: modelId.replace("openai/", ""),
              messages: [{ role: "user", content: prompt }],
              temperature: 0.2,
              max_tokens: 1800,
              stream: true,
            })
            for await (const chunk of openaiStream) {
              const content = chunk.choices[0]?.delta?.content || ""
              if (content) controller.enqueue(encoder.encode(content))
            }
          }
          else {
            // NVIDIA NIM / Moonshot Kimi K2.5
            const isKimi = modelId.includes("kimi")
            const nvidiaKey = (isKimi && process.env.NVIDIA_API_KEY_MOONSHOT_AI) 
              ? process.env.NVIDIA_API_KEY_MOONSHOT_AI 
              : process.env.NVIDIA_API_KEY
            
            if (!nvidiaKey) throw new Error("No NVIDIA API key configured")

            const nimClient = new OpenAI({
              apiKey: nvidiaKey,
              baseURL: "https://integrate.api.nvidia.com/v1"
            })

            const nimStream = await nimClient.chat.completions.create({
              model: modelId.includes("/") ? modelId : "meta/llama-3.3-70b-instruct",
              messages: [{ role: "user", content: prompt }],
              temperature: isKimi ? 1.0 : 0.2,
              top_p: isKimi ? 0.95 : 1.0,
              max_tokens: isKimi ? 16384 : 1800,
              stream: true,
              extra_body: isKimi ? {
                chat_template_kwargs: { thinking: true },
                enable_thinking: true
              } : undefined
            })

            let hasStartedAnswer = false

            for await (const chunk of nimStream) {
              const delta = chunk.choices[0]?.delta as any
              const reasoning = delta?.reasoning_content
              const content = delta?.content

              if (reasoning) {
                controller.enqueue(encoder.encode(reasoning))
              } 
              else if (content) {
                // Transition from reasoning to final answer
                if (isKimi && !hasStartedAnswer) {
                  controller.enqueue(encoder.encode("\n\n---\n\n"))
                  hasStartedAnswer = true
                }
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
