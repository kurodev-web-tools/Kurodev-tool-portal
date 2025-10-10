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
  favoriteTools: QuickAccessItem[];
  popularTools: QuickAccessItem[];
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
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          公開済み
        </Badge>
      );
    case 'beta':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
          ベータ版
        </Badge>
      );
    case 'development':
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
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
  className?: string;
}) => {
  return (
    <Card className={cn("bg-gray-900/30 border-gray-800 shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <Icon className="h-3 w-3 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-200">{title}</CardTitle>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-10 w-10 p-0 touch-manipulation"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
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
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    {getIcon(item.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                        {item.title}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {item.description}
                    </p>
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
                    className="h-10 w-10 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 touch-manipulation"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800/50 flex items-center justify-center">
              <Icon className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const QuickAccess = React.memo(function QuickAccess({
  recentTools,
  favoriteTools,
  popularTools,
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
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight tracking-wide bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
          クイックアクセス
        </h2>
        <p className="text-sm text-gray-400">
          よく使うツールに素早くアクセス
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

        {/* お気に入りツール */}
        <QuickAccessSection
          title="お気に入り"
          icon={Heart}
          items={favoriteTools}
          onItemClick={onItemClick}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          onClear={onClearFavorites}
          showFavoriteToggle={true}
          emptyMessage="お気に入りに追加されたツールはありません"
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
    </div>
  );
});
