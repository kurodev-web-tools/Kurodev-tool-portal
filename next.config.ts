import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Kurodev-tools-portal',
  assetPrefix: '/Kurodev-tools-portal/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;