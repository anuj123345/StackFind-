import { NextRequest } from "next/server"
import { OpenAI } from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { getUsdInrRate } from "@/lib/exchange"
import { getLiveToolIntelligence } from "@/lib/live-fetcher"

// Increase Vercel function timeout
export const maxDuration = 60

// Version: 1.0.2-dynamic-budget

function jsonError(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function POST(req: NextRequest) {
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
    
    const prompt = `You are an expert solution architect for Indian startups. A founder wants to build: "${productIdea}".
    Target Monthly Budget: ${budget > 0 ? `₹${budget}` : "Flexible / Not specified"}.
    The current USD to INR rate is ₹${usdToInrRate}.

    YOUR TASKS:
    1. Select the BEST 3-6 tools from the available database below that solve their problem within budget.
    2. ALWAYS start your response on the very first line with: [STACK: slug1, slug2, slug3...] using only the slugs from the list below.
    3. Provide a professional, detailed build plan with an architecture overview, step-by-step implementation, and cost breakdown in INR.

    AVAILABLE TOOLS (ONLY CHOOSE FROM THESE):
    ${tools.map(t => `- ${t.name} (slug: ${t.slug}): ${t.tagline}. Price: ${t.starting_price_usd ? `$${t.starting_price_usd}` : `₹${t.starting_price_inr}`}`).join("\n")}

    FORMATTING RULES:
    - Use Markdown.
    - Be realistic about Indian market pricing.
    - If a tool has Managed Billing enabled, highlight that they can pay for it via StackFind in INR.
    `

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial heartbeat to prevent gateway timeouts
        controller.enqueue(encoder.encode(" "))
        
        try {
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

            const messages: any[] = [
              { 
                role: "system", 
                content: `You are a senior technical co-founder and solution architect. 
                Your goal is to help founders build their project by selecting the right tools and creating a detailed plan.
                
                CRITICAL INSTRUCTION: 
                - ALWAYS start your response on the very first line with a [STACK: slug1, slug2, ...] block.
                - Use only the slugs provided in the "AVAILABLE TOOLS" list.
                - Select exactly 3-6 tools.
                - After the stack block, provide a comprehensive build plan.` 
              },
              { role: "user", content: prompt }
            ]

            let actualModel = modelId.includes("/") ? modelId : "meta/llama-3.3-70b-instruct"
            
            // Allow Deepseek models to execute without fallback
            // actualModel will be preserved
            const isReasoningModel = actualModel.includes("r1") || actualModel.includes("devstral")

            if (isReasoningModel) {
              // Reasoning models use thought streaming and bypass standard tool calls
              const streamResponse: any = await nimClient.chat.completions.create({
                model: actualModel,
                messages,
                max_tokens: 8192,
                stream: true,
                ...(actualModel.includes("r1") ? { extra_body: { chat_template_kwargs: { thinking: true } } } : {})
              } as any)

              let isFirstReasoning = true
              let hasFinishedReasoning = false

              for await (const chunk of streamResponse) {
                // Check if reasoning_content exists in delta (DeepSeek specific)
                const reasoning = (chunk.choices[0]?.delta as any)?.reasoning_content
                if (reasoning) {
                  if (isFirstReasoning) {
                    controller.enqueue(encoder.encode("> [!TIP]\n> **AI Thought Process:**\n> "))
                    isFirstReasoning = false
                  }
                  // Replace newlines with quote markers to maintain markdown blockquote formatting
                  const text = reasoning.replace(/\n/g, "\n> ")
                  controller.enqueue(encoder.encode(text))
                }

                const content = chunk.choices[0]?.delta?.content
                if (content) {
                  if (!isFirstReasoning && !hasFinishedReasoning) {
                    controller.enqueue(encoder.encode("\n\n---\n\n"))
                    hasFinishedReasoning = true
                  }
                  controller.enqueue(encoder.encode(content))
                }
              }
            } else {
              const nimTools = [
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

              let response = await nimClient.chat.completions.create({
                model: actualModel,
                messages,
                tools: nimTools as any,
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

                const finalStream: any = await nimClient.chat.completions.create({
                  model: actualModel,
                  messages,
                  tools: nimTools as any,
                  max_tokens: 2000,
                  stream: true,
                })

                for await (const chunk of finalStream) {
                  const content = chunk.choices[0]?.delta?.content
                  if (content && !content.trim().startsWith('{"type": "function"')) {
                    controller.enqueue(encoder.encode(content))
                  }
                }
              } else {
                if (message.content) {
                  controller.enqueue(encoder.encode(message.content))
                }
              }
            }
          }
          controller.close()
        } catch (err: any) {
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
    return jsonError(err.message || "Internal server error", 500)
  }
}
