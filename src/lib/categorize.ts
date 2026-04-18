// Shared category detection used by cron/discover and submit flow

const TOPIC_MAP: Record<string, string> = {
  "artificial-intelligence":  "chatbots",
  "developer-tools":          "coding",
  "developer-tools-1":        "coding",
  "productivity":             "productivity",
  "marketing":                "marketing",
  "design-tools":             "image-generation",
  "video-editing":            "video",
  "video":                    "video",
  "writing-tools":            "writing",
  "writing":                  "writing",
  "seo":                      "seo",
  "no-code":                  "automation",
  "automation":               "automation",
  "task-management":          "productivity",
  "customer-success":         "marketing",
  "sales":                    "marketing",
  "social-media-tools":       "marketing",
  "email-marketing":          "marketing",
  "image-generation":         "image-generation",
  "text-to-image":            "image-generation",
  "photo-editing":            "image-generation",
  "text-to-video":            "video",
  "voice":                    "chatbots",
  "chatbots":                 "chatbots",
  "code-review":              "coding",
  "coding-assistant":         "coding",
  "analytics":                "analytics",
  "data-science":             "analytics",
  "research":                 "research",
  "education":                "education",
  "health-and-fitness":       "health",
  "finance":                  "finance",
  "legal":                    "legal",
  "human-resources":          "hr",
  "recruiting":               "hr",
  "customer-support":         "customer-support",
  "audio":                    "audio",
  "music":                    "audio",
  "podcasting":               "audio",
  "speech-recognition":       "audio",
  "3d":                       "3d",
  "gaming":                   "gaming",
  "security":                 "security",
  "translation":              "translation",
}

const KEYWORD_RULES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["code", "coding", "developer", "github", "ide", "programming", "sql", "api", "debug", "copilot", "compiler"], category: "coding" },
  { keywords: ["image", "photo", "picture", "art", "design", "illustration", "stable diffusion", "text-to-image", "generate image", "midjourney"], category: "image-generation" },
  { keywords: ["video", "animation", "avatar", "talking head", "text-to-video", "film", "clip", "footage", "reel"], category: "video" },
  { keywords: ["write", "writing", "blog", "content", "copy", "article", "essay", "email", "newsletter", "paraphrase"], category: "writing" },
  { keywords: ["seo", "search engine", "rank", "keyword research", "backlink", "serp", "organic traffic"], category: "seo" },
  { keywords: ["automate", "automation", "workflow", "zapier", "no-code", "nocode", "integration", "trigger", "pipeline"], category: "automation" },
  { keywords: ["market", "ads", "advertising", "social media", "campaign", "brand", "growth", "lead", "funnel", "crm"], category: "marketing" },
  { keywords: ["productivity", "task", "calendar", "schedule", "focus", "notes", "meeting", "transcrib", "summary"], category: "productivity" },
  { keywords: ["chat", "chatbot", "assistant", "conversation", "llm", "language model", "gpt", "ai model", "talk"], category: "chatbots" },
  { keywords: ["india", "hindi", "bharat", "indian", "rupee", "upi", "desi", "vernacular", "regional language"], category: "made-in-india" },
]

export function detectCategories(
  name: string,
  tagline: string,
  desc: string,
  phTopics: string[] = []
): string[] {
  const cats = new Set<string>()
  const text = `${name} ${tagline} ${desc}`.toLowerCase()

  for (const topic of phTopics) {
    const mapped = TOPIC_MAP[topic]
    if (mapped) cats.add(mapped)
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      cats.add(rule.category)
    }
  }

  if (cats.size === 0) cats.add("chatbots")

  return [...cats].slice(0, 3)
}

export function detectIndia(name: string, tagline: string, desc: string): boolean {
  const text = `${name} ${tagline} ${desc}`.toLowerCase()
  return ["india", "hindi", "bharat", "indian", "rupee", "upi", "desi", "vernacular", "iit", "ola ", "jio", "tata "].some(kw => text.includes(kw))
}

export function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
}
