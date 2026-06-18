import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/rotaract-district-portal',
  assetPrefix: '/rotaract-district-portal/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
