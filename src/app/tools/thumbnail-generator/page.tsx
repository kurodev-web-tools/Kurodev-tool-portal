'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings, Layers, Construction, Minimize2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from '@/hooks/use-sidebar';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Sidebar, SidebarToggle } from '@/components/layouts/Sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import ThumbnailText from '@/components/shared/thumbnail/ThumbnailText';
import ThumbnailImage from '@/components/shared/thumbnail/ThumbnailImage';
import ThumbnailShape from '@/components/shared/thumbnail/ThumbnailShape';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { ExportSettingsPanel, ExportSettings } from './components/ExportSettingsPanel';
import { EnhancedPreview } from '../asset-creator/components/EnhancedPreview';
import { Toolbar } from '../asset-creator/components/Toolbar';
import { useCanvasOperations } from '../asset-creator/hooks/useCanvasOperations';
import { parseTextShadow, buildTextShadow } from '@/utils/textShadowUtils';
import { FontSelector } from '@/components/shared/FontSelector';
import { ShapeTypeSelector } from '@/components/shared/ShapeTypeSelector';
import { logger } from '@/lib/logger';
import { isTextLayer, isImageLayer, isShapeLayer } from '@/types/layers';
import { useUIState } from './hooks/useUIState';
import { useExportHandlers } from './hooks/useExportHandlers';
import { useEditorState } from './hooks/useEditorState';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ThumbnailGeneratorPage() {
  // UI状態管理（最小限）
  const uiState = useUIState();
  
  // エクスポート機能管理
  const exportHandlers = useExportHandlers();
  
  // エディター状態管理
  const editorState = useEditorState();
  
  // サイドバー状態管理（既存のまま）
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });

  const { handleAsyncError } = useErrorHandler();

  const selectedLayer = editorState.layers.find(layer => layer.id === editorState.selectedLayerId);

  // シャドウの有効/無効状態を同期
  React.useEffect(() => {
    if (selectedLayer && isTextLayer(selectedLayer)) {
      if (selectedLayer.textShadow && selectedLayer.textShadow !== 'none') {
        uiState.setShadowEnabled(true);
      } else {
        uiState.setShadowEnabled(false);
      }
    } else {
      uiState.setShadowEnabled(false);
    }
  }, [selectedLayer, uiState]);

  // プレビューエリアのサイズ計算
  const getPreviewSize = React.useCallback(() => {
    if (!isDesktop) {
      // モバイル表示：画面幅を最大限活用
      if (uiState.isPreviewDedicatedMode) {
        // フルスクリーン表示時は画面幅の95%を使用
        return { width: '95vw', maxWidth: 'none' };
      }
      // 通常表示時は画面幅の90%を使用（サイドバー分を考慮）
      return { width: '90vw', maxWidth: 'none' };
    }

    // プレビュー専用モード
    if (uiState.isPreviewDedicatedMode) {
      return { width: 'min(2000px, 95vw)', maxWidth: 'none' };
    }

    // サイドバーの状態に応じて動的調整
    if (isSidebarOpen) {
      return { width: 'min(1600px, 80vw)', maxWidth: 'none' };
    } else {
      return { width: 'min(1800px, 90vw)', maxWidth: 'none' };
    }
  }, [isDesktop, uiState.isPreviewDedicatedMode, isSidebarOpen]);


  // キー入力のイベントハンドラー
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') uiState.setIsShiftKeyDown(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') uiState.setIsShiftKeyDown(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [uiState]);

  // デスクトップ表示時は初期状態でサイドバーを開く
  React.useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);


  // 画像の読み込み完了を待つ
  const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
        } else {
          const onLoad = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            resolve();
          };
          const onError = () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          logger.warn('画像の読み込みに失敗しました', { src: img.src }, 'ThumbnailGenerator');
          resolve(); // エラーでも続行
        };
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
        }
      });
    });
    
    await Promise.all(imagePromises);
    
    // より長い待機時間でレンダリングを確実にする
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // レイヤーのドラッグ＆リサイズハンドラー
  const handleLayerDragStop = React.useCallback((id: string, _: unknown, d: Position) => {
    // 履歴を先に保存（更新前の状態）
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    // その後でレイヤーを更新
    editorState.updateLayer(id, { x: d.x, y: d.y });
  }, [editorState.updateLayer, editorState.addToHistory, editorState.layers, editorState.selectedLayerId]);

  const handleLayerResize = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    // 履歴を先に保存（更新前の状態）
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    // その後でレイヤーを更新
    editorState.updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [editorState.updateLayer, editorState.addToHistory, editorState.layers, editorState.selectedLayerId]);

  const handleLayerResizeStop = React.useCallback((id: string, dir: string, ref: HTMLElement, delta: ResizableDelta, position: Position) => {
    // リサイズ完了時に履歴を保存
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    editorState.updateLayer(id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  }, [editorState.updateLayer, editorState.addToHistory, editorState.layers, editorState.selectedLayerId]);

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
      editorState.addLayer({
        type: 'image',
        name: file.name,
        visible: true,
        locked: false,
        x: isDesktop ? 550 : 50,
        y: isDesktop ? 250 : 50,
        width: isDesktop ? 300 : 150,
        height: isDesktop ? 300 : 150,
        src,
      } as any);
      // レイヤー追加後に履歴を保存
      editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
    }
    e.target.value = '';
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const offset = editorState.layers.filter(l => l.type === 'shape').length * (isDesktop ? 20 : 5);
    const shapeCount = editorState.layers.filter(l => l.type === 'shape' && 'shapeType' in l && l.shapeType === shapeType).length + 1;
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

    editorState.addLayer({
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
    } as any);
    // レイヤー追加後に履歴を保存
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
  };

  const handleAddText = () => {
    editorState.addLayer({
      type: 'text',
      name: `テキスト ${editorState.layers.filter(l => l.type === 'text').length + 1}`,
      visible: true,
      locked: false,
      x: isDesktop ? 550 : 50,
      y: isDesktop ? 250 : 50,
      width: isDesktop ? 300 : 150,
      height: isDesktop ? 100 : 50,
      text: editorState.currentText,
      color: '#000000',
      fontSize: isDesktop ? '2rem' : '1rem',
      // フォント設定はeditorState.addLayer関数内でcurrentFontSettingsから自動適用される
    } as any);
    // レイヤー追加後に履歴を保存
    editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
  };

  if (!editorState.selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

  const renderToolsPanel = () => (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="space-y-4">
        <h4 className="font-medium">基本情報</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">レイヤー名</Label>
            <Input
              value={selectedLayer?.name || ''}
              onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { name: e.target.value })}
              className="mt-1"
              placeholder="レイヤー名を入力"
              disabled={!selectedLayer}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">X座標</Label>
              <Input
                type="number"
                value={selectedLayer?.x || 0}
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Y座標</Label>
              <Input
                type="number"
                value={selectedLayer?.y || 0}
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">幅</Label>
              <Input
                type="number"
                value={selectedLayer?.width || 0}
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">高さ</Label>
              <Input
                type="number"
                value={selectedLayer?.height || 0}
                onChange={(e) => selectedLayer && editorState.updateLayer(selectedLayer.id, { height: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
          </div>
        </div>
      </div>

      {/* テキストレイヤーの設定 */}
      {selectedLayer && isTextLayer(selectedLayer) && (
        <div className="space-y-4">
          <h4 className="font-medium">テキスト設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">テキスト</Label>
              <Textarea
                value={selectedLayer.text || ''}
                onChange={(e) => editorState.updateLayer(selectedLayer.id, { text: e.target.value })}
                className="mt-1 min-h-[80px] resize-none"
                placeholder="テキストを入力してください"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">フォントサイズ</Label>
                <Slider
                  value={[parseFloat(selectedLayer.fontSize?.replace('rem', '') || '2')]}
                  onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { fontSize: `${value}rem` })}
                  min={0.5}
                  max={8}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 text-center mt-1">
                  {selectedLayer.fontSize || '2rem'}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">色</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={selectedLayer.color || '#ffffff'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { color: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={selectedLayer.color || '#ffffff'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* フォント設定 */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-300">フォント設定</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-400">フォントファミリー</Label>
                  <FontSelector
                    value={selectedLayer.fontFamily || 'Arial, sans-serif'}
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { fontFamily: value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">フォントウェイト</Label>
                  <Select
                    value={selectedLayer.fontWeight || 'normal'}
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { fontWeight: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常</SelectItem>
                      <SelectItem value="bold">太字</SelectItem>
                      <SelectItem value="lighter">細字</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="600">600</SelectItem>
                      <SelectItem value="700">700</SelectItem>
                      <SelectItem value="800">800</SelectItem>
                      <SelectItem value="900">900</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-400">フォントスタイル</Label>
                  <Select
                    value={selectedLayer.fontStyle || 'normal'}
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { fontStyle: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常</SelectItem>
                      <SelectItem value="italic">イタリック</SelectItem>
                      <SelectItem value="oblique">斜体</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-400">文字装飾</Label>
                  <Select
                    value={selectedLayer.textDecoration || 'none'}
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { textDecoration: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      <SelectItem value="underline">下線</SelectItem>
                      <SelectItem value="line-through">取り消し線</SelectItem>
                      <SelectItem value="overline">上線</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* 文字シャドウ - ビジュアルエディタ */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-400">文字シャドウ</Label>
                  <Button
                    size="sm"
                    variant={uiState.shadowEnabled ? "default" : "outline"}
                    onClick={() => {
                      const newEnabled = !uiState.shadowEnabled;
                      uiState.setShadowEnabled(newEnabled);
                      if (!newEnabled) {
                        editorState.updateLayer(selectedLayer.id, { textShadow: 'none' });
                      } else {
                        editorState.updateLayer(selectedLayer.id, { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' });
                      }
                    }}
                    className="h-6 px-3 text-xs"
                  >
                    {uiState.shadowEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {uiState.shadowEnabled && (() => {
                  const shadow = parseTextShadow(selectedLayer.textShadow);
                  const handleShadowChange = (param: 'x' | 'y' | 'blur' | 'color' | 'opacity', value: number | string) => {
                    const current = parseTextShadow(selectedLayer.textShadow);
                    const updated = { ...current, [param]: value };
                    const newShadow = buildTextShadow(updated.x, updated.y, updated.blur, updated.color, updated.opacity);
                    editorState.updateLayer(selectedLayer.id, { textShadow: newShadow });
                  };
                  
                  return (
                    <div className="space-y-3 pl-2 border-l-2 border-gray-700">
                      {/* 水平位置 */}
                      <div>
                        <Label className="text-xs text-gray-500">水平位置（X）</Label>
                        <Slider
                          value={[shadow.x]}
                          onValueChange={([value]) => handleShadowChange('x', value)}
                          min={-20}
                          max={20}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {shadow.x}px
                        </div>
                      </div>
                      
                      {/* 垂直位置 */}
                      <div>
                        <Label className="text-xs text-gray-500">垂直位置（Y）</Label>
                        <Slider
                          value={[shadow.y]}
                          onValueChange={([value]) => handleShadowChange('y', value)}
                          min={-20}
                          max={20}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {shadow.y}px
                        </div>
                      </div>
                      
                      {/* ぼかし */}
                      <div>
                        <Label className="text-xs text-gray-500">ぼかし</Label>
                        <Slider
                          value={[shadow.blur]}
                          onValueChange={([value]) => handleShadowChange('blur', value)}
                          min={0}
                          max={30}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {shadow.blur}px
                        </div>
                      </div>
                      
                      {/* 影の色 */}
                      <div>
                        <Label className="text-xs text-gray-500">影の色</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="color"
                            value={shadow.color}
                            onChange={(e) => handleShadowChange('color', e.target.value)}
                            className="w-10 h-8 rounded border border-gray-600"
                          />
                          <Input
                            value={shadow.color}
                            onChange={(e) => handleShadowChange('color', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      
                      {/* 不透明度 */}
                      <div>
                        <Label className="text-xs text-gray-500">不透明度</Label>
                        <Slider
                          value={[shadow.opacity * 100]}
                          onValueChange={([value]) => handleShadowChange('opacity', value / 100)}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {Math.round(shadow.opacity * 100)}%
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 画像レイヤーの設定 */}
      {selectedLayer && isImageLayer(selectedLayer) && (
        <div className="space-y-4">
          <h4 className="font-medium">画像設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">画像を変更</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const src = URL.createObjectURL(file);
                    editorState.updateLayer(selectedLayer.id, { src });
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">不透明度</Label>
              <Slider
                value={[selectedLayer.opacity || 100]}
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { opacity: value })}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                {selectedLayer.opacity || 100}%
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">回転角度</Label>
              <Slider
                value={[selectedLayer.rotation || 0]}
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { rotation: value })}
                min={-180}
                max={180}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                {selectedLayer.rotation || 0}°
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 図形レイヤーの設定 */}
      {selectedLayer && isShapeLayer(selectedLayer) && (
        <div className="space-y-4">
          <h4 className="font-medium">図形設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">図形の種類</Label>
              <div className="mt-2">
                <ShapeTypeSelector
                  value={selectedLayer.shapeType || 'rectangle'}
                  onChange={(shape) => editorState.updateLayer(selectedLayer.id, { shapeType: shape })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">塗りつぶし色</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={selectedLayer.backgroundColor || '#000000'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={selectedLayer.backgroundColor || '#000000'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">境界線色</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={selectedLayer.borderColor || '#000000'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={selectedLayer.borderColor || '#000000'}
                    onChange={(e) => editorState.updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">境界線の太さ</Label>
              <Slider
                value={[selectedLayer.borderWidth || 0]}
                onValueChange={([value]) => editorState.updateLayer(selectedLayer.id, { borderWidth: value })}
                min={0}
                max={20}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                {selectedLayer.borderWidth || 0}px
              </div>
            </div>
          </div>
        </div>
      )}

      {/* レイヤーが選択されていない場合 */}
      {!selectedLayer && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">レイヤーを選択してください</p>
          <p className="text-xs text-muted-foreground mt-1">レイヤーパネルからレイヤーを選択すると、ここで詳細設定ができます</p>
        </div>
      )}
    </div>
  );

  // サイドバーコンテンツ
  const sidebarContent = (
    <Tabs value={uiState.selectedTab} onValueChange={uiState.setSelectedTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="settings">テンプレート</TabsTrigger>
        <TabsTrigger value="tools">ツール</TabsTrigger>
        <TabsTrigger value="layers">レイヤー</TabsTrigger>
        <TabsTrigger value="export">エクスポート</TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={editorState.setSelectedTemplate} selectedTemplateId={editorState.selectedTemplate?.id || null} />
      </TabsContent>
      <TabsContent value="tools" className="mt-4">
        {renderToolsPanel()}
      </TabsContent>
      <TabsContent value="layers" className="mt-4">
        <UnifiedLayerPanel 
          context={{
            layers: editorState.layers as any[],
            updateLayer: editorState.updateLayer as any,
            removeLayer: editorState.removeLayer,
            selectedLayerId: editorState.selectedLayerId,
            setSelectedLayerId: editorState.setSelectedLayerId,
            reorderLayers: editorState.reorderLayers,
            duplicateLayer: editorState.duplicateLayer,
            addLayer: editorState.addLayer as any,
            moveLayerUp: editorState.moveLayerUp,
            moveLayerDown: editorState.moveLayerDown,
          }}
          onShapeSelect={(shapeType) => handleAddShape(shapeType as ShapeType)}
          showShapeSelector={true}
        />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <ExportSettingsPanel onExport={exportHandlers.handleAdvancedExport} isExporting={exportHandlers.isExporting} />
      </TabsContent>
    </Tabs>
  );

  // モバイル用のサイドバーコンテンツ（テンプレート・エクスポートのみ）
  const mobileSidebarContent = (
    <Tabs value={uiState.selectedTab} onValueChange={uiState.setSelectedTab} className="w-full">
      <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
        <TabsTrigger 
          value="settings"
          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          テンプレート
        </TabsTrigger>
        <TabsTrigger 
          value="export"
          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          エクスポート
        </TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="mt-4">
        <TemplateSelector onSelectTemplate={editorState.setSelectedTemplate} selectedTemplateId={editorState.selectedTemplate?.id || null} />
      </TabsContent>
      <TabsContent value="export" className="mt-4">
        <ExportSettingsPanel onExport={exportHandlers.handleAdvancedExport} isExporting={exportHandlers.isExporting} />
      </TabsContent>
    </Tabs>
  );

  // ハンドラー関数を追加
  const handleSave = React.useCallback(() => {
    // ローカルストレージに保存（簡易版）
    try {
      localStorage.setItem('thumbnail-project', JSON.stringify({
        layers: editorState.layers,
        selectedLayerId: editorState.selectedLayerId,
        timestamp: Date.now()
      }));
      toast.success('プロジェクトを保存しました');
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  }, [editorState.layers, editorState.selectedLayerId]);

  const handleUndo = React.useCallback(() => {
    editorState.handleUndo();
  }, [editorState.handleUndo]);

  const handleRedo = React.useCallback(() => {
    editorState.handleRedo();
  }, [editorState.handleRedo]);

  const renderPreview = () => (
    <>
      {/* ツールバー - デスクトップのみ表示 */}
      {isDesktop && (
        <Toolbar
          zoom={editorState.zoom}
          setZoom={editorState.setZoom}
          onUndo={editorState.handleUndo}
          onRedo={editorState.handleRedo}
          onSave={handleSave}
          onDownload={exportHandlers.handleDownloadThumbnail}
          canUndo={editorState.canUndo}
          canRedo={editorState.canRedo}
          isPreviewDedicatedMode={uiState.isPreviewDedicatedMode}
          onTogglePreviewMode={() => uiState.setIsPreviewDedicatedMode(!uiState.isPreviewDedicatedMode)}
          showGrid={uiState.showGrid}
          setShowGrid={uiState.setShowGrid}
          showAspectGuide={uiState.showAspectGuide}
          setShowAspectGuide={uiState.setShowAspectGuide}
          showSafeArea={uiState.showSafeArea}
          setShowSafeArea={uiState.setShowSafeArea}
          showCenterLines={uiState.showCenterLines}
          setShowCenterLines={uiState.setShowCenterLines}
        />
      )}
      
      {/* モバイル表示でのフルスクリーン表示時の戻るボタン */}
      {!isDesktop && uiState.isPreviewDedicatedMode && (
        <div className="absolute top-2 left-2 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => uiState.setIsPreviewDedicatedMode(false)}
            className="bg-background/90 backdrop-blur-sm shadow-lg"
          >
            <Minimize2 className="h-4 w-4 mr-1" />
            通常表示に戻る
          </Button>
        </div>
      )}
      
      {/* プレビューエリア */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 relative">
        <div className="flex items-center justify-center h-full p-4 lg:p-8">
          <div className="relative w-full h-full">
            {/* メインコンテンツエリア */}
            <div
              id="thumbnail-preview"
              style={{ 
                aspectRatio: editorState.aspectRatio === 'custom' 
                  ? `${editorState.customAspectRatio.width}/${editorState.customAspectRatio.height}` 
                  : (editorState.aspectRatio || '16:9').replace(':', '/'),
                maxWidth: '100%',
                transform: `scale(${editorState.zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-in-out'
              }}
              className="bg-card relative border rounded-md shadow-lg w-full"
            >
              <div id="download-target" className="w-full h-full relative overflow-hidden">
                {editorState.layers.map((layer) => {
                  const isSelected = layer.id === editorState.selectedLayerId;
                  const isDraggable = isSelected && !layer.locked;
                  const isResizable = isSelected && !layer.locked;

                  if (!layer.visible) return null;

                  if (layer.type === 'image') {
                    return (
                      <ThumbnailImage
                        key={layer.id} id={layer.id} isSelected={isSelected} src={layer.src || ''} alt={layer.name}
                        x={layer.x} y={layer.y} width={layer.width} height={layer.height} rotation={layer.rotation}
                        zIndex={layer.zIndex}
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={uiState.isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                        onSelect={() => editorState.setSelectedLayerId(layer.id)}
                        isDraggable={isDraggable}
                        isLocked={layer.locked}
                        onRotateStart={() => {}}
                        onRotate={() => {}}
                        onRotateStop={() => {}}
                        updateLayer={editorState.updateLayer}
                      />
                    );
                  } else if (layer.type === 'text') {
                    return (
                      <ThumbnailText
                        key={layer.id} id={layer.id} isSelected={isSelected} text={layer.text || ''} color={layer.color}
                        fontSize={layer.fontSize} fontFamily={layer.fontFamily} fontWeight={layer.fontWeight}
                        fontStyle={layer.fontStyle} textDecoration={layer.textDecoration} textShadow={layer.textShadow}
                        x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                        rotation={layer.rotation} zIndex={layer.zIndex}
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        enableResizing={isResizable} disableDragging={!isDraggable}
                        updateLayer={editorState.updateLayer}
                      />
                    );
                  } else if (layer.type === 'shape') {
                    return (
                      <ThumbnailShape
                        key={layer.id} id={layer.id} isSelected={isSelected} shapeType={layer.shapeType as ShapeType}
                        backgroundColor={layer.backgroundColor || '#cccccc'} borderColor={layer.borderColor || '#000000'}
                        borderWidth={layer.borderWidth || 2} x={layer.x} y={layer.y} width={layer.width} height={layer.height}
                        rotation={layer.rotation} zIndex={layer.zIndex}
                        onDragStop={(e, d) => handleLayerDragStop(layer.id, e, d)}
                        onResize={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        onResizeStop={(e, dir, ref, delta, position) => handleLayerResize(layer.id, dir, ref, delta, position)}
                        lockAspectRatio={uiState.isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
                        updateLayer={editorState.updateLayer}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* グリッドオーバーレイ */}
            {uiState.showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: `${uiState.gridSize}px ${uiState.gridSize}px`,
                }}
                aria-hidden="true"
              />
            )}

            {/* アスペクト比ガイド */}
            {uiState.showAspectGuide && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="border-2 border-dashed border-blue-400/60 bg-blue-400/5 rounded"
                  style={{
                    width: '90%',
                    height: '90%',
                    aspectRatio: editorState.aspectRatio === 'custom' 
                      ? `${editorState.customAspectRatio.width}/${editorState.customAspectRatio.height}`
                      : (editorState.aspectRatio || '16:9'),
                  }}
                  aria-hidden="true"
                />
              </div>
            )}

            {/* 中央線 */}
            {uiState.showCenterLines && (
              <div className="absolute inset-0 pointer-events-none">
                {/* 垂直中央線 */}
                <div 
                  className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-px bg-red-400/60"
                  style={{ width: '1px' }}
                  aria-hidden="true"
                />
                {/* 水平中央線 */}
                <div 
                  className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-px bg-red-400/60"
                  style={{ height: '1px' }}
                  aria-hidden="true"
                />
              </div>
            )}

            {/* セーフエリアガイド */}
            {uiState.showSafeArea && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <div 
                  style={{
                    width: '90%',
                    height: '90%',
                    border: '2px dashed rgba(34, 197, 94, 0.6)',
                    borderRadius: '4px',
                    position: 'relative',
                  }}
                >
                  <div className="absolute -top-6 left-0 text-xs text-green-400 font-medium">
                    セーフエリア
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderMobileControls = () => (
    <div className="p-2 lg:p-4 space-y-3">
      {/* モバイル用クイックアクション */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">クイックアクセス</h4>
        <Tabs value={uiState.selectedTab} onValueChange={uiState.setSelectedTab} className="w-full">
          <TabsList className="w-full h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
            <TabsTrigger 
              value="tools"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              ツール設定
            </TabsTrigger>
            <TabsTrigger 
              value="editorState.layers"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              レイヤー管理
            </TabsTrigger>
            <TabsTrigger 
              value="edit"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              レイヤー編集
            </TabsTrigger>
            <TabsTrigger 
              value="preview"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              プレビュー
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* インライン表示エリア */}
      {uiState.selectedTab === "tools" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">ツール設定</h4>
          {renderToolsPanel()}
        </div>
      )}
      
      {uiState.selectedTab === "editorState.layers" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">レイヤー管理</h4>
          <UnifiedLayerPanel 
            context={{
              layers: editorState.layers as any[],
              updateLayer: editorState.updateLayer as any,
              removeLayer: editorState.removeLayer,
              selectedLayerId: editorState.selectedLayerId,
              setSelectedLayerId: editorState.setSelectedLayerId,
              reorderLayers: editorState.reorderLayers,
              duplicateLayer: editorState.duplicateLayer,
              addLayer: editorState.addLayer as any,
              moveLayerUp: editorState.moveLayerUp,
              moveLayerDown: editorState.moveLayerDown,
            }}
            onShapeSelect={(shapeType) => handleAddShape(shapeType as ShapeType)}
            showShapeSelector={true}
          />
        </div>
      )}
      
      {uiState.selectedTab === "edit" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">レイヤー編集</h4>
          {selectedLayer ? (
            <div className="space-y-3">
              {/* 選択中レイヤー情報 */}
              <div className="p-2 bg-secondary/50 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">選択中</p>
                <p className="text-sm font-medium truncate" title={selectedLayer.name}>
                  {selectedLayer.name.length > 15 ? selectedLayer.name.substring(0, 12) + '...' : selectedLayer.name}
                </p>
              </div>
              
              {/* 位置調整 */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">📐 位置</Label>
                <div className="space-y-2">
                  {/* X座標 */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { x: selectedLayer.x - 10 })}
                      className="h-7 w-7 p-0"
                    >
                      ←
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">X</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={Math.round(selectedLayer.x)}
                        onChange={(e) => editorState.updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { x: selectedLayer.x + 10 })}
                      className="h-7 w-7 p-0"
                    >
                      →
                    </Button>
                  </div>
                  
                  {/* Y座標 */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { y: selectedLayer.y - 10 })}
                      className="h-7 w-7 p-0"
                    >
                      ↑
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Y</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={Math.round(selectedLayer.y)}
                        onChange={(e) => editorState.updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { y: selectedLayer.y + 10 })}
                      className="h-7 w-7 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* サイズ調整 */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">📏 サイズ</Label>
                <div className="space-y-2">
                  {/* 幅 */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { width: Math.max(10, selectedLayer.width - 20) })}
                      className="h-7 w-7 p-0"
                    >
                      −
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">幅</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={Math.round(selectedLayer.width)}
                        onChange={(e) => editorState.updateLayer(selectedLayer.id, { width: Math.max(10, Number(e.target.value)) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { width: selectedLayer.width + 20 })}
                      className="h-7 w-7 p-0"
                    >
                      +
                    </Button>
                  </div>
                  
                  {/* 高さ */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { height: Math.max(10, selectedLayer.height - 20) })}
                      className="h-7 w-7 p-0"
                    >
                      −
                    </Button>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">高さ</Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={Math.round(selectedLayer.height)}
                        onChange={(e) => editorState.updateLayer(selectedLayer.id, { height: Math.max(10, Number(e.target.value)) })}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editorState.updateLayer(selectedLayer.id, { height: selectedLayer.height + 20 })}
                      className="h-7 w-7 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* 回転調整 */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">🔄 回転</Label>
                <div className="flex gap-1 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editorState.updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) - 15 })}
                    className="h-7 w-7 p-0"
                    title="反時計回り 15°"
                  >
                    ↺
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editorState.updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) - 5 })}
                    className="h-7 w-7 p-0"
                    title="反時計回り 5°"
                  >
                    ↶
                  </Button>
                  <div className="flex-1">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={Math.round(selectedLayer.rotation || 0)}
                      onChange={(e) => editorState.updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })}
                      className="h-7 text-xs text-center"
                      placeholder="角度"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editorState.updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) + 5 })}
                    className="h-7 w-7 p-0"
                    title="時計回り 5°"
                  >
                    ↷
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editorState.updateLayer(selectedLayer.id, { rotation: (selectedLayer.rotation || 0) + 15 })}
                    className="h-7 w-7 p-0"
                    title="時計回り 15°"
                  >
                    ↻
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editorState.updateLayer(selectedLayer.id, { rotation: 0 })}
                    className="h-7 px-2 text-xs"
                  >
                    0°
                  </Button>
                </div>
              </div>
              
              {/* テキスト専用設定 */}
              {selectedLayer.type === 'text' && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">✏️ テキスト設定</Label>
                  <div className="space-y-2">
                    <Textarea
                      value={selectedLayer.text || ''}
                      onChange={(e) => editorState.updateLayer(selectedLayer.id, { text: e.target.value })}
                      className="text-xs min-h-[60px] resize-none"
                      placeholder="テキストを入力"
                    />
                    <div className="space-y-2">
                      {/* 色選択 */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground w-8">色</Label>
                        <input
                          type="color"
                          value={selectedLayer.color || '#000000'}
                          onChange={(e) => editorState.updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="w-8 h-7 rounded border"
                        />
                        <Input
                          value={selectedLayer.color || '#000000'}
                          onChange={(e) => editorState.updateLayer(selectedLayer.id, { color: e.target.value })}
                          className="h-7 text-xs flex-1"
                          placeholder="#000000"
                        />
                      </div>
                      
                      {/* フォントサイズ */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const currentSize = parseFloat(selectedLayer.fontSize || '1rem');
                            const newSize = Math.max(0.5, currentSize - 0.25);
                            editorState.updateLayer(selectedLayer.id, { fontSize: `${newSize}rem` });
                          }}
                          className="h-7 w-7 p-0"
                        >
                          −
                        </Button>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">サイズ</Label>
                          <Input
                            value={selectedLayer.fontSize || '1rem'}
                            onChange={(e) => editorState.updateLayer(selectedLayer.id, { fontSize: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="1rem"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const currentSize = parseFloat(selectedLayer.fontSize || '1rem');
                            const newSize = currentSize + 0.25;
                            editorState.updateLayer(selectedLayer.id, { fontSize: `${newSize}rem` });
                          }}
                          className="h-7 w-7 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-xs">レイヤーを選択してください</p>
            </div>
          )}
        </div>
      )}
      
      {uiState.selectedTab === "preview" && (
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">プレビュー設定</h4>
          <div className="space-y-3">
            {/* ズーム調整 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">🔍 ズーム</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => editorState.setZoom(Math.max(0.25, editorState.zoom - 0.25))}
                  className="h-8 w-8 p-0"
                  disabled={editorState.zoom <= 0.25}
                >
                  −
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground">{Math.round(editorState.zoom * 100)}%</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => editorState.setZoom(Math.min(4, editorState.zoom + 0.25))}
                  className="h-8 w-8 p-0"
                  disabled={editorState.zoom >= 4}
                >
                  +
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editorState.setZoom(1)}
                className="w-full h-8"
              >
                リセット (100%)
              </Button>
            </div>

            {/* プレビュー情報表示 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">📊 プレビュー情報</Label>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">アスペクト比:</span>
                  <span className="font-medium">
                    {editorState.aspectRatio === 'custom' 
                      ? `${editorState.customAspectRatio.width}:${editorState.customAspectRatio.height}` 
                      : editorState.aspectRatio || '16:9'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ズーム率:</span>
                  <span className="font-medium">{Math.round(editorState.zoom * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">グリッド:</span>
                  <span className="font-medium">40px</span>
                </div>
              </div>
            </div>

            {/* プレビュー設定 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">⚙️ プレビュー設定</Label>
              <div className="space-y-2">
                {/* グリッド表示 */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">グリッド表示</Label>
                  <Button
                    size="sm"
                    variant={uiState.showGrid ? "default" : "outline"}
                    onClick={() => uiState.setShowGrid(!uiState.showGrid)}
                    className="h-6 px-2 text-xs"
                  >
                    {uiState.showGrid ? "ON" : "OFF"}
                  </Button>
                </div>
                
                {/* アスペクト比ガイド */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">アスペクト比ガイド</Label>
                  <Button
                    size="sm"
                    variant={uiState.showAspectGuide ? "default" : "outline"}
                    onClick={() => uiState.setShowAspectGuide(!uiState.showAspectGuide)}
                    className="h-6 px-2 text-xs"
                  >
                    {uiState.showAspectGuide ? "ON" : "OFF"}
                  </Button>
                </div>
                
                {/* セーフエリア */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">セーフエリア</Label>
                  <Button
                    size="sm"
                    variant={uiState.showSafeArea ? "default" : "outline"}
                    onClick={() => uiState.setShowSafeArea(!uiState.showSafeArea)}
                    className="h-6 px-2 text-xs"
                  >
                    {uiState.showSafeArea ? "ON" : "OFF"}
                  </Button>
                </div>
                
                {/* グリッドサイズ */}
                {uiState.showGrid && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">グリッドサイズ</Label>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={uiState.gridSize === 10 ? "default" : "outline"}
                        onClick={() => uiState.setGridSize(10)}
                        className="h-6 px-2 text-xs flex-1"
                      >
                        10px
                      </Button>
                      <Button
                        size="sm"
                        variant={uiState.gridSize === 20 ? "default" : "outline"}
                        onClick={() => uiState.setGridSize(20)}
                        className="h-6 px-2 text-xs flex-1"
                      >
                        20px
                      </Button>
                      <Button
                        size="sm"
                        variant={uiState.gridSize === 40 ? "default" : "outline"}
                        onClick={() => uiState.setGridSize(40)}
                        className="h-6 px-2 text-xs flex-1"
                      >
                        40px
                      </Button>
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            {/* プレビューモード切り替え */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">📺 表示モード</Label>
              <Button
                size="sm"
                variant={uiState.isPreviewDedicatedMode ? "default" : "outline"}
                onClick={() => uiState.setIsPreviewDedicatedMode(!uiState.isPreviewDedicatedMode)}
                className="w-full h-8"
              >
                {uiState.isPreviewDedicatedMode ? "通常表示に戻る" : "フルスクリーン表示"}
              </Button>
            </div>

            {/* 保存・エクスポート */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">💾 保存・出力</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  className="h-8"
                >
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportHandlers.handleDownloadThumbnail('high')}
                  className="h-8"
                >
                  ダウンロード
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* レイヤー追加ボタン */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">レイヤーを追加</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddText}
            className="flex items-center gap-2"
          >
            <span className="text-lg">T</span>
            <span>テキスト</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('image-upload')?.click()}
            className="flex items-center gap-2"
          >
            <span className="text-lg">🖼️</span>
            <span>画像</span>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddShape('rectangle')}
            className="flex items-center gap-2"
          >
            <span className="text-lg">⬜</span>
            <span>四角</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddShape('circle')}
            className="flex items-center gap-2"
          >
            <span className="text-lg">⭕</span>
            <span>円</span>
          </Button>
        </div>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          multiple
        />
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col lg:h-screen">
      {/* モバイル用オーバーレイ（サイドバーが開いている時のみ表示） */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row flex-grow lg:h-full lg:overflow-y-auto">
        <main className="flex-1 overflow-y-auto">
          <div className={`${isDesktop ? 'p-6' : 'p-2 pt-16'}`}>
            <div className={`${isDesktop ? '' : 'max-h-[85vh] overflow-hidden'}`}>
              {renderPreview()}
            </div>
          </div>
          {/* モバイル用コントロール - プレビュー専用モード時は非表示 */}
          {!isDesktop && !uiState.isPreviewDedicatedMode && (
            <div className="border-t bg-background/95 backdrop-blur-sm">
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">
                  💡 ヒント: 「ツール設定」でレイヤーの詳細編集、「レイヤー管理」でレイヤーの並び替えができます。テンプレートやエクスポートはサイドバーからアクセスできます。
                </p>
              </div>
              {renderMobileControls()}
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
              { id: "editorState.layers", label: "レイヤー", icon: <Layers className="h-4 w-4" /> }
            ]}
          onTabClick={(tabId) => {
            // タブの状態管理が必要な場合はここで実装
            logger.debug('タブクリック', { tabId }, 'ThumbnailGenerator');
          }}
          />
        )}

        {/* サイドバー（プレビュー専用モード時は非表示） */}
        {!uiState.isPreviewDedicatedMode && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            title=""
            isDesktop={isDesktop}
            className={`${isDesktop ? 'lg:w-96' : 'w-full max-w-sm'}`}
          >
            {isDesktop ? sidebarContent : mobileSidebarContent}
          </Sidebar>
        )}
      </div>
    </div>
  );
}
