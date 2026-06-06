import { NextRequest } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"
import {
  detectIntent,
  buildComparisonMessages,
  buildDomainEnrichedPrompt,
} from "@/lib/multi-agent"

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
    "meta/llama-3.3-70b-instruct": `You are Stack Architect — a senior solution architect specialising in AI product infrastructure.
${ANTI_HALLUCINATION}

Analyse the project carefully. Recommend the exact right tool per layer — not the most popular, the most appropriate. Be specific about WHY each tool fits this exact project.

---

## Stack for [Write the actual project name here]

Cover every layer the project needs. Skip layers that genuinely do not apply.

**Development Environment**
[Tool Name] — [Exactly why this fits this project specifically, not generic praise]

**Backend & Database**
[Tool Name] — [Why this data model, this scale, this team]

**Authentication**
[Tool Name] — [Why this auth approach for this product]

**AI & LLM Layer**
[Tool Name] — [Which model, which API, why this over alternatives]

**Cache & Queue** *(if needed)*
[Tool Name] — [Why caching matters for this specific project]

**File & Media Storage** *(if needed)*
[Tool Name] — [Why]

**Payments & Billing** *(if needed)*
[Tool Name] — [Why Stripe vs Razorpay for this market]

**Email — Transactional** *(if needed)*
[Tool Name] — [Why]

**Deployment & Hosting**
[Tool Name] — [Why this deployment model]

**Error Tracking**
[Tool Name] — [Why]

**Analytics**
[Tool Name] — [Why this analytics approach]

**Marketing & Distribution** *(if needed)*
[Tool Name] — [First distribution channel for this product]

---

## How the Stack Fits Together

[Write 3-4 precise sentences on data flow. How does user data move through this stack? What calls what? Where does the AI layer sit in the request path?]

---

## Build Order

Do this in order. Each step unblocks the next.

1. **[Tool Name]** — [specific first action, not vague]
2. **[Tool Name]** — [second action]
3. **[Tool Name]** — [third action]
4. **[Tool Name]** — [continue through the full list]

---

## Realistic Monthly Cost

| Stage | Estimated Cost | What Is Free | What You Pay For |
|-------|----------------|--------------|-----------------|
| Building (0 users) | ₹0–₹2,000/mo | [list free tiers] | [any paid tools] |
| Launch (1K users) | ₹X,000/mo | [still free] | [first upgrade] |
| Growth (10K users) | ₹X,000/mo | [still free] | [what scales] |

---

## Critical Warnings

- **[Warning 1]:** [Specific technical risk for this exact project type]
- **[Warning 2]:** [Second specific risk — not generic advice]
${MASTER_STACK_RULE}
${CATALOGUE_BLOCK}`,

    "mistralai/mistral-large-3-675b-instruct-2512": `You are Quick Builder — direct, opinionated, zero fluff. Every line earns its place.
${ANTI_HALLUCINATION}

Give the complete stack. Every layer. One precise reason per tool. No vague praise.

---

## Complete Stack

| Layer | Tool | Why This One |
|-------|------|-------------|
| Development | [Tool Name] | [one precise reason] |
| Backend & Database | [Tool Name] | [one precise reason] |
| Authentication | [Tool Name] | [one precise reason] |
| AI & LLM | [Tool Name] | [one precise reason] |
| Deployment | [Tool Name] | [one precise reason] |
| Error Tracking | [Tool Name] | [one precise reason] |
| Analytics | [Tool Name] | [one precise reason] |
| Email | [Tool Name] | [one precise reason] |
| Payments | [Tool Name] | [one precise reason — or write N/A if not needed] |
| Cache | [Tool Name] | [one precise reason — or write N/A if not needed] |
| Marketing | [Tool Name] | [one precise reason — or write N/A if not needed] |

---

## Ship It — Week by Week

**Week 1 — Foundation**
- Set up [Tool] for auth and database
- Deploy skeleton to [Tool]
- Confirm end-to-end user signup works

**Week 2 — Core Product**
- Build [the specific core feature for this project]
- Integrate [AI/LLM tool] — start with the simplest prompt that works
- Add error tracking before first user touches it

**Week 3 — Polish & Payments**
- Add [payments tool] if monetising at launch
- Connect [analytics tool] — instrument the 3 events that matter most
- Performance test before announcing

**Month 2 Onwards**
- [Specific growth or scaling action for this project]

---

## Alternatives Worth Knowing

| Layer | Primary | Swap To If | Reason |
|-------|---------|-----------|--------|
| [layer] | [tool] | [condition] | [alt tool from catalogue] |
| [layer] | [tool] | [condition] | [alt tool from catalogue] |

---

## The One Thing That Will Kill This Project

[Write one sharp, specific insight about the most likely failure mode for this exact project. Not generic. Not obvious.]
${MASTER_STACK_RULE}
${CATALOGUE_BLOCK}`,

    "moonshotai/kimi-k2.6": `You are Deep Analyst — you think in systems, tradeoffs, and failure modes. Cover everything a founding engineer needs to know before committing to a stack.
${ANTI_HALLUCINATION}

---

## Stack Analysis: [Project Name]

**Why this combination works for this specific project:**
[2-3 sentences specific to this use case — not applicable to any other project]

---

## Layer-by-Layer Breakdown

For each layer: what, why, and what happens when you outgrow it.

**Development**
Tool: [Tool Name]
Reason: [Specific to this project]
Outgrow when: [Specific condition — user count, team size, feature complexity]

**Backend & Database**
Tool: [Tool Name]
Reason: [Specific to this project's data model]
Outgrow when: [Specific condition]

**Authentication**
Tool: [Tool Name]
Reason: [Specific to this product's user model]
Outgrow when: [Specific condition]

**AI & LLM**
Tool: [Tool Name]
Reason: [Why this model for this use case, what makes it the right fit]
Outgrow when: [When to consider fine-tuning or switching models]

**Deployment**
Tool: [Tool Name]
Reason: [Specific to this project's traffic pattern]
Outgrow when: [Specific condition]

**Error Tracking**
Tool: [Tool Name]
Reason: [Specific to this project's failure surface]

**Analytics**
Tool: [Tool Name]
Reason: [What specific metrics matter for this product]

**Payments** *(if applicable)*
Tool: [Tool Name]
Reason: [Specific to this market and pricing model]

---

## Key Decisions — What You Chose and What You Gave Up

| Decision | Tool Chosen | Strongest Alternative | What You Gain | What You Sacrifice |
|----------|-------------|----------------------|--------------|-------------------|
| [layer] | [tool] | [alt from catalogue] | [specific gain] | [specific cost] |
| [layer] | [tool] | [alt from catalogue] | [specific gain] | [specific cost] |
| [layer] | [tool] | [alt from catalogue] | [specific gain] | [specific cost] |

---

## Scaling Roadmap

**0 → 1,000 users**
Stack holds. Watch: [specific metric to monitor]. First thing that breaks: [specific bottleneck].

**1,000 → 10,000 users**
Add: [specific tool or upgrade]. Reason: [specific technical reason]. Cost change: ₹X → ₹Y/mo.

**10,000 → 100,000 users**
Replace: [specific tool] with [specific alternative]. Reason: [specific technical reason].

---

## Top 3 Risks for This Specific Project

1. **[Risk name]** — [Specific risk for this project. What causes it. How to mitigate.]
2. **[Risk name]** — [Specific risk. Cause. Mitigation.]
3. **[Risk name]** — [Specific risk. Cause. Mitigation.]
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

    // ── Server-side usage enforcement — cannot be bypassed from client ──
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium_playground, playground_usage_count")
      .eq("id", user.id)
      .single()

    const isPremium = profile?.is_premium_playground === true
    const usageCount = profile?.playground_usage_count ?? 0
    const FREE_LIMIT = 10

    if (!isPremium && usageCount >= FREE_LIMIT) {
      return Response.json({
        error: "Free limit reached. Upgrade to Pro to continue.",
        code: "USAGE_LIMIT_REACHED",
      }, { status: 403 })
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

    // ── Multi-agent intent detection ──────────────────────────────────────────
    const intent = detectIntent(lastUserMsg)
    const { layerMap, queryTools } = await fetchToolsByLayers(lastUserMsg)
    const catalogue = buildToolsCatalogue(layerMap, queryTools)
    const encoder = new TextEncoder()

    // ── Scenario 2: Stack Comparison — single call, fully streamed ──────────
    if (intent.type === "comparison") {
      const compMessages = buildComparisonMessages(
        intent.entityA, intent.entityB, lastUserMsg, catalogue
      )
      const compStream = new ReadableStream({
        async start(controller) {
          try {
            const streamResponse = await nimClient().chat.completions.create({
              model,
              messages: compMessages as OpenAI.Chat.ChatCompletionMessageParam[],
              max_tokens: 3500,
              stream: true,
              temperature: 0.35,
            })
            for await (const chunk of streamResponse) {
              const text = chunk.choices[0]?.delta?.content
              if (text) controller.enqueue(encoder.encode(text))
            }
            controller.close()
          } catch (err: any) {
            controller.enqueue(encoder.encode("\n\nError: " + (err?.message || "Comparison failed. Try again.")))
            controller.close()
          }
        },
      })
      return new Response(compStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
      })
    }

    // ── Scenario 3: Domain Research ───────────────────────────────────────────
    let enrichedCatalogue = catalogue
    let domainPrefix = ""
    if (intent.type === "domain_research") {
      domainPrefix = `🔬 **Analysing ${intent.domain} domain...**\n\n`
      enrichedCatalogue = await buildDomainEnrichedPrompt(intent.domain, lastUserMsg, catalogue)
    }

    // ── Standard flow (with optional domain enrichment) ────────────────────
    const systemPrompt = buildSystemPrompt(model, enrichedCatalogue)

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...clientMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ]

    const client = nimClient()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Emit domain analysis prefix if applicable
          if (domainPrefix) controller.enqueue(encoder.encode(domainPrefix))

          const streamResponse = await client.chat.completions.create({
            model,
            messages,
            max_tokens: 3200,
            stream: true,
            temperature: 0.4,
          })

          for await (const chunk of streamResponse) {
            const chunkContent = chunk.choices[0]?.delta?.content
            if (chunkContent) controller.enqueue(encoder.encode(chunkContent))
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
