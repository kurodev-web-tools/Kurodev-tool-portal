'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Heart, 
  Star, 
  Trash2, 
  ExternalLink,
  Calendar,
  Brain,
  Image,
  Sparkles,
  TrendingUp,
  Wrench,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAccessItem } from "@/hooks/use-quick-access";

interface QuickAccessProps {
  recentTools: QuickAccessItem[];
  popularTools: QuickAccessItem[];
  suiteFavoriteTools: QuickAccessItem[];
  unifiedFavoriteTools: QuickAccessItem[];
  onItemClick: (item: QuickAccessItem) => void;
  onToggleFavorite: (item: QuickAccessItem) => void;
  isFavorite: (toolId: string) => boolean;
  onClearRecent: () => void;
  onClearFavorites: () => void;
  className?: string;
}

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'calendar':
      return <Calendar className="h-4 w-4" />;
    case 'brain':
      return <Brain className="h-4 w-4" />;
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'sparkles':
      return <Sparkles className="h-4 w-4" />;
    case 'trending-up':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Wrench className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'released':
      return (
        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
          公開済み
        </Badge>
      );
    case 'beta':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs">
          ベータ版
        </Badge>
      );
    case 'development':
      return (
        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs">
          開発中
        </Badge>
      );
    default:
      return null;
  }
};

const QuickAccessSection = ({ 
  title, 
  icon: Icon, 
  items, 
  onItemClick, 
  onToggleFavorite, 
  isFavorite, 
  onClear,
  showFavoriteToggle = false,
  emptyMessage,
  showSuiteInfo = false,
  className 
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: QuickAccessItem[];
  onItemClick: (item: QuickAccessItem) => void;
  onToggleFavorite: (item: QuickAccessItem) => void;
  isFavorite: (toolId: string) => boolean;
  onClear: () => void;
  showFavoriteToggle?: boolean;
  emptyMessage: string;
  showSuiteInfo?: boolean;
  className?: string;
}) => {
  return (
    <Card className={cn("bg-gray-900/30 border-gray-800 shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-sm bg-[#20B2AA] flex items-center justify-center warm-cyber-glow">
            <Icon className="h-3 w-3 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-200">{title}</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {/* ナビゲーションボタン（最近使用・人気ツールのみ） */}
          {(title === "最近使用" || title === "人気ツール") && items.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-300 hover:text-[#20B2AA] hover:bg-[#20B2AA]/20 touch-manipulation border border-gray-600 hover:border-[#20B2AA]"
                aria-label="前のツールに移動"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-300 hover:text-[#20B2AA] hover:bg-[#20B2AA]/20 touch-manipulation border border-gray-600 hover:border-[#20B2AA]"
                aria-label="次のツールに移動"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {/* クリアボタン */}
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0 touch-manipulation border border-gray-600 hover:border-red-400"
              aria-label={`${title}をクリア`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-sm bg-[#20B2AA] flex items-center justify-center text-white group-hover:scale-110 transition-transform warm-cyber-glow`}>
                    {getIcon(item.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-white group-hover:text-[#20B2AA] transition-colors truncate">
                        {item.title}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-400 truncate mb-1">
                      {item.description}
                    </p>
                        {showSuiteInfo && 'suiteName' in item && item.suiteName && (
                          <div className="text-xs text-[#20B2AA] flex items-center space-x-1">
                            <span>{'isSuite' in item && item.isSuite ? '🎯' : '📦'}</span>
                            <span>{item.suiteName}</span>
                          </div>
                        )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  {showFavoriteToggle && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item);
                      }}
                      className={cn(
                        "h-10 w-10 p-0 transition-colors touch-manipulation",
                        isFavorite(item.id)
                          ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      )}
                    >
                      <Heart className={cn("h-3 w-3", isFavorite(item.id) && "fill-current")} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-gray-400 hover:text-[#20B2AA] hover:bg-[#20B2AA]/10 touch-manipulation"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* 空状態でも同じレイアウト構造を使用 */}
            <div className="group flex items-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-sm bg-[#20B2AA]/20 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#20B2AA]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    {emptyMessage}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {title === "お気に入り" ? "気に入ったツールをハートマークで追加しましょう" : 
                     title === "最近使用" ? "ツールを使用するとここに表示されます" : 
                     "人気のツールが表示されます"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const QuickAccess = React.memo(function QuickAccess({
  recentTools,
  popularTools,
  suiteFavoriteTools,
  unifiedFavoriteTools,
  onItemClick,
  onToggleFavorite,
  isFavorite,
  onClearRecent,
  onClearFavorites,
  className,
}: QuickAccessProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 leading-tight tracking-wider text-white md:text-[#F8F8F8]">
          おすすめツール
        </h2>
        <p className="text-sm text-[#A0A0A0]">
          最近使用・お気に入り・人気ツール
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近使用したツール */}
        <QuickAccessSection
          title="最近使用"
          icon={Clock}
          items={recentTools}
          onItemClick={onItemClick}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          onClear={onClearRecent}
          showFavoriteToggle={true}
          emptyMessage="最近使用したツールはありません"
        />

            {/* お気に入りツール（スイート + 個別ツール統合） */}
            <QuickAccessSection
              title="お気に入り"
              icon={Heart}
              items={unifiedFavoriteTools}
              onItemClick={onItemClick}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
              onClear={onClearFavorites}
              showFavoriteToggle={true}
              emptyMessage="お気に入りに追加されたツールはありません"
              showSuiteInfo={true}
            />

        {/* 人気ツール */}
        <QuickAccessSection
          title="人気ツール"
          icon={Star}
          items={popularTools}
          onItemClick={onItemClick}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          onClear={() => {}} // 人気ツールはクリアしない
          showFavoriteToggle={true}
          emptyMessage="人気ツールがありません"
        />
      </div>
      
          {/* 「すべて表示」リンク */}
          {unifiedFavoriteTools.length > 0 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/tools'}
                className="text-[#20B2AA] border-[#20B2AA] hover:bg-[#20B2AA] hover:text-white px-6"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                すべてのお気に入りを表示
              </Button>
            </div>
          )}
    </div>
  );
});
