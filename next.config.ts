import type { NextConfig } from "next";

// GitHub Pagesでのデプロイ時は常にbasePathを適用
const isProd = process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // 開発環境では静的エクスポートを無効化
  output: isProd ? 'export' : undefined,
  distDir: isProd ? 'out' : '.next',
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
  // パフォーマンス最適化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // バンドル分析
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;