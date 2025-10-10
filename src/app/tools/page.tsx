'use client';

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageNavigation } from "@/components/ui/page-navigation";
import { EnhancedToolsSection } from "@/components/enhanced-tools-section";
import { useQuickAccess } from "@/hooks/use-quick-access";
import { tools } from "@/data/tools";

export default function ToolsPage() {
  const quickAccess = useQuickAccess(tools);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー配下にコンテンツを配置 */}
      <div className="flex-grow bg-gradient-to-b from-background to-muted/20">
        {/* ページナビゲーション */}
        <PageNavigation />

        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* ページタイトル */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              個別ツール
            </h1>
            <p className="text-muted-foreground">
              各機能を個別にご利用いただけます。
            </p>
          </div>

          {/* 拡張版ツールセクション */}
          <EnhancedToolsSection tools={tools} />
        </main>
      </div>
    </div>
  );
}
