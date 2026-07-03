import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Disabled temporarily because Next.js middleware is incompatible with static HTML exports
  basePath: '/rotaract-district-portal',
  assetPrefix: '/rotaract-district-portal/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
