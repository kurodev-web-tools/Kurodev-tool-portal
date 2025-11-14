import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Edit2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const YOUTUBE_DESCRIPTION_LIMIT = 5000;

interface DescriptionEditorProps {
  description: string;
  viewMode: 'edit' | 'preview';
  onViewModeChange: (mode: 'edit' | 'preview') => void;
  onDescriptionChange: (value: string) => void;
}

export function DescriptionEditor({
  description,
  viewMode,
  onViewModeChange,
  onDescriptionChange,
}: DescriptionEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>概要欄</span>
          <Tabs
            value={viewMode}
            onValueChange={(v) => onViewModeChange(v as 'edit' | 'preview')}
            className="w-auto"
          >
            <TabsList className="h-8">
              <TabsTrigger value="edit" className="text-xs px-3">
                <Edit2 className="h-3 w-3 mr-1.5" />
                編集
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs px-3">
                <Eye className="h-3 w-3 mr-1.5" />
                プレビュー
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as 'edit' | 'preview')}
        >
          <TabsContent value="edit" className="space-y-2 mt-0">
            {/* 文字数カウンター */}
            <div className="flex justify-end items-center gap-2 text-xs">
              <span
                className={cn(
                  description.length > YOUTUBE_DESCRIPTION_LIMIT
                    ? 'text-red-400 font-semibold'
                    : description.length > YOUTUBE_DESCRIPTION_LIMIT * 0.9
                      ? 'text-yellow-400'
                      : 'text-muted-foreground',
                )}
              >
                {description.length} / {YOUTUBE_DESCRIPTION_LIMIT}
              </span>
              {description.length > YOUTUBE_DESCRIPTION_LIMIT && (
                <Badge variant="destructive" className="text-xs">
                  制限超過
                </Badge>
              )}
            </div>

            {/* 編集可能なテキストエリア */}
            <Textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="AIが生成した概要欄（編集可能）"
              rows={12}
              className="resize-y font-mono text-sm"
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            {/* リアルタイムプレビュー（YouTube概要欄風） */}
            <div className="border rounded-lg p-4 bg-[#0F0F0F] min-h-[200px]">
              {description ? (
                <div className="text-sm text-white whitespace-pre-wrap font-sans leading-relaxed">
                  {description.split('\n').map((line, index) => {
                    // セクション検出（【】で囲まれた見出し）
                    const sectionMatch = line.match(/^【(.+?)】/);
                    if (sectionMatch) {
                      const sectionName = sectionMatch[1];
                      return (
                        <div key={index} className="mb-3">
                          <div className="text-[#20B2AA] font-semibold mb-1">
                            【{sectionName}】
                          </div>
                          <div className="text-gray-300 ml-2">
                            {line.replace(/^【.+?】/, '').trim() || '\u00A0'}
                          </div>
                        </div>
                      );
                    }

                    // ハッシュタグ検出
                    if (line.includes('#') || line.trim().startsWith('#')) {
                      return (
                        <div key={index} className="mb-2 text-[#3EA6FF]">
                          {line}
                        </div>
                      );
                    }

                    // タイムスタンプ検出（00:00形式）
                    if (line.match(/^\d{1,2}:\d{2}/)) {
                      return (
                        <div
                          key={index}
                          className="mb-1 text-[#3EA6FF] font-medium"
                        >
                          {line}
                        </div>
                      );
                    }

                    // 通常のテキスト
                    return (
                      <div key={index} className="mb-1 text-gray-300">
                        {line || '\u00A0'}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">
                  概要欄がありません
                </div>
              )}
            </div>

            {/* 文字数カウンター（プレビューでも表示） */}
            <div className="flex justify-end items-center gap-2 text-xs mt-2">
              <span
                className={cn(
                  description.length > YOUTUBE_DESCRIPTION_LIMIT
                    ? 'text-red-400 font-semibold'
                    : description.length > YOUTUBE_DESCRIPTION_LIMIT * 0.9
                      ? 'text-yellow-400'
                      : 'text-muted-foreground',
                )}
              >
                {description.length} / {YOUTUBE_DESCRIPTION_LIMIT}
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
