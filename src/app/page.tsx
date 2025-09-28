'use client';

import { useState, useEffect } from 'react';
import { StatusFilter } from "@/components/ui/status-filter";
import { SwipeableStats } from "@/components/ui/swipeable-stats";
import { QuickAccessSection } from "@/components/quick-access-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageNavigation } from "@/components/ui/page-navigation";
import { useQuickAccess } from "@/hooks/use-quick-access";
import { useLoading } from "@/hooks/use-loading";
import { PageSkeleton, ToolCardSkeleton } from "@/components/ui/skeleton";
import { ErrorDisplay, NetworkStatus } from "@/components/ui/error-display";
import { ProgressBar } from "@/components/ui/progress-bar";

// 拡張されたダミーデータ
const suites = [
  {
    id: "suite-1",
    title: "企画準備",
    description: "コンテンツの企画から準備までをサポートするツール群。スケジュール管理、台本作成、素材準備などを効率化します。",
    status: "released",
    href: "/tools/schedule-calendar",
    iconName: "sparkles",
    color: "from-blue-500 to-cyan-500",
    stats: "8つのツール"
  },
  {
    id: "suite-2",
    title: "動画公開",
    description: "コンテンツの公開とオーディエンスへのリーチを最大化するツール群。タイトル生成、サムネイル作成、SEO最適化などを自動化します。",
    status: "development",
    iconName: "trending-up",
    color: "from-blue-500 to-cyan-500",
    stats: "5つのツール"
  },
  {
    id: "suite-3",
    title: "配信強化",
    description: "オーディエンスとのインタラクションを強化するツール群。コメント分析、感情分析、リアルタイム支援などで配信・ライブをサポートします。",
    status: "development",
    iconName: "users",
    color: "from-green-500 to-emerald-500",
    stats: "6つのツール"
  },
] as const;

// ツールデータ（統計計算用）
const tools = [
  {
    id: "tool-1",
    title: "スケジュールカレンダー",
    description: "配信・ライブのスケジュールを管理するツール。",
    status: "released" as const,
    href: "/tools/schedule-calendar",
    iconName: "calendar",
    color: "from-blue-500 to-cyan-500",
    category: "planning",
    tags: ["スケジュール", "管理", "配信"],
    usageCount: 150,
    rating: 4.2
  },
  {
    id: "tool-2",
    title: "企画・台本サポートAI",
    description: "コンテンツの企画や台本作成をAIがサポート。",
    status: "beta" as const,
    href: "/tools/script-generator",
    iconName: "brain",
    color: "from-blue-500 to-cyan-500",
    category: "planning",
    tags: ["AI", "台本", "企画"],
    usageCount: 89,
    rating: 4.5
  },
  {
    id: "tool-3",
    title: "サムネイル自動生成ツール",
    description: "動画・コンテンツのサムネイルをAIが自動生成。",
    status: "released" as const,
    href: "/tools/thumbnail-generator",
    iconName: "image",
    color: "from-green-500 to-emerald-500",
    category: "production",
    tags: ["AI", "サムネイル", "画像生成"],
    usageCount: 320,
    rating: 4.7
  },
  {
    id: "tool-4",
    title: "コンセプト・ブランディング提案",
    description: "AIがあなたのブランドコンセプトを提案します。",
    status: "development" as const,
    href: "/tools/branding-generator",
    iconName: "sparkles",
    color: "from-orange-500 to-red-500",
    category: "branding",
    tags: ["AI", "ブランディング", "コンセプト"],
    usageCount: 45,
    rating: 4.0
  },
  {
    id: "tool-5",
    title: "動画タイトル・概要欄自動生成AI",
    description: "AIが動画・コンテンツのタイトルと概要欄を自動生成。",
    status: "development" as const,
    href: "/tools/title-generator",
    iconName: "trending-up",
    color: "from-indigo-500 to-blue-500",
    category: "production",
    tags: ["AI", "タイトル", "SEO"],
    usageCount: 67,
    rating: 4.3
  },
  {
    id: "tool-6",
    title: "配信スケジュール自動調整",
    description: "コラボ相手との配信スケジュールを自動調整。",
    status: "development" as const,
    href: "/tools/schedule-adjuster",
    iconName: "calendar",
    color: "from-purple-500 to-pink-500",
    category: "collaboration",
    tags: ["スケジュール", "コラボ", "自動調整"],
    usageCount: 23,
    rating: 3.8
  },
  {
    id: "tool-7",
    title: "イベント用素材制作",
    description: "Canvaのようにイベント用の素材を制作。",
    status: "development" as const,
    href: "/tools/asset-creator",
    iconName: "image",
    color: "from-pink-500 to-rose-500",
    category: "production",
    tags: ["素材", "デザイン", "イベント"],
    usageCount: 78,
    rating: 4.1
  },
  {
    id: "tool-8",
    title: "バーチャル背景自動生成AI",
    description: "AIが配信・ライブ用のバーチャル背景を自動生成。",
    status: "development" as const,
    href: "/tools/virtual-bg-generator",
    iconName: "image",
    color: "from-cyan-500 to-blue-500",
    category: "production",
    tags: ["AI", "背景", "配信"],
    usageCount: 112,
    rating: 4.4
  }
];


export default function Home() {
  const quickAccess = useQuickAccess(tools);

  const handleSuiteClick = (suite: any) => {
    // スイートを最近使用に追加
    quickAccess.addToRecent({
      id: suite.id,
      title: suite.title,
      description: suite.description,
      status: suite.status,
      href: suite.href,
      iconName: suite.iconName,
      color: suite.color,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Skip links for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        メインコンテンツにスキップ
      </a>
      <a href="#suites" className="skip-link">
        ツールスイートにスキップ
      </a>
      <a href="#statistics" className="skip-link">
        統計情報にスキップ
      </a>
      
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {/* ブレッドクラム */}
        <Breadcrumb />

        <main id="main-content">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight tracking-wide bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            配信者向けコンテンツ制作支援ツール
          </h1>
          <p className="text-sm md:text-base mb-8 md:mb-10 text-gray-200 leading-relaxed">
            配信者・クリエイターの活動を強力にサポートする連鎖ツールをご紹介します。
          </p>

        {/* クイックアクセス機能 */}
        <section id="quick-access" aria-labelledby="quick-access-title">
          <h2 id="quick-access-title" className="sr-only">クイックアクセス</h2>
          <QuickAccessSection tools={tools} />
        </section>

        {/* 連鎖ツールスイート（主要コンテンツを先に） */}
        <section id="suites" aria-labelledby="suites-title">
          <h2 id="suites-title" className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 md:mb-8 leading-tight tracking-wide bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
            連鎖ツールスイート
          </h2>
          <StatusFilter items={suites} gridCols={3} onItemClick={handleSuiteClick} />
        </section>

        
        {/* 詳細統計情報（スワイプ機能付き） */}
        <section id="statistics" className="mt-16" aria-labelledby="statistics-title">
          <h2 id="statistics-title" className="text-2xl md:text-3xl font-semibold mb-6 leading-tight tracking-wide bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
            詳細統計
          </h2>
          <SwipeableStats 
            stats={{
              totalTools: tools.length,
              releasedTools: tools.filter(t => t.status === 'released').length,
              betaTools: tools.filter(t => t.status === 'beta').length,
              developmentTools: tools.filter(t => t.status === 'development').length,
              totalSuites: suites.length,
              toolProgress: Math.round((tools.filter(t => t.status === 'released').length / tools.length) * 100),
              suiteProgress: Math.round((suites.filter(s => s.status === 'released').length / suites.length) * 100)
            }}
          />
        </section>
        </main>
      </div>

      {/* ページナビゲーション */}
      <PageNavigation />
    </div>
  );
}