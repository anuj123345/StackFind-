import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FoundersClient } from "@/components/founders/founders-client"

export const metadata = { title: "AI Founders — StackFind" }

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
  region: "india" | "global"
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
    avatar: "/api/avatar/bhash",
    twitter: "bhash",
    linkedin: "bhavishaggarwal",
    tags: ["LLM", "Consumer AI", "Mobility"],
    region: "india",
  },
  {
    slug: "vivek-raghunathan",
    name: "Vivek Raghunathan",
    role: "Co-founder & CEO",
    company: "Sarvam AI",
    companyUrl: "https://sarvam.ai",
    city: "Bengaluru",
    bio: "Building full-stack AI for India. Sarvam AI creates India-first language models and voice AI for Indic languages. Ex-VP YouTube India.",
    avatar: "/api/avatar/vivek_vr",
    twitter: "vivek_vr",
    linkedin: "vivekraghunathan",
    tags: ["Indic LLM", "Voice AI", "Foundation Model"],
    region: "india",
  },
  {
    slug: "pratyush-kumar",
    name: "Pratyush Kumar",
    role: "Co-founder",
    company: "Sarvam AI",
    companyUrl: "https://sarvam.ai",
    city: "Bengaluru",
    bio: "AI researcher and co-founder at Sarvam AI. Previously a researcher at Microsoft Research India, working on NLP for low-resource languages.",
    avatar: "/api/avatar/pratyush103",
    twitter: "pratyush103",
    linkedin: "pratyush-kumar-b3540824",
    tags: ["NLP", "Research", "Indic Languages"],
    region: "india",
  },
  {
    slug: "raghu-ravinutala",
    name: "Raghu Ravinutala",
    role: "Co-founder & CEO",
    company: "Yellow.ai",
    companyUrl: "https://yellow.ai",
    city: "Bengaluru",
    bio: "Building the world's leading conversational AI platform. Yellow.ai powers customer service automation for enterprises across 35+ countries.",
    avatar: "/api/avatar/raghu_rv",
    twitter: "raghu_rv",
    linkedin: "raghuraveen",
    tags: ["Conversational AI", "Enterprise", "CX Automation"],
    region: "india",
  },
  {
    slug: "aakrit-vaish",
    name: "Aakrit Vaish",
    role: "Co-founder & CEO",
    company: "Haptik",
    companyUrl: "https://haptik.ai",
    city: "Mumbai",
    bio: "Pioneer of conversational AI in India. Haptik was acquired by Reliance Jio for $100M+ and now powers AI assistants at scale across India.",
    avatar: "/api/avatar/aakritv",
    twitter: "aakritv",
    linkedin: "aakritvaish",
    tags: ["Chatbots", "Enterprise AI", "Jio"],
    region: "india",
  },
  {
    slug: "ragy-thomas",
    name: "Ragy Thomas",
    role: "Founder & CEO",
    company: "Sprinklr",
    companyUrl: "https://sprinklr.com",
    city: "New York / India",
    bio: "Built Sprinklr into a $3B+ unified customer experience platform. The only Indian-founded AI company to go public on NYSE. Deeply focused on AI-driven CXM.",
    avatar: "/api/avatar/ragythomas",
    twitter: "ragythomas",
    linkedin: "ragythomas",
    tags: ["CXM", "Enterprise AI", "NYSE Listed"],
    region: "india",
  },
  {
    slug: "sridhar-vembu",
    name: "Sridhar Vembu",
    role: "Founder & CEO",
    company: "Zoho",
    companyUrl: "https://zoho.com",
    city: "Tenkasi, Tamil Nadu",
    bio: "Bootstrapped Zoho to $1B+ revenue serving 100M+ users. Now betting big on AI-first SaaS with Zoho Zia and next-gen AI tools — all built in rural India.",
    avatar: "/api/avatar/svembu",
    twitter: "svembu",
    linkedin: "sridharvembu",
    tags: ["SaaS", "Bootstrapped", "AI-first"],
    region: "india",
  },
  {
    slug: "swapnil-jain",
    name: "Swapnil Jain",
    role: "Co-founder & CEO",
    company: "Observe.AI",
    companyUrl: "https://observe.ai",
    city: "San Francisco / India",
    bio: "Building the intelligence layer for contact centers. Observe.AI uses AI to analyze 100% of customer calls, helping agents perform better in real time.",
    avatar: "/api/avatar/swapniljain",
    twitter: "swapniljain",
    linkedin: "swapniljain7",
    tags: ["Contact Center AI", "Voice AI", "Series C"],
    region: "india",
  },
  {
    slug: "umesh-sachdev",
    name: "Umesh Sachdev",
    role: "Co-founder & CEO",
    company: "Uniphore",
    companyUrl: "https://uniphore.com",
    city: "Chennai",
    bio: "Uniphore is the global leader in Conversational AI & Automation. Uses multimodal AI (voice, video, text) to transform how enterprises interact with customers.",
    avatar: "/api/avatar/umeshsachdev",
    twitter: "umeshsachdev",
    linkedin: "umeshsachdev",
    tags: ["Conversational AI", "Automation", "Enterprise"],
    region: "india",
  },
  {
    slug: "ashwini-asokan",
    name: "Ashwini Asokan",
    role: "Co-founder & CEO",
    company: "Mad Street Den / Vue.ai",
    companyUrl: "https://vue.ai",
    city: "Chennai",
    bio: "Building AI for retail and fashion. Vue.ai uses computer vision and AI to power product discovery, personalization, and automation for global retailers.",
    avatar: "/api/avatar/ash_asokan",
    twitter: "ash_asokan",
    linkedin: "ashwiniasokan",
    tags: ["Computer Vision", "Retail AI", "Fashion Tech"],
    region: "india",
  },
  {
    slug: "sourabh-gupta",
    name: "Sourabh Gupta",
    role: "Co-founder & CEO",
    company: "Skit.ai",
    companyUrl: "https://skit.ai",
    city: "Bengaluru",
    bio: "Skit.ai (formerly Vernacular.ai) builds voice AI agents for enterprise call centers. Their AI handles millions of customer calls in regional Indian languages.",
    avatar: "/api/avatar/sourabhgupta_ai",
    twitter: "sourabhgupta_ai",
    linkedin: "sourabhguptaai",
    tags: ["Voice AI", "Regional Languages", "Call Center"],
    region: "india",
  },
  {
    slug: "abhinav-shashank",
    name: "Abhinav Shashank",
    role: "Co-founder & CEO",
    company: "Innovaccer",
    companyUrl: "https://innovaccer.com",
    city: "San Francisco / India",
    bio: "Building AI for healthcare. Innovaccer's Health Data Platform unifies patient data and deploys AI models that help hospitals improve outcomes and reduce costs.",
    avatar: "/api/avatar/abhinavshashank",
    twitter: "abhinavshashank",
    linkedin: "abhinavshashank",
    tags: ["Healthcare AI", "Data Platform", "Series E"],
    region: "india",
  },

  // ── Global AI Founders ────────────────────────────────────────────────────
  {
    slug: "sam-altman",
    name: "Sam Altman",
    role: "CEO",
    company: "OpenAI",
    companyUrl: "https://openai.com",
    city: "San Francisco",
    bio: "Leading the most consequential AI lab in history. Under Sam's leadership, OpenAI shipped GPT-4, ChatGPT (now 200M+ users), Sora, and o1. Previously president of Y Combinator.",
    avatar: "/api/avatar/sama",
    twitter: "sama",
    linkedin: "samaltman",
    tags: ["LLM", "ChatGPT", "AGI"],
    region: "global",
  },
  {
    slug: "dario-amodei",
    name: "Dario Amodei",
    role: "Co-founder & CEO",
    company: "Anthropic",
    companyUrl: "https://anthropic.com",
    city: "San Francisco",
    bio: "Building safer AI systems at Anthropic. Created the Claude family of models with a focus on AI safety and interpretability. Previously VP of Research at OpenAI.",
    avatar: "/api/avatar/DarioAmodei",
    twitter: "DarioAmodei",
    linkedin: "dario-amodei-3934ba16",
    tags: ["AI Safety", "Claude", "Research"],
    region: "global",
  },
  {
    slug: "demis-hassabis",
    name: "Demis Hassabis",
    role: "Co-founder & CEO",
    company: "Google DeepMind",
    companyUrl: "https://deepmind.google",
    city: "London",
    bio: "Nobel Prize winner (Chemistry, 2024) and AI pioneer. Co-founded DeepMind which created AlphaFold, AlphaGo, and Gemini. Merged with Google Brain to lead the world's largest AI research lab.",
    avatar: "/api/avatar/demishassabis",
    twitter: "demishassabis",
    linkedin: "demishassabis",
    tags: ["DeepMind", "AlphaFold", "Nobel Prize"],
    region: "global",
  },
  {
    slug: "andrej-karpathy",
    name: "Andrej Karpathy",
    role: "Founder",
    company: "Eureka Labs",
    companyUrl: "https://eurekalabs.ai",
    city: "San Francisco",
    bio: "AI educator and researcher building AI-native education at Eureka Labs. Former Director of AI at Tesla (Autopilot) and founding member of OpenAI. Creator of the legendary neural networks course.",
    avatar: "/api/avatar/karpathy",
    twitter: "karpathy",
    linkedin: "andrej-karpathy-9a650716",
    tags: ["Education", "Tesla", "Neural Networks"],
    region: "global",
  },
  {
    slug: "yann-lecun",
    name: "Yann LeCun",
    role: "Chief AI Scientist",
    company: "Meta AI",
    companyUrl: "https://ai.meta.com",
    city: "New York",
    bio: "Turing Award winner and father of convolutional neural networks. Chief AI Scientist at Meta, open-sourcing Llama models for the world. Vocal advocate for open-source AI development.",
    avatar: "/api/avatar/ylecun",
    twitter: "ylecun",
    linkedin: "yann-lecun-0b999b5a",
    tags: ["Meta AI", "Llama", "Open Source"],
    region: "global",
  },
  {
    slug: "ilya-sutskever",
    name: "Ilya Sutskever",
    role: "Co-founder",
    company: "Safe Superintelligence (SSI)",
    companyUrl: "https://ssi.inc",
    city: "Palo Alto",
    bio: "Co-founded OpenAI and served as Chief Scientist, contributing to GPT series and DALL·E. Now building Safe Superintelligence (SSI) with a singular focus on making superintelligent AI that is safe.",
    avatar: "/api/avatar/ilyasut",
    twitter: "ilyasut",
    linkedin: "ilya-sutskever",
    tags: ["Superintelligence", "AI Safety", "OpenAI"],
    region: "global",
  },
  {
    slug: "clement-delangue",
    name: "Clément Delangue",
    role: "Co-founder & CEO",
    company: "Hugging Face",
    companyUrl: "https://huggingface.co",
    city: "New York",
    bio: "Built Hugging Face into the GitHub of machine learning — home to 500K+ models, datasets, and spaces. Democratizing AI by making models and tools open and accessible to every developer.",
    avatar: "/api/avatar/ClementDelangue",
    twitter: "ClementDelangue",
    linkedin: "clementdelangue",
    tags: ["Open Source", "ML Hub", "Transformers"],
    region: "global",
  },
  {
    slug: "arthur-mensch",
    name: "Arthur Mensch",
    role: "Co-founder & CEO",
    company: "Mistral AI",
    companyUrl: "https://mistral.ai",
    city: "Paris",
    bio: "Building Europe's most powerful AI lab. Mistral AI has released open-weight models (Mistral 7B, Mixtral, Mistral Large) rivaling proprietary models. Raised $1B+ at a $6B valuation.",
    avatar: "/api/avatar/arthurmensch",
    twitter: "arthurmensch",
    linkedin: "arthur-mensch",
    tags: ["Open Weights", "Europe", "LLM"],
    region: "global",
  },
  {
    slug: "aidan-gomez",
    name: "Aidan Gomez",
    role: "Co-founder & CEO",
    company: "Cohere",
    companyUrl: "https://cohere.com",
    city: "Toronto",
    bio: "Co-authored the original Transformer paper ('Attention Is All You Need') at age 20. Now building enterprise-focused LLMs at Cohere, helping businesses deploy AI securely at scale.",
    avatar: "/api/avatar/aidangomez",
    twitter: "aidangomez",
    linkedin: "aidan-gomez",
    tags: ["Transformers", "Enterprise AI", "NLP"],
    region: "global",
  },
  {
    slug: "emad-mostaque",
    name: "Emad Mostaque",
    role: "Founder",
    company: "Stability AI",
    companyUrl: "https://stability.ai",
    city: "London",
    bio: "Founded Stability AI and released Stable Diffusion — the open-source image generation model that sparked the generative AI art revolution. Strong believer in open, decentralized AI development.",
    avatar: "/api/avatar/EMostaque",
    twitter: "EMostaque",
    linkedin: "emostaque",
    tags: ["Stable Diffusion", "Open Source", "Image AI"],
    region: "global",
  },
  {
    slug: "mustafa-suleyman",
    name: "Mustafa Suleyman",
    role: "CEO",
    company: "Microsoft AI",
    companyUrl: "https://microsoft.com/ai",
    city: "London / Seattle",
    bio: "Co-founded DeepMind with Demis Hassabis, then built Inflection AI (Pi assistant) before joining Microsoft as CEO of Microsoft AI. One of the most influential figures in applied AI.",
    avatar: "/api/avatar/mustafasuleyman",
    twitter: "mustafasuleyman",
    linkedin: "mustafa-suleyman-02409aa",
    tags: ["DeepMind", "Microsoft", "Applied AI"],
    region: "global",
  },
]

export default function FoundersPage() {
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
            AI Founders
          </h1>
          <p className="mb-12 max-w-lg" style={{ color: "#7A6A57", fontSize: "1.0625rem", lineHeight: "1.6" }}>
            The builders shaping the AI era — from India's homegrown foundation models to the global labs redefining intelligence.
          </p>

          <FoundersClient founders={FOUNDERS} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
