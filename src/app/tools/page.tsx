'use client';

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EnhancedToolsSection } from "@/components/enhanced-tools-section";
import { useQuickAccess } from "@/hooks/use-quick-access";
import { tools } from "@/data/tools";
import { useRouter } from "next/navigation";

export default function ToolsPage() {
  const quickAccess = useQuickAccess(tools);
  const router = useRouter();

  const handleItemClick = (item: any) => {
    // ツールページに遷移
    router.push(item.href);
    // 最近使用に追加
    quickAccess.addToRecent(item);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー配下にコンテンツを配置 */}
      <div className="flex-grow bg-gradient-to-b from-background to-muted/20">
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* ページタイトル */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#20B2AA] to-[#1a9b94] bg-clip-text text-transparent">
              個別ツール
            </h1>
            <p className="text-muted-foreground">
              各機能を個別にご利用いただけます。
            </p>
          </div>

          {/* 拡張版ツールセクション */}
          <EnhancedToolsSection tools={tools} onItemClick={handleItemClick} />
        </main>
      </div>
    </div>
  );
}
