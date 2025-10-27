import React, { useState, useEffect, useCallback, useRef } from 'react';
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

import { useTemplate, ShapeType } from '../contexts/TemplateContext';
import TemplateSelector from './TemplateSelector';
import ThumbnailText from '@/components/shared/thumbnail/ThumbnailText';
import ThumbnailImage from '@/components/shared/thumbnail/ThumbnailImage';
import ThumbnailShape from '@/components/shared/thumbnail/ThumbnailShape';
import { MobileControls } from '@/components/shared/MobileControls';
import { MobileDisplaySettings } from '@/components/shared/MobileDisplaySettings';
import { UnifiedLayerPanel } from '@/components/shared/UnifiedLayerPanel';
import { ExportSettingsPanel, ExportSettings } from './ExportSettingsPanel';
import { Toolbar } from '../../asset-creator/components/Toolbar';
import { useCanvasOperations } from '../../asset-creator/hooks/useCanvasOperations';
import { parseTextShadow, buildTextShadow } from '@/utils/textShadowUtils';
import { FontSelector } from '@/components/shared/FontSelector';
import { ShapeTypeSelector } from '@/components/shared/ShapeTypeSelector';
import { logger } from '@/lib/logger';
import { isTextLayer, isImageLayer, isShapeLayer } from '@/types/layers';
import { useUIState } from '../hooks/useUIState';
import { useExportHandlers } from '../hooks/useExportHandlers';
import { useEditorState } from '../hooks/useEditorState';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface EditorUIProps {
  // 必要なpropsを定義
}

/**
 * エディタのUIコンポーネント
 * page.tsxからJSX部分を分離して保守性を向上
 * 既存のUIと機能を完全に保持
 */
export const EditorUI: React.FC<EditorUIProps> = () => {
  // UI状態管理（最小限）
  const uiState = useUIState();
  
  // エクスポート機能管理
  const exportHandlers = useExportHandlers();
  
  // エディター状態管理
  const editorState = useEditorState();
  
  // キーボードショートカット管理
  const { isShiftKeyDown } = useKeyboardShortcuts();
  
  // サイドバー状態管理（既存のまま）
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isDesktop } = useSidebar({
    defaultOpen: false,
    desktopDefaultOpen: true,
  });

  const { handleAsyncError } = useErrorHandler();

  const selectedLayer = editorState.layers.find(layer => layer.id === editorState.selectedLayerId);

  // レイヤーの変更を監視して履歴を保存
  const prevLayersRef = useRef(editorState.layers);
  useEffect(() => {
    const currentLayers = editorState.layers;
    const prevLayers = prevLayersRef.current;
    
    console.log('=== LAYERS EFFECT TRIGGERED ===');
    console.log('Layers effect triggered:', {
      prev: prevLayers.length,
      current: currentLayers.length,
      selectedLayerId: editorState.selectedLayerId,
      canUndo: editorState.canUndo,
      canRedo: editorState.canRedo,
      prevLayers: prevLayers.map(l => ({ id: l.id, type: l.type })),
      currentLayers: currentLayers.map(l => ({ id: l.id, type: l.type }))
    });
    
    // レイヤーの数が変わった場合（追加・削除）は履歴を保存
    if (currentLayers.length !== prevLayers.length) {
      console.log('*** LAYERS COUNT CHANGED ***');
      console.log('Layers count changed, saving to history:', {
        prev: prevLayers.length,
        current: currentLayers.length,
        selectedLayerId: editorState.selectedLayerId
      });
      
      // 少し遅延させてから履歴を保存（レイヤー状態の更新を待つ）
      setTimeout(() => {
        console.log('*** EXECUTING DELAYED HISTORY SAVE ***');
        editorState.addToHistory(editorState.layers, editorState.selectedLayerId);
      }, 100);
    } else {
      console.log('Layers count unchanged, skipping history save');
    }
    
    prevLayersRef.current = currentLayers;
    console.log('=== END LAYERS EFFECT ===');
  }, [editorState.layers, editorState.selectedLayerId, editorState.addToHistory, editorState.canUndo, editorState.canRedo]);

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
    console.log('Adding text layer...');
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
    console.log('Text layer added, layers count:', editorState.layers.length);
  };

  if (!editorState.selectedTemplate) {
    return <div className="flex h-full items-center justify-center"><p>テンプレートを読み込み中...</p></div>;
  }

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
    console.log('Toolbar undo button clicked');
    const result = editorState.handleUndo();
    if (result) {
      toast.success('元に戻しました');
    } else {
      console.log('Undo failed - no history to undo');
    }
  }, [editorState.handleUndo]);

  const handleRedo = React.useCallback(() => {
    console.log('Toolbar redo button clicked');
    const result = editorState.handleRedo();
    if (result) {
      toast.success('やり直しました');
    } else {
      console.log('Redo failed - no history to redo');
    }
  }, [editorState.handleRedo]);

  // レンダリング関数を実装
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
                <div className="text-xs text-[#A0A0A0] text-center mt-1">
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
                    className="w-8 h-8 rounded border border-[#4A4A4A]"
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
              <h5 className="text-sm font-medium text-[#E0E0E0]">フォント設定</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-[#A0A0A0]">フォントファミリー</Label>
                  <FontSelector
                    value={selectedLayer.fontFamily || 'Arial, sans-serif'}
                    onValueChange={(value) => editorState.updateLayer(selectedLayer.id, { fontFamily: value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#A0A0A0]">フォントウェイト</Label>
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
                  <Label className="text-xs text-[#A0A0A0]">フォントスタイル</Label>
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
                  <Label className="text-xs text-[#A0A0A0]">文字装飾</Label>
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
                  <Label className="text-xs text-[#A0A0A0]">文字シャドウ</Label>
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
                    <div className="space-y-3 pl-2 border-l-2 border-[#4A4A4A]">
                      {/* 水平位置 */}
                      <div>
                        <Label className="text-xs text-[#A0A0A0]">水平位置（X）</Label>
                        <Slider
                          value={[shadow.x]}
                          onValueChange={([value]) => handleShadowChange('x', value)}
                          min={-20}
                          max={20}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-[#A0A0A0] text-center mt-1">
                          {shadow.x}px
                        </div>
                      </div>
                      
                      {/* 垂直位置 */}
                      <div>
                        <Label className="text-xs text-[#A0A0A0]">垂直位置（Y）</Label>
                        <Slider
                          value={[shadow.y]}
                          onValueChange={([value]) => handleShadowChange('y', value)}
                          min={-20}
                          max={20}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-[#A0A0A0] text-center mt-1">
                          {shadow.y}px
                        </div>
                      </div>
                      
                      {/* ぼかし */}
                      <div>
                        <Label className="text-xs text-[#A0A0A0]">ぼかし</Label>
                        <Slider
                          value={[shadow.blur]}
                          onValueChange={([value]) => handleShadowChange('blur', value)}
                          min={0}
                          max={30}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-[#A0A0A0] text-center mt-1">
                          {shadow.blur}px
                        </div>
                      </div>
                      
                      {/* 影の色 */}
                      <div>
                        <Label className="text-xs text-[#A0A0A0]">影の色</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="color"
                            value={shadow.color}
                            onChange={(e) => handleShadowChange('color', e.target.value)}
                            className="w-10 h-8 rounded border border-[#4A4A4A]"
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
                        <Label className="text-xs text-[#A0A0A0]">不透明度</Label>
                        <Slider
                          value={[shadow.opacity * 100]}
                          onValueChange={([value]) => handleShadowChange('opacity', value / 100)}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                        <div className="text-xs text-[#A0A0A0] text-center mt-1">
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
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
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
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
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
                    className="w-8 h-8 rounded border border-[#4A4A4A]"
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
                    className="w-8 h-8 rounded border border-[#4A4A4A]"
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
              <div className="text-xs text-[#A0A0A0] text-center mt-1">
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

  // プレビューのレンダリング（簡易版）
  const renderPreview = () => (
    <>
      {/* ツールバー - デスクトップのみ表示 */}
      {isDesktop && (
        <Toolbar
          zoom={editorState.zoom}
          setZoom={editorState.setZoom}
          onUndo={handleUndo}
          onRedo={handleRedo}
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
      <div className="flex-1 overflow-auto bg-[#1A1A1A] relative">
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
                        lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
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
                        lockAspectRatio={isShiftKeyDown} enableResizing={isResizable} disableDragging={!isDraggable}
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

  // モバイル用クイックアクセス
  const renderMobileControls = () => (
    <div className="p-2 lg:p-4 space-y-3">
      {/* モバイル用クイックアクション */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">クイックアクセス</h4>
        <Tabs value={uiState.selectedTab} onValueChange={uiState.setSelectedTab} className="w-full max-h-[40vh] flex flex-col">
          <TabsList className="w-full h-16 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground">
            <TabsTrigger 
              value="tools"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              ツール設定
            </TabsTrigger>
            <TabsTrigger 
              value="layers"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              レイヤー管理
            </TabsTrigger>
            <TabsTrigger 
              value="edit"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              編集
            </TabsTrigger>
            <TabsTrigger 
              value="display"
              className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              表示設定
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="mt-4 flex-1 overflow-y-auto">
            {renderToolsPanel()}
          </TabsContent>
          
          <TabsContent value="layers" className="mt-4 flex-1 overflow-y-auto">
            <UnifiedLayerPanel 
              context={{
                layers: editorState.layers,
                updateLayer: editorState.updateLayer,
                removeLayer: editorState.removeLayer,
                selectedLayerId: editorState.selectedLayerId,
                setSelectedLayerId: editorState.setSelectedLayerId,
                reorderLayers: editorState.reorderLayers,
                duplicateLayer: editorState.duplicateLayer,
                addLayer: editorState.addLayer,
                moveLayerUp: editorState.moveLayerUp,
                moveLayerDown: editorState.moveLayerDown,
              }}
              onShapeSelect={(shapeType) => editorState.handleAddShape(shapeType as ShapeType)}
              showShapeSelector={true}
            />
          </TabsContent>
          
          <TabsContent value="edit" className="mt-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* レイヤー操作ボタン */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">レイヤー操作</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => editorState.duplicateLayer(editorState.selectedLayerId!)}>
                    複製
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editorState.removeLayer(editorState.selectedLayerId!)}>
                    削除
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editorState.moveLayerUp(editorState.selectedLayerId!)}>
                    最前面
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editorState.moveLayerDown(editorState.selectedLayerId!)}>
                    最背面
                  </Button>
                </div>
              </div>

              {/* モバイル操作コントロール */}
              <MobileControls
                selectedLayer={editorState.layers.find(layer => layer.id === editorState.selectedLayerId) || null}
                onUpdateLayer={(id, updates) => editorState.updateLayer(id, updates)}
                className="mt-4"
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="mt-4 flex-1 overflow-y-auto">
            <MobileDisplaySettings
              zoom={editorState.zoom}
              onZoomChange={editorState.setZoom}
              showGrid={uiState.showGrid}
              onShowGridChange={uiState.setShowGrid}
              showGuides={uiState.showCenterLines}
              onShowGuidesChange={uiState.setShowCenterLines}
              showSafeArea={uiState.showSafeArea}
              onShowSafeAreaChange={uiState.setShowSafeArea}
              showAspectGuide={uiState.showAspectGuide}
              onShowAspectGuideChange={uiState.setShowAspectGuide}
              gridSize={uiState.gridSize}
              onGridSizeChange={uiState.setGridSize}
            />
          </TabsContent>
        </Tabs>
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
        <main className={`${isDesktop ? 'flex-1 overflow-y-auto' : 'flex-1 flex flex-col'}`}>
          <div className={`${isDesktop ? 'p-6' : 'p-2 pt-16 flex-1 flex flex-col'}`}>
            <div className={`${isDesktop ? '' : 'flex-1 flex flex-col'}`}>
              {renderPreview()}
            </div>
          </div>
          {/* モバイル用コントロール - プレビュー専用モード時は非表示 */}
          {!isDesktop && !uiState.isPreviewDedicatedMode && (
            <div className="border-t bg-background/95 backdrop-blur-sm max-h-[40vh] overflow-y-auto flex-shrink-0">
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
              { id: "layers", label: "レイヤー", icon: <Layers className="h-4 w-4" /> }
            ]}
            onTabClick={(tabId) => {
              logger.debug('タブクリック', { tabId }, 'EditorUI');
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
};
