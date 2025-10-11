/**
 * サムネイル生成ツールのツールパネルコンポーネント
 * レイヤーの詳細設定を行うパネル（基本情報、テキスト、画像、図形設定）
 */

'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseTextShadow, buildTextShadow } from '@/utils/textShadowUtils';
import { FontSelector } from '@/components/shared/FontSelector';
import { ShapeTypeSelector } from '@/components/shared/ShapeTypeSelector';
import { Layer } from '../contexts/TemplateContext';

export interface ToolsPanelProps {
  selectedLayer: Layer | undefined;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  shadowEnabled: boolean;
  setShadowEnabled: (value: boolean) => void;
}

/**
 * サムネイル生成ツールのツールパネルコンポーネント
 * 選択されたレイヤーの詳細設定を提供
 */
export const ThumbnailToolsPanel: React.FC<ToolsPanelProps> = ({
  selectedLayer,
  updateLayer,
  shadowEnabled,
  setShadowEnabled,
}) => {
  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="space-y-4">
        <h4 className="font-medium">基本情報</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">レイヤー名</Label>
            <Input
              value={selectedLayer?.name || ''}
              onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { name: e.target.value })}
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
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Y座標</Label>
              <Input
                type="number"
                value={selectedLayer?.y || 0}
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
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
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">高さ</Label>
              <Input
                type="number"
                value={selectedLayer?.height || 0}
                onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { height: Number(e.target.value) })}
                className="mt-1"
                disabled={!selectedLayer}
              />
            </div>
          </div>
        </div>
      </div>

      {/* テキストレイヤーの設定 */}
      {selectedLayer?.type === 'text' && (
        <div className="space-y-4">
          <h4 className="font-medium">テキスト設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">テキスト</Label>
              <Textarea
                value={selectedLayer.text || ''}
                onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                className="mt-1 min-h-[80px] resize-none"
                placeholder="テキストを入力してください"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">フォントサイズ</Label>
                <Slider
                  value={[parseFloat(selectedLayer.fontSize?.replace('rem', '') || '2')]}
                  onValueChange={([value]) => updateLayer(selectedLayer.id, { fontSize: `${value}rem` })}
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
                    onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={selectedLayer.color || '#ffffff'}
                    onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
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
                    onValueChange={(value) => updateLayer(selectedLayer.id, { fontFamily: value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400">フォントウェイト</Label>
                  <Select
                    value={selectedLayer.fontWeight || 'normal'}
                    onValueChange={(value) => updateLayer(selectedLayer.id, { fontWeight: value })}
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
                    onValueChange={(value) => updateLayer(selectedLayer.id, { fontStyle: value })}
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
                    onValueChange={(value) => updateLayer(selectedLayer.id, { textDecoration: value })}
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
                    variant={shadowEnabled ? "default" : "outline"}
                    onClick={() => {
                      const newEnabled = !shadowEnabled;
                      setShadowEnabled(newEnabled);
                      if (!newEnabled) {
                        updateLayer(selectedLayer.id, { textShadow: 'none' });
                      } else {
                        updateLayer(selectedLayer.id, { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' });
                      }
                    }}
                    className="h-6 px-3 text-xs"
                  >
                    {shadowEnabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {shadowEnabled && (() => {
                  const shadow = parseTextShadow(selectedLayer.textShadow);
                  const handleShadowChange = (param: 'x' | 'y' | 'blur' | 'color' | 'opacity', value: number | string) => {
                    const current = parseTextShadow(selectedLayer.textShadow);
                    const updated = { ...current, [param]: value };
                    const newShadow = buildTextShadow(updated.x, updated.y, updated.blur, updated.color, updated.opacity);
                    updateLayer(selectedLayer.id, { textShadow: newShadow });
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
      {selectedLayer?.type === 'image' && (
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
                    updateLayer(selectedLayer.id, { src });
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">不透明度</Label>
              <Slider
                value={[selectedLayer.opacity || 100]}
                onValueChange={([value]) => updateLayer(selectedLayer.id, { opacity: value })}
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
                onValueChange={([value]) => updateLayer(selectedLayer.id, { rotation: value })}
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
      {selectedLayer?.type === 'shape' && (
        <div className="space-y-4">
          <h4 className="font-medium">図形設定</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">図形の種類</Label>
              <div className="mt-2">
                <ShapeTypeSelector
                  value={selectedLayer.shapeType || 'rectangle'}
                  onChange={(shape) => updateLayer(selectedLayer.id, { shapeType: shape })}
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
                    onChange={(e) => updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={selectedLayer.backgroundColor || '#000000'}
                    onChange={(e) => updateLayer(selectedLayer.id, { backgroundColor: e.target.value })}
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
                    onChange={(e) => updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <Input
                    value={selectedLayer.borderColor || '#000000'}
                    onChange={(e) => updateLayer(selectedLayer.id, { borderColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">境界線の太さ</Label>
              <Slider
                value={[selectedLayer.borderWidth || 0]}
                onValueChange={([value]) => updateLayer(selectedLayer.id, { borderWidth: value })}
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
};

