/**
 * サイト全体の設定ファイル
 * ブランド名、メタデータなどの共通設定を管理
 */

export const siteConfig = {
  name: "Kurodev Tools",
  shortName: "Kurodev",
  description: "VTuber活動を支援する包括的なツールスイート",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/your-account",
    github: "https://github.com/your-account",
  },
  keywords: [
    "VTuber",
    "配信ツール",
    "動画制作",
    "サムネイル生成",
    "スケジュール管理",
    "企画支援",
  ],
} as const;

export type SiteConfig = typeof siteConfig;


