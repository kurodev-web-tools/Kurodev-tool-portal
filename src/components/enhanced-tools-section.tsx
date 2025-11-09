'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedFilter } from '@/components/ui/enhanced-filter';
import { EnhancedToolCard } from '@/components/ui/enhanced-tool-card';
import { logger } from '@/lib/logger';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { favoritesManager } from '@/lib/favorites-storage';
import { favoritesEventManager } from '@/lib/favorites-events';

import type { Tool } from '@/data/tools';

export interface ToolItem extends Omit<Tool, 'color'> {
  color?: string;
  iconName: string;
}

interface EnhancedToolsSectionProps {
  tools: ToolItem[];
  className?: string;
  onItemClick?: (item: ToolItem) => void;
}

export function EnhancedToolsSection({ tools, className, onItemClick }: EnhancedToolsSectionProps) {
  const [filteredTools, setFilteredTools] = useState<ToolItem[]>(tools);
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [visibleTools, setVisibleTools] = useState<ToolItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // ページネーション設定
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);

  // 表示するツールを計算（パフォーマンス最適化）
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTools.slice(startIndex, endIndex);
  }, [filteredTools, currentPage]);

  // フィルター結果が変更されたらページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTools]);

  // お気に入りツールの読み込み（新しいシステム使用）
  useEffect(() => {
    const loadFavorites = () => {
      const favorites = favoritesManager.getFavorites();
      setFavoriteTools(favorites.tools);
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
  const toggleFavorite = (toolId: string) => {
    try {
      const success = favoritesManager.toggleTool(toolId);
      if (success) {
        logger.info(`Tool ${toolId} favorite toggled`, 'EnhancedToolsSection');
      }
    } catch (error) {
      logger.error('Failed to toggle tool favorite', error, 'EnhancedToolsSection');
    }
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

  const getIcon = (iconName?: string) => {
    if (!iconName) return "🔧";
    return iconMap[iconName as keyof typeof iconMap] || "🔧";
  };

  const handleItemClick = (item: ToolItem) => {
    // hrefが存在するかチェック
    if (!item.href) {
      logger.error('Tool href is undefined', { item }, 'EnhancedToolsSection');
      return;
    }

    // カスタムクリックハンドラーを呼び出し
    if (onItemClick) {
      onItemClick(item);
    }

    // 実際のツールページに遷移
    router.push(item.href);
  };

  return (
    <div className={className}>
      <EnhancedFilter 
        items={tools} 
        onFilteredItemsChange={setFilteredTools} 
        className="mb-6"
      />
      {/* モバイル: リスト表示、PC: グリッド表示 */}
      <div className="block md:hidden">
        {paginatedTools.length > 0 ? (
          <div className="space-y-4">
            {paginatedTools.map((tool) => (
              <div
                key={tool.id}
                className="group flex items-center justify-between p-3 md:p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-[#20B2AA]/50 hover:shadow-lg hover:shadow-[#20B2AA]/10 hover:scale-[1.02] transform focus:outline-none focus:ring-2 focus:ring-[#20B2AA] focus:ring-offset-2 focus:ring-offset-gray-900 relative"
                onClick={() => handleItemClick(tool)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(tool);
                  }
                }}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
                tabIndex={0}
                role="button"
                aria-label={`${tool.title} - ${tool.description}`}
              >
                <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#20B2AA] flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 warm-cyber-glow group-hover:shadow-lg group-hover:shadow-[#20B2AA]/30">
                    <span className="text-lg md:text-xl group-hover:animate-pulse">{getIcon(tool.iconName)}</span>
                  </div>
                <div className="flex-1 min-w-0">
                  {/* 主要情報（タイトル + ステータス + お気に入り） */}
                  <div className="flex items-center space-x-1 md:space-x-2 mb-1 md:mb-2">
                    <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-[#20B2AA] transition-colors truncate" id={`tool-title-${tool.id}`}>
                      {tool.title}
                    </h3>
                    <Badge className={`text-xs ${
                      tool.status === 'released' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      tool.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`} aria-label={`ステータス: ${tool.status === 'released' ? '公開済み' : tool.status === 'beta' ? 'ベータ版' : '開発中'}`}>
                      {tool.status === 'released' ? '公開済み' : tool.status === 'beta' ? 'ベータ版' : '開発中'}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className={`p-0.5 md:p-1 rounded-full transition-all duration-200 ${
                        favoriteTools.includes(tool.id)
                          ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                      }`}
                      aria-label={favoriteTools.includes(tool.id) ? 'お気に入りから削除' : 'お気に入りに追加'}
                    >
                      <Heart 
                        className={`h-3 w-3 md:h-4 md:w-4 ${favoriteTools.includes(tool.id) ? 'fill-current' : ''}`} 
                      />
                    </button>
                  </div>
                    
                    {/* 説明文 */}
                    <p className="text-xs md:text-sm text-gray-300 truncate mb-2 md:mb-3 leading-relaxed" aria-describedby={`tool-title-${tool.id}`}>
                      {tool.description}
                    </p>
                    
                    {/* 詳細情報（評価 + 使用回数） */}
                    <div className="flex items-center space-x-3 md:space-x-4 text-xs" role="group" aria-label="ツールの詳細情報">
                      <div className="flex items-center space-x-1 text-yellow-400" aria-label={`評価: ${tool.rating.toFixed(1)}点`}>
                        <span>⭐</span>
                        <span className="font-medium">{tool.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400" aria-label={`使用回数: ${tool.usageCount}回`}>
                        <span>📊</span>
                        <span>{tool.usageCount}回使用</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-2 md:ml-4 flex-shrink-0">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#20B2AA]/20 flex items-center justify-center group-hover:bg-[#20B2AA]/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" aria-label="ツールを開く">
                    <span className="text-[#20B2AA] text-xs md:text-sm group-hover:animate-bounce">→</span>
                  </div>
                </div>
                
                {/* ツール詳細プレビュー */}
                {hoveredTool === tool.id && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-900 border border-[#20B2AA]/30 rounded-lg shadow-xl z-50 warm-cyber-glow">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-[#20B2AA] flex items-center justify-center">
                          <span className="text-lg">{getIcon(tool.iconName)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{tool.title}</h4>
                          <p className="text-xs text-gray-400">{tool.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {tool.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <span>⭐</span>
                          <span className="font-medium">{tool.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <span>📊</span>
                          <span>{tool.usageCount}回使用</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[#20B2AA]">
                          <span>🏷️</span>
                          <span>{tool.tags.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(tool);
                          }}
                          className="px-3 py-1 bg-[#20B2AA] text-white text-xs rounded hover:bg-[#1a9b94] transition-colors"
                        >
                          ツールを開く
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(tool.id);
                          }}
                          className={`px-3 py-1 text-xs rounded transition-colors ${
                            favoriteTools.includes(tool.id)
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {favoriteTools.includes(tool.id) ? 'お気に入り解除' : 'お気に入り追加'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-[#20B2AA]/20 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">該当するツールが見つかりません</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              フィルター条件を変更するか、別のキーワードで検索してみてください。
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[#20B2AA] border-[#20B2AA] hover:bg-[#20B2AA] hover:text-white"
              onClick={() => window.location.reload()}
            >
              フィルターをリセット
            </Button>
          </div>
        )}
      </div>
      
      {/* PC: グリッド表示 */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTools.length > 0 ? (
          paginatedTools.map((tool) => (
            <EnhancedToolCard
              key={tool.id}
              item={tool}
              onItemClick={handleItemClick}
              onToggleFavorite={(item) => toggleFavorite(item.id)}
              isFavorite={favoriteTools.includes(tool.id)}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-[#20B2AA]/20 rounded-full flex items-center justify-center mb-8">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">該当するツールが見つかりません</h3>
            <p className="text-gray-400 mb-8 max-w-lg">
              フィルター条件を変更するか、別のキーワードで検索してみてください。
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-[#20B2AA] border-[#20B2AA] hover:bg-[#20B2AA] hover:text-white px-8"
              onClick={() => window.location.reload()}
            >
              フィルターをリセット
            </Button>
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="text-[#20B2AA] border-[#20B2AA] hover:bg-[#20B2AA] hover:text-white disabled:opacity-50"
          >
            前へ
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page 
                    ? "bg-[#20B2AA] text-white" 
                    : "text-[#20B2AA] border-[#20B2AA] hover:bg-[#20B2AA] hover:text-white"
                  }
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="text-[#20B2AA] border-[#20B2AA] hover:bg-[#20B2AA] hover:text-white disabled:opacity-50"
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
