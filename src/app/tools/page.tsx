'use client';

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EnhancedToolsSection } from "@/components/enhanced-tools-section";
import { tools } from "@/data/tools";
import { useToolTracking } from "@/hooks/use-tool-tracking";
import { useRecentTools } from "@/hooks/use-recent-tools";
import type { ToolItem } from "@/components/enhanced-tools-section";

export default function ToolsPage() {
  const { addToRecent } = useRecentTools();
  const trackToolUsage = useToolTracking(addToRecent);

  const handleItemClick = (item: ToolItem) => {
    trackToolUsage(item);
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
    </div>
  );
}
