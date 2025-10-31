import React, { useState, useMemo } from 'react';
import { ResponsiveImage } from '@/components/ui/optimized-image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Search, Heart, Grid3x3, Grid2x2, ZoomIn } from 'lucide-react';
import { useTemplate } from '../contexts/TemplateContext';
import { useTemplateManagement, useCustomAspectRatio, Template } from '@/hooks/useTemplateManagement';
import { useMediaQuery } from '@/hooks/use-media-query';

// 型エイリアス（後方互換性のため）
export type ThumbnailTemplate = Template;

const aspectRatios = ['1:1', '4:3', '9:16', '16:9'];

interface TemplateSelectorProps {
  onSelectTemplate: (template: ThumbnailTemplate) => void;
  selectedTemplateId: string | null;
}

const FAVORITES_KEY = 'asset-creator-favorites';

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, selectedTemplateId }) => {
  const { 
    aspectRatio, 
    setAspectRatio, 
    customAspectRatio, 
    setCustomAspectRatio 
  } = useTemplate();

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // 検索・お気に入り・プレビューサイズの状態
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [previewSize, setPreviewSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // カスタムフックでテンプレート管理
  const {
    filteredTemplates,
    availableGenres,
    genreNames,
    isLoading
  } = useTemplateManagement({ aspectRatio, customAspectRatio });

  // カスタムアスペクト比のヘルパー
  const { handleCustomAspectRatioChange } = useCustomAspectRatio(
    customAspectRatio,
    setCustomAspectRatio,
    setAspectRatio
  );

  // お気に入りの切り替え
  const toggleFavorite = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
    }
  };

  // フィルタリングされたテンプレート
  const displayTemplates = useMemo(() => {
    let templates = filteredTemplates;

    // 検索フィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.genre.toLowerCase().includes(query)
      );
    }

    // お気に入りフィルター
    if (activeTab === 'favorites') {
      templates = templates.filter(template => favorites.has(template.id));
    }

    return templates;
  }, [filteredTemplates, searchQuery, activeTab, favorites]);

  // グリッド列数の決定
  const gridCols = useMemo(() => {
    if (!isDesktop) return 'grid-cols-2';
    
    switch (previewSize) {
      case 'small':
        return 'grid-cols-3';
      case 'medium':
        return 'grid-cols-2';
      case 'large':
        return 'grid-cols-1'; // 大きいプレビューは1列表示
      default:
        return 'grid-cols-2';
    }
  }, [isDesktop, previewSize]);

  if (isLoading) {
    return (
      <div className="w-full p-4 text-center">
        <div className="text-sm text-muted-foreground">テンプレートを読み込み中...</div>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full" defaultValue={['aspect-ratio', 'templates']}>
      <AccordionItem value="aspect-ratio">
        <AccordionTrigger>アスペクト比</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <Label>プリセット</Label>
          <ToggleGroup 
            type="single" 
            value={aspectRatio === 'custom' ? '' : aspectRatio}
            onValueChange={(value) => { if (value) setAspectRatio(value); }}
            variant="outline" 
            className="flex-wrap justify-start"
          >
            {aspectRatios.map(ratio => (
              <ToggleGroupItem key={ratio} value={ratio} aria-label={`比率 ${ratio}`}>{ratio}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="space-y-2">
            <Label>手動設定</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="幅" 
                className="w-24" 
                value={customAspectRatio.width}
                onChange={(e) => handleCustomAspectRatioChange(e, 'width')}
              />
              <span>:</span>
              <Input 
                type="number" 
                placeholder="高さ" 
                className="w-24" 
                value={customAspectRatio.height}
                onChange={(e) => handleCustomAspectRatioChange(e, 'height')}
              />
            </div>
            <p className="text-xs text-muted-foreground">小さい数字で比率、大きい数字で解像度を指定できます。</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="templates">
        <AccordionTrigger>テンプレート選択</AccordionTrigger>
        <AccordionContent className="pt-4">
          {availableGenres.length > 0 ? (
            <div className="space-y-4">
              {/* 検索バーとコントロール */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="テンプレートを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-2"
                  />
                </div>
                
                {/* タブとプレビューサイズ切り替え */}
                <div className="flex items-center justify-between gap-2">
                  <Tabs 
                    value={activeTab} 
                    onValueChange={(v) => setActiveTab(v as 'all' | 'favorites')}
                    className="flex-1"
                  >
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="all" className="text-xs">
                        すべて ({displayTemplates.length})
                      </TabsTrigger>
                      <TabsTrigger value="favorites" className="text-xs flex items-center gap-1">
                        <Heart className={cn("h-3 w-3", favorites.size > 0 && "fill-current")} />
                        お気に入り ({favorites.size})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {/* プレビューサイズ切り替え（デスクトップのみ） */}
                  {isDesktop && (
                    <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 transition-colors",
                          previewSize === 'small' && "bg-[#20B2AA]/20 text-[#20B2AA] hover:bg-[#20B2AA]/30"
                        )}
                        onClick={() => setPreviewSize('small')}
                        title="小さいプレビュー（3列表示）"
                      >
                        <Grid3x3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 transition-colors",
                          previewSize === 'medium' && "bg-[#20B2AA]/20 text-[#20B2AA] hover:bg-[#20B2AA]/30"
                        )}
                        onClick={() => setPreviewSize('medium')}
                        title="中サイズプレビュー（2列表示）"
                      >
                        <Grid2x2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 transition-colors",
                          previewSize === 'large' && "bg-[#20B2AA]/20 text-[#20B2AA] hover:bg-[#20B2AA]/30"
                        )}
                        onClick={() => setPreviewSize('large')}
                        title="大きいプレビュー（1列表示）"
                      >
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* ジャンル別タブ（検索時は非表示） */}
              {!searchQuery.trim() && activeTab === 'all' && (
                <Tabs defaultValue={availableGenres[0]} className="w-full">
                  <TabsList className={cn(
                    "w-full h-auto p-1",
                    availableGenres.length <= 4 
                      ? availableGenres.length === 1 ? "grid grid-cols-1" :
                        availableGenres.length === 2 ? "grid grid-cols-2" :
                        availableGenres.length === 3 ? "grid grid-cols-3" :
                        "grid grid-cols-4"
                      : "flex overflow-x-auto space-x-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  )}>
                    {availableGenres.map(genre => (
                      <TabsTrigger 
                        key={genre} 
                        value={genre}
                        className={cn(
                          availableGenres.length > 4 ? 'min-w-fit whitespace-nowrap' : '',
                          'h-8 px-3 py-1 text-sm'
                        )}
                      >
                        {genreNames[genre]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {availableGenres.map(genre => (
                    <TabsContent key={genre} value={genre}>
                      <div className={cn("grid gap-2 mt-4", gridCols)}>
                        {displayTemplates
                          .filter(template => template.genre === genre)
                          .map((template) => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                              isSelected={selectedTemplateId === template.id}
                              isFavorite={favorites.has(template.id)}
                              onSelect={onSelectTemplate}
                              onToggleFavorite={toggleFavorite}
                              aspectRatio={aspectRatio}
                              previewSize={previewSize}
                            />
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}

              {/* 検索結果またはお気に入り表示 */}
              {(searchQuery.trim() || activeTab === 'favorites') && (
                <div className={cn("grid gap-2", gridCols)}>
                  {displayTemplates.length > 0 ? (
                    displayTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplateId === template.id}
                        isFavorite={favorites.has(template.id)}
                        onSelect={onSelectTemplate}
                        onToggleFavorite={toggleFavorite}
                        aspectRatio={aspectRatio}
                        previewSize={previewSize}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                      {searchQuery.trim() 
                        ? '検索結果が見つかりませんでした'
                        : 'お気に入りに登録されたテンプレートはありません'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              このアスペクト比に対応するテンプレートはありません。
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// テンプレートカードコンポーネント
interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (template: Template) => void;
  onToggleFavorite: (templateId: string, e: React.MouseEvent) => void;
  aspectRatio: string;
  previewSize: 'small' | 'medium' | 'large';
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  aspectRatio,
  previewSize,
}) => {
  const breakpoints = useMemo(() => {
    switch (previewSize) {
      case 'small':
        return { sm: 150, md: 180, lg: 200 };
      case 'medium':
        return { sm: 200, md: 250, lg: 300 };
      case 'large':
        return { sm: 300, md: 400, lg: 500 }; // 大きいプレビューはさらに大きなサイズ
      default:
        return { sm: 200, md: 250, lg: 300 };
    }
  }, [previewSize]);

  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-[#20B2AA] transition-all duration-200 group relative",
        isSelected && "border-2 border-[#20B2AA] ring-2 ring-[#20B2AA] ring-offset-2",
        !isSelected && "hover:shadow-lg"
      )}
      onClick={() => onSelect(template)}
    >
      <CardContent className="p-0 rounded-md relative">
        <div className={cn(
          "w-full rounded-md flex items-center justify-center relative overflow-hidden",
          aspectRatio === '1:1' ? 'aspect-square' : 
          aspectRatio === '4:3' ? 'aspect-[4/3]' :
          aspectRatio === '9:16' ? 'aspect-[9/16]' :
          'aspect-video'
        )}>
          <ResponsiveImage
            src={template.initialImageSrc}
            alt={template.name}
            aspectRatio="16:9"
            breakpoints={breakpoints}
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* お気に入りボタン */}
          <button
            onClick={(e) => onToggleFavorite(template.id, e)}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm transition-all duration-200 z-10",
              "hover:bg-black/70 hover:scale-110",
              isFavorite && "bg-[#20B2AA]/80 hover:bg-[#20B2AA]"
            )}
            aria-label={isFavorite ? "お気に入りを解除" : "お気に入りに追加"}
            title={isFavorite ? "お気に入りを解除" : "お気に入りに追加"}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-[#20B2AA] text-[#20B2AA]" : "text-white"
              )} 
            />
          </button>

          {/* 選択時のオーバーレイ */}
          {isSelected && (
            <div className="absolute inset-0 bg-[#20B2AA]/10 border-2 border-[#20B2AA] rounded-md" />
          )}

          {/* ホバー時のテンプレート名表示 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-xs text-white font-medium truncate">{template.name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(TemplateSelector);
