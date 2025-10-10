'use client';

import { StatusFilter } from "@/components/ui/status-filter";
import { SwipeableStats } from "@/components/ui/swipeable-stats";
import { QuickAccessSection } from "@/components/quick-access-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageNavigation } from "@/components/ui/page-navigation";
import { useQuickAccess } from "@/hooks/use-quick-access";
import { tools } from "@/data/tools";

// スイートの型定義
interface Suite {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href?: string;
  iconName?: string; // StatusFilterのItem型に合わせてオプショナルに
  color?: string;
  stats?: string;
}

// 拡張されたダミーデータ
const suites: Suite[] = [
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
    href: "/tools/title-generator",
    iconName: "trending-up",
    color: "from-blue-500 to-cyan-500",
    stats: "5つのツール"
  },
  {
    id: "suite-3",
    title: "配信強化",
    description: "オーディエンスとのインタラクションを強化するツール群。コメント分析、感情分析、リアルタイム支援などで配信・ライブをサポートします。",
    status: "development",
    href: "/tools",
    iconName: "users",
    color: "from-green-500 to-emerald-500",
    stats: "6つのツール"
  },
] as const;

export default function Home() {
  const quickAccess = useQuickAccess(tools);

  const handleSuiteClick = (suite: Suite) => {
    // スイートを最近使用に追加（hrefがある場合のみ）
    if (suite.href) {
      quickAccess.addToRecent({
        id: suite.id,
        title: suite.title,
        description: suite.description,
        status: suite.status,
        href: suite.href,
        iconName: suite.iconName,
        color: suite.color,
      });
    }
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