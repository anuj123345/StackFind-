import { Suspense } from "react"
import { getToolsBySlugs } from "@/lib/queries"
import { getServerUser } from "@/lib/auth"
import { getUsdInrRate } from "@/lib/exchange"
import CheckoutClient from "./checkout-client"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Checkout Stack | StackFind",
  description: "Securely purchase your AI tool stack in INR.",
}

interface PageProps {
  searchParams: Promise<{ slugs?: string }>
}

export default async function CheckoutStackPage({ searchParams }: PageProps) {
  const params = await searchParams
  const slugs = params.slugs?.split(",").filter(Boolean) ?? []

  if (slugs.length === 0) {
    redirect("/playground")
  }

  const [tools, usdToInrRate, user] = await Promise.all([
    getToolsBySlugs(slugs),
    getUsdInrRate(),
    getServerUser()
  ])

  if (!user) {
    // Force login if trying to pay
    redirect(`/login?callbackUrl=/checkout/stack?slugs=${params.slugs}`)
  }

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Suspense fallback={<CheckoutLoader />}>
        <CheckoutClient 
          tools={tools} 
          usdToInrRate={usdToInrRate} 
          userEmail={user.email}
        />
      </Suspense>
    </main>
  )
}

function CheckoutLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
