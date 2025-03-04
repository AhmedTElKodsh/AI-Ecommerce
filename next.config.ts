import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  eslint: {
    // This will ignore ESLint errors during the build process
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This will ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
