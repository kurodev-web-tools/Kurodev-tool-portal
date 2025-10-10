'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Star, 
  Users, 
  Calendar,
  Brain,
  Image,
  Sparkles,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  status: 'released' | 'beta' | 'development';
  href: string;
  iconName?: string;
  color?: string;
  category: string;
  tags: string[];
  usageCount: number;
  rating: number;
}

interface EnhancedToolCardProps {
  item: ToolItem;
  onItemClick: (item: ToolItem) => void;
  className?: string;
}

const getStatusBadge = (status: ToolItem['status']) => {
  switch (status) {
    case 'released':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">公開済み</Badge>;
    case 'beta':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">ベータ版</Badge>;
    case 'development':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">開発中</Badge>;
    default:
      return null;
  }
};

const getToolIcon = (iconName?: string) => {
  switch (iconName) {
    case 'calendar': return Calendar;
    case 'brain': return Brain;
    case 'image': return Image;
    case 'sparkles': return Sparkles;
    case 'trending-up': return TrendingUp;
    case 'users': return Users;
    case 'bar-chart': return BarChart3;
    default: return ExternalLink;
  }
};

const getCategoryLabel = (category: string) => {
  const categoryLabels: Record<string, string> = {
    planning: '企画・準備',
    production: '制作・編集',
    branding: 'ブランディング',
    collaboration: 'コラボ・連携'
  };
  return categoryLabels[category] || category;
};

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Star key="half" className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />
    );
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="h-3 w-3 text-gray-600" />
    );
  }

  return stars;
};

export const EnhancedToolCard = React.memo(function EnhancedToolCard({ item, onItemClick, className }: EnhancedToolCardProps) {
  const Icon = React.useMemo(() => getToolIcon(item.iconName), [item.iconName]);

  return (
    <Card 
      className={cn(
        "group relative bg-gray-900/30 border-gray-800 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer",
        className
      )}
      onClick={() => onItemClick(item)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow",
              `bg-gradient-to-r ${item.color}`
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-200 group-hover:text-blue-600 transition-colors leading-tight tracking-wide truncate">
                {item.title}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                  {getCategoryLabel(item.category)}
                </Badge>
                {getStatusBadge(item.status)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(item);
            }}
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed line-clamp-2">
          {item.description}
        </p>

        {/* タグ */}
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-gray-800/50 text-gray-300 border-gray-700"
            >
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="text-xs bg-gray-800/50 text-gray-400 border-gray-700"
            >
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* 統計情報 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{item.usageCount.toLocaleString()}回</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-0.5">
                {renderStars(item.rating)}
              </div>
              <span>{item.rating}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
