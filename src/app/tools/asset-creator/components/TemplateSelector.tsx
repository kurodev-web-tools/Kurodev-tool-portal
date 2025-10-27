import React from 'react';
import { ResponsiveImage } from '@/components/ui/optimized-image';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplate } from '../contexts/TemplateContext';
import { useTemplateManagement, useCustomAspectRatio, Template } from '@/hooks/useTemplateManagement';

// 型エイリアス（後方互換性のため）
export type ThumbnailTemplate = Template;

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
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {filteredTemplates
                      .filter(template => template.genre === genre)
                      .map((template) => (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer hover:border-[#20B2AA] transition-colors group",
                            selectedTemplateId === template.id && "border-2 border-[#20B2AA] ring-2 ring-[#20B2AA]"
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
                              <ResponsiveImage
                                src={template.initialImageSrc}
                                alt={template.name}
                                aspectRatio="16:9"
                                breakpoints={{
                                  sm: 200,
                                  md: 250,
                                  lg: 300
                                }}
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
