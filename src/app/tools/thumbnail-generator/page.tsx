'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Rnd, DraggableData, ResizableDelta, Position } from 'react-rnd';

import { useTemplate } from './contexts/TemplateContext';
import TemplateSelector from './components/TemplateSelector';
import ThumbnailText from './components/ThumbnailText';
import ThumbnailImage from './components/ThumbnailImage';

export default function ThumbnailGeneratorPage() {
  // 状態管理フック
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // テンプレートと要素の状態をコンテキストから取得
  const {
    selectedTemplate,
    setSelectedTemplate,
    currentText,
    setCurrentText,
    currentTextColor,
    setCurrentTextColor,
    currentFontSize,
    setCurrentFontSize,
    backgroundImageSrc,
    setBackgroundImageSrc,
    characterImageSrc,
    setCharacterImageSrc,
    // 新しく追加した状態
    backgroundImagePosition,
    setBackgroundImagePosition,
    characterImagePosition,
    setCharacterImagePosition,
  } = useTemplate();

  // デスクトップ表示ではサイドバーを常に開く
  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    }
  }, [isDesktop]);

  // サムネイルを画像としてダウンロードする関数
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

  // 画像の位置とサイズを更新するハンドラー
  const handleImageDragStop = (
    type: 'background' | 'character',
    e: any,
    d: DraggableData
  ) => {
    if (type === 'background') {
      setBackgroundImagePosition(prev => ({ ...prev, x: d.x, y: d.y }));
    } else {
      setCharacterImagePosition(prev => ({ ...prev, x: d.x, y: d.y }));
    }
  };

  const handleImageResizeStop = (
    type: 'background' | 'character',
    e: any,
    dir: any,
    ref: HTMLDivElement,
    delta: ResizableDelta,
    position: Position
  ) => {
    if (type === 'background') {
      setBackgroundImagePosition(prev => ({
        ...prev,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        x: position.x,
        y: position.y,
      }));
    } else {
      setCharacterImagePosition(prev => ({
        ...prev,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        x: position.x,
        y: position.y,
      }));
    }
  };

  // プリセットカラー
  const availableColors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  // selectedTemplateがまだ読み込まれていない場合の表示
  if (!selectedTemplate) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 text-white">
        <p className="text-lg">テンプレートを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col lg:h-screen bg-gray-900 text-white font-sans">
      {/* モバイル用のサイドバー展開ボタン */}
      <div className="absolute top-4 right-4 z-20 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        {/* メインコンテンツ（プレビューエリア） */}
        <main className="flex-grow p-4 w-full lg:w-auto">
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
              {backgroundImageSrc && (
                <ThumbnailImage
                  src={backgroundImageSrc}
                  alt="Background"
                  x={backgroundImagePosition.x}
                  y={backgroundImagePosition.y}
                  width={backgroundImagePosition.width}
                  height={backgroundImagePosition.height}
                  onDragStop={(e, d) => handleImageDragStop('background', e, d)}
                  onResizeStop={(e, dir, ref, delta, position) =>
                    handleImageResizeStop('background', e, dir, ref, delta, position)
                  }
                  className=""
                />
              )}
              {characterImageSrc && (
                <ThumbnailImage
                  src={characterImageSrc}
                  alt="Character"
                  x={characterImagePosition.x}
                  y={characterImagePosition.y}
                  width={characterImagePosition.width}
                  height={characterImagePosition.height}
                  onDragStop={(e, d) => handleImageDragStop('character', e, d)}
                  onResizeStop={(e, dir, ref, delta, position) =>
                    handleImageResizeStop('character', e, dir, ref, delta, position)
                  }
                  className="" // absolute bottom-0 right-0 はThumbnailImage内でRndのpositionで制御されるため不要
                />
              )}
              <ThumbnailText
                text={currentText}
                color={currentTextColor}
                fontSize={currentFontSize}
                className={selectedTemplate.textPositionClass}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDownloadThumbnail}>画像をダウンロード</Button>
            </div>
          </div>
        </main>

        {/* モバイル用のオーバーレイ */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* サイドバー（設定パネル） */}
        <aside
          className={cn(
            "fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-4 border-l z-40",
            "transition-transform duration-300 ease-in-out",
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
            "lg:static lg:w-1/4 lg:translate-x-0 lg:z-auto",
            isSidebarOpen ? 'lg:block' : 'lg:hidden'
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">設定パネル</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">設定</TabsTrigger>
              <TabsTrigger value="tools">ツール</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="mt-4 space-y-6">
              <TemplateSelector
                onSelectTemplate={setSelectedTemplate}
                selectedTemplateId={selectedTemplate.id}
              />
            </TabsContent>
            <TabsContent value="tools" className="mt-4 space-y-6">
              {/* テキスト編集 */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail-text">サムネイルテキスト</Label>
                <Input
                  id="thumbnail-text"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                />
              </div>

              {/* テキストカラー */}
              <div className="space-y-2">
                <Label>テキストカラー</Label>
                <div className="flex gap-2">
                  {availableColors.map((color) => (
                    <div
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full cursor-pointer border-2 border-transparent",
                        currentTextColor === color && "border-primary"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentTextColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* フォントサイズ */}
              <div className="space-y-2">
                <Label htmlFor="font-size">フォントサイズ ({currentFontSize})</Label>
                <Slider
                  id="font-size"
                  min={1}
                  max={5}
                  step={0.1}
                  value={[parseFloat(currentFontSize)]}
                  onValueChange={(value) => setCurrentFontSize(`${value[0]}rem`)}
                />
              </div>

              {/* 画像アップロード */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="background-image">背景画像</Label>
                  <Input
                    id="background-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setBackgroundImageSrc(URL.createObjectURL(e.target.files[0]));
                        // 背景画像がアップロードされたら、位置をリセット
                        setBackgroundImagePosition(selectedTemplate.initialBackgroundImagePosition || { x: 0, y: 0, width: 1200, height: 675 });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="character-image">キャラクター立ち絵</Label>
                  <Input
                    id="character-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCharacterImageSrc(URL.createObjectURL(e.target.files[0]));
                        // キャラクター画像がアップロードされたら、位置をリセット
                        setCharacterImagePosition(selectedTemplate.initialCharacterImagePosition || { x: 700, y: 175, width: 500, height: 500 });
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* PC用の閉じたサイドバーアイコン */}
        {!isSidebarOpen && (
          <div className="hidden lg:flex p-4 border-l flex-shrink-0 flex-col items-center justify-start space-y-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setIsSidebarOpen(true); setSelectedTab("settings"); }}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}