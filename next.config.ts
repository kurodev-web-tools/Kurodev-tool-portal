import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/Kurodev-tool-portal',
  assetPrefix: '/Kurodev-tool-portal/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;