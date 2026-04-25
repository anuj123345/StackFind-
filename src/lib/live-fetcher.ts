/**
 * Live Fetcher: A lightweight utility to extract metadata from tool websites.
 * This gives the AI "eyes" to verify tool taglines, descriptions, and pricing indicators.
 */

export interface ToolIntelligence {
  url: string
  title: string
  description: string
  status: 'ok' | 'error'
  error?: string
}

export async function getLiveToolIntelligence(url: string): Promise<ToolIntelligence> {
  const result: ToolIntelligence = {
    url,
    title: '',
    description: '',
    status: 'error',
  }

  if (!url || !url.startsWith('http')) {
    result.error = 'Invalid URL'
    return result
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      result.error = `HTTP ${response.status}`
      return result
    }

    const html = await response.text()

    // Lightweight extraction without a full DOM parser (more robust on Vercel)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) || 
                          html.match(/<meta[^>]*content="([^"]+)"[^>]*name="description"/i)

    result.title = titleMatch ? titleMatch[1].trim() : ''
    result.description = metaDescMatch ? metaDescMatch[1].trim() : ''
    result.status = 'ok'

    return result
  } catch (error: any) {
    result.error = error.name === 'AbortError' ? 'Timeout' : error.message
    return result
  }
}
