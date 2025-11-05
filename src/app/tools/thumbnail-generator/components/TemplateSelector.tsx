import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Star, Upload, Save, X, Grid3X3, Grid2x2, ZoomIn, Heart, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generatePreviewFromTemplate, fileToDataURL } from '@/utils/imageUtils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplate } from '../contexts/TemplateContext';
import { TemplateManager } from './TemplateManager';
import { AutoGenerationPanel } from './AutoGenerationPanel';
import { ThumbnailTemplate, aspectRatios } from '@/types/template';
import { templates } from '@/data/template-definitions';
import { logger } from '@/lib/logger';
import { useMediaQuery } from '@/hooks/use-media-query';

interface TemplateSelectorProps {
  onSelectTemplate: (template: ThumbnailTemplate) => void;
  selectedTemplateId: string | null;
}

const FAVORITES_KEY = 'thumbnail-generator-favorites';

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, selectedTemplateId }) => {
  const { 
    aspectRatio, 
    setAspectRatio, 
    customAspectRatio, 
    setCustomAspectRatio 
  } = useTemplate();
  
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ThumbnailTemplate[]>([]);
  const [allTemplates, setAllTemplates] = useState<ThumbnailTemplate[]>(templates);
  const [activeTab, setActiveTab] = useState<'browse' | 'manage' | 'auto-generate'>('browse');
  
  // お気に入り・プレビューサイズの状態
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [previewSize, setPreviewSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [templateTab, setTemplateTab] = useState<'all' | 'favorites'>('all');

  // カスタムテンプレートの読み込み
  useEffect(() => {
    const savedTemplates = localStorage.getItem('customThumbnailTemplates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      setCustomTemplates(parsed);
      setAllTemplates([...templates, ...parsed]);
    }
  }, []);

  const handleCustomAspectRatioChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'width' | 'height') => {
    const value = parseInt(e.target.value, 10);
    const newRatio = { ...customAspectRatio, [type]: value };
    if (!isNaN(value) && value > 0) {
      setCustomAspectRatio(newRatio);
      setAspectRatio('custom');
    }
  };

  // フィルタリング
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStyle = styleFilter === 'all' || template.style === styleFilter;
    const matchesDifficulty = difficultyFilter === 'all' || template.metadata.difficulty === difficultyFilter;
    const matchesAspectRatio = aspectRatio === 'custom' || template.supportedAspectRatios.includes(aspectRatio);
    
    return matchesSearch && matchesCategory && matchesStyle && matchesDifficulty && matchesAspectRatio;
  });
  }, [allTemplates, searchQuery, categoryFilter, styleFilter, difficultyFilter, aspectRatio]);
  
  // 表示用テンプレート（お気に入りフィルター適用）
  const displayTemplates = useMemo(() => {
    let templates = filteredTemplates;
    
    // お気に入りフィルター
    if (templateTab === 'favorites') {
      templates = templates.filter(template => favorites.has(template.id));
    }
    
    return templates;
  }, [filteredTemplates, templateTab, favorites]);
  
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

  // カスタムテンプレート作成
  const handleCreateCustomTemplate = (templateData: Partial<ThumbnailTemplate>) => {
    const newTemplate: ThumbnailTemplate = {
      id: `custom-${Date.now()}`,
      name: templateData.name || 'カスタムテンプレート',
      description: templateData.description || '',
      category: templateData.category || 'custom',
      style: templateData.style || 'simple',
      rating: 0,
      preview: templateData.preview || '',
      supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
      layout: {
        background: {
          type: 'color',
          value: '#FFFFFF',
        },
        objects: [
          {
            id: 'text-main',
            type: 'text',
            position: { x: 340, y: 285, width: 600, height: 150 },
            content: {
              text: '新しいテキスト',
              fontSize: '4rem',
              fontFamily: 'Arial, sans-serif',
              color: '#000000',
            },
            zIndex: 1,
            visible: true,
          },
        ],
      },
      colorPalette: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#007bff',
        background: '#FFFFFF',
        text: '#000000',
        light: '#FFFFFF',
        dark: '#000000',
        muted: '#6c757d',
        highlight: '#007bff',
      },
      fontSettings: {
        family: 'Arial, sans-serif',
        size: '4rem',
        weight: 'normal',
        style: 'normal',
        lineHeight: 1.2,
        letterSpacing: '0.05em',
        textAlign: 'center',
        textDecoration: 'none',
        textShadow: 'none',
      },
      settings: {
        defaultFontSize: '4rem',
        defaultFontFamily: 'Arial, sans-serif',
        defaultTextColor: '#000000',
        defaultBackgroundColor: '#FFFFFF',
        maxObjects: 20,
        minObjectSize: 10,
        maxObjectSize: 1000,
        allowAnimation: true,
        allowEffects: true,
        allowVideo: true,
        allowGif: true,
        exportFormats: ['png', 'jpg', 'webp', 'svg', 'pdf'],
        defaultExportFormat: 'png',
        exportQuality: 'high',
      },
      metadata: {
        version: '1.0.0',
        author: 'User',
        tags: ['custom', 'user-created'],
        difficulty: 'beginner',
        estimatedTime: 5,
        lastModified: new Date().toISOString(),
        usage: {
          views: 0,
          downloads: 0,
          favorites: 0,
        },
      },
      // レガシーサポート
      initialText: '新しいテキスト',
      initialTextColor: '#000000',
      initialFontSize: '4rem',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updatedCustomTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(updatedCustomTemplates);
    setAllTemplates([...templates, ...updatedCustomTemplates]);
    
    localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedCustomTemplates));
    toast.success('カスタムテンプレートを作成しました！');
    setShowCustomCreator(false);
  };

  // カスタムテンプレート削除
  const handleDeleteCustomTemplate = (templateId: string) => {
    if (confirm('このカスタムテンプレートを削除しますか？')) {
      const updatedCustomTemplates = customTemplates.filter(template => template.id !== templateId);
      setCustomTemplates(updatedCustomTemplates);
      setAllTemplates([...templates, ...updatedCustomTemplates]);
      
      localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedCustomTemplates));
      toast.success('カスタムテンプレートを削除しました！');
    }
  };

  // テンプレート管理用のハンドラー
  const handleTemplatesChange = (updatedTemplates: ThumbnailTemplate[]) => {
    setCustomTemplates(updatedTemplates);
    setAllTemplates([...templates, ...updatedTemplates]);
    localStorage.setItem('customThumbnailTemplates', JSON.stringify(updatedTemplates));
  };

  return (
    <div className="w-full">
      {/* タブ切り替え */}
      <div className="border-b mb-4">
        <div className="flex justify-center">
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'browse'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('browse')}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>選択</span>
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'manage'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            <Settings className="h-4 w-4" />
            <span>管理</span>
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'auto-generate'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('auto-generate')}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI生成</span>
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
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
          <div className="space-y-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-lg font-semibold">テンプレート選択</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCustomCreator(true)}
                className="flex items-center gap-1 md:gap-2 h-9 px-3 md:px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">カスタム作成</span>
                <span className="sm:hidden">作成</span>
              </Button>
            </div>

      {/* 検索・フィルター */}
      <div className="space-y-3">
        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
          <Input
            placeholder="テンプレートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 md:h-9"
          />
        </div>
        
        {/* タブとプレビューサイズ切り替え */}
        <div className="flex items-center justify-between gap-2">
          <Tabs 
            value={templateTab} 
            onValueChange={(v) => setTemplateTab(v as 'all' | 'favorites')}
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
                <Grid3X3 className="h-3 w-3" />
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
        
        {/* フィルター */}
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-32 h-10 md:h-9">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="gaming">ゲーム</SelectItem>
              <SelectItem value="talk">雑談</SelectItem>
              <SelectItem value="singing">歌枠</SelectItem>
              <SelectItem value="collaboration">コラボ</SelectItem>
              <SelectItem value="event">イベント</SelectItem>
              <SelectItem value="custom">カスタム</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-full md:w-32 h-10 md:h-9">
              <SelectValue placeholder="スタイル" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="cute">可愛い</SelectItem>
              <SelectItem value="cool">クール</SelectItem>
              <SelectItem value="elegant">エレガント</SelectItem>
              <SelectItem value="funny">面白い</SelectItem>
              <SelectItem value="simple">シンプル</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-32 h-10 md:h-9">
              <SelectValue placeholder="難易度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="beginner">初級</SelectItem>
              <SelectItem value="intermediate">中級</SelectItem>
              <SelectItem value="advanced">上級</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* テンプレートグリッド */}
      {displayTemplates.length > 0 ? (
        <div className={cn("grid gap-3", gridCols)}>
          {displayTemplates.map((template) => (
            <TemplateCard
            key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              isFavorite={favorites.has(template.id)}
              onSelect={onSelectTemplate}
              onToggleFavorite={toggleFavorite}
              onDelete={template.isCustom ? handleDeleteCustomTemplate : undefined}
              previewSize={previewSize}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-8">
          {searchQuery.trim() 
            ? '検索結果が見つかりませんでした'
            : templateTab === 'favorites'
            ? 'お気に入りに登録されたテンプレートはありません'
            : 'この条件に一致するテンプレートはありません'}
        </div>
      )}

            {/* カスタムテンプレート作成モーダル */}
            {showCustomCreator && (
              <CustomTemplateCreator
                onCreateTemplate={handleCreateCustomTemplate}
                onClose={() => setShowCustomCreator(false)}
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
      ) : activeTab === 'manage' ? (
        <TemplateManager
          templates={customTemplates}
          onTemplatesChange={handleTemplatesChange}
          onSelectTemplate={onSelectTemplate}
          selectedTemplateId={selectedTemplateId}
        />
      ) : (
        <AutoGenerationPanel
          onTemplateGenerated={onSelectTemplate}
          onTemplatesGenerated={(templates) => {
            const updatedTemplates = [...customTemplates, ...templates];
            handleTemplatesChange(updatedTemplates);
          }}
        />
      )}
    </div>
  );
};

// テンプレートカードコンポーネント
interface TemplateCardProps {
  template: ThumbnailTemplate;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (template: ThumbnailTemplate) => void;
  onToggleFavorite: (templateId: string, e: React.MouseEvent) => void;
  onDelete?: (templateId: string) => void;
  previewSize: 'small' | 'medium' | 'large';
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onDelete,
  previewSize,
}) => {
  // プレビューサイズに応じた画像サイズの計算
  const imageSize = useMemo(() => {
    switch (previewSize) {
      case 'small':
        return { height: '120px' };
      case 'medium':
        return { height: '160px' };
      case 'large':
        return { height: '240px' };
      default:
        return { height: '160px' };
    }
  }, [previewSize]);

  return (
    <Card
            className={cn(
        "cursor-pointer hover:border-[#20B2AA] transition-all duration-200 group relative overflow-hidden",
        isSelected && "border-2 border-[#20B2AA] ring-2 ring-[#20B2AA] ring-offset-2",
        !isSelected && "hover:shadow-lg"
            )}
      onClick={() => onSelect(template)}
          >
      <CardContent className="p-0 relative">
                {/* プレビュー画像部分 */}
        <div 
          className={cn(
            "w-full bg-[#2D2D2D] relative overflow-hidden",
            previewSize === 'large' ? 'aspect-video' : 'aspect-video'
          )}
          style={imageSize}
        >
                  {template.preview ? (
                    <img
                      src={template.preview}
                      alt={template.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-xs md:text-sm relative overflow-hidden"
                      style={{
                        background: template.layout.background.type === 'color' 
                          ? template.layout.background.value
                          : template.layout.background.type === 'gradient'
                          ? template.layout.background.value
                          : '#f8f9fa'
                      }}
                    >
                      {/* テンプレートオブジェクトのプレビュー */}
                      {template.layout.objects.map((obj) => {
                        if (obj.type === 'text' && obj.content?.text) {
                          return (
                            <div
                              key={obj.id}
                              className="absolute"
                              style={{
                                left: `${(obj.position.x / 1200) * 100}%`,
                                top: `${(obj.position.y / 675) * 100}%`,
                                width: `${(obj.position.width / 1200) * 100}%`,
                                height: `${(obj.position.height / 675) * 100}%`,
                        fontSize: previewSize === 'large' ? '0.75rem' : '0.5rem',
                                color: obj.content.color || template.colorPalette.text,
                                fontFamily: obj.content.fontFamily || template.fontSettings.family,
                                fontWeight: obj.content.fontSize?.includes('bold') ? 'bold' : 'normal',
                                textAlign: obj.content.textAlign || template.fontSettings.textAlign,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transform: `scale(${Math.min(1, 100 / (obj.content.text.length || 1))})`,
                              }}
                            >
                              {obj.content.text}
                            </div>
                          );
                        }
                        return null;
                      })}
                      
                      {/* フォールバック: レガシーサポート */}
                      {template.layout.objects.length === 0 && template.initialText && (
                        <p 
                          className="font-bold text-center px-1" 
                          style={{ 
                            color: template.initialTextColor || template.colorPalette.text,
                    fontSize: previewSize === 'large' ? '0.75rem' : '0.5rem'
                          }}
                        >
                          {template.initialText}
                        </p>
                      )}
                    </div>
                  )}
          
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
                  
                  {/* デスクトップ用ホバーオーバーレイ */}
          {onDelete && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                  onDelete(template.id);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        削除
                      </Button>
            </div>
                    )}
                </div>
                
                {/* コンテンツ部分 */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{template.name}</h4>
              {template.description && (
                <p className="text-xs text-[#A0A0A0] mt-1 line-clamp-2">{template.description}</p>
              )}
                    </div>
                    {/* モバイル用削除ボタン */}
            {onDelete && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                className="md:hidden ml-2 h-6 w-6 p-0 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                  onDelete(template.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {template.category === 'gaming' ? 'ゲーム' :
                         template.category === 'talk' ? '雑談' :
                         template.category === 'singing' ? '歌枠' :
                         template.category === 'collaboration' ? 'コラボ' :
                         template.category === 'event' ? 'イベント' : 'カスタム'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          color: template.metadata.difficulty === 'beginner' ? '#22c55e' :
                                 template.metadata.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        {template.metadata.difficulty === 'beginner' ? '初級' :
                         template.metadata.difficulty === 'intermediate' ? '中級' : '上級'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{template.rating}</span>
                    </div>
                  </div>
                  
                  {/* メタデータ情報 */}
                  <div className="flex items-center justify-between mt-1 text-xs text-[#A0A0A0]">
                    <span>{template.metadata.estimatedTime}分</span>
                    <span>{template.layout.objects.length}オブジェクト</span>
                  </div>
                </div>
      </CardContent>
            </Card>
  );
};

// カスタムテンプレート作成コンポーネント
interface CustomTemplateCreatorProps {
  onCreateTemplate: (templateData: Partial<ThumbnailTemplate>) => void;
  onClose: () => void;
}

const CustomTemplateCreator: React.FC<CustomTemplateCreatorProps> = ({ onCreateTemplate, onClose }) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('custom');
  const [templateStyle, setTemplateStyle] = useState<string>('simple');
  const [templateImage, setTemplateImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // ファイルをDataURLに変換
      const templateDataURL = await fileToDataURL(file);
      setTemplateImage(templateDataURL);
      
      // プレビュー画像を自動生成
      setIsGeneratingPreview(true);
      const previewDataURL = await generatePreviewFromTemplate(templateDataURL);
      setPreviewImage(previewDataURL);
      
      toast.success('画像をアップロードし、プレビューを生成しました！');
    } catch (error) {
      logger.error('画像アップロード失敗', error, 'TemplateSelector');
      toast.error('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
      setIsGeneratingPreview(false);
    }
  };

  const handleCreate = () => {
    if (!templateName.trim()) {
      toast.error('テンプレート名を入力してください');
      return;
    }

    if (!templateImage) {
      toast.error('テンプレート画像をアップロードしてください');
      return;
    }

    onCreateTemplate({
      name: templateName,
      description: templateDescription,
      category: templateCategory as any,
      style: templateStyle as any,
      preview: previewImage,
    });

    // フォームをリセット
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('custom');
    setTemplateStyle('simple');
    setTemplateImage('');
    setPreviewImage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              カスタムテンプレート作成
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-[#A0A0A0]">
            既存のサムネイル画像をアップロードしてテンプレートとして保存できます
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-xs text-yellow-800">
              <strong>注意:</strong> カスタムテンプレートは現在1280×720でのエクスポートのみ対応しています。
              他の解像度でのエクスポートは正常に動作しない場合があります。
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* テンプレート画像アップロード */}
          <div>
            <Label className="text-sm font-medium">テンプレート画像</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              {templateImage && (
                <div className="space-y-2">
                  <div className="aspect-video bg-[#2D2D2D] rounded-md overflow-hidden">
                    <img
                      src={templateImage}
                      alt="テンプレート"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-[#A0A0A0]">元画像 (1280×720px推奨)</p>
                </div>
              )}
              {previewImage && (
                <div className="space-y-2">
                  <div className="aspect-video bg-[#2D2D2D] rounded-md overflow-hidden max-w-xs">
                    <img
                      src={previewImage}
                      alt="プレビュー"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-[#A0A0A0]">プレビュー画像 (320×180px)</p>
                </div>
              )}
              {isUploading && (
                <p className="text-xs text-[#A0A0A0] mt-1">アップロード中...</p>
              )}
              {isGeneratingPreview && (
                <p className="text-xs text-blue-500 mt-1">プレビュー生成中...</p>
              )}
            </div>
          </div>

          {/* テンプレート名 */}
          <div>
            <Label className="text-sm font-medium">テンプレート名</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="テンプレート名を入力"
              className="mt-1"
            />
          </div>

          {/* 説明 */}
          <div>
            <Label className="text-sm font-medium">説明</Label>
            <Textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="テンプレートの説明を入力"
              className="mt-1 min-h-[80px] resize-none"
            />
          </div>

          {/* カテゴリとスタイル */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">カテゴリ</Label>
              <Select value={templateCategory} onValueChange={setTemplateCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gaming">ゲーム</SelectItem>
                  <SelectItem value="talk">雑談</SelectItem>
                  <SelectItem value="singing">歌枠</SelectItem>
                  <SelectItem value="collaboration">コラボ</SelectItem>
                  <SelectItem value="event">イベント</SelectItem>
                  <SelectItem value="custom">カスタム</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">スタイル</Label>
              <Select value={templateStyle} onValueChange={setTemplateStyle}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cute">可愛い</SelectItem>
                  <SelectItem value="cool">クール</SelectItem>
                  <SelectItem value="elegant">エレガント</SelectItem>
                  <SelectItem value="funny">面白い</SelectItem>
                  <SelectItem value="simple">シンプル</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreate} className="flex-1" disabled={!templateName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              テンプレートを作成
            </Button>
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateSelector;
