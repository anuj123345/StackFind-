import { Footer } from "@/components/footer"
import { PlaygroundClient } from "@/components/playground/playground-client"
import { ChatInterface } from "@/components/playground/chat-interface"
import { getPlaygroundTools, getUserProfile } from "@/lib/queries"
import { getIsAuthenticated } from "@/lib/auth"
import { getUsdInrRate } from "@/lib/exchange"
import { redirect } from "next/navigation"
import { PlaygroundTabs } from "@/components/playground/playground-tabs"

export const dynamic = "force-dynamic"
export const metadata = { title: "Stack Playground — StackFind" }

export default async function PlaygroundPage() {
  const isAuthenticated = await getIsAuthenticated()

  if (!isAuthenticated) {
    redirect("/login?callbackUrlURI=/playground")
  }

  const [tools, profile, usdToInrRate] = await Promise.all([
    getPlaygroundTools(),
    getUserProfile(),
    getUsdInrRate(),
  ])

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <main className="pt-28 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <PlaygroundTabs
            stackBuilder={
              <PlaygroundClient
                tools={tools}
                isAuthenticated={isAuthenticated}
                profile={profile}
                usdToInrRate={usdToInrRate}
              />
            }
            aiChat={<ChatInterface isAuthenticated={isAuthenticated} />}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
