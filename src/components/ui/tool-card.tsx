import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { ArrowRight, Star, Users } from "lucide-react";

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
  const statusMap = {
    released: { text: "公開中", variant: "default", color: "bg-green-200 text-green-900 border-green-300 dark:bg-green-800 dark:text-green-100 dark:border-green-600" },
    beta: { text: "ベータ版", variant: "warning", color: "bg-yellow-200 text-yellow-900 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600" },
    development: { text: "開発中", variant: "destructive", color: "bg-red-200 text-red-900 border-red-300 dark:bg-red-800 dark:text-red-100 dark:border-red-600" },
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
      className="h-full flex flex-col group card-interactive hover:shadow-blue-500/20 border-gray-800 shadow-sm bg-gray-900/30 hover:bg-gray-900/40 cursor-pointer"
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
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center shadow-lg text-2xl hover-scale-sm`}>
            {iconEmoji}
          </div>
          <Badge className={`text-xs font-medium ${currentStatus.color} status-${status}`}>
            {currentStatus.text}
          </Badge>
        </div>
        <CardTitle className="text-lg md:text-xl font-bold group-hover:text-blue-600 transition-smooth leading-tight tracking-wide">
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
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center shadow-lg text-xl hover-scale-sm`}>
              {iconEmoji}
            </div>
            <div>
              <CardTitle className="text-sm md:text-base font-bold group-hover:text-blue-600 transition-smooth leading-tight tracking-wide">
                {title}
              </CardTitle>
            </div>
          </div>
          <Badge className={`text-xs font-medium ${currentStatus.color} status-${status}`}>
            {currentStatus.text}
          </Badge>
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
              className="w-full hidden md:flex group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400 transition-colors"
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
              className="w-full md:hidden group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400 transition-colors text-xs md:text-sm py-2 tracking-normal"
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