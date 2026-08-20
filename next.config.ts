import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/v1/realizzare-events/",
          destination: "/api/v1/realizzare-events",
        },
        {
          source: "/api/:path*/",
          destination: "/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
