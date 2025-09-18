'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Settings, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ResizableDelta, Position } from 'react-rnd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

import { useTemplate, ShapeType } from './contexts/TemplateContext';
import TemplateSelector from './components/TemplateSelector';
import ThumbnailText from './components/ThumbnailText';
import ThumbnailImage from './components/ThumbnailImage';
import ThumbnailShape from './components/ThumbnailShape';
import { LayerPanel } from './components/LayerPanel';

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
    layers,
    addLayer, // addLayerをコンテキストから取得
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
  } = useTemplate();

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

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
  const handleLayerDragStop = React.useCallback((id: string, _: unknown, d: Position) => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`ファイルサイズが大きすぎます: ${file.name}`, {
          description: `10MB以下のファイルを選択してください。`,
        });
        continue;
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`ファイル形式が無効です: ${file.name}`, {
          description: "JPEG, PNG, WEBP形式の画像ファイルを選択してください。",
        });
        continue;
      }

      const src = URL.createObjectURL(file);
      addLayer({
        type: 'image',
        name: file.name,
        visible: true,
        locked: false,
        x: 550,
        y: 250,
        width: 300,
        height: 300,
        src,
      });
    }
    e.target.value = '';
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const offset = layers.filter(l => l.type === 'shape').length * 20;
    addLayer({
      type: 'shape',
      shapeType,
      name: `${shapeType === 'rectangle' ? '四角' : '円'} ${layers.filter(l => l.type === 'shape').length + 1}`,
      visible: true,
      locked: false,
      x: 550 + offset,
      y: 250 + offset,
      width: 300,
      height: 300,
      backgroundColor: '#cccccc',
      borderColor: '#000000',
      borderWidth: 2,
    });
  };

  const handleAddText = () => {
    addLayer({
      type: 'text',
      name: `テキスト ${layers.filter(l => l.type === 'text').length + 1}`,
      visible: true,
      locked: false,
      x: 550,
      y: 250,
      width: 300,
      height: 100,
      text: currentText,
      color: '#000000',
      fontSize: '2rem',
    });
  };

  if (!selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

  return (
    <div className="relative flex flex-col lg:h-screen">
      <div className="absolute top-4 right-4 z-20 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} aria-label="設定パネルを開く">
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        <main className={cn("flex-grow p-4", isSidebarOpen ? "lg:w-3/4" : "lg:w-full")}>
          <div className="flex flex-col h-full">
            <header className="mb-4">
              <h1 className="text-3xl font-bold tracking-tight">サムネイル自動生成ツール</h1>
              <p className="text-muted-foreground mt-2">テンプレートと要素を組み合わせて、オリジナルのサムネイルを作成します。</p>
            </header>
            <div id="thumbnail-preview" className={cn("aspect-video w-full bg-card relative border rounded-md", {
                'simple-enhanced': selectedTemplate.id === 'template-1',
                'stylish-enhanced': selectedTemplate.id === 'template-2',
                'cute-enhanced': selectedTemplate.id === 'template-3',
                'cool-enhanced': selectedTemplate.id === 'template-4',
                'bg-gray-200': selectedTemplate.id === 'template-5',
              })}>
              {selectedTemplate.id === 'template-4' && (
                <>
                  <div className="digital-overlay"></div>
                  <div className="light-ray-1"></div>
                  <div className="light-ray-2"></div>
                </>
              )}
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
                      onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
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
                      onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                      onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                      enableResizing={isResizable}
                      disableDragging={!isDraggable}
                    />
                  );
                } else if (layer.type === 'shape' && layer.shapeType) {
                  return (
                    <ThumbnailShape
                      key={layer.id}
                      shapeType={layer.shapeType}
                      backgroundColor={layer.backgroundColor || '#cccccc'}
                      borderColor={layer.borderColor || '#000000'}
                      borderWidth={layer.borderWidth || 0}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                      onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                      onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                      lockAspectRatio={isShiftKeyDown}
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

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

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
            <TabsContent value="tools" className="mt-4">
              <Accordion type="multiple" className="w-full" defaultValue={['text']}>
                <AccordionItem value="text">
                  <AccordionTrigger>テキスト</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail-text">テキスト内容</Label>
                      <Textarea id="thumbnail-text" value={currentText} onChange={(e) => setCurrentText(e.target.value)} className="h-24" />
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" className="w-full" onClick={handleAddText}>テキストを追加</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="images">
                  <AccordionTrigger>画像</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-images">画像を追加</Label>
                      <Input id="add-images" type="file" accept="image/*" multiple onChange={handleImageUpload} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shapes">
                  <AccordionTrigger>図形</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => handleAddShape('rectangle')}>四角を追加</Button>
                      <Button variant="outline" onClick={() => handleAddShape('circle')}>円を追加</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="style">
                  <AccordionTrigger>スタイル</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {!selectedLayer && <p className="text-sm text-muted-foreground">レイヤーを選択してください</p>}
                    {selectedLayer?.type === 'text' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="text-color">テキストカラー</Label>
                          <input id="text-color" type="color" value={selectedLayer.color} onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })} className="w-full h-10 rounded-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="font-size">フォントサイズ ({selectedLayer.fontSize})</Label>
                          <Slider id="font-size" min={1} max={8} step={0.1} value={[parseFloat(selectedLayer.fontSize || '1')]} onValueChange={(v) => updateLayer(selectedLayer.id, { fontSize: `${v[0]}rem` })} />
                        </div>
                      </>
                    )}
                    {selectedLayer?.type === 'shape' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="shape-fill">塗りつぶし</Label>
                          <input id="shape-fill" type="color" value={selectedLayer.backgroundColor} onChange={(e) => updateLayer(selectedLayer.id, { backgroundColor: e.target.value })} className="w-full h-10 rounded-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shape-stroke">枠線</Label>
                          <input id="shape-stroke" type="color" value={selectedLayer.borderColor} onChange={(e) => updateLayer(selectedLayer.id, { borderColor: e.target.value })} className="w-full h-10 rounded-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shape-stroke-width">枠線の太さ ({selectedLayer.borderWidth}px)</Label>
                          <Slider id="shape-stroke-width" min={0} max={20} step={1} value={[selectedLayer.borderWidth || 0]} onValueChange={(v) => updateLayer(selectedLayer.id, { borderWidth: v[0] })} />
                        </div>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            <TabsContent value="layers" className="mt-4 space-y-6">
              <LayerPanel />
            </TabsContent>
          </Tabs>
        </aside>

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
