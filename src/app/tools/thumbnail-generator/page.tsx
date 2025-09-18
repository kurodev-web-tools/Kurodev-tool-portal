'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Settings, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DraggableData, ResizableDelta, Position } from 'react-rnd';

import { useTemplate, Layer } from './contexts/TemplateContext'; // Layerもインポート
import TemplateSelector from './components/TemplateSelector';
import ThumbnailText from './components/ThumbnailText';
import ThumbnailImage from './components/ThumbnailImage';
import { LayerPanel } from './components/LayerPanel';

// テンプレートコンポーネントのインポート
import { StylishTemplate } from './components/templates/StylishTemplate';
import { SimpleTemplate } from './components/templates/SimpleTemplate';
import { CuteTemplate } from './components/templates/CuteTemplate';
import { CoolTemplate } from './components/templates/CoolTemplate';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
    layers,
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
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

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = React.useCallback((id: string, d: DraggableData) => {
    updateLayer(id, { x: d.x, y: d.y });
  }, [updateLayer]);

  const handleLayerResize = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [updateLayer]);

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      // ファイルが選択されていない場合、背景画像レイヤーのsrcをnullにする
      const backgroundLayer = layers.find(layer => layer.name === '背景画像' && layer.type === 'image');
      if (backgroundLayer) {
        updateLayer(backgroundLayer.id, { src: null });
      }
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("ファイルサイズが大きすぎます", {
        description: `10MB以下のファイルを選択してください。`,
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("ファイル形式が無効です", {
        description: "JPEG, PNG, WEBP形式の画像ファイルを選択してください。",
      });
      return;
    }

    // 背景画像レイヤーを更新または追加
    const backgroundLayer = layers.find(layer => layer.name === '背景画像' && layer.type === 'image');
    const src = URL.createObjectURL(file);
    if (backgroundLayer) {
      updateLayer(backgroundLayer.id, { src });
    } else {
      // 新しい背景画像レイヤーを追加
      // TODO: 適切な初期位置とサイズを設定する
      // addLayer({ type: 'image', name: '背景画像', visible: true, locked: false, x: 0, y: 0, width: 1200, height: 675, src });
    }
  };

  const handleCharacterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("ファイルサイズが大きすぎます", {
        description: `10MB以下のファイルを選択してください。`,
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("ファイル形式が無効です", {
        description: "JPEG, PNG, WEBP形式の画像ファイルを選択してください。",
      });
      return;
    }

    const src = URL.createObjectURL(file);
    // キャラクター画像レイヤーを更新または追加
    const characterLayer = layers.find(layer => layer.name === 'キャラクター' && layer.type === 'image');
    if (characterLayer) {
      updateLayer(characterLayer.id, { src });
    } else {
      // 新しいキャラクター画像レイヤーを追加
      // TODO: 適切な初期位置とサイズを設定する
      // addLayer({ type: 'image', name: 'キャラクター', visible: true, locked: false, x: 700, y: 175, width: 500, height: 500, src });
    }
  };

  if (!selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

  return (
    <div className="relative flex flex-col lg:h-screen">
      {/* Mobile-only drawer open button */}
      <div className="absolute top-4 right-4 z-20 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} aria-label="設定パネルを開く">
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
              {/* レイヤーを逆順にマップして、z-indexのように振る舞わせる */}
              {layers.slice().reverse().map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                const isDraggable = isSelected && !layer.locked;
                const isResizable = isSelected && !layer.locked;

                if (!layer.visible) return null;

                if (layer.type === 'image') {
                  return (
                    <ThumbnailImage
                      key={layer.id}
                      src={layer.src || ''}
                      alt={layer.name}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      onDragStop={(e, d) => handleLayerDragStop(layer.id, d)}
                      onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                      onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                      lockAspectRatio={isShiftKeyDown}
                      enableResizing={isResizable}
                      disableDragging={!isDraggable}
                    />
                  );
                } else if (layer.type === 'text') {
                  return (
                    <ThumbnailText
                      key={layer.id}
                      text={layer.text || ''}
                      color={layer.color || '#000000'}
                      fontSize={layer.fontSize || '1rem'}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      onDragStop={(e, d) => handleLayerDragStop(layer.id, d)}
                      onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                      enableResizing={isResizable}
                      disableDragging={!isDraggable}
                    />
                  );
                }
                return null;
              })}
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
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} aria-label="設定パネルを閉じる">
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">設定</TabsTrigger>
              <TabsTrigger value="tools">ツール</TabsTrigger>
              <TabsTrigger value="layers">レイヤー</TabsTrigger>
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
                <Label htmlFor="text-color">テキストカラー</Label>
                <input id="text-color" type="color" value={currentTextColor} onChange={(e) => setCurrentTextColor(e.target.value)} className="w-full h-10 rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">フォントサイズ ({currentFontSize})</Label>
                <Slider id="font-size" min={1} max={8} step={0.1} value={[parseFloat(currentFontSize)]} onValueChange={(v) => setCurrentFontSize(`${v[0]}rem`)} />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="background-image">背景画像</Label>
                  <Input id="background-image" type="file" accept="image/*" onChange={handleBackgroundImageChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="character-image">キャラクター立ち絵</Label>
                  <Input id="character-image" type="file" accept="image/*" onChange={handleCharacterImageChange} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="layers" className="mt-4 space-y-6">
              <LayerPanel />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Icon bar for PC when sidebar is closed */}
        {!isSidebarOpen && isDesktop && (
          <div className="hidden lg:flex p-4 border-l flex-shrink-0 flex-col items-center justify-start space-y-4">
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="h-9 w-9 rounded-md hover:bg-muted" aria-label="設定パネルを開く">
                <PanelLeftOpen className="h-[18px] w-[18px]" />
              </Button>
              <span className="text-xs text-muted-foreground">開く</span>
            </div>
            <div className="w-full border-t border-border"></div>
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedTab("settings"); setIsSidebarOpen(true); }} className="h-9 w-9 rounded-md hover:bg-muted" aria-label="設定タブを開く">
                <Settings className="h-[18px] w-[18px]" />
              </Button>
              <span className="text-xs text-muted-foreground">設定</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedTab("tools"); setIsSidebarOpen(true); }} className="h-9 w-9 rounded-md hover:bg-muted" aria-label="ツールタブを開く">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Button>
              <span className="text-xs text-muted-foreground">ツール</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedTab("layers"); setIsSidebarOpen(true); }} className="h-9 w-9 rounded-md hover:bg-muted" aria-label="レイヤータブを開く">
                <Layers className="h-[18px] w-[18px]" />
              </Button>
              <span className="text-xs text-muted-foreground">レイヤー</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
