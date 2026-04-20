import { createClient } from '@/lib/supabase/server'
import type { Tool, Category } from '@/types/database'

// Tool with category names flattened
export type ToolWithCategoryNames = Tool & { categoryNames: string[] }

function flattenCategories(tool: any): ToolWithCategoryNames {
  const categoryNames: string[] = (tool.tool_categories ?? [])
    .map((tc: any) => tc.categories?.name)
    .filter(Boolean)
  const { tool_categories: _, ...rest } = tool
  return { ...rest, categoryNames }
}

export async function getFeaturedTools(limit = 6): Promise<ToolWithCategoryNames[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('*, tool_categories(categories(name))')
    .eq('status', 'approved')
    .not('featured_until', 'is', null)
    .gte('featured_until', new Date().toISOString())
    .order('upvotes', { ascending: false })
    .limit(limit)
  return (data ?? []).map(flattenCategories)
}

export async function getLatestTools(limit = 8): Promise<ToolWithCategoryNames[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('*, tool_categories(categories(name))')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(limit)
  return (data ?? []).map(flattenCategories)
}

export async function getMadeInIndiaTools(limit = 12): Promise<ToolWithCategoryNames[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('*, tool_categories(categories(name))')
    .eq('status', 'approved')
    .eq('is_made_in_india', true)
    .order('upvotes', { ascending: false })
    .limit(limit)
  return (data ?? []).map(flattenCategories)
}

export async function getAllTools(): Promise<ToolWithCategoryNames[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('*, tool_categories(categories(name))')
    .eq('status', 'approved')
    .order('upvotes', { ascending: false })
  return (data ?? []).map(flattenCategories)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('tool_count', { ascending: false })
  return data ?? []
}

export async function getToolBySlug(slug: string): Promise<ToolWithCategoryNames | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('*, tool_categories(categories(name))')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()
  return data ? flattenCategories(data) : null
}

export async function getRelatedTools(slug: string, categoryNames: string[], limit = 4): Promise<ToolWithCategoryNames[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('*, tool_categories(categories(name))')
    .eq('status', 'approved')
    .neq('slug', slug)
    .order('upvotes', { ascending: false })
    .limit(limit)
  return (data ?? []).map(flattenCategories)
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  return data ?? null
}

export async function getToolsByCategory(categorySlug: string): Promise<ToolWithCategoryNames[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tools')
    .select('*, tool_categories!inner(categories!inner(name, slug))')
    .eq('status', 'approved')
    .eq('tool_categories.categories.slug', categorySlug)
    .order('upvotes', { ascending: false })
  return (data ?? []).map(flattenCategories)
}

export type PlaygroundTool = {
  slug: string
  name: string
  tagline: string
  website: string | null
  logo_url: string | null
  pricing_model: string
  starting_price_usd: number | null
  is_made_in_india: boolean
  categorySlug: string
  categoryName: string
}

const PLAYGROUND_CATEGORIES = [
  'coding','backend-db','deployment','domain','payments',
  'version-control','emails','auth','dns','analytics',
  'error-tracking','redis','vector-db',
]

export async function getPlaygroundTools(): Promise<PlaygroundTool[]> {
  const supabase = await createClient()

  // Fetch ALL approved tools with their categories (left join so tools with no categories still appear)
  const { data } = await supabase
    .from('tools')
    .select('slug, name, tagline, website, logo_url, pricing_model, starting_price_usd, is_made_in_india, tool_categories(categories(slug, name))')
    .eq('status', 'approved')
    .order('upvotes', { ascending: false })

  if (!data) return []

  const seen = new Set<string>()
  const result: PlaygroundTool[] = []

  for (const row of data as any[]) {
    if (seen.has(row.slug)) continue

    // Find the first matching playground category for this tool
    const cats: { slug: string; name: string }[] = (row.tool_categories ?? [])
      .map((tc: any) => tc.categories)
      .filter(Boolean)

    const playgroundCat = cats.find(c => PLAYGROUND_CATEGORIES.includes(c.slug))

    seen.add(row.slug)
    result.push({
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      website: row.website,
      logo_url: row.logo_url,
      pricing_model: row.pricing_model,
      starting_price_usd: row.starting_price_usd,
      is_made_in_india: row.is_made_in_india,
      // Tools not in a playground category go under "others"
      categorySlug: playgroundCat?.slug ?? 'others',
      categoryName: playgroundCat?.name ?? 'Others',
    })
  }

  return result
}

export async function getToolStats(): Promise<{ total: number; madeInIndia: number; categories: number; freeOrFreemium: number }> {
  const supabase = await createClient()
  const [totalRes, indiaRes, catRes, freeRes] = await Promise.all([
    supabase.from('tools').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('tools').select('id', { count: 'exact', head: true }).eq('status', 'approved').eq('is_made_in_india', true),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('tools').select('id', { count: 'exact', head: true }).eq('status', 'approved').in('pricing_model', ['free', 'freemium']),
  ])
  const total = totalRes.count ?? 0
  return {
    total,
    madeInIndia: indiaRes.count ?? 0,
    categories: catRes.count ?? 0,
    freeOrFreemium: total > 0 ? Math.round(((freeRes.count ?? 0) / total) * 100) : 0,
  }
}
