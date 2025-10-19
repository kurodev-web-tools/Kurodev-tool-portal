"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ToolCard } from "@/components/ui/tool-card"; // ToolCardをインポート
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { favoritesManager } from "@/lib/favorites-storage";
import { favoritesEventManager } from "@/lib/favorites-events";
import { logger } from "@/lib/logger";

interface Item {
  id: string;
  title: string;
  description: string;
  status: "released" | "beta" | "development";
  feedbackMessage?: string;
  href?: string;
  iconName?: string;
  color?: string;
  stats?: string;
}

interface StatusFilterProps {
  items: readonly Item[];
  gridCols?: 3 | 4;
  layout?: "grid" | "list";
  onItemClick?: (item: Item) => void;
}

export function StatusFilter({ items, gridCols = 3, layout = "grid", onItemClick }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [favoriteSuites, setFavoriteSuites] = useState<string[]>([]);

  // お気に入りスイートの読み込みと更新（新しいシステム使用）
  useEffect(() => {
    const loadFavorites = () => {
      const favorites = favoritesManager.getFavorites();
      setFavoriteSuites(favorites.suites);
    };
    
    loadFavorites();
    
    // イベントリスナーを追加
    const handleFavoritesChange = () => {
      loadFavorites();
    };
    
    favoritesEventManager.addListener(handleFavoritesChange);
    return () => favoritesEventManager.removeListener(handleFavoritesChange);
  }, []);

  // お気に入りの切り替え（新しいシステム使用）
  const toggleFavorite = (suiteId: string) => {
    try {
      const success = favoritesManager.toggleSuite(suiteId);
      if (success) {
        logger.info(`Suite ${suiteId} favorite toggled`, 'StatusFilter');
      }
    } catch (error) {
      logger.error('Failed to toggle suite favorite', error, 'StatusFilter');
    }
  };

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const currentStatus = searchParams?.get("status") || "all";

  const sortedItems = [...items].sort((a, b) => {
    const order = {
      released: 1,
      beta: 2,
      development: 3,
    };
    return order[a.status] - order[b.status];
  });

  const filteredAndSortedItems = sortedItems.filter((item) => {
    if (currentStatus === "all") {
      return true;
    }
    return currentStatus === item.status;
  });

  const gridLayout = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  // アイコンマッピング
  const iconMap = {
    "sparkles": "✨",
    "trending-up": "📈",
    "users": "👥",
    "calendar": "📅",
    "image": "🖼️",
    "brain": "🧠",
    "bar-chart": "📊",
  };

  const statusMap = {
    released: { text: "公開済み", color: "bg-green-500/20 text-green-400 border border-green-500/30" },
    beta: { text: "ベータ版", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
    development: { text: "開発中", color: "bg-red-500/20 text-red-400 border border-red-500/30" },
  };

  return (
    <>
      <ToggleGroup
        type="single"
        value={currentStatus}
        onValueChange={handleFilterChange}
        className="mb-4 md:mb-6 bg-slate-800/50 backdrop-blur-sm p-1 rounded-lg shadow-lg border border-slate-700/50 flex flex-wrap gap-1"
      >
        <ToggleGroupItem 
          value="all" 
          aria-label="すべてのステータス"
          className="text-xs md:text-sm font-medium text-[#A0A0A0] data-[state=on]:bg-[#20B2AA] data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-[#20B2AA] px-4 py-2 tracking-normal"
        >
          すべて
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="released" 
          aria-label="公開済み"
          className="text-xs md:text-sm font-medium text-[#A0A0A0] data-[state=on]:bg-[#20B2AA] data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-green-400 px-4 py-2 tracking-normal"
        >
          公開済み
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="beta" 
          aria-label="ベータ版"
          className="text-xs md:text-sm font-medium text-[#A0A0A0] data-[state=on]:bg-[#FF6B6B] data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-yellow-400 px-4 py-2 tracking-normal"
        >
          ベータ版
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="development" 
          aria-label="開発中"
          className="text-xs md:text-sm font-medium text-[#A0A0A0] data-[state=on]:bg-[#A0A0A0] data-[state=on]:text-white data-[state=on]:shadow-lg transition-all duration-200 hover:text-red-400 px-4 py-2 tracking-normal"
        >
          開発中
        </ToggleGroupItem>
      </ToggleGroup>
      
      {layout === "grid" ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
          {filteredAndSortedItems.map((item, index) => (
            <div
              key={item.id}
              className="stagger-animation"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ToolCard
                id={item.id}
                title={item.title}
                description={item.description}
                status={item.status}
                feedbackMessage={item.feedbackMessage}
                hoverable={true}
                href={item.href}
                iconName={item.iconName}
                color={item.color}
                stats={item.stats}
                onClick={() => onItemClick?.(item)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedItems.map((item, index) => {
            const iconEmoji = item.iconName ? iconMap[item.iconName as keyof typeof iconMap] || "🔧" : "🔧";
            const currentStatus = statusMap[item.status];
            
            return (
              <div
                key={item.id}
                className="enhanced-card group stagger-animation cyber-border cyber-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 flex-1">
                    <div className="w-12 h-12 bg-[#20B2AA] rounded-sm flex items-center justify-center shadow-lg text-xl warm-cyber-glow">
                      {iconEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-[#F8F8F8] group-hover:text-[#20B2AA] transition-colors leading-tight tracking-wide">
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base text-[#A0A0A0] leading-relaxed mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={`text-sm font-medium ${currentStatus.color}`}>
                      {currentStatus.text}
                    </Badge>
                    
                    {/* お気に入りボタン */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className={`transition-colors ${
                        favoriteSuites.includes(item.id)
                          ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                      }`}
                      aria-label={favoriteSuites.includes(item.id) ? 'お気に入りから削除' : 'お気に入りに追加'}
                    >
                      <Heart className={`h-4 w-4 ${favoriteSuites.includes(item.id) ? 'fill-current' : ''}`} />
                    </Button>

                    {item.href && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:bg-[#20B2AA] group-hover:text-white transition-colors"
                        asChild
                      >
                        <Link href={item.href} className="flex items-center gap-2">
                          使用する
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}