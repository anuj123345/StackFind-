import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { NewsletterBanner } from "@/components/home/newsletter-banner"

export const metadata = { title: "Newsletter — StackFind" }

export default function NewsletterPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />
      <main className="pt-32 pb-8 px-4">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <span
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "#C4B0A0" }}
          >
            Weekly Digest
          </span>
          <h1
            className="font-black leading-tight mt-2 mb-4"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "#1C1611",
            }}
          >
            The AI tools weekly
          </h1>
          <p className="max-w-md mx-auto" style={{ color: "#7A6A57", fontSize: "1.0625rem", lineHeight: "1.6" }}>
            Every Monday — new AI tools, top news from the AI world, and what builders are saying. No fluff.
          </p>
        </div>

        {/* What you get */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🛠️", title: "New AI tools", desc: "Freshly discovered tools curated for builders and creators" },
              { icon: "📰", title: "AI news digest", desc: "Top stories from AI labs, startups, and founders worldwide" },
              { icon: "💬", title: "Community buzz", desc: "What builders are actually saying about tools on Reddit" },
            ].map(item => (
              <div
                key={item.title}
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3
                  className="font-bold text-sm mb-1"
                  style={{ color: "#1C1611" }}
                >
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#7A6A57" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <NewsletterBanner />
      <Footer />
    </div>
  )
}
