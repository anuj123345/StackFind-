import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "icons.duckduckgo.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      // Keep these for any manually stored logo URLs pointing to these domains
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
