import { NextRequest } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"

export const maxDuration = 60

// ─── NVIDIA NIM client ────────────────────────────────────────────────────────

function getNimClient() {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY!,
    baseURL: "https://integrate.api.nvidia.com/v1",
  })
}

// ─── Available models ─────────────────────────────────────────────────────────

export const CHAT_MODELS = [
  { id: "meta/llama-3.3-70b-instruct",                   name: "Llama 3.3 70B"   },
  { id: "mistralai/mistral-large-3-675b-instruct-2512",  name: "Mistral Large 3" },
  { id: "moonshotai/kimi-k2.6",                          name: "Kimi K2.6"       },
]

// ─── Tool definitions (OpenAI format) ────────────────────────────────────────

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_tools",
      description:
        "Search StackFind's database of 2500+ AI tools by name, use case, or description. " +
        "Run multiple searches for different categories — e.g. 'auth', 'database', 'payments' separately.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "What to search for — tool name, use case, or category",
          },
          limit: {
            type: "number",
            description: "Max results to return. Default 8.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_tool_details",
      description:
        "Get detailed info about specific tools by their slugs. Use after search_tools to compare before recommending.",
      parameters: {
        type: "object",
        properties: {
          slugs: {
            type: "array",
            items: { type: "string" },
            description: "Array of tool slugs from previous search results",
          },
        },
        required: ["slugs"],
      },
    },
  },
]

// ─── Tool execution ───────────────────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const supabase = await createClient()

  if (name === "search_tools") {
    const query = args.query as string
    const limit = (args.limit as number) || 8

    const { data, error } = await supabase
      .from("tools")
      .select(
        "slug, name, tagline, pricing_model, starting_price_usd, starting_price_inr, is_made_in_india, tool_categories(categories(slug, name))"
      )
      .eq("status", "approved")
      .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (error) return `Search error: ${error.message}`
    if (!data?.length) return `No tools found for: "${query}"`

    return JSON.stringify(
      data.map((t: any) => ({
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        pricing_model: t.pricing_model,
        starting_price_usd: t.starting_price_usd,
        starting_price_inr: t.starting_price_inr,
        is_made_in_india: t.is_made_in_india,
        categories: (t.tool_categories || [])
          .map((tc: any) => tc.categories?.name)
          .filter(Boolean),
      }))
    )
  }

  if (name === "get_tool_details") {
    const slugs = args.slugs as string[]
    const { data, error } = await supabase
      .from("tools")
      .select(
        "slug, name, tagline, description, pricing_model, starting_price_usd, starting_price_inr, website, has_inr_billing, has_upi, is_made_in_india"
      )
      .in("slug", slugs)
      .eq("status", "approved")

    if (error) return `Error: ${error.message}`
    return JSON.stringify(data || [])
  }

  return "Unknown tool"
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are StackFind AI — a senior software architect helping developers and founders pick the right AI tools and tech stack for their projects.

You have access to a real database of 2500+ curated tools via search_tools and get_tool_details.

Your workflow:
1. Understand what the user is building
2. Run multiple targeted searches — one per category needed (auth, database, AI, payments, deployment, etc.)
3. Compare results and recommend the best coherent stack
4. Be specific and opinionated — one clear recommendation per category with reasoning
5. Handle follow-up questions naturally

Rules:
- Always search before recommending. Never recommend from memory alone.
- Mention pricing tier (free/freemium/paid) for every tool
- Format the final stack clearly: **Tool Name** → what it does in this project
- Keep answers concise and actionable. No padding.`

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

    const model = CHAT_MODELS.find((m) => m.id === modelId)?.id || CHAT_MODELS[0].id
    const nim = getNimClient()

    // Build message history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...clientMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ]

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Agent loop: run up to 5 iterations (call → tool → call → ...)
          for (let i = 0; i < 5; i++) {
            const response = await nim.chat.completions.create({
              model,
              messages,
              tools,
              tool_choice: "auto",
              max_tokens: 2000,
            })

            const message = response.choices[0].message

            // No tool calls — stream final response
            if (!message.tool_calls?.length) {
              const content = message.content || ""
              controller.enqueue(encoder.encode(content))
              break
            }

            // Execute tool calls
            messages.push(message)

            for (const toolCall of message.tool_calls) {
              const fn = (toolCall as any).function
              const args = JSON.parse(fn.arguments)
              const result = await executeTool(fn.name, args)
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: result,
              })
            }
          }

          controller.close()
        } catch (err: any) {
          console.error("Chat agent error:", err)
          controller.enqueue(
            encoder.encode(`\n\nSomething went wrong: ${err.message}`)
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
