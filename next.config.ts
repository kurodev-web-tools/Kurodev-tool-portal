import type { NextConfig } from "next";

// GitHub Pagesでのデプロイ時は常にbasePathを適用
const isProd = process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  // 本番環境またはGitHub ActionsではbasePathとassetPrefixを適用
  basePath: isProd ? '/Kurodev-tool-portal' : '',
  assetPrefix: isProd ? '/Kurodev-tool-portal/' : '',
  images: {
    unoptimized: true,
  },
  // 静的エクスポート時のエラーページ処理を無効化
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // ESLintを無効化（一時的）
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;