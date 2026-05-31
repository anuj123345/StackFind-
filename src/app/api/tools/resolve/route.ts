import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await getServerUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { slugs } = await req.json()
  if (!Array.isArray(slugs) || slugs.length === 0) {
    return Response.json({ tools: [] })
  }

  const supabase = await createClient()

  // Clean slugs — normalize to lowercase, no whitespace
  const cleanSlugs = slugs
    .map((s: string) => s?.toString().toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 50) // max 50

  const { data, error } = await supabase
    .from("tools")
    .select(
      "slug, name, tagline, website, logo_url, pricing_model, starting_price_usd, starting_price_inr, managed_billing_enabled, convenience_fee_percent, tool_categories(categories(slug, name))"
    )
    .in("slug", cleanSlugs)
    .eq("status", "approved")

  if (error) return Response.json({ error: error.message }, { status: 500 })

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
