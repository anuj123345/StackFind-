export async function getUsdInrRate(): Promise<number> {
  const FALLBACK_RATE = 84.0
  const CACHE_TIME = 21600 // 6 hours

  // Try Exchange Rate API (Primary)
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: CACHE_TIME },
    })
    
    if (res.ok) {
      const data = await res.json()
      if (data?.rates?.INR) return data.rates.INR
    }
  } catch (error) {
    console.warn("Primary exchange API failed, trying fallback:", error)
  }

  // Try Frankfurter.dev (Secondary Fallback)
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", {
      next: { revalidate: CACHE_TIME },
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.rates?.INR) return data.rates.INR
    }
  } catch (error) {
    console.error("Secondary exchange API failed:", error)
  }

  return FALLBACK_RATE
}
