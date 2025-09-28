'use client';

import { useRouter } from "next/navigation";
import { SwipeableQuickAccess } from "@/components/ui/swipeable-quick-access";
import { useQuickAccess } from "@/hooks/use-quick-access";
import { QuickAccessItem } from "@/hooks/use-quick-access";
import { Clock, Heart, Star } from "lucide-react";

interface QuickAccessSectionProps {
  tools: QuickAccessItem[];
}

export function QuickAccessSection({ tools }: QuickAccessSectionProps) {
  const quickAccess = useQuickAccess(tools);
  const router = useRouter();

  const handleItemClick = (item: QuickAccessItem) => {
    router.push(item.href);
    quickAccess.addToRecent(item);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <SwipeableQuickAccess
        title="最近使用"
        icon={Clock}
        items={quickAccess.recentTools}
        onItemClick={handleItemClick}
        onToggleFavorite={quickAccess.toggleFavorite}
        isFavorite={quickAccess.isFavorite}
        onClear={quickAccess.clearRecent}
        showFavoriteToggle={true}
        emptyMessage="最近使用したツールはありません"
      />
      <SwipeableQuickAccess
        title="お気に入り"
        icon={Heart}
        items={quickAccess.favoriteTools}
        onItemClick={handleItemClick}
        onToggleFavorite={quickAccess.toggleFavorite}
        isFavorite={quickAccess.isFavorite}
        onClear={quickAccess.clearFavorites}
        showFavoriteToggle={true}
        emptyMessage="お気に入りに追加されたツールはありません"
      />
      <SwipeableQuickAccess
        title="人気ツール"
        icon={Star}
        items={quickAccess.popularTools}
        onItemClick={handleItemClick}
        onToggleFavorite={quickAccess.toggleFavorite}
        isFavorite={quickAccess.isFavorite}
        onClear={() => {}}
        showFavoriteToggle={false}
        emptyMessage="人気ツールがありません"
      />
    </div>
  );
}
