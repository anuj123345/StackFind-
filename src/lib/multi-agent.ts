import OpenAI from "openai"

// ─── NIM client ───────────────────────────────────────────────────────────────

function nimClient() {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY!,
    baseURL: "https://integrate.api.nvidia.com/v1",
  })
}

const FAST_MODEL = "meta/llama-3.3-70b-instruct"

// ─── Intent detection ─────────────────────────────────────────────────────────

export type AgentIntent =
  | { type: "comparison"; entityA: string; entityB: string }
  | { type: "domain_research"; domain: string; query: string }
  | { type: "standard" }

const COMPARISON_PATTERNS = [
  /\b(vs\.?|versus|or|compared? to|compare|which is better|should i use|between)\b/i,
  /(supabase|firebase|vercel|railway|stripe|razorpay|next\.?js|nuxt|svelte|react|vue|flutter|kotlin|swift).+(vs\.?|or|versus).+(supabase|firebase|vercel|railway|stripe|razorpay|next\.?js|nuxt|svelte|react|vue|flutter|kotlin|swift)/i,
]

const DOMAIN_KEYWORDS = [
  "healthcare", "health", "medical", "hospital", "clinic", "patient",
  "fintech", "finance", "banking", "lending", "insurance", "trading",
  "edtech", "education", "learning", "school", "university", "course",
  "logistics", "supply chain", "shipping", "delivery", "warehouse",
  "legal", "law", "compliance", "contract",
  "real estate", "property", "rent",
  "agriculture", "farm", "crop",
  "ayurved", "wellness", "fitness", "nutrition",
  "government", "civic", "public sector",
  "vernacular", "hindi", "regional language", "bharat",
  "manufacturing", "factory", "industrial",
  "hospitality", "hotel", "restaurant", "travel",
  "media", "news", "content creator", "streaming",
]

export function detectIntent(query: string): AgentIntent {
  const q = query.toLowerCase()

  // Comparison detection
  if (COMPARISON_PATTERNS.some(p => p.test(query))) {
    // Extract the two entities being compared
    const vsMatch = query.match(
      /([A-Za-z0-9.\s]+?)\s+(vs\.?|versus|or|compared? to)\s+([A-Za-z0-9.\s]+)/i
    )
    if (vsMatch) {
      return {
        type: "comparison",
        entityA: vsMatch[1].trim(),
        entityB: vsMatch[3].trim().split(/\s+for\s+|\s+in\s+/)[0].trim(),
      }
    }
  }

  // Domain research detection
  const matchedDomain = DOMAIN_KEYWORDS.find(kw => q.includes(kw))
  if (matchedDomain) {
    return {
      type: "domain_research",
      domain: matchedDomain,
      query,
    }
  }

  return { type: "standard" }
}

// ─── Agent 1: Domain Analyser (Scenario 3) ────────────────────────────────────

export async function runDomainAnalysis(domain: string, query: string): Promise<string> {
  const client = nimClient()

  const response = await client.chat.completions.create({
    model: FAST_MODEL,
    max_tokens: 400,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are a domain expert analyst. Given a domain and a product idea, extract the key technical requirements, compliance needs, market specifics, and recommended tool categories.

Respond in this exact JSON format:
{
  "domain_summary": "2 sentence summary of this domain's tech landscape",
  "critical_requirements": ["requirement 1", "requirement 2", "requirement 3"],
  "compliance_notes": "key compliance or regulatory notes for India",
  "recommended_categories": ["category1", "category2", "category3"],
  "india_specifics": "specific India market considerations",
  "avoid": ["technology or pattern to avoid and why"]
}

Respond ONLY with valid JSON. No other text.`,
      },
      {
        role: "user",
        content: `Domain: ${domain}\nProduct idea: ${query}`,
      },
    ],
  })

  return response.choices[0]?.message?.content || "{}"
}

// ─── Comparison system prompt (Scenario 2) — single call, streamable ─────────

export function buildComparisonSystemPrompt(
  entityA: string,
  entityB: string,
  catalogue: string
): string {
  return `You are Stack Architect — a senior solution architect who compares technology approaches.

CRITICAL RULES:
1. Only recommend tools from the AVAILABLE TOOLS CATALOGUE below
2. Use exact slugs shown in [slug: ...] brackets
3. Never invent tool names not in the catalogue

Compare the two approaches for the user's project. Structure your response exactly like this:

---

## Stack A — ${entityA} Approach

**Development** → [Tool] — [one precise reason for this project]
**Backend & Database** → [Tool] — [one precise reason]
**Authentication** → [Tool] — [one precise reason]
**AI & LLM** → [Tool or N/A] — [reason]
**Payments** → [Tool or N/A] — [reason]
**Deployment** → [Tool] — [one precise reason]
**Monitoring** → [Tool] — [one precise reason]
**Analytics** → [Tool] — [one precise reason]

Monthly cost: ₹X at launch · ₹X at 10K users
Strength: [one sentence]
Risk: [one sentence]

---

## Stack B — ${entityB} Approach

**Development** → [Tool] — [one precise reason for this project]
**Backend & Database** → [Tool] — [one precise reason]
**Authentication** → [Tool] — [one precise reason]
**AI & LLM** → [Tool or N/A] — [reason]
**Payments** → [Tool or N/A] — [reason]
**Deployment** → [Tool] — [one precise reason]
**Monitoring** → [Tool] — [one precise reason]
**Analytics** → [Tool] — [one precise reason]

Monthly cost: ₹X at launch · ₹X at 10K users
Strength: [one sentence]
Risk: [one sentence]

---

## Head-to-Head

| Factor | ${entityA} | ${entityB} |
|--------|-----------|-----------|
| Cost at launch | ₹X/mo | ₹X/mo |
| Cost at 10K users | ₹X/mo | ₹X/mo |
| Setup complexity | Low/Medium/High | Low/Medium/High |
| India/INR/UPI | ✅/⚠️/❌ | ✅/⚠️/❌ |
| Lock-in risk | Low/Medium/High | Low/Medium/High |
| Best for | [scenario] | [scenario] |

## Verdict

**Choose ${entityA} if:** [specific condition]
**Choose ${entityB} if:** [specific condition]
**My recommendation:** [direct answer + 2-sentence reasoning specific to this project]

After your response, output the winning approach's tools:
%%MASTER_STACK_START%%
{"Category": [{"name": "Tool", "slug": "exact-slug", "pricing": "freemium", "website": "https://..."}]}
%%MASTER_STACK_END%%

AVAILABLE TOOLS CATALOGUE:
${catalogue}`
}

// ─── Full Comparison Flow (Scenario 2) — single call, streamed ───────────────

export function buildComparisonMessages(
  entityA: string,
  entityB: string,
  fullQuery: string,
  catalogue: string
): { role: "system" | "user"; content: string }[] {
  return [
    { role: "system", content: buildComparisonSystemPrompt(entityA, entityB, catalogue) },
    { role: "user", content: `My project: ${fullQuery}\n\nCompare the ${entityA} approach vs the ${entityB} approach for this specific project.` },
  ]
}

// ─── Full Domain Research Flow (Scenario 3) ───────────────────────────────────

export async function buildDomainEnrichedPrompt(
  domain: string,
  query: string,
  catalogue: string
): Promise<string> {
  // Run domain analysis with a tight timeout — if it takes too long, skip it
  let domainContext = `Domain context: ${domain} product for the Indian market.`

  try {
    const analysisPromise = runDomainAnalysis(domain, query)
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000)
    )
    const domainJson = await Promise.race([analysisPromise, timeoutPromise])
    const parsed = JSON.parse(domainJson)
    domainContext = `
DOMAIN INTELLIGENCE — ${domain.toUpperCase()}:
Summary: ${parsed.domain_summary ?? ""}
Critical requirements: ${(parsed.critical_requirements ?? []).join(", ")}
India specifics: ${parsed.india_specifics ?? "None"}
Compliance: ${parsed.compliance_notes ?? "None"}
Avoid: ${(parsed.avoid ?? []).join("; ")}
Priority categories: ${(parsed.recommended_categories ?? []).join(", ")}
`
  } catch {
    // Silent fallback — use basic domain context
  }

  return `${domainContext}\n\nAVAILABLE TOOLS CATALOGUE:\n${catalogue}`
}
