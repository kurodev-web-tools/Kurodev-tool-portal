'use client';

import { StatusFilter } from "@/components/ui/status-filter";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageNavigation } from "@/components/ui/page-navigation";
import { EnhancedToolsSection } from "@/components/enhanced-tools-section";
import { useQuickAccess } from "@/hooks/use-quick-access";

// ダミーデータ
const tools = [
  {
    id: "tool-1",
    title: "スケジュールカレンダー",
    description: "配信・ライブのスケジュールを管理するツール。",
    status: "beta" as const,
    href: "/tools/schedule-calendar",
    feedbackMessage: "フィードバックお待ちしております！",
    iconName: "calendar",
    color: "from-blue-500 to-cyan-500",
    stats: "利用可能",
    category: "planning",
    tags: ["スケジュール", "管理", "配信"],
    usageCount: 150,
    rating: 4.2
  },
  {
    id: "tool-7",
    title: "企画・台本サポートAI",
    description: "コンテンツの企画や台本作成をAIがサポート。",
    status: "beta" as const,
    href: "/tools/script-generator",
    feedbackMessage: "フィードバックお待ちしております！",
    iconName: "brain",
    color: "from-blue-500 to-cyan-500",
    stats: "利用可能",
    category: "planning",
    tags: ["AI", "台本", "企画"],
    usageCount: 89,
    rating: 4.5
  },
  {
    id: "tool-5",
    title: "サムネイル自動生成ツール",
    description: "動画・コンテンツのサムネイルをAIが自動生成。",
    status: "beta" as const,
    href: "/tools/thumbnail-generator",
    feedbackMessage: "フィードバックお待ちしております！",
    iconName: "image",
    color: "from-green-500 to-emerald-500",
    stats: "利用可能",
    category: "production",
    tags: ["AI", "サムネイル", "画像生成"],
    usageCount: 320,
    rating: 4.7
  },
  {
    id: "tool-11",
    title: "コンセプト・ブランディング提案",
    description: "AIがあなたのブランドコンセプトを提案します。",
    status: "development" as const,
    href: "/tools/branding-generator",
    iconName: "sparkles",
    color: "from-orange-500 to-red-500",
    stats: "開発中",
    category: "branding",
    tags: ["AI", "ブランディング", "コンセプト"],
    usageCount: 45,
    rating: 4.0
  },
  {
    id: "tool-2",
    title: "動画タイトル・概要欄自動生成AI",
    description: "AIが動画・コンテンツのタイトルと概要欄を自動生成。",
    status: "development" as const,
    href: "/tools/title-generator",
    iconName: "trending-up",
    color: "from-indigo-500 to-blue-500",
    stats: "開発中",
    category: "production",
    tags: ["AI", "タイトル", "SEO"],
    usageCount: 67,
    rating: 4.3
  },
  {
    id: "tool-12",
    title: "配信スケジュール自動調整",
    description: "コラボ相手との配信スケジュールを自動調整。",
    status: "development" as const,
    href: "/tools/schedule-adjuster",
    iconName: "calendar",
    color: "from-teal-500 to-blue-500",
    stats: "開発中",
    category: "collaboration",
    tags: ["スケジュール", "コラボ", "自動調整"],
    usageCount: 23,
    rating: 3.8
  },
  {
    id: "tool-13",
    title: "イベント用素材制作",
    description: "Canvaのようにイベント用の素材を制作。",
    status: "development" as const,
    href: "/tools/asset-creator",
    iconName: "image",
    color: "from-indigo-500 to-blue-500",
    stats: "開発中",
    category: "production",
    tags: ["素材", "デザイン", "イベント"],
    usageCount: 78,
    rating: 4.1
  },
  {
    id: "tool-3",
    title: "バーチャル背景自動生成AI",
    description: "AIが配信用のバーチャル背景を自動生成。",
    status: "development" as const,
    href: "/tools/virtual-bg-generator",
    iconName: "image",
    color: "from-blue-500 to-indigo-500",
    stats: "開発中",
    category: "production",
    tags: ["AI", "背景", "配信"],
    usageCount: 112,
    rating: 4.4
  },
];

export default function ToolsPage() {
  const quickAccess = useQuickAccess(tools);

  const handleToolClick = (tool: any) => {
    // ツールを最近使用に追加
    quickAccess.addToRecent({
      id: tool.id,
      title: tool.title,
      description: tool.description,
      status: tool.status,
      href: tool.href,
      iconName: tool.iconName,
      color: tool.color,
    });
  };
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {/* ブレッドクラム */}
        <Breadcrumb />

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight tracking-wide bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          個別ツール一覧
        </h1>
        <p className="text-sm md:text-base mb-8 md:mb-10 text-gray-300 leading-relaxed">
          配信者・クリエイターの活動を支援する個別のツールをご紹介します。
        </p>
        <EnhancedToolsSection tools={tools} onItemClick={handleToolClick} />
      </div>

      {/* ページナビゲーション */}
      <PageNavigation showQuickNav={false} />
    </div>
  );
}