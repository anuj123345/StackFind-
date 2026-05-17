"use server"

export interface RedditPost {
  title: string
  score: number
  subreddit: string
  url: string
  numComments: number
  selftext: string
  createdUtc: number
}

export async function getRedditInsights(toolName: string): Promise<RedditPost[]> {
  try {
    const query = encodeURIComponent(`${toolName} review OR tutorial OR experience OR project`)
    const response = await fetch(
      `https://www.reddit.com/search.json?q=${query}&sort=top&t=year&limit=8&type=link`,
      { 
        headers: { 
          Accept: "application/json",
          "User-Agent": "web:StackFind:v1.0.0 (by /u/stackfind)" 
        },
        next: { revalidate: 3600 } // cache for an hour
      }
    )

    if (!response.ok) {
      console.error(`Reddit API failed with status ${response.status}`);
      return []
    }

    const json = await response.json()
    const items = (json?.data?.children ?? []).map((c: any) => ({
      title: c.data.title as string,
      score: c.data.score as number,
      subreddit: c.data.subreddit as string,
      url: `https://reddit.com${c.data.permalink}`,
      numComments: c.data.num_comments as number,
      selftext: ((c.data.selftext as string) || "").slice(0, 300),
      createdUtc: c.data.created_utc as number,
    }))
    
    return items
  } catch (error) {
    console.error("Failed to fetch Reddit insights:", error)
    return []
  }
}
