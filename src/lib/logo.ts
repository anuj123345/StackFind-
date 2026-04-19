/**
 * Logo URL strategy:
 *
 * 1. Stored logo_url in DB  → highest priority (admin-verified)
 * 2. Clearbit Logo API      → best quality logos for well-known companies;
 *    returns HTTP 404 for unknown ones so onError fires correctly.
 * 3. Google S2 favicons     → reliable final fallback; returns the site's
 *    actual favicon for any real domain. For truly unknown domains it returns
 *    a generic globe with HTTP 200 (onError won't fire), but all approved tools
 *    have real websites so this is acceptable.
 */
export function getLogoSources(
  website: string | null | undefined,
  storedLogoUrl?: string | null
): string[] {
  const sources: string[] = []

  if (storedLogoUrl) sources.push(storedLogoUrl)

  if (website) {
    try {
      const domain = new URL(website).hostname.replace(/^www\./, "")
      sources.push(`https://logo.clearbit.com/${domain}`)
      sources.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
    } catch {
      // invalid URL — skip
    }
  }

  // Deduplicate while preserving order
  return [...new Set(sources)]
}

export function getLogoUrl(
  website: string | null | undefined,
  storedLogoUrl?: string | null
): string | null {
  return getLogoSources(website, storedLogoUrl)[0] ?? null
}
