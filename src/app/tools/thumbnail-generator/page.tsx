'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DraggableData, ResizableDelta, Position } from 'react-rnd';

import { useTemplate } from './contexts/TemplateContext';
import TemplateSelector from './components/TemplateSelector';
import ThumbnailText from './components/ThumbnailText';
import ThumbnailImage from './components/ThumbnailImage';

// テンプレートコンポーネントのインポート
import { StylishTemplate } from './components/templates/StylishTemplate';
import { SimpleTemplate } from './components/templates/SimpleTemplate';
import { CuteTemplate } from './components/templates/CuteTemplate';
import { CoolTemplate } from './components/templates/CoolTemplate';

export default function ThumbnailGeneratorPage() {
  // UI状態管理
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const [isShiftKeyDown, setIsShiftKeyDown] = React.useState(false);
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
    characterImagePosition,
    setCharacterImagePosition,
    textPosition,
    setTextPosition,
  } = useTemplate();

  // キー入力のイベントハンドラー
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftKeyDown(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftKeyDown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // デスクトップ表示時は初期状態でサイドバーを開く
  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    }
  }, [isDesktop]);

  // サムネイルのダウンロード処理
  const handleDownloadThumbnail = React.useCallback(async () => {
    const thumbnailElement = document.getElementById('thumbnail-preview');
    if (thumbnailElement) {
      try {
        const dataUrl = await toPng(thumbnailElement, { cacheBust: true });
        const link = document.createElement('a');
        link.download = 'thumbnail.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('サムネイルの生成に失敗しました', err);
        toast.error("画像の生成に失敗しました", {
          description: "時間をおいて再度お試しいただくか、別の画像でお試しください。",
        });
      }
    }
  }, []);

  // 画像のドラッグ＆リサイズハンドラー
  const handleImageDragStop = React.useCallback((e: MouseEvent, d: DraggableData) => {
    setCharacterImagePosition((prev) => ({ ...prev, x: d.x, y: d.y }));
  }, [setCharacterImagePosition]);

  const handleImageResize = React.useCallback((e: MouseEvent, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    setCharacterImagePosition({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      ...position,
    });
  }, [setCharacterImagePosition]);

  // テキストのドラッグ＆リサイズハンドラー
  const handleTextDragStop = React.useCallback((e: MouseEvent, d: DraggableData) => {
    setTextPosition((prev) => ({ ...prev, x: d.x, y: d.y }));
  }, [setTextPosition]);

  const handleTextResizeStop = React.useCallback((e: MouseEvent, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    setTextPosition({ width: ref.offsetWidth, height: ref.offsetHeight, ...position });
  }, [setTextPosition]);

  // 表示するコンポーネントを定義 (useMemoでメモ化)
  const imageComponent = React.useMemo(() => characterImageSrc ? (
    <ThumbnailImage
      src={characterImageSrc}
      alt="Character"
      x={characterImagePosition.x}
      y={characterImagePosition.y}
      width={characterImagePosition.width}
      height={characterImagePosition.height}
      onDragStop={handleImageDragStop}
      onResize={handleImageResize}
      onResizeStop={handleImageResize}
      lockAspectRatio={isShiftKeyDown}
    />
  ) : null, [characterImageSrc, characterImagePosition, handleImageDragStop, handleImageResize, isShiftKeyDown]);

  const textComponent = React.useMemo(() => (
    <ThumbnailText
      text={currentText}
      color={currentTextColor}
      fontSize={currentFontSize}
      x={textPosition.x}
      y={textPosition.y}
      width={textPosition.width}
      height={textPosition.height}
      onDragStop={handleTextDragStop}
      onResizeStop={handleTextResizeStop}
    />
  ), [currentText, currentTextColor, currentFontSize, textPosition, handleTextDragStop, handleTextResizeStop]);

  // テンプレートを動的にレンダリング
  const renderTemplate = React.useCallback(() => {
    const props = { imageComponent, textComponent };
    switch (selectedTemplate.id) {
      case 'template-1':
        return <SimpleTemplate {...props} />;
      case 'template-2':
        return <StylishTemplate {...props} />;
      case 'template-3':
        return <CuteTemplate {...props} />;
      case 'template-4':
        return <CoolTemplate {...props} />;
      case 'template-5':
      default:
        return <div className="w-full h-full relative">{imageComponent}{textComponent}</div>;
    }
  }, [imageComponent, textComponent, selectedTemplate.id]);

  if (!selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

  return (
    <div className="relative flex flex-col lg:h-screen">
      {/* Mobile-only drawer open button */}
      <div className="absolute top-4 right-4 z-20 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        <main className="flex-grow p-4 w-full lg:w-auto">
          <div className="flex flex-col h-full">
            <header className="mb-4">
              <h1 className="text-3xl font-bold tracking-tight">サムネイル自動生成ツール</h1>
              <p className="text-muted-foreground mt-2">テンプレートと要素を組み合わせて、オリジナルのサムネイルを作成します。</p>
            </header>
            <div id="thumbnail-preview" className="aspect-video w-full bg-card relative border rounded-md">
              {backgroundImageSrc && <Image src={backgroundImageSrc} alt="Background" layout="fill" objectFit="cover" priority />}
              {renderTemplate()}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDownloadThumbnail}>画像をダウンロード</Button>
            </div>
          </div>
        </main>

        {/* Overlay for mobile when drawer is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar/Drawer */}
        <aside
          className={[
            "fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-4 border-l z-40",
            "transition-transform duration-300 ease-in-out",
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
            "lg:static lg:w-1/4 lg:translate-x-0 lg:z-auto",
            isSidebarOpen ? 'lg:block' : 'lg:hidden'
          ].join(' ')}
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
              <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate.id} />
            </TabsContent>
            <TabsContent value="tools" className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="thumbnail-text">サムネイルテキスト</Label>
                <Textarea id="thumbnail-text" value={currentText} onChange={(e) => setCurrentText(e.target.value)} className="h-24" />
              </div>
              <div className="space-y-2">
                <Label>テキストカラー</Label>
                <input type="color" value={currentTextColor} onChange={(e) => setCurrentTextColor(e.target.value)} className="w-full h-10 rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">フォントサイズ ({currentFontSize})</Label>
                <Slider id="font-size" min={1} max={8} step={0.1} value={[parseFloat(currentFontSize)]} onValueChange={(v) => setCurrentFontSize(`${v[0]}rem`)} />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="background-image">背景画像</Label>
                  <Input id="background-image" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setBackgroundImageSrc(URL.createObjectURL(e.target.files[0]))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="character-image">キャラクター立ち絵</Label>
                  <Input id="character-image" type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      const src = URL.createObjectURL(file);
                      setCharacterImageSrc(src);
                      const img = new window.Image();
                      img.src = src;
                      img.onload = () => {
                        const initialWidth = selectedTemplate.initialCharacterImagePosition?.width || 500;
                        const aspectRatio = img.naturalWidth / img.naturalHeight;
                        const height = initialWidth / aspectRatio;
                        const x = selectedTemplate.initialCharacterImagePosition?.x || 700;
                        const y = selectedTemplate.initialCharacterImagePosition?.y || 175;
                        setCharacterImagePosition({ x, y, width: initialWidth, height });
                      };
                    }
                  }} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Icon bar for PC when sidebar is closed */}
        {!isSidebarOpen && isDesktop && (
          <div className="hidden lg:flex p-4 border-l flex-shrink-0 flex-col items-center justify-start space-y-4">
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="h-9 w-9 rounded-md hover:bg-muted">
                <PanelLeftOpen className="h-[18px] w-[18px]" />
              </Button>
              <span className="text-xs text-muted-foreground">開く</span>
            </div>
            <div className="w-full border-t border-border"></div>
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedTab("settings"); setIsSidebarOpen(true); }} className="h-9 w-9 rounded-md hover:bg-muted">
                <Settings className="h-[18px] w-[18px]" />
              </Button>
              <span className="text-xs text-muted-foreground">設定</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedTab("tools"); setIsSidebarOpen(true); }} className="h-9 w-9 rounded-md hover:bg-muted">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Button>
              <span className="text-xs text-muted-foreground">ツール</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}