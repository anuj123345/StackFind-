import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TOPIC_MAP = {
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
};

const KEYWORD_RULES = [
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
];

function detectCategories(name, tagline, desc, phTopics) {
  const cats = new Set();
  const text = `${name} ${tagline} ${desc}`.toLowerCase();

  for (const topic of phTopics) {
    const mapped = TOPIC_MAP[topic];
    if (mapped) cats.add(mapped);
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      cats.add(rule.category);
    }
  }

  if (cats.size === 0) cats.add("chatbots");
  return [...cats].slice(0, 3);
}

function detectIndia(name, tagline, desc) {
  const text = `${name} ${tagline} ${desc}`.toLowerCase();
  return ["india", "hindi", "bharat", "indian", "rupee", "upi", "desi", "vernacular", "iit", "ola ", "jio", "tata "].some(kw => text.includes(kw));
}

function slugify(s) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

async function fetchPH(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const dateStr = date.toISOString().split("T")[0];

  const query = `{
    posts(first: 50, order: VOTES, postedAfter: "${dateStr}T00:00:00Z", postedBefore: "${dateStr}T23:59:59Z", topic: "artificial-intelligence") {
      edges {
        node {
          name tagline description url website votesCount
          thumbnail { url }
          largeThumbnail: thumbnail { url }
          topics { edges { node { slug } } }
        }
      }
    }
  }`;

  const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`,
    },
    body: JSON.stringify({ query })
  });

  if (!res.ok) return [];
  const json = await res.json();

  return (json?.data?.posts?.edges ?? []).map(e => {
    const n = e.node;
    return {
      name: n.name,
      tagline: n.tagline ?? "",
      description: n.description ?? "",
      website: n.website || n.url,
      thumbnail: n.thumbnail?.url || n.largeThumbnail?.url,
      votesCount: n.votesCount,
      topics: n.topics.edges.map(t => t.node.slug),
    };
  });
}

async function runBackfill() {
  const { data: dbCategories } = await supabase.from("categories").select("slug, name, id");
  const catMap = {};
  for (const c of dbCategories || []) {
    catMap[c.slug] = c.id;
  }

  async function ensureCategory(slug, name) {
    if (catMap[slug]) return catMap[slug];
    const { data } = await supabase
      .from("categories")
      .insert({ slug, name, tool_count: 0 })
      .select("id")
      .single();
    if (data) {
      catMap[slug] = data.id;
      return data.id;
    }
    return null;
  }

  // First fetch all tools across 50 days
  console.log("Fetching tools from last 50 days...");
  const fetchPromises = [];
  for (let d = 1; d <= 50; d++) {
    fetchPromises.push(fetchPH(d).then(posts => ({ day: d, posts })));
  }
  const results = await Promise.all(fetchPromises);
  
  let allPosts = [];
  for (const r of results) {
    allPosts.push(...r.posts);
  }
  
  console.log(`Found ${allPosts.length} total posts. Beginning fast insert...`);

  let totalInserted = 0;
  
  // Chunk posts to avoid overwhelming db
  const chunkSize = 20;
  for (let i = 0; i < allPosts.length; i += chunkSize) {
    const chunk = allPosts.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (post) => {
      const slug = slugify(post.name);
      
      const { data: existing } = await supabase
        .from("tools")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) return;

      const isIndia = detectIndia(post.name, post.tagline, post.description);
      const catSlugs = detectCategories(post.name, post.tagline, post.description, post.topics);

      const { data: tool, error } = await supabase
        .from("tools")
        .insert({
          slug,
          name: post.name,
          tagline: post.tagline.slice(0, 160),
          description: post.description.slice(0, 2000) || null,
          website: post.website,
          logo_url: post.thumbnail || null,
          pricing_model: "freemium",
          status: "approved",
          is_made_in_india: isIndia,
          has_india_support: isIndia,
          has_inr_billing: isIndia,
          has_upi: isIndia,
          upvotes: post.votesCount || 0,
        })
        .select("id")
        .single();

      if (!tool || error) {
        return;
      }

      for (const cs of catSlugs) {
        const catId = await ensureCategory(cs, cs.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
        if (catId) {
          await supabase.from("tool_categories").insert({
            tool_id: tool.id,
            category_id: catId
          });
        }
      }
      totalInserted++;
    }));
    console.log(`Processed chunk ${i/chunkSize + 1} of ${Math.ceil(allPosts.length/chunkSize)}...`);
  }
  
  console.log(`Backfill complete. Total new tools inserted: ${totalInserted}`);
  
  const { data: [{ count }] } = await supabase.from("tools").select("*", { count: "exact", head: true });
  console.log("New Total Tools Count:", count);
}

runBackfill().catch(console.error);
