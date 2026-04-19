import { Footer } from "@/components/footer"
import { PlaygroundClient } from "@/components/playground/playground-client"
import { getPlaygroundTools } from "@/lib/queries"
import { getIsAuthenticated } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const metadata = { title: "Stack Playground — StackFind" }

export default async function PlaygroundPage() {
  const [tools, isAuthenticated] = await Promise.all([
    getPlaygroundTools(),
    getIsAuthenticated(),
  ])

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <main className="pt-28 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <PlaygroundClient tools={tools} isAuthenticated={isAuthenticated} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
