import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { ArrowRight, Star, Users, Heart } from "lucide-react";
import { favoritesManager } from "@/lib/favorites-storage";
import { favoritesEventManager } from "@/lib/favorites-events";
import { logger } from "@/lib/logger";

type ToolStatus = "released" | "beta" | "development";

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  status: ToolStatus;
  feedbackMessage?: string;
  hoverable?: boolean;
  href?: string;
  iconName?: string;
  color?: string;
  stats?: string;
  onClick?: () => void;
}

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

export const ToolCard = React.memo(function ToolCard({
  id,
  title,
  description,
  status,
  feedbackMessage,
  hoverable = false,
  href,
  iconName,
  color = "from-gray-500 to-gray-600",
  stats,
  onClick,
}: ToolCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // お気に入り状態の読み込み（新しいシステム使用）
  useEffect(() => {
    const loadFavoriteState = () => {
      const isSuite = id.startsWith('suite-');
      setIsFavorite(favoritesManager.isFavorite(id, isSuite ? 'suite' : 'tool'));
    };
    
    loadFavoriteState();
    
    // イベントリスナーを追加
    const handleFavoritesChange = () => {
      loadFavoriteState();
    };
    
    favoritesEventManager.addListener(handleFavoritesChange);
    return () => favoritesEventManager.removeListener(handleFavoritesChange);
  }, [id]);

  // お気に入りの切り替え（新しいシステム使用）
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isSuite = id.startsWith('suite-');
      const success = isSuite 
        ? favoritesManager.toggleSuite(id)
        : favoritesManager.toggleTool(id);
      
      if (success) {
        logger.info(`${isSuite ? 'Suite' : 'Tool'} ${id} favorite toggled`, 'ToolCard');
      }
    } catch (error) {
      logger.error('Failed to toggle favorite', error, 'ToolCard');
    }
  };
  const statusMap = {
    released: { text: "公開済み", variant: "default", color: "bg-green-500/20 text-green-400 border border-green-500/30" },
    beta: { text: "ベータ版", variant: "warning", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
    development: { text: "開発中", variant: "destructive", color: "bg-red-500/20 text-red-400 border border-red-500/30" },
  };

  const currentStatus = statusMap[status];
  const iconEmoji = iconName ? iconMap[iconName as keyof typeof iconMap] || "🔧" : "🔧";

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const CardComponent = (
    <Card 
      className="h-full flex flex-col group card-interactive border-gray-800 shadow-sm bg-gray-900/30 hover:bg-gray-900/40 cursor-pointer"
      style={{ 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(32, 178, 170, 0.2), 0 4px 6px -2px rgba(32, 178, 170, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${description}`}
      aria-describedby={`${id}-description`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* デスクトップ用レイアウト */}
      <CardHeader className="pb-4 flex-shrink-0 hidden md:block">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-sm bg-[#20B2AA] flex items-center justify-center shadow-lg text-2xl hover-scale-sm warm-cyber-glow`}>
            {iconEmoji}
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs font-medium ${currentStatus.color} status-${status}`}>
              {currentStatus.text}
            </Badge>
            {/* お気に入りボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`transition-colors ${
                isFavorite
                  ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
              }`}
              aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg md:text-xl font-bold group-hover:text-[#20B2AA] transition-smooth leading-tight tracking-wide">
          {title}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      {/* モバイル用レイアウト（2列表示） */}
      <CardHeader className="pb-2 flex-shrink-0 md:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-sm bg-[#20B2AA] flex items-center justify-center shadow-lg text-xl hover-scale-sm warm-cyber-glow`}>
              {iconEmoji}
            </div>
            <div>
              <CardTitle className="text-sm md:text-base font-bold group-hover:text-[#20B2AA] transition-smooth leading-tight tracking-wide">
                {title}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs font-medium ${currentStatus.color} status-${status}`}>
              {currentStatus.text}
            </Badge>
            {/* お気に入りボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`transition-colors ${
                isFavorite
                  ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
              }`}
              aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription 
          id={`${id}-description`}
          className="text-xs md:text-sm text-gray-500 dark:text-gray-300 leading-relaxed"
        >
          {description}
        </CardDescription>
      </CardHeader>
      
      {/* デスクトップ用コンテンツ */}
      <CardContent className="flex-grow pb-4 hidden md:block">
        {status === "beta" && feedbackMessage && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-xs md:text-sm font-medium text-yellow-800 dark:text-yellow-200">フィードバック募集中</span>
            </div>
            <p className="text-xs md:text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">{feedbackMessage}</p>
          </div>
        )}
        
        {stats && (
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 dark:text-gray-300">
            <Users className="h-4 w-4" />
            <span>{stats}</span>
          </div>
        )}
      </CardContent>

      {/* モバイル用コンテンツ（簡略化） */}
      <CardContent className="flex-grow pb-2 md:hidden">
        {status === "beta" && feedbackMessage && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 mb-2 shadow-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-600" />
              <span className="text-xs md:text-sm font-medium text-yellow-800 dark:text-yellow-200">フィードバック募集中</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex-shrink-0">
        {href && (
          <>
            {/* デスクトップ用ボタン */}
            <Button 
              variant="ghost" 
              className="w-full hidden md:flex group-hover:bg-[#20B2AA]/10 group-hover:text-[#20B2AA] dark:group-hover:bg-[#20B2AA]/20 dark:group-hover:text-[#20B2AA] transition-colors"
              asChild
            >
              <Link href={href} className="flex items-center justify-center gap-2">
                ツールを使用する
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
              </Link>
            </Button>

            {/* モバイル用ボタン（コンパクト） */}
            <Button 
              variant="ghost" 
              className="w-full md:hidden group-hover:bg-[#20B2AA]/10 group-hover:text-[#20B2AA] dark:group-hover:bg-[#20B2AA]/20 dark:group-hover:text-[#20B2AA] transition-colors text-xs md:text-sm py-2 tracking-normal"
              asChild
            >
              <Link href={href} className="flex items-center justify-center gap-1">
                使用する
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-smooth" />
              </Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );

  // hrefがある場合は、外側のLinkでラップせず、Card内のボタンでリンクを処理
  return CardComponent;
});