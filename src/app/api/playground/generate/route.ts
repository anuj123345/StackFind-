import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getIsAuthenticated } from "@/lib/auth"
import { getUsdInrRate } from "@/lib/exchange"

// Increase Vercel function timeout (works on Pro; Hobby ignores but we also use haiku which is fast)
export const maxDuration = 60

function jsonError(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function POST(req: NextRequest) {
  try {
    const usdToInrRate = await getUsdInrRate()
    const isAuthenticated = await getIsAuthenticated()
    if (!isAuthenticated) return jsonError("Sign in to use the Playground", 401)

    if (!process.env.ANTHROPIC_API_KEY) return jsonError("ANTHROPIC_API_KEY not configured", 500)

    let tools: any[], productIdea: string
    try {
      const body = await req.json()
      tools = body.tools
      productIdea = body.productIdea
    } catch {
      return jsonError("Invalid request body")
    }

    if (!tools?.length) return jsonError("Add at least one tool to your stack")
    if (!productIdea?.trim()) return jsonError("Describe what you want to build")

    // Build a tight prompt
    const toolLines = tools.map((t: any) => {
      const inrStr = t.startingPriceInr ? `₹${t.startingPriceInr}/mo` : "N/A"
      const usdStr = t.startingPriceUsd ? `$${t.startingPriceUsd}/mo` : "N/A"
      
      // Calculate effective INR for the LLM's reference
      let effectiveInr = 0
      if (t.startingPriceInr) effectiveInr = t.startingPriceInr
      else if (t.startingPriceUsd) effectiveInr = Math.round(t.startingPriceUsd * usdToInrRate)

      const billingContext = t.managed_billing_enabled 
        ? "Managed INR Billing Available (UPI/GST)" 
        : (t.startingPriceInr ? "Native INR/UPI support" : "USD/International Only")

      return `- ${t.name}: Price: ${inrStr} / ${usdStr}, (ESTIMATED TOTAL: ₹${effectiveInr}/mo). Billing: ${billingContext}. Tagline: ${t.tagline}`
    }).join("\n")

    const prompt = `You are a senior technical co-founder. A founder wants to build: "${productIdea.trim()}"

Their stack (${tools.length} tools):
${toolLines}

Write a practical build plan. Use this EXACT format, no deviations:

## Product Overview
One paragraph (3 sentences max): what it is, who it's for, core value.

## How Each Tool Is Used
${tools.map((t: any) => `### ${t.name}\nOne focused paragraph on exactly what this tool does in this specific product.`).join("\n\n")}

## Cost Breakdown

| Tool | Plan | Monthly Cost (₹) | Billing Status |
|------|------|------------------|----------------|
${tools.map((t: any) => {
  let priceStr = "₹0"
  let billingStatus = "International"
  
  if (t.startingPriceInr) {
    priceStr = `₹${t.startingPriceInr}`
    billingStatus = "Native INR/GST"
  } else if (t.managed_billing_enabled) {
    priceStr = `₹${Math.round(t.startingPriceUsd * usdToInrRate * 1.05)}*`
    billingStatus = "StackFind Managed (GST)"
  } else if (t.startingPriceUsd) {
    priceStr = `₹${Math.round(t.startingPriceUsd * usdToInrRate)}*`
  }
  return `| ${t.name} | ${t.startingPriceInr || t.startingPriceUsd ? 'Starting plan' : 'Free tier'} | ${priceStr} | ${billingStatus} |`
}).join("\n")}

*Prices marked with * are estimates (USD to INR @ ₹${usdToInrRate}). StackFind Managed includes a 5% service fee.

## Managed Stack Advantage
Explain briefly: By using StackFind Managed Billing for the ${tools.filter((t: any) => t.managed_billing_enabled).length} international tools in this stack, the founder gets a valid Indian GST invoice. 
CALCULATE: Total monthly spend on Managed tools is ₹[SUM]. 18% GST Input Credit savings = ₹[0.18 * SUM]. Mention this exact saving.

## Launch Timeline
- **Week 1–2:** [Setup, auth, database schema, core scaffolding]
- **Week 3–4:** [Core feature implementation, key integrations]
- **Week 5–6:** [Payments, emails, polish, staging deploy]
- **Week 7–8:** [Beta users, feedback loop, production launch]

## First 3 Steps
1. [Specific first step — tool + action]
2. [Specific second step — tool + action]
3. [Specific third step — tool + action]

Be direct. No filler. Do not use code blocks for the output itself.`

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Use a robust model choice
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1800,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim()

    if (!text) throw new Error("Empty response from AI")

    return new Response(JSON.stringify({ plan: text }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("[playground/generate]", err)
    
    // Check for specific Anthropic errors
    const isAuth = err?.status === 401
    const isRateLimit = err?.status === 429
    const isOverloaded = err?.status === 503 || err?.status === 529

    const msg = isAuth
      ? "Invalid Anthropic API key. Please check your environment variables."
      : isRateLimit
      ? "Anthropic rate limit hit. Please wait a minute and try again."
      : isOverloaded
      ? "Anthropic servers are currently overloaded. Please try again in a moment."
      : err?.message ?? "Generation failed. Please try again."
      
    return jsonError(msg, err?.status || 500)
  }
}
