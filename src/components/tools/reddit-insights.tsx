"use client"

import { useEffect, useState } from "react"
import { MessageSquare, TrendingUp, ExternalLink } from "lucide-react"

interface RedditPost {
  title: string
  score: number
  subreddit: string
  url: string
  numComments: number
  selftext: string
  createdUtc: number
}

function timeAgo(utc: number): string {
  const diff = Math.floor(Date.now() / 1000) - utc
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`
  return `${Math.floor(diff / 31536000)}y ago`
}

function SkeletonPost() {
  return (
    <div
      className="rounded-xl p-4 animate-pulse"
      style={{ background: "rgba(140,110,80,0.03)", border: "1px solid rgba(140,110,80,0.08)" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 flex-shrink-0">
          <div className="h-3 w-6 rounded mb-1" style={{ background: "rgba(140,110,80,0.1)" }} />
          <div className="h-2 w-4 rounded" style={{ background: "rgba(140,110,80,0.08)" }} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded w-4/5" style={{ background: "rgba(140,110,80,0.1)" }} />
          <div className="h-3 rounded w-3/5" style={{ background: "rgba(140,110,80,0.07)" }} />
          <div className="flex gap-2 mt-2">
            <div className="h-4 w-16 rounded-full" style={{ background: "rgba(140,110,80,0.08)" }} />
            <div className="h-4 w-20 rounded-full" style={{ background: "rgba(140,110,80,0.06)" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RedditInsights({ toolName }: { toolName: string }) {
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const query = encodeURIComponent(`${toolName} review OR tutorial OR experience OR project`)
    fetch(
      `https://www.reddit.com/search.json?q=${query}&sort=top&t=year&limit=8&type=link`,
      { headers: { Accept: "application/json" } }
    )
      .then(r => {
        if (!r.ok) throw new Error("fetch failed")
        return r.json()
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(json => {
        const items = (json?.data?.children ?? []).map((c: any) => ({
          title: c.data.title as string,
          score: c.data.score as number,
          subreddit: c.data.subreddit as string,
          url: `https://reddit.com${c.data.permalink}`,
          numComments: c.data.num_comments as number,
          selftext: ((c.data.selftext as string) || "").slice(0, 300),
          createdUtc: c.data.created_utc as number,
        }))
        setPosts(items)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [toolName])

  if (error) return null
  if (!loading && posts.length === 0) return null

  return (
    <>
      {/* Community Discussions */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(140,110,80,0.1)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-bold text-sm tracking-wide uppercase"
            style={{ color: "#C4B0A0", letterSpacing: "0.1em" }}
          >
            Community Discussions
          </h2>
          {!loading && (
            <a
              href={`https://www.reddit.com/search/?q=${encodeURIComponent(toolName)}&sort=top`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: "#FF4500" }}
            >
              View all on Reddit <ExternalLink size={10} />
            </a>
          )}
        </div>

        <div className="space-y-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonPost key={i} />)
            : posts.map((post, i) => (
                <a
                  key={i}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-4 transition-all duration-150 hover:scale-[1.01]"
                  style={{
                    background: "rgba(140,110,80,0.03)",
                    border: "1px solid rgba(140,110,80,0.08)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Score */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-0.5" style={{ minWidth: 36 }}>
                      <TrendingUp size={12} style={{ color: "#FF4500" }} />
                      <span className="text-xs font-bold tabular-nums mt-0.5" style={{ color: "#FF4500" }}>
                        {post.score >= 1000 ? `${(post.score / 1000).toFixed(1)}k` : post.score}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug mb-1.5 line-clamp-2" style={{ color: "#1C1611" }}>
                        {post.title}
                      </p>
                      {post.selftext && (
                        <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: "#7A6A57" }}>
                          {post.selftext}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,69,0,0.08)", color: "#FF4500" }}
                        >
                          r/{post.subreddit}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#C4B0A0" }}>
                          <MessageSquare size={9} />
                          {post.numComments} comments
                        </span>
                        <span className="text-[10px]" style={{ color: "#C4B0A0" }}>
                          {timeAgo(post.createdUtc)}
                        </span>
                      </div>
                    </div>

                    <ExternalLink size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#C4B0A0" }} />
                  </div>
                </a>
              ))}
        </div>
      </div>

      {/* Reddit Buzz sidebar card — rendered separately via prop, shown inline here for mobile */}
      {!loading && posts.length > 0 && (
        <div
          className="rounded-2xl p-5 lg:hidden"
          style={{ background: "rgba(255,69,0,0.03)", border: "1px solid rgba(255,69,0,0.1)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#FF4500">
              <circle cx="10" cy="10" r="10"/>
              <path fill="white" d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.08zM7.5 11a1 1 0 111 1 1 1 0 01-1-1zm5.6 2.71a3.58 3.58 0 01-2.1.52 3.58 3.58 0 01-2.1-.52.27.27 0 01.38-.38 3.27 3.27 0 001.72.4 3.27 3.27 0 001.72-.4.27.27 0 01.38.38zm-.1-1.71a1 1 0 111-1 1 1 0 01-1 1z"/>
            </svg>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#FF4500" }}>Reddit Buzz</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-bold text-base" style={{ color: "#FF4500" }}>
                {Math.max(...posts.map(p => p.score)).toLocaleString()}
              </p>
              <p className="text-[10px]" style={{ color: "#7A6A57" }}>top score</p>
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "#1C1611" }}>
                {posts.reduce((a, p) => a + p.numComments, 0).toLocaleString()}
              </p>
              <p className="text-[10px]" style={{ color: "#7A6A57" }}>comments</p>
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "#1C1611" }}>
                {new Set(posts.map(p => p.subreddit)).size}
              </p>
              <p className="text-[10px]" style={{ color: "#7A6A57" }}>subreddits</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Sidebar-only buzz card for desktop
export function RedditBuzzSidebar({ toolName }: { toolName: string }) {
  const [posts, setPosts] = useState<RedditPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = encodeURIComponent(`${toolName} review OR tutorial OR experience OR project`)
    fetch(`https://www.reddit.com/search.json?q=${query}&sort=top&t=year&limit=8&type=link`)
      .then(r => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(json => {
        const items = (json?.data?.children ?? []).map((c: any) => ({
          title: c.data.title as string,
          score: c.data.score as number,
          subreddit: c.data.subreddit as string,
          url: `https://reddit.com${c.data.permalink}`,
          numComments: c.data.num_comments as number,
          selftext: "",
          createdUtc: c.data.created_utc as number,
        }))
        setPosts(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [toolName])

  if (loading || posts.length === 0) return null

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,69,0,0.03)", border: "1px solid rgba(255,69,0,0.1)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="#FF4500">
          <circle cx="10" cy="10" r="10"/>
          <path fill="white" d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.08zM7.5 11a1 1 0 111 1 1 1 0 01-1-1zm5.6 2.71a3.58 3.58 0 01-2.1.52 3.58 3.58 0 01-2.1-.52.27.27 0 01.38-.38 3.27 3.27 0 001.72.4 3.27 3.27 0 001.72-.4.27.27 0 01.38.38zm-.1-1.71a1 1 0 111-1 1 1 0 01-1 1z"/>
        </svg>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#FF4500" }}>Reddit Buzz</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span style={{ color: "#7A6A57" }}>Top post score</span>
          <span className="font-bold" style={{ color: "#FF4500" }}>
            {Math.max(...posts.map(p => p.score)).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "#7A6A57" }}>Total comments</span>
          <span className="font-bold" style={{ color: "#1C1611" }}>
            {posts.reduce((a, p) => a + p.numComments, 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "#7A6A57" }}>Subreddits</span>
          <span className="font-bold" style={{ color: "#1C1611" }}>
            {new Set(posts.map(p => p.subreddit)).size}
          </span>
        </div>
      </div>
    </div>
  )
}
