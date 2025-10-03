'use client';

import React from 'react';
import { useTemplate } from '../contexts/TemplateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';

export const EnhancedPropertyPanel: React.FC = () => {
  const { layers, updateLayer, selectedLayerId } = useTemplate();
  const selectedLayer = layers.find(layer => layer.id === selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">レイヤーを選択してください</p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    updateLayer(selectedLayer.id, { [property]: value });
  };

  const resetRotation = () => {
    handlePropertyChange('rotation', 0);
  };

  return (
    <div className="space-y-4">
      {/* レイヤー情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">レイヤー情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-gray-400">名前</Label>
            <Input
              value={selectedLayer.name || ''}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
              className="h-8 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-400">X</Label>
              <Input
                type="number"
                value={Math.round(selectedLayer.x)}
                onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">Y</Label>
              <Input
                type="number"
                value={Math.round(selectedLayer.y)}
                onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-400">幅</Label>
              <Input
                type="number"
                value={Math.round(Number(selectedLayer.width))}
                onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">高さ</Label>
              <Input
                type="number"
                value={Math.round(Number(selectedLayer.height))}
                onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
                className="h-8 mt-1"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">回転</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={resetRotation}
                className="h-6 px-2"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
            <Input
              type="number"
              value={Math.round(selectedLayer.rotation || 0)}
              onChange={(e) => handlePropertyChange('rotation', Number(e.target.value))}
              className="h-8 mt-1"
              placeholder="角度"
            />
          </div>
        </CardContent>
      </Card>

      {/* テキストプロパティ */}
      {selectedLayer.type === 'text' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">テキスト設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">テキスト</Label>
              <Textarea
                value={selectedLayer.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                className="h-16 resize-none mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-400">フォントサイズ</Label>
                <div className="mt-1">
                  <Slider
                    value={[parseFloat(selectedLayer.fontSize || '24') * 10]}
                    onValueChange={([value]) => handlePropertyChange('fontSize', `${value / 10}rem`)}
                    min={8}
                    max={200}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {selectedLayer.fontSize || '2.4rem'}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-400">色</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={selectedLayer.color || '#000000'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-600"
                  />
                  <Input
                    value={selectedLayer.color || '#000000'}
                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 図形プロパティ */}
      {selectedLayer.type === 'shape' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">図形設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">塗りつぶし色</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedLayer.backgroundColor || '#cccccc'}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-600"
                />
                <Input
                  value={selectedLayer.backgroundColor || '#cccccc'}
                  onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">枠線色</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedLayer.borderColor || '#000000'}
                  onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-600"
                />
                <Input
                  value={selectedLayer.borderColor || '#000000'}
                  onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-400">
                枠線の太さ ({selectedLayer.borderWidth || 0}px)
              </Label>
              <Slider
                value={[selectedLayer.borderWidth || 0]}
                onValueChange={([value]) => handlePropertyChange('borderWidth', value)}
                min={0}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 画像プロパティ */}
      {selectedLayer.type === 'image' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">画像設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">画像ファイル</Label>
              <div className="mt-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const src = URL.createObjectURL(file);
                      handlePropertyChange('src', src);
                      handlePropertyChange('name', file.name);
                    }
                  }}
                  className="h-8"
                />
              </div>
            </div>
            {selectedLayer.src && (
              <div>
                <Label className="text-xs text-gray-400">プレビュー</Label>
                <div className="mt-1 p-2 border rounded">
                  <img
                    src={selectedLayer.src}
                    alt={selectedLayer.name}
                    className="w-full h-20 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};



