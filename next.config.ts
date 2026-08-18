import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/feed',
        destination: '/rss.xml',
      },
      {
        source: '/rss',
        destination: '/rss.xml',
      },
    ];
  },
};

export default nextConfig;
