import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// テンプレートの型定義
export interface ThumbnailTemplate {
  id: string;
  name: string;
  description: string;
  previewClass: string; // プレビュー用のCSSクラス
  textPositionClass: string; // テキストの位置を決めるCSSクラス
  initialText: string;
  initialTextColor: string;
  initialFontSize: string;
  initialImageSrc?: string;
}

// テンプレートの定義
export const templates: ThumbnailTemplate[] = [
  {
    id: 'template-1',
    name: 'シンプル',
    description: '基本的なレイアウト',
    previewClass: 'bg-blue-500 text-white flex items-center justify-center',
    textPositionClass: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    initialText: 'VTuber配信タイトル',
    initialTextColor: 'white',
    initialFontSize: '2.5rem',
  },
  {
    id: 'template-2',
    name: 'モダン',
    description: 'テキストが中央に大きく表示',
    previewClass: 'bg-purple-600 text-white flex flex-col items-center justify-center',
    textPositionClass: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    initialText: '今日の配信！',
    initialTextColor: 'white',
    initialFontSize: '3.5rem',
  },
  {
    id: 'template-3',
    name: 'ポップ',
    description: '背景画像とテキスト',
    previewClass: 'bg-yellow-400 text-gray-800 flex items-end justify-start p-4',
    textPositionClass: 'absolute bottom-4 left-4',
    initialText: '見てね！',
    initialTextColor: 'black',
    initialFontSize: '2rem',
    initialImageSrc: '/placeholder-bg.png', // 仮の背景画像
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
              <div className={cn("w-full h-24 rounded-md", template.previewClass)}>
                <p className="text-sm font-bold">{template.name}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
