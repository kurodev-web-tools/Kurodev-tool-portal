'use client';

import React from 'react';
import { toPng } from 'html-to-image'; // html-to-imageをインポート
import { Button } from '@/components/ui/button'; // shadcn/uiのButtonをインポート

export default function ThumbnailGeneratorPage() {
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
      <div id="thumbnail-preview" className="flex-grow flex items-center justify-center border border-gray-700 bg-gray-800"> {/* idを追加し、背景色を設定 */}
        <h2 className="text-xl font-semibold mb-4">プレビューエリア</h2>
        <p className="text-gray-400">ここにサムネイルのプレビューが表示されます。</p>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleDownloadThumbnail}>画像をダウンロード</Button>
      </div>
    </div>
  );
}
