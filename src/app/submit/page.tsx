import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SubmitForm } from "@/components/submit/submit-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Submit Your AI Tool — StackFind",
  description: "List your AI tool on StackFind. Reach Indian founders and developers actively looking for AI tools.",
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />
      <main className="pt-28 pb-24 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Two-column asymmetric layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

            {/* ── Left: Form ── */}
            <div>
              <div className="mb-1">
                <span
                  className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: "#C4B0A0" }}
                >
                  Submit
                </span>
              </div>
              <h1
                className="font-black leading-[1.05] mb-3"
                style={{
                  fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  color: "#1C1611",
                  letterSpacing: "-0.02em",
                }}
              >
                List your<br />AI tool
              </h1>
              <p className="mb-10" style={{ color: "#7A6A57", fontSize: "1rem", lineHeight: "1.6", maxWidth: "38ch" }}>
                Free. We review within 24–48 hours and place your tool in the right category automatically.
              </p>

              <SubmitForm />
            </div>

            {/* ── Right: Process sidebar ── */}
            <aside className="hidden lg:block pt-2">
              {/* Sticky on scroll */}
              <div className="sticky top-28">

                {/* Process steps */}
                <div className="mb-10">
                  <p
                    className="text-[0.625rem] font-semibold tracking-[0.16em] uppercase mb-6"
                    style={{ color: "#C4B0A0" }}
                  >
                    What happens
                  </p>
                  <div className="flex flex-col gap-7">
                    {[
                      ["01", "We fetch your website and verify it's live and legitimate."],
                      ["02", "Your tool is auto-categorised by name and description."],
                      ["03", "A human reviews and approves within 24–48 hours."],
                      ["04", "Your tool goes live and appears in the right categories."],
                    ].map(([n, text]) => (
                      <div key={n} className="flex gap-4 items-start">
                        <span
                          className="shrink-0 font-black tabular-nums leading-none mt-0.5"
                          style={{
                            fontFamily: "'Bricolage Grotesque Variable', sans-serif",
                            fontSize: "1.375rem",
                            color: "rgba(196,176,160,0.5)",
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {n}
                        </span>
                        <p style={{ color: "#7A6A57", fontSize: "0.875rem", lineHeight: "1.55" }}>
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(140,110,80,0.12)", marginBottom: "1.5rem" }} />

                {/* Facts */}
                <div className="flex flex-col gap-3">
                  {[
                    ["Free forever", "No payment, no featured upsells."],
                    ["Auto-categorised", "Keyword matching puts you in the right place."],
                    ["INR-first audience", "Founders and developers looking for tools that work in India."],
                  ].map(([title, desc]) => (
                    <div key={title}>
                      <p className="text-sm font-semibold" style={{ color: "#1C1611" }}>{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#C4B0A0" }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
