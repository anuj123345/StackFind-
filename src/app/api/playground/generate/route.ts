import { NextRequest } from "next/server"
import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { getIsAuthenticated } from "@/lib/auth"
import { getUsdInrRate } from "@/lib/exchange"
import { getLiveToolIntelligence } from "@/lib/live-fetcher"

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
            
            // Note: Anthropic tool support could be added here later
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

            const messages: any[] = [
              { 
                role: "system", 
                content: "You are a senior technical co-founder. Use the 'get_live_tool_intelligence' tool if you are unsure about a tool's current pricing, tagline, or features. Always provide a highly professional and practical build plan." 
              },
              { role: "user", content: prompt }
            ]

            const tools = [
              {
                type: 'function',
                function: {
                  name: 'get_live_tool_intelligence',
                  description: 'Fetch real-time metadata from a tool\'s website to verify pricing, tagline, or features.',
                  parameters: {
                    type: 'object',
                    properties: {
                      url: { type: 'string', description: 'The official website URL of the tool' }
                    },
                    required: ['url']
                  }
                }
              }
            ]

            // We handle one level of tool calling for now (simple & robust)
            let response = await nimClient.chat.completions.create({
              model: modelId.includes("/") ? modelId : "meta/llama-3.3-70b-instruct",
              messages,
              tools: tools as any,
              tool_choice: "auto",
              max_tokens: 2000,
            })

            const message = response.choices[0].message
            
            if (message.tool_calls && message.tool_calls.length > 0) {
              controller.enqueue(encoder.encode("> [!NOTE]\n> AI is verifying live tool data...\n\n"))
              
              messages.push(message)

              for (const toolCall of message.tool_calls) {
                if (toolCall.type !== 'function') continue
                const args = JSON.parse(toolCall.function.arguments)
                const intelligence = await getLiveToolIntelligence(args.url)
                
                messages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "get_live_tool_intelligence",
                  content: JSON.stringify(intelligence),
                })
              }

              // Final stream with the tool results in context
              const finalStream = await nimClient.chat.completions.create({
                model: modelId.includes("/") ? modelId : "meta/llama-3.3-70b-instruct",
                messages,
                tools: tools as any, // Always provide tools to maintain model state
                max_tokens: 2000,
                stream: true,
              })

              for await (const chunk of finalStream) {
                const content = chunk.choices[0]?.delta?.content
                // Safety: If the model still tries to output tool JSON in the content, skip it
                if (content && !content.trim().startsWith('{"type": "function"')) {
                  controller.enqueue(encoder.encode(content))
                }
              }
            } else {
              // No official tool_calls, but check if the model outputted a JSON tool call in content
              const content = message.content || ""
              if (content.trim().startsWith('{"type": "function"') || content.includes('"get_live_tool_intelligence"')) {
                // The model outputted a tool call as text instead of using the API
                // Let's try to recover by treating it as a tool call
                try {
                  const rawJson = content.trim().startsWith('{') ? content.trim() : content.match(/\{[\s\S]*?\}/)?.[0]
                  if (rawJson) {
                    const parsed = JSON.parse(rawJson)
                    const url = parsed.function?.parameters?.url || parsed.parameters?.url
                    if (url) {
                      controller.enqueue(encoder.encode("> [!NOTE]\n> AI is verifying live tool data (recovered)...\n\n"))
                      const intelligence = await getLiveToolIntelligence(url)
                      messages.push({ role: "assistant", content: content })
                      messages.push({
                        role: "tool",
                        tool_call_id: "call_" + Math.random().toString(36).substring(7),
                        name: "get_live_tool_intelligence",
                        content: JSON.stringify(intelligence),
                      })
                      
                      const finalStream = await nimClient.chat.completions.create({
                        model: modelId.includes("/") ? modelId : "meta/llama-3.3-70b-instruct",
                        messages,
                        tools: tools as any,
                        max_tokens: 2000,
                        stream: true,
                      })
                      for await (const chunk of finalStream) {
                        const c = chunk.choices[0]?.delta?.content
                        if (c) controller.enqueue(encoder.encode(c))
                      }
                      controller.close()
                      return
                    }
                  }
                } catch (e) {
                  // Fallback to normal streaming if recovery fails
                }
              }
              
              if (message.content) {
                controller.enqueue(encoder.encode(message.content))
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
