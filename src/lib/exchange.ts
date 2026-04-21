export async function getUsdInrRate(): Promise<number> {
  const FALLBACK_RATE = 84.0

  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    
    if (!res.ok) throw new Error("Failed to fetch exchange rate")
    
    const data = await res.json()
    const rate = data.rates.INR
    
    return rate || FALLBACK_RATE
  } catch (error) {
    console.error("Exchange rate fetch error:", error)
    return FALLBACK_RATE
  }
}
