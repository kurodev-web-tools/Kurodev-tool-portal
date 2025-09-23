import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTemplate } from '../contexts/TemplateContext';

// テンプレートの型定義
export interface ThumbnailTemplate {
  id: string;
  name: string;
  initialText: string;
  initialTextColor: string;
  initialFontSize: string;
  initialImageSrc?: string;
  initialBackgroundImagePosition?: { x: number; y: number; width: number; height: number };
  initialCharacterImagePosition?: { x: number; y: number; width: number; height: number };
  initialTextPosition?: { x: number; y: number; width: number; height: number };
}

// テンプレートの定義
export const templates: ThumbnailTemplate[] = [
  {
    id: 'template-1',
    name: 'シンプル',
    initialText: 'VTuber配信タイトル',
    initialTextColor: '#333333',
    initialFontSize: '4rem',
    initialCharacterImagePosition: { x: 650, y: 100, width: 500, height: 500 },
    initialTextPosition: { x: 50, y: 280, width: 600, height: 150 },
  },
  {
    id: 'template-2',
    name: 'スタイリッシュ',
    initialText: '今日の配信！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5rem',
    initialCharacterImagePosition: { x: 100, y: 150, width: 450, height: 450 },
    initialTextPosition: { x: 600, y: 250, width: 550, height: 200 },
  },
  {
    id: 'template-3',
    name: 'かわいい',
    initialText: 'みてね！',
    initialTextColor: '#FF69B4',
    initialFontSize: '4.5rem',
    initialCharacterImagePosition: { x: 350, y: 100, width: 400, height: 400 },
    initialTextPosition: { x: 50, y: 450, width: 400, height: 150 },
  },
  {
    id: 'template-4',
    name: 'クール',
    initialText: '緊急告知',
    initialTextColor: '#E0E0E0',
    initialFontSize: '6rem',
    initialCharacterImagePosition: { x: 100, y: 100, width: 500, height: 500 },
    initialTextPosition: { x: 650, y: 280, width: 500, height: 150 },
  },
  {
    id: 'template-5',
    name: 'まっさら',
    initialText: 'テキストを入力',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialTextPosition: {  x: 340, y: 285, width: 600, height: 150 },
  },
];

const aspectRatios = ['1:1', '4:3', '3:2', '16:9'];

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

  const handleCustomAspectRatioChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'width' | 'height') => {
    const value = parseInt(e.target.value, 10);
    const newRatio = { ...customAspectRatio, [type]: value };
    if (!isNaN(value) && value > 0) {
      setCustomAspectRatio(newRatio);
      setAspectRatio('custom');
    }
  };

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
                placeholder="幅 (px / 比率)" 
                className="w-24" 
                value={customAspectRatio.width}
                onChange={(e) => handleCustomAspectRatioChange(e, 'width')}
              />
              <span>:</span>
              <Input 
                type="number" 
                placeholder="高さ (px / 比率)" 
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
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer hover:border-primary transition-colors",
                  selectedTemplateId === template.id && "border-primary ring-2 ring-primary"
                )}
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className={cn("w-full aspect-video rounded-b-md flex items-center justify-center relative overflow-hidden", {
                    'simple-enhanced': template.id === 'template-1',
                    'stylish-enhanced': template.id === 'template-2',
                    'cute-enhanced': template.id === 'template-3',
                    'cool-enhanced': template.id === 'template-4',
                    'bg-gray-200': template.id === 'template-5',
                  })}>
                     {template.id === 'template-2' && (
                      <>
                        <div className="abstract-shape s1"></div>
                        <div className="abstract-shape s2"></div>
                      </>
                    )}
                    {template.id === 'template-3' && (
                      <>
                        <div className="dot-pattern"></div>
                        <div className="blob b1"></div>
                        <div className="blob b2"></div>
                      </>
                    )}
                    {template.id === 'template-4' && (
                      <>
                        <div className="digital-overlay"></div>
                        <div className="light-ray-1"></div>
                        <div className="light-ray-2"></div>
                      </>
                    )}
                    <p className="text-xs font-bold z-10" style={{ color: template.initialTextColor }}>
                      {template.initialText}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default React.memo(TemplateSelector);