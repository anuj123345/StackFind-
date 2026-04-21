import { Footer } from "@/components/footer"
import { PlaygroundClient } from "@/components/playground/playground-client"
import { getPlaygroundTools, getUserProfile } from "@/lib/queries"
import { getIsAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const metadata = { title: "Stack Playground — StackFind" }

export default async function PlaygroundPage() {
  const isAuthenticated = await getIsAuthenticated()
  
  if (!isAuthenticated) {
    redirect("/login?callbackUrlURI=/playground")
  }

  const [tools, profile] = await Promise.all([
    getPlaygroundTools(),
    getUserProfile(),
  ])

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <main className="pt-28 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <PlaygroundClient 
            tools={tools} 
            isAuthenticated={isAuthenticated} 
            profile={profile}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
