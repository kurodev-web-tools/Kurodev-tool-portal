'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Image, Type, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

// ツールバーのスケルトン
export const ToolbarSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
      {/* 左側: 基本操作 */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 bg-gray-700" />
        <Skeleton className="h-8 w-8 bg-gray-700" />
        <div className="w-px h-6 bg-gray-600 mx-1" />
        <Skeleton className="h-8 w-16 bg-gray-700" />
      </div>

      {/* 中央: ズーム */}
      <div className="flex items-center gap-1 mx-auto">
        <Skeleton className="h-8 w-8 bg-gray-700" />
        <Skeleton className="h-6 w-12 bg-gray-700" />
        <Skeleton className="h-8 w-8 bg-gray-700" />
        <Skeleton className="h-8 w-12 bg-gray-700" />
      </div>

      {/* 右側: エクスポート */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-20 bg-gray-700" />
      </div>
    </div>
  );
};

// プレビューエリアのスケルトン
export const PreviewSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl aspect-video">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-8 mx-auto rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-3 w-48 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// サイドバーのスケルトン
export const SidebarSkeleton: React.FC = () => {
  return (
    <div className="w-80 border-l bg-background p-4 space-y-4">
      {/* タブ */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>

      {/* コンテンツ */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// レイヤーパネルのスケルトン
export const LayerPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {/* 操作ボタン */}
      <div className="flex gap-1 p-2 bg-gray-800 rounded">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>

      {/* レイヤー一覧 */}
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2 border rounded">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 画像読み込み中のプレースホルダー
interface ImageLoadingProps {
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const ImageLoading: React.FC<ImageLoadingProps> = ({ 
  className, 
  aspectRatio = 'video' 
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div className={cn(
      'flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25',
      aspectClasses[aspectRatio],
      className
    )}>
      <div className="text-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">画像を読み込み中...</p>
      </div>
    </div>
  );
};

// エクスポート処理中のオーバーレイ
interface ExportLoadingProps {
  progress?: number;
  status?: string;
}

export const ExportLoading: React.FC<ExportLoadingProps> = ({ 
  progress, 
  status = 'エクスポート中...' 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-80">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{status}</h3>
        </CardHeader>
        <CardContent>
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>進捗</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center mt-4">
            しばらくお待ちください...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// テンプレート読み込み中のプレースホルダー
export const TemplateGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardContent className="p-3">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// レイヤータイプ別のアイコン付きローディング
interface LayerLoadingProps {
  type: 'text' | 'image' | 'shape';
  message?: string;
}

export const LayerLoading: React.FC<LayerLoadingProps> = ({ 
  type, 
  message 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'text':
        return <Type className="h-6 w-6" />;
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'shape':
        return <Square className="h-6 w-6" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'text':
        return 'テキストレイヤーを作成中...';
      case 'image':
        return '画像を処理中...';
      case 'shape':
        return '図形を作成中...';
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="animate-pulse">
        {getIcon()}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {message || getDefaultMessage()}
        </p>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
};


