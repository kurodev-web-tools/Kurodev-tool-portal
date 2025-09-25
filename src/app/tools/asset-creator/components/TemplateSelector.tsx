import React, { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplate } from '../contexts/TemplateContext';
import { loadTemplates } from '@/lib/templateLoader';
import { createGenreDisplayMapping } from '@/lib/genreMapping';

// テンプレートの型定義
export interface ThumbnailTemplate {
  id: string;
  name: string;
  genre: string; // ジャンルプロパティを動的に変更
  initialText: string;
  initialTextColor: string;
  initialFontSize: string;
  initialImageSrc: string; // 必須に変更
  initialBackgroundImagePosition?: { x: number; y: number; width: number; height: number };
  initialCharacterImagePosition?: { x: number; y: number; width: number; height: number };
  initialTextPosition?: { x: number; y: number; width: number; height: number };
  supportedAspectRatios: string[];
}



const aspectRatios = ['1:1', '4:3', '9:16', '16:9'];

interface TemplateSelectorProps {
  onSelectTemplate: (template: ThumbnailTemplate) => void;
  selectedTemplateId: string | null;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, selectedTemplateId }) => {
  const { 
    aspectRatio, 
    setAspectRatio, 
    customAspectRatio, 
    setCustomAspectRatio 
  } = useTemplate();

  // 動的テンプレート読み込み
  const [templates, setTemplates] = useState<ThumbnailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplatesData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 テンプレート読み込み開始...');
        const loadedTemplates = await loadTemplates();
        console.log('✅ テンプレート読み込み完了:', loadedTemplates.length, '個');
        console.log('📝 読み込まれたジャンル:', [...new Set(loadedTemplates.map(t => t.genre))]);
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('❌ テンプレート読み込み失敗:', error);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplatesData();
  }, []);

  const handleCustomAspectRatioChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'width' | 'height') => {
    const value = parseInt(e.target.value, 10);
    const newRatio = { ...customAspectRatio, [type]: value };
    if (!isNaN(value) && value > 0) {
      setCustomAspectRatio(newRatio);
      setAspectRatio('custom');
    }
  };

  // 選択中のアスペクト比でテンプレートをフィルタリング
  const filteredTemplates = useMemo(() => {
    console.log('🎯 現在のアスペクト比:', aspectRatio);
    const filtered = templates.filter(t => 
      aspectRatio === 'custom' || t.supportedAspectRatios.includes(aspectRatio)
    );
    console.log('🔍 フィルタリング前のテンプレート数:', templates.length);
    console.log('🔍 フィルタリング後のテンプレート数:', filtered.length);
    console.log('📋 フィルタリング後のジャンル:', [...new Set(filtered.map(t => t.genre))]);
    return filtered;
  }, [templates, aspectRatio]);

  // フィルタリングされたテンプレートからユニークなジャンルを取得
  const availableGenres = useMemo(() => {
    const genres = [...new Set(filteredTemplates.map(t => t.genre))];
    console.log('🔍 利用可能なジャンル:', genres);
    console.log('📊 フィルタリングされたテンプレート数:', filteredTemplates.length);
    console.log('📋 全テンプレート数:', templates.length);
    console.log('🎯 現在のアスペクト比:', aspectRatio);
    console.log('📝 全ジャンル（フィルタリング前）:', [...new Set(templates.map(t => t.genre))]);
    return genres;
  }, [filteredTemplates, templates, aspectRatio]);

  // ジャンルの表示名マッピングを動的に生成
  const genreNames = useMemo(() => 
    createGenreDisplayMapping(availableGenres),
    [availableGenres]
  );

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
            <Tabs defaultValue={availableGenres[0]} className="w-full">
              <TabsList className={cn(
                "w-full",
                availableGenres.length <= 4 
                  ? availableGenres.length === 1 ? "grid grid-cols-1" :
                    availableGenres.length === 2 ? "grid grid-cols-2" :
                    availableGenres.length === 3 ? "grid grid-cols-3" :
                    "grid grid-cols-4"
                  : "flex overflow-x-auto space-x-1 p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              )}>
                {availableGenres.map(genre => (
                  <TabsTrigger 
                    key={genre} 
                    value={genre}
                    className={availableGenres.length > 4 ? 'min-w-fit whitespace-nowrap' : ''}
                  >
                    {genreNames[genre]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {availableGenres.map(genre => (
                <TabsContent key={genre} value={genre}>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {filteredTemplates
                      .filter(template => template.genre === genre)
                      .map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer hover:border-primary transition-colors group",
                            selectedTemplateId === template.id && "border-primary ring-2 ring-primary"
                          )}
                          onClick={() => onSelectTemplate(template)}
                        >
                          <CardContent className="p-0 rounded-md">
                            <div className={cn(
                              "w-full rounded-md flex items-center justify-center relative overflow-hidden",
                              aspectRatio === '1:1' ? 'aspect-square' : 
                              aspectRatio === '4:3' ? 'aspect-[4/3]' :
                              aspectRatio === '9:16' ? 'aspect-[9/16]' :
                              'aspect-video'
                            )}>
                              <Image
                                src={template.initialImageSrc}
                                alt={template.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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

export default React.memo(TemplateSelector);