import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export interface SearchResult {
  slug: string
  name: string
  tagline: string
  logo_url: string | null
  pricing_model: string
  is_made_in_india: boolean
  website: string | null
  categories: string[]
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const supabase = await createClient()

  const { data } = await supabase
    .from("tools")
    .select("slug, name, tagline, logo_url, pricing_model, is_made_in_india, website, tool_categories(categories(name, slug))")
    .eq("status", "approved")
    .or(`name.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%`)
    .order("upvotes", { ascending: false })
    .limit(8)

  const results: SearchResult[] = (data ?? []).map((tool: any) => ({
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    logo_url: tool.logo_url,
    pricing_model: tool.pricing_model,
    is_made_in_india: tool.is_made_in_india,
    website: tool.website,
    categories: (tool.tool_categories as any[])
      .map((tc: any) => tc.categories?.name)
      .filter(Boolean)
      .slice(0, 2),
  }))

  return NextResponse.json({ results })
}
