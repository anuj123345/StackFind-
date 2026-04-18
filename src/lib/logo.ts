/**
 * Logo URL strategy — simple and reliable:
 *
 * - Stored logo_url in DB  → use it (admin manually verified it)
 * - No stored URL          → return [] immediately → component shows letter avatar
 *
 * We do NOT fall back to any external favicon service (Clearbit, Google S2,
 * DuckDuckGo) because they all return a generic globe for unknown/small domains
 * with HTTP 200, so onError never fires and the globe silently replaces the logo.
 *
 * For new tools: admin must paste a working logo URL in the admin form.
 * The form shows a live preview before saving so bad logos are caught up front.
 */
export function getLogoSources(
  _website: string | null | undefined,
  storedLogoUrl?: string | null
): string[] {
  return storedLogoUrl ? [storedLogoUrl] : []
}

export function getLogoUrl(
  website: string | null | undefined,
  storedLogoUrl?: string | null
): string | null {
  return getLogoSources(website, storedLogoUrl)[0] ?? null
}
