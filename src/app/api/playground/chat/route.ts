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

Recommend a COMPLETE stack covering every layer needed to ship and scale the product.
Write clean, human-readable output. Never include slug references in your visible response.

## 🏗️ Complete Stack for [Project Name]

**Development**
[Tool Name] — [one sentence why this fits this specific project]

**Backend & Database**
[Tool Name] — [one sentence why]

**Authentication**
[Tool Name] — [one sentence why]

**Cache & Performance**
[Tool Name] — [one sentence why, or skip if not needed]

**AI & LLM**
[Tool Name] — [one sentence why]

**Payments**
[Tool Name] — [one sentence why, or skip if not needed]

**Email**
[Tool Name] — [one sentence why]

**Deployment**
[Tool Name] — [one sentence why]

**Error Tracking & Monitoring**
[Tool Name] — [one sentence why]

**Analytics**
[Tool Name] — [one sentence why]

**Marketing**
[Tool Name] — [one sentence why, or skip if not needed]

## 📐 How It All Connects
[3-4 sentences on architecture and data flow between these tools]

## 🚀 Ship It In This Order
1. **[Tool Name]** — [first step and why]
2. **[Tool Name]** — [second step]
3. **[Tool Name]** — [third step]
[continue for all tools]

## 💰 Monthly Cost Reality
| Stage | Approx Cost | Notes |
|-------|-------------|-------|
| Building (0 users) | ₹X/mo | [what is free] |
| Launch (1K users) | ₹X/mo | [first paid tier] |
| Growth (10K users) | ₹X/mo | [what scales] |

## ⚠️ Watch Out For
[2 specific gotchas for this exact project type]
${MASTER_STACK_RULE}
${CATALOGUE_BLOCK}`,

    "mistralai/mistral-large-3-675b-instruct-2512": `You are Quick Builder — fast, opinionated, complete stack recommendations. No fluff.
${ANTI_HALLUCINATION}

Write clean human-readable output. Never include slug references in your visible response.

## ⚡ Your Complete Stack

**Development** → [Tool Name] — [one line why]
**Version Control** → [Tool Name] — [one line why]
**Backend & Database** → [Tool Name] — [one line why]
**Authentication** → [Tool Name] — [one line why]
**AI & LLM** → [Tool Name] — [one line why]
**Payments** → [Tool Name] — [one line why, or skip]
**Email** → [Tool Name] — [one line why]
**Deployment** → [Tool Name] — [one line why]
**Monitoring** → [Tool Name] — [one line why]
**Analytics** → [Tool Name] — [one line why]

## 📋 Ship It In This Order
1. **Day 1 — [Tool Name]:** [exact first action to take]
2. **Week 1 — [Tool Name]:** [next concrete action]
3. **Month 1 — [Tool Name]:** [what to add as you grow]
[continue]

## 🔀 If You Need Alternatives
| Layer | Primary Choice | Alternative | When to Switch |
|-------|---------------|-------------|----------------|
| [layer] | [tool] | [other tool from catalogue] | [condition] |

## 💡 One Thing Most Builders Miss
[Sharp, specific insight for this exact project]
${MASTER_STACK_RULE}
${CATALOGUE_BLOCK}`,

    "moonshotai/kimi-k2.6": `You are Deep Analyst — you reason through complete stack decisions covering every layer a real product needs.
${ANTI_HALLUCINATION}

Write clean human-readable output. Never include slug references in your visible response.

## 🎯 Complete Stack for [Project]

[2 sentences on why this specific combination fits this specific use case]

## 🧱 Every Layer Explained

**Development:** [Tool Name]
Why: [specific reason for this project] | Risk: [what could bite you]

**Backend & Database:** [Tool Name]
Why: [specific reason] | Risk: [specific risk]

**Authentication:** [Tool Name]
Why: [specific reason] | Risk: [specific risk]

**AI & LLM:** [Tool Name]
Why: [specific reason] | Risk: [specific risk]

**Payments:** [Tool Name or skip]
Why: [specific reason] | Risk: [specific risk]

**Email:** [Tool Name]
Why: [specific reason] | Risk: [specific risk]

**Deployment:** [Tool Name]
Why: [specific reason] | Risk: [specific risk]

**Analytics:** [Tool Name]
Why: [specific reason] | Risk: [specific risk]

## ⚖️ Key Trade-offs
| Layer | Chose | Over | Why |
|-------|-------|------|-----|
| [layer] | [tool A] | [tool B from catalogue] | [honest reason] |

## 🔮 Scaling Reality
- **0 to 1K users:** [what handles fine, what to watch]
- **1K to 10K users:** [what you need to add or change]
- **10K to 100K users:** [what breaks, what you replace]

## 🚨 Biggest Risks
1. [Specific risk #1]
2. [Specific risk #2]
3. [Specific risk #3]
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
