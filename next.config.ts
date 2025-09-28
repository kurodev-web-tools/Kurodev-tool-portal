import type { NextConfig } from "next";

// GitHub Pagesでのデプロイ時は常にbasePathを適用
const isProd = process.env.NODE_ENV === 'production' || process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // 開発環境では静的エクスポートを無効化
  output: isProd ? 'export' : undefined,
  // 静的エクスポート時のrobots.txt生成を有効化
  ...(isProd && {
    generateStaticParams: async () => {
      return [];
    },
  }),
  distDir: isProd ? 'out' : '.next',
  // 本番環境またはGitHub ActionsではbasePathとassetPrefixを適用
  basePath: isProd ? '/Kurodev-tool-portal' : '',
  assetPrefix: isProd ? '/Kurodev-tool-portal/' : '',
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 静的エクスポート時のエラーページ処理を無効化
  trailingSlash: true,
  // 静的エクスポート時のエラーページ生成を無効化
  ...(isProd && {
    generateBuildId: async () => {
      return 'build-' + Date.now();
    },
  }),
  // ESLintを無効化（一時的）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // パフォーマンス最適化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // 新しい設定オプション
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
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