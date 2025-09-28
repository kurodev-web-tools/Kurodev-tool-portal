'use client';

import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings, Layers, Construction } from "lucide-react";
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
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

import { useTemplate, ShapeType, TemplateProvider } from './contexts/TemplateContext';
import TemplateSelector from './components/TemplateSelector';
import ThumbnailText from './components/ThumbnailText';
import ThumbnailImage from './components/ThumbnailImage';
import ThumbnailShape from './components/ThumbnailShape';
import { LayerPanel } from './components/LayerPanel';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function AssetCreatorPage() {
  // UI状態管理
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });
  const [selectedTab, setSelectedTab] = React.useState("settings");
  const [isShiftKeyDown, setIsShiftKeyDown] = React.useState(false);
  const { handleAsyncError } = useErrorHandler();

  // テンプレートと要素の状態をコンテキストから取得
  const {
    selectedTemplate,
    setSelectedTemplate,
    currentText,
    setCurrentText,
    layers,
    addLayer,
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
    aspectRatio,
    customAspectRatio,
  } = useTemplate();

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  // キー入力のイベントハンドラー
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftKeyDown(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftKeyDown(false);
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
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  // サムネイルのダウンロード処理
  const handleDownloadThumbnail = React.useCallback(async (qualityLevel: 'normal' | 'high' | 'super') => {
    await handleAsyncError(async () => {
      const downloadElement = document.getElementById('download-target');
      if (!downloadElement) {
        throw new Error('ダウンロード対象の要素が見つかりません');
      }

      let baseHeight: number;
      switch (qualityLevel) {
        case 'normal': baseHeight = 720; break;
        case 'high': baseHeight = 1080; break;
        case 'super': baseHeight = 2160; break;
        default: baseHeight = 720; break;
      }

      let parsedAspectRatio = 16 / 9; // デフォルト
      if (aspectRatio === 'custom') {
        if (customAspectRatio.width > 0 && customAspectRatio.height > 0) {
          parsedAspectRatio = customAspectRatio.width / customAspectRatio.height;
        }
      } else {
        const [w, h] = aspectRatio.split(':').map(Number);
        if (w > 0 && h > 0) {
          parsedAspectRatio = w / h;
        }
      }

      const downloadWidth = Math.round(baseHeight * parsedAspectRatio);
      const downloadHeight = baseHeight;

      const dataUrl = await toPng(downloadElement, { 
        cacheBust: true,
        width: downloadWidth,
        height: downloadHeight,
      });
      const link = document.createElement('a');
      link.download = `creative_${qualityLevel}.png`;
      link.href = dataUrl;
      link.click();
    }, `画像の生成に失敗しました`);
  }, [aspectRatio, customAspectRatio, handleAsyncError]);

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
        x: isDesktop ? 550 : 50,
        y: isDesktop ? 250 : 50,
        width: isDesktop ? 300 : 150,
        height: isDesktop ? 300 : 150,
        src,
      });
    }
    e.target.value = '';
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const offset = layers.filter(l => l.type === 'shape').length * (isDesktop ? 20 : 5);
    const shapeCount = layers.filter(l => l.shapeType === shapeType).length + 1;
    let name = '';
    const initialX = isDesktop ? 550 : 10;
    const initialY = isDesktop ? 250 : 10;
    const initialWidth = isDesktop ? 300 : 50;
    const initialHeight = isDesktop ? 300 : 50;
    const initialBorderWidth = isDesktop ? 2 : 1;
    const lineArrowWidth = isDesktop ? 300 : 100;
    const lineArrowHeight = isDesktop ? 5 : 3;

    switch (shapeType) {
      case 'rectangle': name = `四角 ${shapeCount}`; break;
      case 'circle': name = `円 ${shapeCount}`; break;
      case 'line': name = `線 ${shapeCount}`; break;
      case 'arrow': name = `矢印 ${shapeCount}`; break;
    }

    addLayer({
      type: 'shape',
      shapeType,
      name,
      visible: true,
      locked: false,
      x: initialX + offset,
      y: initialY + offset,
      width: (shapeType === 'line' || shapeType === 'arrow') ? lineArrowWidth : initialWidth,
      height: (shapeType === 'line' || shapeType === 'arrow') ? lineArrowHeight : initialHeight,
      backgroundColor: '#cccccc',
      borderColor: '#000000',
      borderWidth: initialBorderWidth,
    });
  };

  const handleAddText = () => {
    addLayer({
      type: 'text',
      name: `テキスト ${layers.filter(l => l.type === 'text').length + 1}`,
      visible: true,
      locked: false,
      x: isDesktop ? 550 : 50,
      y: isDesktop ? 250 : 50,
      width: isDesktop ? 300 : 150,
      height: isDesktop ? 100 : 50,
      text: currentText,
      color: '#000000',
      fontSize: isDesktop ? '2rem' : '1rem',
    });
  };

  if (!selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

  // サイドバーコンテンツ
  const sidebarContent = (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="settings">テンプレート</TabsTrigger>
        <TabsTrigger value="tools">ツール</TabsTrigger>
        <TabsTrigger value="layers">レイヤー</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
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
                <Button variant="outline" onClick={() => handleAddShape('line')}>線を追加</Button>
                <Button variant="outline" onClick={() => handleAddShape('arrow')}>矢印を追加</Button>
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
      <TabsContent value="layers" className="mt-4">
        <LayerPanel />
      </TabsContent>
    </Tabs>
  );

  // モバイル用のサイドバーコンテンツ（テンプレートのみ）
  const mobileSidebarContent = (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">テンプレート選択</h3>
      </div>
      <TemplateSelector onSelectTemplate={setSelectedTemplate} selectedTemplateId={selectedTemplate.id} />
    </div>
  );

  const renderPreview = () => {
    const getAspectRatio = () => {
      if (aspectRatio === 'custom') {
        return `${customAspectRatio.width} / ${customAspectRatio.height}`;
      }
      return aspectRatio.replace(':', ' / ');
    };

    return (
      <>
        <div 
          id="thumbnail-preview" 
          style={{ aspectRatio: getAspectRatio() }}
          className="w-full bg-card relative border rounded-md"
        >
          <div id="download-target" className="w-full h-full relative overflow-hidden">
            {layers.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              const isDraggable = isSelected && !layer.locked;
              const isResizable = isSelected && !layer.locked;

              if (!layer.visible) return null;

              if (layer.type === 'image') {
                return (
                  <ThumbnailImage
                    key={layer.id} id={layer.id} isSelected={isSelected} src={layer.src || ''} alt={layer.name}
                    x={layer.x} y={layer.y} width={layer.width} height={layer.height} rotation={layer.rotation}
                    onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                    onSelect={() => setSelectedLayerId(layer.id)}
                    isLocked={layer.locked}
                    isDraggable={isDraggable}
                    onRotateStart={() => {}} 
                    onRotate={() => {}} 
                    onRotateStop={() => {}}
                    isBackground={layer.isBackground}
                    zIndex={layer.zIndex}
                  />
                );
              } else if (layer.type === 'text') {
                return (
                  <ThumbnailText
                    key={layer.id} id={layer.id} isSelected={isSelected} text={layer.text || ''} color={layer.color || '#000000'}
                    fontSize={layer.fontSize || '1rem'} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                    rotation={layer.rotation} onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    enableResizing={isResizable} disableDragging={!isDraggable}
                    zIndex={layer.zIndex}
                  />
                );
              } else if (layer.type === 'shape' && layer.shapeType) {
                return (
                  <ThumbnailShape
                    key={layer.id} id={layer.id} isSelected={isSelected} shapeType={layer.shapeType}
                    backgroundColor={layer.backgroundColor || '#cccccc'} borderColor={layer.borderColor || '#000000'}
                    borderWidth={layer.borderWidth || 0} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                    rotation={layer.rotation} onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                    onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                    lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                    zIndex={layer.zIndex}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={() => handleDownloadThumbnail('normal')} size="sm">
            通常画質
          </Button>
          <Button onClick={() => handleDownloadThumbnail('high')} size="sm">
            高画質
          </Button>
          <Button onClick={() => handleDownloadThumbnail('super')} size="sm">
            最高画質
          </Button>
        </div>
      </>
    );
  };

  const renderToolsPanel = () => (
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
            <Button variant="outline" onClick={() => handleAddShape('line')}>線を追加</Button>
            <Button variant="outline" onClick={() => handleAddShape('arrow')}>矢印を追加</Button>
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
  );

  return (
    <div className="relative flex flex-col lg:h-screen">
      {/* モバイル用オーバーレイ（サイドバーが開いている時のみ表示） */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        <main className="flex-1 overflow-y-auto p-2 pt-20 lg:p-4 lg:pt-4">
          {renderPreview()}
          
          {/* モバイル用ツールとレイヤー */}
          {!isDesktop && (
            <div className="mt-6 space-y-4">
              {/* ツールパネル（全体をアコーディオンで囲む） */}
              <div className="bg-card border rounded-lg p-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tools">
                    <AccordionTrigger>
                      <h3 className="text-lg font-semibold">ツール</h3>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {renderToolsPanel()}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              {/* レイヤーパネル（常時表示） */}
              <div className="bg-card border rounded-lg p-4">
                <LayerPanel />
              </div>
            </div>
          )}
        </main>

        {/* サイドバーが閉じている場合の開くボタン */}
        {!isSidebarOpen && (
          <SidebarToggle
            onOpen={() => setIsSidebarOpen(true)}
            isDesktop={isDesktop}
            tabs={[
              { id: "settings", label: "テンプレート", icon: <Settings className="h-4 w-4" /> },
              { id: "tools", label: "ツール", icon: <Construction className="h-4 w-4" /> },
              { id: "layers", label: "レイヤー", icon: <Layers className="h-4 w-4" /> }
            ]}
            onTabClick={(tabId) => {
              // タブの状態管理が必要な場合はここで実装
              console.log('Tab clicked:', tabId);
            }}
          />
        )}

        {/* サイドバー */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          title=""
          isDesktop={isDesktop}
          className="lg:w-1/4"
        >
          {isDesktop ? sidebarContent : mobileSidebarContent}
        </Sidebar>
      </div>
    </div>
  );
}

// TemplateProviderでラップしたコンポーネント
export default function AssetCreatorPageWithProvider() {
  return (
    <TemplateProvider>
      <AssetCreatorPage />
    </TemplateProvider>
  );
}