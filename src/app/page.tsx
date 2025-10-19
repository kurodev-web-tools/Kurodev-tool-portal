'use client';

import { StatusFilter } from "@/components/ui/status-filter";
import { SwipeableStats } from "@/components/ui/swipeable-stats";
import { QuickAccessSection } from "@/components/quick-access-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageNavigation } from "@/components/ui/page-navigation";
import { useQuickAccess } from "@/hooks/use-quick-access";
import { useTheme } from "@/contexts/ThemeContext";
import { useContextualDisplay } from "@/hooks/use-contextual-display";
import { useLearningSystem } from "@/hooks/use-learning-system";
import { tools } from "@/data/tools";
import { Button } from "@/components/ui/button";
import { Settings, Brain, Users } from "lucide-react";
import { useState } from "react";
import { ThemeSettings } from "@/components/ui/theme-settings";
import { LearningInsights, SocialFeatures } from "@/components/ui/learning-social-features";

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
    color: "from-[#20B2AA] to-[#20B2AA]",
    stats: "8つのツール"
  },
  {
    id: "suite-2",
    title: "動画公開",
    description: "コンテンツの公開とオーディエンスへのリーチを最大化するツール群。タイトル生成、サムネイル作成、SEO最適化などを自動化します。",
    status: "development",
    href: "/tools/title-generator",
    iconName: "trending-up",
    color: "from-[#FF6B6B] to-[#FF6B6B]",
    stats: "5つのツール"
  },
  {
    id: "suite-3",
    title: "配信強化",
    description: "オーディエンスとのインタラクションを強化するツール群。コメント分析、感情分析、リアルタイム支援などで配信・ライブをサポートします。",
    status: "development",
    href: "/tools",
    iconName: "users",
    color: "from-[#A0A0A0] to-[#A0A0A0]",
    stats: "6つのツール"
  },
] as const;

export default function Home() {
  const quickAccess = useQuickAccess(tools);
  const { preferences } = useTheme();
  const contextualDisplay = useContextualDisplay();
  const { trackUsage } = useLearningSystem();
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showLearningInsights, setShowLearningInsights] = useState(false);
  const [showSocialFeatures, setShowSocialFeatures] = useState(false);

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

      // 学習システムに使用を記録
      trackUsage(suite.id, 10); // 10分間の使用と仮定
    }
  };

  // 推奨ツールをフィルタリング（削除）
  // const recommendedSuites = suites.filter(suite => 
  //   contextualDisplay.recommendedTools.some(toolId => 
  //     suite.href?.includes(toolId)
  //   )
  // );

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
          {/* パーソナライズされた挨拶 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight tracking-wider text-[#20B2AA]">
                <span className="md:hidden">
                  {contextualDisplay.greeting.includes('！') ? (
                    <>
                      {contextualDisplay.greeting.split('！')[0]}！
                      <br />
                      {contextualDisplay.greeting.split('！')[1]}
                    </>
                  ) : (
                    contextualDisplay.greeting
                  )}
                </span>
                <span className="hidden md:inline">
                  {contextualDisplay.greeting}
                </span>
              </h1>
              <p className="text-sm md:text-base text-[#A0A0A0] leading-relaxed">
                配信者・クリエイターの活動を強力にサポートする連鎖ツールをご紹介します。
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLearningInsights(!showLearningInsights)}
                className="flex items-center gap-2 h-10 md:h-9 px-3 md:px-2 text-sm md:text-xs"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">学習インサイト</span>
                <span className="sm:hidden">学習</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSocialFeatures(!showSocialFeatures)}
                className="flex items-center gap-2 h-10 md:h-9 px-3 md:px-2 text-sm md:text-xs"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">ソーシャル</span>
                <span className="sm:hidden">交流</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowThemeSettings(!showThemeSettings)}
                className="flex items-center gap-2 h-10 md:h-9 px-3 md:px-2 text-sm md:text-xs"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">テーマ設定</span>
                <span className="sm:hidden">設定</span>
              </Button>
            </div>
          </div>

          {/* テーマ設定モーダル */}
          {showThemeSettings && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 border-t-[#20B2AA]/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto warm-cyber-glow">
                <div className="p-6">
                  <ThemeSettings />
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setShowThemeSettings(false)} className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white">
                      閉じる
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 学習インサイトモーダル */}
          {showLearningInsights && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 border-t-[#20B2AA]/30 rounded-lg max-w-4xl w-full h-[600px] md:h-[750px] overflow-hidden warm-cyber-glow">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <LearningInsights />
                  </div>
                  <div className="flex-shrink-0 flex justify-end mt-4 pt-4 border-t border-gray-700">
                    <Button onClick={() => setShowLearningInsights(false)} className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white">
                      閉じる
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ソーシャル機能モーダル */}
          {showSocialFeatures && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 border-t-[#20B2AA]/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto warm-cyber-glow">
                <div className="p-6">
                  <SocialFeatures />
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setShowSocialFeatures(false)} className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white">
                      閉じる
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* おすすめツール（統合されたセクション） */}
        <section id="quick-access" className="mt-16 mb-16" aria-labelledby="quick-access-title">
          <h2 id="quick-access-title" className="sr-only">おすすめツール</h2>
          <QuickAccessSection tools={tools} />
        </section>

        {/* 連鎖ツールスイート（主要コンテンツ） */}
        <section id="suites" className="mt-16 mb-16" aria-labelledby="suites-title">
          <h2 id="suites-title" className="text-lg md:text-xl lg:text-2xl font-semibold mb-6 md:mb-8 leading-tight tracking-wider text-[#F8F8F8] md:text-[#F8F8F8] border-l-4 border-[#20B2AA] pl-4 md:border-l-0 md:pl-0">
            連鎖ツールスイート
          </h2>
          <StatusFilter items={suites} layout={preferences.layout} onItemClick={handleSuiteClick} />
        </section>

        
        {/* 詳細統計情報（スワイプ機能付き） */}
        <section id="statistics" className="mt-16 mb-16" aria-labelledby="statistics-title">
          <h2 id="statistics-title" className="text-base md:text-xl lg:text-2xl font-medium mb-6 leading-tight tracking-wider text-gray-300 md:text-[#F8F8F8]">
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