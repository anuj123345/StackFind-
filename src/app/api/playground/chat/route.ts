import { NextRequest } from "next/server"
import { StateGraph, Annotation, END, START } from "@langchain/langgraph"
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import { tool } from "@langchain/core/tools"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

// ─── Agent State ──────────────────────────────────────────────────────────────

const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
})

// ─── Tools ────────────────────────────────────────────────────────────────────

const searchTools = tool(
  async ({ query, limit = 8 }: { query: string; limit?: number }) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("tools")
      .select(
        "slug, name, tagline, description, pricing_model, starting_price_usd, starting_price_inr, website, is_made_in_india, tool_categories(categories(slug, name))"
      )
      .eq("status", "approved")
      .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (error) return `Search error: ${error.message}`

    const results = (data || []).map((t: any) => ({
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      pricing_model: t.pricing_model,
      starting_price_usd: t.starting_price_usd,
      starting_price_inr: t.starting_price_inr,
      categories: (t.tool_categories || [])
        .map((tc: any) => tc.categories?.name)
        .filter(Boolean),
      is_made_in_india: t.is_made_in_india,
    }))

    if (results.length === 0) return `No tools found for query: "${query}"`
    return JSON.stringify(results)
  },
  {
    name: "search_tools",
    description:
      "Search StackFind's database of 2500+ AI tools by name, use case, or description. Run multiple searches for different categories — e.g. search 'auth', 'database', 'payments' separately to build a complete stack.",
    schema: z.object({
      query: z.string().describe(
        "What to search for — tool name, use case, or category. E.g. 'user authentication', 'vector database', 'AI image generation', 'India payments UPI'"
      ),
      limit: z.number().optional().describe("Max results to return. Default 8."),
    }),
  }
)

const getToolDetails = tool(
  async ({ slugs }: { slugs: string[] }) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("tools")
      .select(
        "slug, name, tagline, description, pricing_model, starting_price_usd, starting_price_inr, website, has_inr_billing, has_upi, is_made_in_india"
      )
      .in("slug", slugs)
      .eq("status", "approved")

    if (error) return `Error: ${error.message}`
    return JSON.stringify(data || [])
  },
  {
    name: "get_tool_details",
    description:
      "Get detailed info about specific tools by their slugs. Use after search_tools to compare options before recommending.",
    schema: z.object({
      slugs: z.array(z.string()).describe("Array of tool slugs from previous search results"),
    }),
  }
)

const agentTools = [searchTools, getToolDetails]
const toolNode = new ToolNode(agentTools)

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are StackFind AI — a senior software architect helping developers and founders pick the right AI tools and tech stack for their projects.

You have access to a real database of 2500+ curated tools via search_tools and get_tool_details.

Your approach:
1. Understand what the user is building
2. Run multiple targeted searches — one per category needed (auth, database, AI, payments, deployment, etc.)
3. Compare results and recommend the best coherent stack
4. Be specific and opinionated — one clear recommendation per category with reasoning
5. Handle follow-ups naturally — search for alternatives if asked

Rules:
- Always search before recommending. Never recommend from memory alone.
- Mention pricing tier (free/freemium/paid) for every tool
- Format the final stack clearly: Tool Name → what it does in this project
- Keep answers concise. No padding.
- If the user asks about Indian market / budget — prioritize free/freemium + tools with INR billing`

// ─── Graph ────────────────────────────────────────────────────────────────────

function shouldContinue({ messages }: typeof AgentState.State): "tools" | typeof END {
  const last = messages[messages.length - 1] as AIMessage
  return last.tool_calls?.length ? "tools" : END
}

async function runAgent({ messages }: typeof AgentState.State) {
  const model = new ChatOpenAI({
    model: "meta/llama-3.3-70b-instruct",
    apiKey: process.env.NVIDIA_API_KEY!,
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    streaming: true,
    maxTokens: 2000,
  }).bindTools(agentTools)

  const response = await model.invoke(messages)
  return { messages: [response] }
}

function buildGraph() {
  return new StateGraph(AgentState)
    .addNode("agent", runAgent)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent")
    .compile()
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { getServerUser } = await import("@/lib/auth")
    const user = await getServerUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Sign in to use AI Chat" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const body = await req.json()
    const clientMessages: { role: string; content: string }[] = body.messages || []

    if (!clientMessages.length) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Build LangGraph state from conversation history
    const stateMessages: BaseMessage[] = [
      new SystemMessage(SYSTEM_PROMPT),
      ...clientMessages.map((m) =>
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    ]

    const graph = buildGraph()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const graphStream = await graph.stream(
            { messages: stateMessages },
            { streamMode: "messages" }
          )

          for await (const [message, metadata] of graphStream) {
            // Only stream text from the agent node
            if (
              metadata?.langgraph_node === "agent" &&
              message.content &&
              typeof message.content === "string"
            ) {
              controller.enqueue(encoder.encode(message.content))
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
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
