import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'; // 本番環境かどうかを判定

const nextConfig: NextConfig = {
  output: 'export',
  // 開発環境ではbasePathとassetPrefixを無効にする
  basePath: isProd ? '/Kurodev-tool-portal' : '',
  assetPrefix: isProd ? '/Kurodev-tool-portal/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;