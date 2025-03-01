import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  eslint: {
    // This will ignore ESLint errors during the build process
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
