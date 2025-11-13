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
import { useSuites } from "@/hooks/use-suites";
import { useSuiteTracking } from "@/hooks/use-suite-tracking";
import { Button } from "@/components/ui/button";
import { Settings, Brain, Users } from "lucide-react";
import { ThemeSettings } from "@/components/ui/theme-settings";
import { LearningInsights, SocialFeatures } from "@/components/ui/learning-social-features";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function Home() {
  const quickAccess = useQuickAccess(tools);
  const { preferences } = useTheme();
  const contextualDisplay = useContextualDisplay();
  const { trackUsage } = useLearningSystem();
  const { suites } = useSuites();
  const handleSuiteClick = useSuiteTracking({
    addToRecent: quickAccess.addToRecent,
    trackUsage,
  });

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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-10 md:h-9 px-3 md:px-2 text-sm md:text-xs"
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">学習インサイト</span>
                  <span className="sm:hidden">学習</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 border-t-[#20B2AA]/30 max-w-4xl w-full h-[600px] md:h-[750px] overflow-hidden warm-cyber-glow flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-white">学習インサイト</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <LearningInsights />
                </div>
                <DialogFooter className="pt-4 border-t border-gray-700">
                  <DialogClose asChild>
                    <Button className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white">
                      閉じる
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-10 md:h-9 px-3 md:px-2 text-sm md:text-xs"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">ソーシャル</span>
                  <span className="sm:hidden">交流</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 border-t-[#20B2AA]/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto warm-cyber-glow flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-white">ソーシャル機能</DialogTitle>
                </DialogHeader>
                <SocialFeatures />
                <DialogFooter className="pt-4 border-t border-gray-700">
                  <DialogClose asChild>
                    <Button className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white">
                      閉じる
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-10 md:h-9 px-3 md:px-2 text-sm md:text-xs"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">テーマ設定</span>
                  <span className="sm:hidden">設定</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 border-t-[#20B2AA]/30 max-w-2xl w-full max-h-[90vh] overflow-hidden warm-cyber-glow flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-white">テーマ設定</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <ThemeSettings />
                </div>
                <DialogFooter className="pt-4 border-t border-gray-700">
                  <DialogClose asChild>
                    <Button className="bg-[#20B2AA] hover:bg-[#1a9b94] text-white">
                      閉じる
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

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