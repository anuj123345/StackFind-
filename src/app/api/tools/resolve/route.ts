import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { slugs, names } = await req.json()
  const hasSlugs = Array.isArray(slugs) && slugs.length > 0
  const hasNames = Array.isArray(names) && names.length > 0

  if (!hasSlugs && !hasNames) return Response.json({ toolMap: {} })

  const supabase = await createClient()

  const cleanSlugs = hasSlugs
    ? slugs.map((s: string) => s?.toString().toLowerCase().trim()).filter(Boolean).slice(0, 50)
    : []

  const cleanNames = hasNames
    ? names.map((n: string) => n?.toString().trim()).filter(Boolean).slice(0, 50)
    : []

  // Query by slugs first
  const results: any[] = []

  if (cleanSlugs.length > 0) {
    const { data } = await supabase
      .from("tools")
      .select("slug, name, tagline, website, logo_url, pricing_model, starting_price_usd, starting_price_inr, managed_billing_enabled, convenience_fee_percent, tool_categories(categories(slug, name))")
      .in("slug", cleanSlugs)
      .eq("status", "approved")
    results.push(...(data || []))
  }

  // Query by names (case-insensitive) for tools not found by slug
  if (cleanNames.length > 0) {
    const foundSlugs = new Set(results.map((t: any) => t.slug))
    // Use ilike for each name - run in parallel
    const nameResults = await Promise.all(
      cleanNames.map(async (n: string) => {
        try {
          const { data } = await supabase
            .from("tools")
            .select("slug, name, tagline, website, logo_url, pricing_model, starting_price_usd, starting_price_inr, managed_billing_enabled, convenience_fee_percent, tool_categories(categories(slug, name))")
            .ilike("name", n)
            .eq("status", "approved")
            .limit(1)
            .maybeSingle()
          return data
        } catch {
          return null
        }
      })
    )
    for (const tool of nameResults) {
      if (tool && !foundSlugs.has(tool.slug)) {
        results.push(tool)
        foundSlugs.add(tool.slug)
      }
    }
  }

  const data = results
  const error = null

  // Return map: slug → tool data
  const toolMap: Record<string, any> = {}
  for (const tool of data || []) {
    const categories = (tool.tool_categories || [])
      .map((tc: any) => tc.categories?.name)
      .filter(Boolean)
    toolMap[tool.slug] = {
      slug: tool.slug,
      name: tool.name,
      tagline: tool.tagline,
      website: tool.website,
      logoUrl: tool.logo_url,
      pricing: tool.pricing_model,
      startingPriceUsd: tool.starting_price_usd,
      startingPriceInr: tool.starting_price_inr,
      managedBillingEnabled: tool.managed_billing_enabled,
      convenienceFeePercent: tool.convenience_fee_percent,
      categoryName: categories[0] || "Other",
      fromDB: true,
    }
  }

  return Response.json({ toolMap })
}
