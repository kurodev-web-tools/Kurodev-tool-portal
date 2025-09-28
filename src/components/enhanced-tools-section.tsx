'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedFilter } from '@/components/ui/enhanced-filter';
import { EnhancedToolCard } from '@/components/ui/enhanced-tool-card';

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

interface EnhancedToolsSectionProps {
  tools: ToolItem[];
  className?: string;
  onItemClick?: (item: ToolItem) => void;
}

export function EnhancedToolsSection({ tools, className, onItemClick }: EnhancedToolsSectionProps) {
  const [filteredTools, setFilteredTools] = useState<ToolItem[]>(tools);
  const router = useRouter();

  const handleItemClick = (item: ToolItem) => {
    // hrefが存在するかチェック
    if (!item.href) {
      console.error('Tool href is undefined:', item);
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
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-tight tracking-wide bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
        個別ツール一覧
      </h2>
      <EnhancedFilter 
        items={tools} 
        onFilteredItemsChange={setFilteredTools} 
        className="mb-6"
      />
      {/* モバイル: リスト表示、PC: グリッド表示 */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="group flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer border border-gray-700"
              onClick={() => handleItemClick(tool)}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  <span className="text-xl">🔧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                      {tool.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tool.status === 'released' ? 'bg-green-500/20 text-green-400' :
                      tool.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tool.status === 'released' ? '公開済み' : tool.status === 'beta' ? 'ベータ版' : '開発中'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate mb-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>⭐ {tool.rating.toFixed(1)}</span>
                    <span>使用回数: {tool.usageCount}回</span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <span className="text-blue-400 text-sm">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* PC: グリッド表示 */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <EnhancedToolCard
            key={tool.id}
            item={tool}
            onItemClick={handleItemClick}
          />
        ))}
      </div>
    </div>
  );
}
