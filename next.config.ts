import type { NextConfig } from "next";

// GitHub Pagesでのデプロイ時は常にbasePathを適用
const isProd = process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  // 本番環境またはGitHub ActionsではbasePathとassetPrefixを適用
  basePath: isProd ? '/Kurodev-tool-portal' : '',
  assetPrefix: isProd ? '/Kurodev-tool-portal/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;