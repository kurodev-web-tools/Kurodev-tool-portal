import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    initialTextPosition: { x: -300, y: -100, width: 600, height: 150 },
  },
  {
    id: 'template-2',
    name: 'スタイリッシュ',
    initialText: '今日の配信！',
    initialTextColor: '#FFFFFF',
    initialFontSize: '5rem',
    initialCharacterImagePosition: { x: 100, y: 150, width: 450, height: 450 },
    initialTextPosition: { x: -300, y: -100, width: 600, height: 150 },
  },
  {
    id: 'template-3',
    name: 'かわいい',
    initialText: 'みてね！',
    initialTextColor: '#FF69B4',
    initialFontSize: '4.5rem',
    initialCharacterImagePosition: { x: 350, y: 100, width: 400, height: 400 },
    initialTextPosition: { x: -300, y: -100, width: 600, height: 150 },
  },
  {
    id: 'template-4',
    name: 'クール',
    initialText: '緊急告知',
    initialTextColor: '#E0E0E0',
    initialFontSize: '6rem',
    initialCharacterImagePosition: { x: 100, y: 100, width: 500, height: 500 },
    initialTextPosition: { x: -300, y: -100, width: 600, height: 150 },
  },
  {
    id: 'template-5',
    name: 'まっさら',
    initialText: 'テキストを入力',
    initialTextColor: '#000000',
    initialFontSize: '4rem',
    initialCharacterImagePosition: { x: 700, y: 175, width: 500, height: 500 },
    initialTextPosition: {  x: 340, y: 285, width: 600, height: 150 },
  },
];

interface TemplateSelectorProps {
  onSelectTemplate: (template: ThumbnailTemplate) => void;
  selectedTemplateId: string | null;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate, selectedTemplateId }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">テンプレート選択</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer hover:border-primary transition-colors",
              selectedTemplateId === template.id && "border-primary ring-2 ring-primary"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("w-full h-24 rounded-md flex items-center justify-center relative overflow-hidden", {
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
                <p className="w-full h-full flex items-center justify-center text-sm font-bold z-10" style={{ color: template.initialTextColor }}>
                  {template.initialText}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;