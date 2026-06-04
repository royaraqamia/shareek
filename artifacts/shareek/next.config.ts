import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.REPLIT_DEV_DOMAIN ?? "",
        `*.${process.env.REPLIT_DEV_DOMAIN ?? ""}`,
        "localhost:3000",
      ].filter(Boolean),
    },
  },
};

export default nextConfig;
