/**
 * Logo URL strategy:
 *
 * 1. Stored logo_url in DB  → highest priority (admin-verified)
 * 2. Clearbit Logo API      → reliable fallback: returns the real logo PNG for
 *    known companies, and a proper HTTP 404 for unknown ones — so onError fires
 *    correctly and the letter avatar takes over. Unlike Google S2 / DuckDuckGo
 *    which return a generic globe with HTTP 200 (breaking onError).
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
    } catch {
      // invalid URL — skip
    }
  }

  return sources
}

export function getLogoUrl(
  website: string | null | undefined,
  storedLogoUrl?: string | null
): string | null {
  return getLogoSources(website, storedLogoUrl)[0] ?? null
}
