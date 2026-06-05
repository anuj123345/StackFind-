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

// ─── Agent 2: Parallel Stack Builder (Scenario 2) ─────────────────────────────

export async function runStackAgent(
  approach: string,
  label: string,
  catalogue: string,
  fullQuery: string
): Promise<string> {
  const client = nimClient()

  const ANTI_HALLUCINATION = `CRITICAL: Only recommend tools from the AVAILABLE TOOLS CATALOGUE. Use exact slugs. Skip categories with no suitable tool rather than inventing one.`

  const MASTER_STACK_RULE = `
After your response, output:
%%MASTER_STACK_${label.toUpperCase()}_START%%
{"Category": [{"name": "Tool", "slug": "slug", "pricing": "freemium", "website": "https://..."}]}
%%MASTER_STACK_${label.toUpperCase()}_END%%`

  const response = await client.chat.completions.create({
    model: FAST_MODEL,
    max_tokens: 900,
    temperature: 0.35,
    messages: [
      {
        role: "system",
        content: `You are Stack Architect. Build a complete production stack for the given project using the ${approach} approach.
${ANTI_HALLUCINATION}

Format:
**${label}: ${approach} Stack**

Cover: Development, Backend, Database, Auth, AI/ML, Payments, Deployment, Monitoring, Analytics.

For each layer: Tool — one precise reason why it fits this project and this approach.

Then: Monthly cost at launch (0 users) and growth (10K users) in INR.

Key strength of this approach: one sentence.
Key risk of this approach: one sentence.
${MASTER_STACK_RULE}

AVAILABLE TOOLS CATALOGUE:
${catalogue}`,
      },
      {
        role: "user",
        content: `Project: ${fullQuery}\nBuild the complete ${approach} approach stack.`,
      },
    ],
  })

  return response.choices[0]?.message?.content || ""
}

// ─── Agent 3: Comparison Synthesiser (Scenario 2) ────────────────────────────

export async function runComparisonSynthesis(
  query: string,
  entityA: string,
  entityB: string,
  stackA: string,
  stackB: string
): Promise<string> {
  const client = nimClient()

  const response = await client.chat.completions.create({
    model: FAST_MODEL,
    max_tokens: 700,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `You are a senior solution architect. Given two pre-built stack analyses, write a clear comparison and final verdict.

Format your response exactly like this:

## Head-to-Head Comparison

| Factor | ${entityA} Approach | ${entityB} Approach |
|--------|-------------------|-------------------|
| Monthly cost (launch) | ₹X | ₹X |
| Monthly cost (10K users) | ₹X | ₹X |
| Setup complexity | Low/Medium/High | Low/Medium/High |
| India/INR support | ✅/⚠️/❌ | ✅/⚠️/❌ |
| Lock-in risk | Low/Medium/High | Low/Medium/High |
| Scale ceiling | ₹X revenue or N users | ₹X revenue or N users |
| Best for | [specific scenario] | [specific scenario] |

## Verdict

**Choose ${entityA} if:** [specific condition, 1 sentence]
**Choose ${entityB} if:** [specific condition, 1 sentence]
**My recommendation for this project:** [direct answer with 2-sentence reasoning]`,
      },
      {
        role: "user",
        content: `Project: ${query}\n\nStack A Analysis:\n${stackA}\n\nStack B Analysis:\n${stackB}`,
      },
    ],
  })

  return response.choices[0]?.message?.content || ""
}

// ─── Full Comparison Flow (Scenario 2) ───────────────────────────────────────

export async function runComparisonFlow(
  entityA: string,
  entityB: string,
  fullQuery: string,
  catalogue: string
): Promise<string> {
  // Run both stack agents in PARALLEL — no sequential latency
  const [stackA, stackB] = await Promise.all([
    runStackAgent(entityA, "A", catalogue, fullQuery),
    runStackAgent(entityB, "B", catalogue, fullQuery),
  ])

  // Synthesise comparison
  const comparison = await runComparisonSynthesis(
    fullQuery, entityA, entityB, stackA, stackB
  )

  // Extract winning MASTER_STACK from recommended approach
  // Default to A if no clear winner
  const verdictMatch = comparison.match(/My recommendation.*?choose\s+(\w+)/i)
  const winner = verdictMatch?.[1]?.toLowerCase().includes(entityB.split(/\s/)[0].toLowerCase()) ? "B" : "A"
  const winningStack = winner === "A" ? stackA : stackB
  const masterStackMatch = winningStack.match(
    /%%MASTER_STACK_[AB]_START%%([\s\S]*?)%%MASTER_STACK_[AB]_END%%/
  )
  const masterStack = masterStackMatch
    ? `%%MASTER_STACK_START%%${masterStackMatch[1]}%%MASTER_STACK_END%%`
    : ""

  // Assemble full output for streaming
  return [
    `## Comparing: ${entityA} vs ${entityB}\n`,
    `*Both stacks built in parallel for your project.*\n`,
    `---\n`,
    stackA.replace(/%%MASTER_STACK_A_START%%[\s\S]*?%%MASTER_STACK_A_END%%/, "").trim(),
    `\n---\n`,
    stackB.replace(/%%MASTER_STACK_B_START%%[\s\S]*?%%MASTER_STACK_B_END%%/, "").trim(),
    `\n---\n`,
    comparison,
    masterStack ? `\n\n${masterStack}` : "",
  ].join("\n")
}

// ─── Full Domain Research Flow (Scenario 3) ───────────────────────────────────

export async function buildDomainEnrichedPrompt(
  domain: string,
  query: string,
  catalogue: string
): Promise<string> {
  const domainJson = await runDomainAnalysis(domain, query)

  let domainContext = ""
  try {
    const parsed = JSON.parse(domainJson)
    domainContext = `
DOMAIN INTELLIGENCE (pre-analysed for this niche):
Domain: ${domain.toUpperCase()}
Summary: ${parsed.domain_summary ?? ""}
Critical requirements: ${(parsed.critical_requirements ?? []).join(", ")}
India specifics: ${parsed.india_specifics ?? "None"}
Compliance notes: ${parsed.compliance_notes ?? "None"}
Avoid: ${(parsed.avoid ?? []).join(", ")}
Focus categories: ${(parsed.recommended_categories ?? []).join(", ")}

Use this domain intelligence to make your stack recommendation precisely fit this niche.
`
  } catch {
    domainContext = `Domain context: ${domain} product for India market.`
  }

  return `${domainContext}\n\nAVAILABLE TOOLS CATALOGUE:\n${catalogue}`
}
