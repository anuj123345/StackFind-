/**
 * Logo URL strategy:
 *
 * All logo loading goes through /api/logo/[domain] — a server-side proxy
 * that tries Clearbit → Google S2 → SVG letter avatar. It ALWAYS returns
 * an image, so client-side onError never fires. Results are cached 24h at CDN.
 *
 * Stored logo_url in DB (e.g. ph-files.imgix.net) takes highest priority
 * and bypasses the proxy entirely.
 */

export function getLogoUrl(
  website: string | null | undefined,
  storedLogoUrl?: string | null
): string | null {
  // Admin-stored URL (ProductHunt logos, custom uploads, etc.) — use directly
  if (storedLogoUrl && !storedLogoUrl.includes("logo.clearbit.com")) {
    return storedLogoUrl
  }

  // Derive domain from website URL, route through server-side proxy
  if (website) {
    try {
      const domain = new URL(website).hostname.replace(/^www\./, "")
      return `/api/logo/${domain}`
    } catch {
      // invalid URL
    }
  }

  return null
}

/** @deprecated use getLogoUrl */
export function getLogoSources(
  website: string | null | undefined,
  storedLogoUrl?: string | null
): string[] {
  const url = getLogoUrl(website, storedLogoUrl)
  return url ? [url] : []
}
