'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { useTemplate } from './contexts/TemplateContext';
import ThumbnailText from './components/ThumbnailText';
import ThumbnailImage from './components/ThumbnailImage';
import { cn } from '@/lib/utils';

export default function ThumbnailGeneratorPage() {
  const { selectedTemplate, currentText, currentTextColor, currentFontSize } = useTemplate(); // テキスト関連の状態も取得

  const handleDownloadThumbnail = () => {
    const node = document.getElementById('thumbnail-preview');
    if (node) {
      toPng(node)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'thumbnail.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
        });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">サムネイル自動生成ツール (MVP)</h1>
        <p className="text-gray-400 mt-2">
          テンプレートとテキスト入力で、簡易的なサムネイルを作成します。
        </p>
      </header>
      {/* プレビューエリア */}
      <div
        id="thumbnail-preview"
        className={cn(
          "flex-grow relative overflow-hidden border border-gray-700 bg-gray-800",
          selectedTemplate.previewClass
        )}
      >
        {selectedTemplate.initialImageSrc && (
          <ThumbnailImage src={selectedTemplate.initialImageSrc} alt="Background" width={1200} height={675} />
        )}
        <ThumbnailText
          text={currentText} // currentTextを使用
          color={currentTextColor} // currentTextColorを使用
          fontSize={currentFontSize} // currentFontSizeを使用
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleDownloadThumbnail}>画像をダウンロード</Button>
      </div>
    </div>
  );
}
