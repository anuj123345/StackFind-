import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FoundersClient } from "@/components/founders/founders-client"

export const dynamic = "force-dynamic"
export const metadata = { title: "Indian AI Founders — StackFind" }

export interface FounderProfile {
  slug: string
  name: string
  role: string
  company: string
  companyUrl: string
  city: string
  bio: string
  avatar: string | null
  twitter: string | null
  linkedin: string | null
  tags: string[]
}

// Curated list of real Indian AI founders
export const FOUNDERS: FounderProfile[] = [
  {
    slug: "bhavish-aggarwal",
    name: "Bhavish Aggarwal",
    role: "Founder & CEO",
    company: "Krutrim / Ola",
    companyUrl: "https://olakrutrim.com",
    city: "Bengaluru",
    bio: "Building India's first AI unicorn. Krutrim is an AI platform with a homegrown LLM trained on Indian languages and culture. Previously founded Ola Cabs.",
    avatar: "https://unavatar.io/twitter/bhash",
    twitter: "bhash",
    linkedin: "bhavishaggarwal",
    tags: ["LLM", "Consumer AI", "Mobility"],
  },
  {
    slug: "vivek-raghunathan",
    name: "Vivek Raghunathan",
    role: "Co-founder & CEO",
    company: "Sarvam AI",
    companyUrl: "https://sarvam.ai",
    city: "Bengaluru",
    bio: "Building full-stack AI for India. Sarvam AI creates India-first language models and voice AI for Indic languages. Ex-VP YouTube India.",
    avatar: "https://unavatar.io/twitter/vivek_vr",
    twitter: "vivek_vr",
    linkedin: "vivekraghunathan",
    tags: ["Indic LLM", "Voice AI", "Foundation Model"],
  },
  {
    slug: "pratyush-kumar",
    name: "Pratyush Kumar",
    role: "Co-founder",
    company: "Sarvam AI",
    companyUrl: "https://sarvam.ai",
    city: "Bengaluru",
    bio: "AI researcher and co-founder at Sarvam AI. Previously a researcher at Microsoft Research India, working on NLP for low-resource languages.",
    avatar: "https://unavatar.io/twitter/pratyush103",
    twitter: "pratyush103",
    linkedin: "pratyush-kumar-b3540824",
    tags: ["NLP", "Research", "Indic Languages"],
  },
  {
    slug: "raghu-ravinutala",
    name: "Raghu Ravinutala",
    role: "Co-founder & CEO",
    company: "Yellow.ai",
    companyUrl: "https://yellow.ai",
    city: "Bengaluru",
    bio: "Building the world's leading conversational AI platform. Yellow.ai powers customer service automation for enterprises across 35+ countries.",
    avatar: "https://unavatar.io/twitter/raghu_rv",
    twitter: "raghu_rv",
    linkedin: "raghuraveen",
    tags: ["Conversational AI", "Enterprise", "CX Automation"],
  },
  {
    slug: "aakrit-vaish",
    name: "Aakrit Vaish",
    role: "Co-founder & CEO",
    company: "Haptik",
    companyUrl: "https://haptik.ai",
    city: "Mumbai",
    bio: "Pioneer of conversational AI in India. Haptik was acquired by Reliance Jio for $100M+ and now powers AI assistants at scale across India.",
    avatar: "https://unavatar.io/twitter/aakritv",
    twitter: "aakritv",
    linkedin: "aakritvaish",
    tags: ["Chatbots", "Enterprise AI", "Jio"],
  },
  {
    slug: "ragy-thomas",
    name: "Ragy Thomas",
    role: "Founder & CEO",
    company: "Sprinklr",
    companyUrl: "https://sprinklr.com",
    city: "New York / India",
    bio: "Built Sprinklr into a $3B+ unified customer experience platform. The only Indian-founded AI company to go public on NYSE. Deeply focused on AI-driven CXM.",
    avatar: "https://unavatar.io/twitter/ragythomas",
    twitter: "ragythomas",
    linkedin: "ragythomas",
    tags: ["CXM", "Enterprise AI", "NYSE Listed"],
  },
  {
    slug: "sridhar-vembu",
    name: "Sridhar Vembu",
    role: "Founder & CEO",
    company: "Zoho",
    companyUrl: "https://zoho.com",
    city: "Tenkasi, Tamil Nadu",
    bio: "Bootstrapped Zoho to $1B+ revenue serving 100M+ users. Now betting big on AI-first SaaS with Zoho Zia and next-gen AI tools — all built in rural India.",
    avatar: "https://unavatar.io/twitter/svembu",
    twitter: "svembu",
    linkedin: "sridharvembu",
    tags: ["SaaS", "Bootstrapped", "AI-first"],
  },
  {
    slug: "swapnil-jain",
    name: "Swapnil Jain",
    role: "Co-founder & CEO",
    company: "Observe.AI",
    companyUrl: "https://observe.ai",
    city: "San Francisco / India",
    bio: "Building the intelligence layer for contact centers. Observe.AI uses AI to analyze 100% of customer calls, helping agents perform better in real time.",
    avatar: "https://unavatar.io/twitter/swapniljain",
    twitter: "swapniljain",
    linkedin: "swapniljain7",
    tags: ["Contact Center AI", "Voice AI", "Series C"],
  },
  {
    slug: "umesh-sachdev",
    name: "Umesh Sachdev",
    role: "Co-founder & CEO",
    company: "Uniphore",
    companyUrl: "https://uniphore.com",
    city: "Chennai",
    bio: "Uniphore is the global leader in Conversational AI & Automation. Uses multimodal AI (voice, video, text) to transform how enterprises interact with customers.",
    avatar: "https://unavatar.io/twitter/umeshsachdev",
    twitter: "umeshsachdev",
    linkedin: "umeshsachdev",
    tags: ["Conversational AI", "Automation", "Enterprise"],
  },
  {
    slug: "ashwini-asokan",
    name: "Ashwini Asokan",
    role: "Co-founder & CEO",
    company: "Mad Street Den / Vue.ai",
    companyUrl: "https://vue.ai",
    city: "Chennai",
    bio: "Building AI for retail and fashion. Vue.ai uses computer vision and AI to power product discovery, personalization, and automation for global retailers.",
    avatar: "https://unavatar.io/twitter/ash_asokan",
    twitter: "ash_asokan",
    linkedin: "ashwiniasokan",
    tags: ["Computer Vision", "Retail AI", "Fashion Tech"],
  },
  {
    slug: "sourabh-gupta",
    name: "Sourabh Gupta",
    role: "Co-founder & CEO",
    company: "Skit.ai",
    companyUrl: "https://skit.ai",
    city: "Bengaluru",
    bio: "Skit.ai (formerly Vernacular.ai) builds voice AI agents for enterprise call centers. Their AI handles millions of customer calls in regional Indian languages.",
    avatar: "https://unavatar.io/twitter/sourabhgupta_ai",
    twitter: "sourabhgupta_ai",
    linkedin: "sourabhguptaai",
    tags: ["Voice AI", "Regional Languages", "Call Center"],
  },
  {
    slug: "abhinav-shashank",
    name: "Abhinav Shashank",
    role: "Co-founder & CEO",
    company: "Innovaccer",
    companyUrl: "https://innovaccer.com",
    city: "San Francisco / India",
    bio: "Building AI for healthcare. Innovaccer's Health Data Platform unifies patient data and deploys AI models that help hospitals improve outcomes and reduce costs.",
    avatar: "https://unavatar.io/twitter/abhinavshashank",
    twitter: "abhinavshashank",
    linkedin: "abhinavshashank",
    tags: ["Healthcare AI", "Data Platform", "Series E"],
  },
]

async function getFounderNews() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const res = await fetch(`${base}/api/founders/news`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.items ?? []
  } catch {
    return []
  }
}

export default async function FoundersPage() {
  const news = await getFounderNews()

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      <Navbar />
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-2">
            <span className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "#C4B0A0" }}>
              Community
            </span>
          </div>
          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontFamily: "'Bricolage Grotesque Variable', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#1C1611",
            }}
          >
            Indian AI Founders
          </h1>
          <p className="mb-12 max-w-lg" style={{ color: "#7A6A57", fontSize: "1.0625rem", lineHeight: "1.6" }}>
            The builders behind India's AI revolution — shipping foundation models, voice AI, and enterprise tools with maximum ambition.
          </p>

          <FoundersClient founders={FOUNDERS} news={news} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
