import { NextRequest } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"

export const maxDuration = 60

function nimClient() {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY!,
    baseURL: "https://integrate.api.nvidia.com/v1",
  })
}

// ─── Full product layer categories mapped to DB slugs ─────────────────────────

const PRODUCT_LAYERS = [
  { label: "Development",          dbSlugs: ["coding", "code-editors", "vibe-coding", "engineering"] },
  { label: "Version Control",      dbSlugs: ["version-control"] },
  { label: "Backend & Database",   dbSlugs: ["backend-db"] },
  { label: "Authentication",       dbSlugs: ["auth"] },
  { label: "Cache & Performance",  dbSlugs: ["redis"] },
  { label: "Vector Database",      dbSlugs: ["vector-db"] },
  { label: "AI & LLM",            dbSlugs: ["chatbots", "automation"] },
  { label: "Payments",             dbSlugs: ["payments"] },
  { label: "Email",                dbSlugs: ["emails"] },
  { label: "Deployment & Hosting", dbSlugs: ["deployment", "dns"] },
  { label: "Error Tracking",       dbSlugs: ["error-tracking"] },
  { label: "Analytics",            dbSlugs: ["analytics"] },
  { label: "Marketing",            dbSlugs: ["marketing", "seo"] },
  { label: "Customer Support",     dbSlugs: ["customer-support"] },
  { label: "Design & UI",          dbSlugs: ["design"] },
]

// ─── Fetch tools grouped by product layer ─────────────────────────────────────

async function fetchToolsByLayers(userQuery: string) {
  const supabase = await createClient()

  // 1. Broad fetch: top 300 tools with categories
  const { data: allData } = await supabase
    .from("tools")
    .select("slug, name, tagline, pricing_model, starting_price_usd, starting_price_inr, website, tool_categories(categories(slug, name))")
    .eq("status", "approved")
    .order("upvotes", { ascending: false })
    .limit(300)

  if (!allData?.length) return { layerMap: {}, queryTools: [] }

  // 2. Group by product layer
  const layerMap: Record<string, { slug: string; name: string; tagline: string; pricing: string; price: string }[]> = {}

  for (const layer of PRODUCT_LAYERS) {
    const layerTools = allData
      .filter((t: any) => {
        const cats = (t.tool_categories || []).map((tc: any) => tc.categories?.slug).filter(Boolean)
        return layer.dbSlugs.some(s => cats.includes(s))
      })
      .slice(0, 8) // max 8 per layer
      .map((t: any) => ({
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        pricing: t.pricing_model,
        price: t.starting_price_inr
          ? `₹${t.starting_price_inr}/mo`
          : t.starting_price_usd
          ? `$${t.starting_price_usd}/mo`
          : "Free",
      }))

    if (layerTools.length > 0) layerMap[layer.label] = layerTools
  }

  // 3. Query-specific tools not already covered
  const terms = userQuery.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(" ").filter(w => w.length > 3).slice(0, 5)
  const { data: queryData } = await supabase
    .from("tools")
    .select("slug, name, tagline, pricing_model, starting_price_usd, starting_price_inr")
    .eq("status", "approved")
    .or(terms.map(t => `name.ilike.%${t}%,tagline.ilike.%${t}%,description.ilike.%${t}%`).join(","))
    .limit(15)

  return { layerMap, queryTools: queryData || [] }
}

// ─── Format tools for prompt as grouped catalogue ────────────────────────────

function buildToolsCatalogue(
  layerMap: Record<string, any[]>,
  queryTools: any[]
): string {
  let catalogue = ""

  for (const [layer, tools] of Object.entries(layerMap)) {
    catalogue += `\n=== ${layer.toUpperCase()} ===\n`
    tools.forEach(t => {
      catalogue += `• ${t.name} [slug: ${t.slug}] (${t.pricing}, ${t.price}) — ${t.tagline}\n`
    })
  }

  if (queryTools.length > 0) {
    catalogue += `\n=== PROJECT-SPECIFIC MATCHES ===\n`
    queryTools.forEach((t: any) => {
      const price = t.starting_price_inr ? `₹${t.starting_price_inr}/mo` : t.starting_price_usd ? `$${t.starting_price_usd}/mo` : "Free"
      catalogue += `• ${t.name} [slug: ${t.slug}] (${t.pricing_model}, ${price}) — ${t.tagline}\n`
    })
  }

  return catalogue
}

// ─── Model configs ────────────────────────────────────────────────────────────

function buildSystemPrompt(modelKey: string, toolsCatalogue: string): string {
  const ANTI_HALLUCINATION = `
CRITICAL RULES — READ BEFORE RESPONDING:
1. ONLY recommend tools from the AVAILABLE TOOLS CATALOGUE below. Never invent tool names.
2. Use the EXACT slug shown in [slug: ...] brackets. Do not modify slugs.
3. If a category has no suitable tool in the catalogue, SKIP that category entirely.
4. Do not recommend tools you know from training data if they are not in the catalogue.
5. The catalogue is your only source of truth.`

  const MASTER_STACK_RULE = `
After your complete response, output this block — include EVERY tool you mentioned above:
%%MASTER_STACK_START%%
{
  "Development": [{"name": "Cursor", "slug": "cursor", "pricing": "freemium", "website": "https://cursor.sh"}],
  "Database": [{"name": "Supabase", "slug": "supabase", "pricing": "freemium", "website": "https://supabase.com"}]
}
%%MASTER_STACK_END%%
Use exact slugs from catalogue. Standard categories only. Valid JSON only.`

  const CATALOGUE_BLOCK = `
AVAILABLE TOOLS CATALOGUE (your ONLY source for recommendations):
${toolsCatalogue}
--- END OF CATALOGUE ---`

  const configs: Record<string, string> = {
    "meta/llama-3.3-70b-instruct": `You are Stack Architect — a senior solution architect who designs complete, production-ready tech stacks for AI products.
${ANTI_HALLUCINATION}

When a user describes their project, recommend a COMPLETE stack covering every layer needed to actually ship and scale it:
Development → Version Control → Backend → Database → Auth → Cache → AI/ML → Storage → Payments → Email → Deployment → Monitoring → Analytics → Marketing

Format your response:

## 🏗️ Complete Stack for [Project Name]

For each layer, use this format:
**[LAYER NAME]**
Tool: [Tool Name] — [Why this tool specifically for this project, 1 sentence]
Cost: [Free/Freemium/₹X per month] | Alternatives in catalogue: [1-2 alternatives if available]

## 📐 How It All Connects
[3-4 sentences explaining the architecture — data flow, integrations, how layers talk to each other]

## 🚀 Ship It In This Order
1. [Tool] — [first step, why]
2. [Tool] — [second step]
3. [Tool] — [third step]
(continue for all major tools)

## 💰 Realistic Monthly Cost
| Stage | Cost | What's Free |
|-------|------|-------------|
| Building (0 users) | ₹X | [what] |
| Launch (1K users) | ₹X | [what scales] |
| Growth (10K users) | ₹X | [what you pay for] |

## ⚠️ Watch Out For
[2-3 specific gotchas for this exact project type]
${MASTER_STACK_RULE}
${CATALOGUE_BLOCK}`,

    "mistralai/mistral-large-3-675b-instruct-2512": `You are Quick Builder — you give fast, complete, opinionated stack recommendations covering every layer needed to ship.
${ANTI_HALLUCINATION}

Cover ALL layers: Development, Backend, Database, Auth, AI/ML, Deployment, Monitoring, Analytics, Marketing, Email, Payments.

Format:

## ⚡ Your Complete Stack

**DEVELOPMENT**
→ [Tool] (slug: [slug]) — [one line why]

**BACKEND & DATABASE**
→ [Tool] — [why]

**AUTHENTICATION**
→ [Tool] — [why]

(continue for every relevant layer)

## 📋 Ship It In This Order
1. **Day 1:** [Tool] — [exact first action]
2. **Week 1:** [Tool] — [next action]
3. **Month 1:** [Tool] — [scale action]

## 🔀 Key Alternatives
| Layer | Primary | If [condition] use |
|-------|---------|--------------------|
| [layer] | [tool] | [alt tool] |

## 💡 The One Thing Most Builders Skip
[One specific, painful truth about this project type]
${MASTER_STACK_RULE}
${CATALOGUE_BLOCK}`,

    "moonshotai/kimi-k2.6": `You are Deep Analyst — you reason through complete stack decisions with depth, covering every layer a real product needs to survive and scale.
${ANTI_HALLUCINATION}

Think through the ENTIRE product lifecycle: build → launch → scale → monetise.

Format:

## 🎯 Stack Decision for [Project]

**Why this combination:** [2 sentences specific to this project — not generic]

## 🧱 Layer-by-Layer Breakdown

For each layer:
**[LAYER]:** [Tool Name]
Why chosen: [specific reason for this project vs alternatives]
Risk: [what could go wrong with this choice]
When to switch: [at what scale or condition]

## ⚖️ Trade-off Analysis
| Decision | Chose | Over | Because |
|----------|-------|------|---------|
| [layer] | [tool A] | [tool B] | [specific reason] |

## 🔮 Scaling Roadmap
- **0→100 users:** [what this stack handles, what breaks first]
- **100→10K users:** [what changes, what you add]
- **10K→100K users:** [what you replace, cost implications]

## 🚨 Top 3 Risks for This Project
1. [Specific risk with this stack for this use case]
2. [Another specific risk]
3. [Third risk]
${MASTER_STACK_RULE}
${CATALOGUE_BLOCK}`,
  }

  return configs[modelKey] || configs["meta/llama-3.3-70b-instruct"]
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

    const model = modelId && [
      "meta/llama-3.3-70b-instruct",
      "mistralai/mistral-large-3-675b-instruct-2512",
      "moonshotai/kimi-k2.6",
    ].includes(modelId) ? modelId : "meta/llama-3.3-70b-instruct"

    const lastUserMsg = [...clientMessages].reverse().find((m: any) => m.role === "user")?.content || ""
    const { layerMap, queryTools } = await fetchToolsByLayers(lastUserMsg)
    const catalogue = buildToolsCatalogue(layerMap, queryTools)
    const systemPrompt = buildSystemPrompt(model, catalogue)

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
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
          const streamResponse = await client.chat.completions.create({
            model,
            messages,
            max_tokens: 2500,
            stream: true,
            temperature: 0.4, // lower = less hallucination
          })

          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content
            if (content) controller.enqueue(encoder.encode(content))
          }

          controller.close()
        } catch (err: any) {
          console.error("Chat error:", err?.message)
          controller.enqueue(encoder.encode("\n\nError: " + (err?.message || "Something went wrong. Try again.")))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    })
  } catch (err: any) {
    return Response.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
